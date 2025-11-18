# RAG (Retrieval-Augmented Generation) System

This document explains the RAG implementation in the Student Counselling application.

## What is RAG?

RAG enhances AI responses by retrieving relevant past context (conversations, mood logs, etc.) and injecting it into the prompt. This allows the AI to:

- Reference past conversations naturally
- Identify patterns in mood and behavior
- Provide continuity across sessions
- Give more personalized, context-aware advice

## Architecture

### Components

1. **Embedding Service** (`src/lib/ai/embedding-service.js`)

   - Generates vector embeddings using OpenAI's `text-embedding-3-small` model
   - Handles text chunking and formatting
   - Provides cosine similarity calculation

2. **RAG Service** (`src/lib/ai/rag-service.js`)

   - Performs semantic similarity search
   - Retrieves relevant conversations, messages, and mood logs
   - Formats retrieved context for LLM injection

3. **AI Service Integration** (`src/lib/ai/ai-service.js`)

   - Automatically calls RAG before generating responses
   - Injects retrieved context into system prompts
   - Falls back gracefully if RAG fails

4. **Automatic Indexing** (`src/lib/ai/embedding-utils.js`)
   - Generates embeddings for new messages automatically
   - Updates conversation embeddings in background
   - Non-blocking to avoid slowing down responses

### Database Schema

**Conversation Model** - Added fields:

```javascript
{
  summary: String,      // Short summary of conversation
  embedding: [Number],  // 1536-dimensional vector
}
```

**Message Model** - Added field:

```javascript
{
  embedding: [Number],  // 1536-dimensional vector
}
```

**MoodLog Model** - Added field:

```javascript
{
  embedding: [Number],  // 1536-dimensional vector
}
```

## Setup

### Prerequisites

1. **OpenAI API Key** (required for embeddings)

   ```bash
   OPENAI_API_KEY=sk-...
   ```

2. Install dependencies (already included in package.json):
   ```bash
   npm install openai
   ```

### Initial Indexing

Run the indexing script to generate embeddings for existing data:

```powershell
cd d:\Projects\studentcounselling
node src/scripts/index-documents.js
```

This will:

- Generate embeddings for all existing conversations
- Generate embeddings for all existing messages
- Generate embeddings for all existing mood logs

**Note:** This is a one-time operation. New documents are automatically indexed.

## Usage

### In Chat API

RAG is automatically enabled in the chat API:

```javascript
const aiResponse = await aiService.generateResponse({
  message,
  mode: "general",
  conversationHistory: formattedHistory,
  studentContext,
  messageCount: conversationHistory.length,
  userId, // Required for RAG
  enableRAG: true, // Can be disabled if needed
  options: {
    temperature: 0.7,
    maxTokens: 1000,
  },
});
```

### API Endpoints

#### Get RAG Statistics

```http
GET /api/rag/stats
```

Returns:

```json
{
  "success": true,
  "stats": {
    "conversationsIndexed": 45,
    "messagesIndexed": 320,
    "moodLogsIndexed": 78,
    "totalIndexed": 443
  }
}
```

#### Test RAG Retrieval

```http
POST /api/rag/search
Content-Type: application/json

{
  "query": "tell me about my stress patterns",
  "topK": 5,
  "minSimilarity": 0.7
}
```

Returns:

```json
{
  "success": true,
  "query": "tell me about my stress patterns",
  "results": {
    "conversations": 2,
    "messages": 3,
    "moodLogs": 4
  },
  "data": { ... },
  "formattedContext": "📚 RELEVANT PAST CONVERSATIONS:\n..."
}
```

## How It Works

### 1. Message Sent

User sends: "I'm feeling stressed about my exams again"

### 2. RAG Retrieval

System:

1. Generates embedding for the query
2. Searches for similar conversations (cosine similarity)
3. Searches for similar messages
4. Searches for similar mood logs (if in emotional mode)
5. Ranks by similarity score (0-1)
6. Returns top K results (default: 3 of each type)

### 3. Context Injection

Retrieved context is formatted and injected into the system prompt:

```
--- RETRIEVED CONTEXT (RAG) ---
RELEVANT PAST CONVERSATIONS:
1. [ACADEMIC] Exam Preparation Stress (Nov 10, 2025)
   Summary: Student discussed stress about upcoming midterms...
   Relevance: 87%

RELEVANT PAST MESSAGES:
1. Student (Nov 5, 2025): "I always get anxious before exams..."
   Relevance: 92%

RELEVANT MOOD PATTERNS:
1. Nov 12, 2025 - Mood: 4/10, Emotions: anxious, overwhelmed
   Notes: Stressed about calculus exam tomorrow
   Relevance: 85%
--- END RETRIEVED CONTEXT ---
```

### 4. AI Response

The LLM now has access to:

- Current student profile (always included)
- Conversation history (last 20 messages)
- **Retrieved past context** (RAG)

This enables responses like:

> "I remember you mentioned exam anxiety back on November 5th, and I see you logged high stress before your calculus exam. Let's work on some strategies that might help..."

## Configuration

### Similarity Threshold

Default: `0.7` (70% similarity)

Higher = more strict (fewer, more relevant results)
Lower = more lenient (more results, possibly less relevant)

```javascript
const results = await ragService.retrieveConversations(query, userId, {
  minSimilarity: 0.8, // Adjust threshold
});
```

### Number of Retrieved Documents

Default: `topK = 3` per type

```javascript
const results = await ragService.retrieveAllContext(query, userId, {
  topK: 5, // Get top 5 of each type
});
```

### Disable RAG for Specific Requests

```javascript
const aiResponse = await aiService.generateResponse({
  // ... other params
  enableRAG: false, // Disable RAG
});
```

## Performance & Costs

### Embedding Generation Costs

- Model: `text-embedding-3-small` (1536 dimensions)
- Cost: **$0.02 per 1 million tokens**
- Average message: ~50 tokens
- **1000 messages ≈ $0.001** (essentially free)

### Monthly Estimates (10,000 messages)

- Embedding generation: ~$0.10
- Additional LLM tokens (retrieved context): ~$0.50
- **Total: ~$0.60/month additional cost**

### Response Time Impact

- Embedding generation: ~50-100ms
- Similarity search: ~10-50ms (with 1000 documents)
- **Total overhead: ~100-150ms** (negligible)

## Troubleshooting

### RAG Not Working

1. **Check OpenAI API Key**

   ```bash
   # Verify environment variable is set
   echo $env:OPENAI_API_KEY
   ```

2. **Check Logs**
   Look for:

   - `RAG Service initialized`
   - `RAG Service disabled (OPENAI_API_KEY not set)`

3. **Check Indexing**
   ```bash
   # Run stats endpoint
   curl http://localhost:3000/api/rag/stats
   ```

### No Results Retrieved

1. **Documents Not Indexed**

   - Run `node src/scripts/index-documents.js`
   - Check stats endpoint

2. **Similarity Threshold Too High**

   - Lower `minSimilarity` from 0.7 to 0.5
   - Test with `/api/rag/search` endpoint

3. **No Historical Data**
   - RAG requires existing conversations to work
   - Create some conversations first

### High Costs

If you notice high embedding costs:

1. **Reduce Batch Processing**

   - Process fewer documents at once
   - Increase delays in indexing script

2. **Disable Auto-Indexing**

   - Comment out embedding generation in chat API
   - Run manual indexing periodically

3. **Cache Embeddings**
   - Already implemented (embeddings stored in DB)

## Best Practices

1. **Run Indexing Periodically**

   ```bash
   # Daily cron job (or trigger via API)
   node src/scripts/index-documents.js
   ```

2. **Monitor Retrieval Quality**

   - Use `/api/rag/search` to test queries
   - Adjust similarity threshold based on results

3. **Balance Context Length**

   - More retrieved docs = better context
   - But also = more tokens = higher cost
   - Default of 3 per type is a good balance

4. **Mode-Specific Retrieval**
   - Emotional mode: Include mood logs
   - Academic mode: Focus on academic conversations
   - Career mode: Focus on career conversations

## Future Enhancements

Potential improvements:

1. **Hybrid Search**

   - Combine semantic search with keyword search
   - Better handling of specific names/dates

2. **MongoDB Atlas Vector Search**

   - Use native vector search (requires M10+ tier)
   - Faster and more scalable

3. **Re-ranking**

   - Use cross-encoder to re-rank results
   - Improves relevance of top results

4. **Query Rewriting**

   - Automatically expand/rephrase queries
   - Better retrieval for ambiguous queries

5. **Document Metadata**

   - Add importance scores
   - Filter by date ranges automatically
   - Weight recent documents higher

6. **User Feedback**
   - Track which retrieved context was useful
   - Fine-tune retrieval over time

## Summary

✅ **What's Implemented:**

- Automatic embedding generation for new messages
- Semantic similarity search across conversations, messages, mood logs
- Context injection into AI prompts
- Background indexing (non-blocking)
- API endpoints for testing and monitoring
- Graceful fallback if RAG fails

✅ **What's Configured:**

- Uses OpenAI text-embedding-3-small (cost-effective)
- Stores embeddings in MongoDB (no external dependencies)
- Retrieves top 3 results per type by default
- 70% similarity threshold

✅ **What's Needed:**

- Run initial indexing script once: `node src/scripts/index-documents.js`
- Ensure `OPENAI_API_KEY` is set in production
- Monitor costs and adjust as needed

The RAG system is production-ready and will significantly enhance the personalization and continuity of your AI counselling system!

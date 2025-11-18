import { getEmbeddingService } from './embedding-service';
import connectDB from '@/lib/db/mongodb';
import Conversation from '@/models/Conversation';
import Message from '@/models/Message';
import MoodLog from '@/models/MoodLog';

/**
 * RAG (Retrieval-Augmented Generation) Service
 * Handles document retrieval based on semantic similarity
 */
class RAGService {
    constructor() {
        this.embeddingService = getEmbeddingService();
        this.defaultTopK = 5; // Number of documents to retrieve
        this.minSimilarityThreshold = 0.7; // Minimum similarity score (0-1)
    }

    /**
     * Retrieve relevant conversations based on query
     * @param {string} query - Search query
     * @param {string} userId - User ID to filter results
     * @param {Object} options - Retrieval options
     * @returns {Promise<Array>} - Array of relevant conversations with similarity scores
     */
    async retrieveConversations(query, userId, options = {}) {
        try {
            await connectDB();

            const {
                topK = this.defaultTopK,
                minSimilarity = this.minSimilarityThreshold,
                mode = null, // Filter by conversation mode
                dateRange = null, // { start: Date, end: Date }
            } = options;

            // Generate query embedding
            const queryEmbedding = await this.embeddingService.generateEmbedding(query);

            // Build filter
            const filter = {
                userId,
                embedding: { $exists: true, $ne: null },
            };

            if (mode) {
                filter.mode = mode;
            }

            if (dateRange) {
                filter.createdAt = {};
                if (dateRange.start) filter.createdAt.$gte = dateRange.start;
                if (dateRange.end) filter.createdAt.$lte = dateRange.end;
            }

            // Fetch conversations with embeddings
            const conversations = await Conversation.find(filter)
                .select('_id title mode summary embedding createdAt lastMessageAt')
                .limit(100) // Pre-filter to reasonable size
                .lean();

            if (conversations.length === 0) {
                return [];
            }

            // Calculate similarity scores
            const conversationsWithScores = conversations
                .map(conv => ({
                    ...conv,
                    similarity: this.embeddingService.cosineSimilarity(
                        queryEmbedding,
                        conv.embedding
                    ),
                }))
                .filter(conv => conv.similarity >= minSimilarity)
                .sort((a, b) => b.similarity - a.similarity)
                .slice(0, topK);

            return conversationsWithScores;
        } catch (error) {
            console.error('Retrieve conversations error:', error);
            throw error;
        }
    }

    /**
     * Retrieve relevant messages based on query
     * @param {string} query - Search query
     * @param {string} userId - User ID to filter results
     * @param {Object} options - Retrieval options
     * @returns {Promise<Array>} - Array of relevant messages with similarity scores
     */
    async retrieveMessages(query, userId, options = {}) {
        try {
            await connectDB();

            const {
                topK = this.defaultTopK,
                minSimilarity = this.minSimilarityThreshold,
                role = null, // 'user' or 'assistant'
            } = options;

            // Generate query embedding
            const queryEmbedding = await this.embeddingService.generateEmbedding(query);

            // First, get user's conversation IDs
            const conversations = await Conversation.find({ userId })
                .select('_id')
                .lean();

            const conversationIds = conversations.map(c => c._id);

            if (conversationIds.length === 0) {
                return [];
            }

            // Build filter
            const filter = {
                conversationId: { $in: conversationIds },
                embedding: { $exists: true, $ne: null },
            };

            if (role) {
                filter.role = role;
            }

            // Fetch messages with embeddings
            const messages = await Message.find(filter)
                .select('_id conversationId role content embedding createdAt sentimentScore')
                .limit(200) // Pre-filter to reasonable size
                .lean();

            if (messages.length === 0) {
                return [];
            }

            // Calculate similarity scores
            const messagesWithScores = messages
                .map(msg => ({
                    ...msg,
                    similarity: this.embeddingService.cosineSimilarity(
                        queryEmbedding,
                        msg.embedding
                    ),
                }))
                .filter(msg => msg.similarity >= minSimilarity)
                .sort((a, b) => b.similarity - a.similarity)
                .slice(0, topK);

            return messagesWithScores;
        } catch (error) {
            console.error('Retrieve messages error:', error);
            throw error;
        }
    }

    /**
     * Retrieve relevant mood logs based on query
     * @param {string} query - Search query
     * @param {string} userId - User ID to filter results
     * @param {Object} options - Retrieval options
     * @returns {Promise<Array>} - Array of relevant mood logs with similarity scores
     */
    async retrieveMoodLogs(query, userId, options = {}) {
        try {
            await connectDB();

            const {
                topK = this.defaultTopK,
                minSimilarity = this.minSimilarityThreshold,
                dateRange = null,
            } = options;

            // Generate query embedding
            const queryEmbedding = await this.embeddingService.generateEmbedding(query);

            // Build filter
            const filter = {
                userId,
                embedding: { $exists: true, $ne: null },
            };

            if (dateRange) {
                filter.createdAt = {};
                if (dateRange.start) filter.createdAt.$gte = dateRange.start;
                if (dateRange.end) filter.createdAt.$lte = dateRange.end;
            }

            // Fetch mood logs with embeddings
            const moodLogs = await MoodLog.find(filter)
                .select('_id moodScore emotions notes context embedding createdAt')
                .limit(100)
                .lean();

            if (moodLogs.length === 0) {
                return [];
            }

            // Calculate similarity scores
            const moodLogsWithScores = moodLogs
                .map(log => ({
                    ...log,
                    similarity: this.embeddingService.cosineSimilarity(
                        queryEmbedding,
                        log.embedding
                    ),
                }))
                .filter(log => log.similarity >= minSimilarity)
                .sort((a, b) => b.similarity - a.similarity)
                .slice(0, topK);

            return moodLogsWithScores;
        } catch (error) {
            console.error('Retrieve mood logs error:', error);
            throw error;
        }
    }

    /**
     * Retrieve all relevant context (conversations, messages, mood logs)
     * @param {string} query - Search query
     * @param {string} userId - User ID to filter results
     * @param {Object} options - Retrieval options
     * @returns {Promise<Object>} - Object containing all retrieved context
     */
    async retrieveAllContext(query, userId, options = {}) {
        try {
            const {
                includeConversations = true,
                includeMessages = true,
                includeMoodLogs = true,
                topK = 3, // Fewer per type when retrieving all
            } = options;

            const results = {};

            // Retrieve in parallel
            const promises = [];

            if (includeConversations) {
                promises.push(
                    this.retrieveConversations(query, userId, { ...options, topK })
                        .then(data => ({ type: 'conversations', data }))
                );
            }

            if (includeMessages) {
                promises.push(
                    this.retrieveMessages(query, userId, { ...options, topK })
                        .then(data => ({ type: 'messages', data }))
                );
            }

            if (includeMoodLogs) {
                promises.push(
                    this.retrieveMoodLogs(query, userId, { ...options, topK })
                        .then(data => ({ type: 'moodLogs', data }))
                );
            }

            const retrievalResults = await Promise.all(promises);

            // Organize results
            retrievalResults.forEach(result => {
                results[result.type] = result.data;
            });

            return results;
        } catch (error) {
            console.error('Retrieve all context error:', error);
            throw error;
        }
    }

    /**
     * Format retrieved context for LLM injection
     * @param {Object} retrievedContext - Context from retrieveAllContext
     * @returns {string} - Formatted context string
     */
    formatContextForPrompt(retrievedContext) {
        const sections = [];

        // Format conversations
        if (retrievedContext.conversations && retrievedContext.conversations.length > 0) {
            sections.push('📚 RELEVANT PAST CONVERSATIONS:');
            retrievedContext.conversations.forEach((conv, idx) => {
                const date = new Date(conv.createdAt).toLocaleDateString();
                sections.push(
                    `${idx + 1}. [${conv.mode.toUpperCase()}] ${conv.title || 'Untitled'} (${date})` +
                    `\n   Summary: ${conv.summary || 'No summary available'}` +
                    `\n   Relevance: ${(conv.similarity * 100).toFixed(0)}%`
                );
            });
            sections.push('');
        }

        // Format messages
        if (retrievedContext.messages && retrievedContext.messages.length > 0) {
            sections.push('💬 RELEVANT PAST MESSAGES:');
            retrievedContext.messages.forEach((msg, idx) => {
                const date = new Date(msg.createdAt).toLocaleDateString();
                const role = msg.role === 'user' ? 'Student' : 'Counsellor';
                const preview = msg.content.length > 150
                    ? msg.content.substring(0, 150) + '...'
                    : msg.content;
                sections.push(
                    `${idx + 1}. ${role} (${date}): "${preview}"` +
                    `\n   Relevance: ${(msg.similarity * 100).toFixed(0)}%`
                );
            });
            sections.push('');
        }

        // Format mood logs
        if (retrievedContext.moodLogs && retrievedContext.moodLogs.length > 0) {
            sections.push('😊 RELEVANT MOOD PATTERNS:');
            retrievedContext.moodLogs.forEach((log, idx) => {
                const date = new Date(log.createdAt).toLocaleDateString();
                sections.push(
                    `${idx + 1}. ${date} - Mood: ${log.moodScore}/10, Emotions: ${log.emotions.join(', ')}` +
                    (log.notes ? `\n   Notes: ${log.notes}` : '') +
                    `\n   Relevance: ${(log.similarity * 100).toFixed(0)}%`
                );
            });
            sections.push('');
        }

        if (sections.length === 0) {
            return '';
        }

        return '\n--- RETRIEVED CONTEXT (RAG) ---\n' +
            sections.join('\n') +
            '\n--- END RETRIEVED CONTEXT ---\n' +
            '\nIMPORTANT: Use this retrieved context to provide continuity and reference past interactions when relevant. ' +
            'Mention specific past conversations or patterns if they help inform your response.';
    }

    /**
     * Get retrieval statistics
     * @param {string} userId - User ID
     * @returns {Promise<Object>} - Statistics about indexed documents
     */
    async getStats(userId) {
        try {
            await connectDB();

            const stats = await Promise.all([
                Conversation.countDocuments({ userId, embedding: { $exists: true, $ne: null } }),
                Message.countDocuments({
                    conversationId: {
                        $in: await Conversation.find({ userId }).select('_id').lean().then(c => c.map(x => x._id))
                    },
                    embedding: { $exists: true, $ne: null }
                }),
                MoodLog.countDocuments({ userId, embedding: { $exists: true, $ne: null } }),
            ]);

            return {
                conversationsIndexed: stats[0],
                messagesIndexed: stats[1],
                moodLogsIndexed: stats[2],
                totalIndexed: stats[0] + stats[1] + stats[2],
            };
        } catch (error) {
            console.error('Get stats error:', error);
            return {
                conversationsIndexed: 0,
                messagesIndexed: 0,
                moodLogsIndexed: 0,
                totalIndexed: 0,
            };
        }
    }
}

// Singleton instance
let ragServiceInstance = null;

export function getRAGService() {
    if (!ragServiceInstance) {
        ragServiceInstance = new RAGService();
    }
    return ragServiceInstance;
}

export default RAGService;

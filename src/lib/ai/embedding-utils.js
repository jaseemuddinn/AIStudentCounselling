import { getEmbeddingService } from './embedding-service';

/**
 * Utility functions for automatic embedding generation
 * Use these in API routes when creating new documents
 */

let embeddingService = null;

// Initialize embedding service only if OpenAI key is available
try {
    if (process.env.OPENAI_API_KEY) {
        embeddingService = getEmbeddingService();
    }
} catch (error) {
    console.error('Failed to initialize embedding service:', error.message);
}

/**
 * Generate embedding for a new message
 * @param {Object} message - Message object with content
 * @returns {Promise<number[]>} - Embedding vector
 */
export async function generateMessageEmbedding(message) {
    try {
        if (!embeddingService) {
            console.log('⚠️ Embedding service not initialized (OPENAI_API_KEY missing)');
            return null;
        }

        if (!message.content || typeof message.content !== 'string') {
            throw new Error('Invalid message content');
        }

        const embedding = await embeddingService.generateEmbedding(message.content);
        return embedding;
    } catch (error) {
        console.error('Generate message embedding error:', error);
        return null; // Return null instead of throwing to avoid breaking the main flow
    }
}

/**
 * Generate embedding for a conversation summary
 * @param {Array} messages - Array of message objects
 * @returns {Promise<{summary: string, embedding: number[]}>} - Summary and embedding
 */
export async function generateConversationEmbedding(messages) {
    try {
        if (!embeddingService) {
            console.log('⚠️ Embedding service not initialized (OPENAI_API_KEY missing)');
            return { summary: '', embedding: null };
        }

        if (!Array.isArray(messages) || messages.length === 0) {
            throw new Error('Invalid messages array');
        }

        // Format conversation
        const conversationText = embeddingService.formatConversationForEmbedding(messages);

        // Generate summary (first 200 chars)
        const summary = conversationText.length > 200
            ? conversationText.substring(0, 200) + '...'
            : conversationText;

        // Generate embedding
        const embedding = await embeddingService.generateEmbedding(conversationText);

        return { summary, embedding };
    } catch (error) {
        console.error('Generate conversation embedding error:', error);
        return { summary: '', embedding: null };
    }
}

/**
 * Generate embedding for a mood log
 * @param {Object} moodLog - Mood log object
 * @returns {Promise<number[]>} - Embedding vector
 */
export async function generateMoodLogEmbedding(moodLog) {
    try {
        const formattedText = embeddingService.formatMoodLogForEmbedding(moodLog);

        if (!formattedText || formattedText.trim().length === 0) {
            throw new Error('No content to embed in mood log');
        }

        const embedding = await embeddingService.generateEmbedding(formattedText);
        return embedding;
    } catch (error) {
        console.error('Generate mood log embedding error:', error);
        return null;
    }
}

/**
 * Update conversation with embeddings after new messages
 * @param {string} conversationId - Conversation ID
 * @returns {Promise<boolean>} - Success status
 */
export async function updateConversationEmbedding(conversationId) {
    try {
        // Dynamically import to avoid circular dependencies
        const { default: Conversation } = await import('@/models/Conversation');
        const { default: Message } = await import('@/models/Message');
        const { default: connectDB } = await import('@/lib/db/mongodb');

        await connectDB();

        // Get conversation and messages
        const conversation = await Conversation.findById(conversationId);
        if (!conversation) {
            throw new Error('Conversation not found');
        }

        const messages = await Message.find({ conversationId })
            .sort({ createdAt: 1 })
            .lean();

        if (messages.length === 0) {
            return false;
        }

        // Generate embeddings
        const { summary, embedding } = await generateConversationEmbedding(messages);

        // Update conversation
        conversation.summary = summary;
        conversation.embedding = embedding;
        await conversation.save();

        return true;
    } catch (error) {
        console.error('Update conversation embedding error:', error);
        return false;
    }
}

export { embeddingService };

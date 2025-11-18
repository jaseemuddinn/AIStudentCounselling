import OpenAI from 'openai';

/**
 * Service for generating text embeddings using OpenAI
 * Uses text-embedding-3-small model for cost-effectiveness
 */
class EmbeddingService {
    constructor() {
        const apiKey = process.env.OPENAI_API_KEY;
        if (!apiKey) {
            throw new Error('OPENAI_API_KEY is not set. Required for RAG embeddings.');
        }
        this.client = new OpenAI({ apiKey });
        this.model = 'text-embedding-3-small'; // 1536 dimensions, $0.02/1M tokens
        this.maxTokensPerChunk = 8000; // Safe limit for embedding model
    }

    /**
     * Generate embedding for a single text
     * @param {string} text - Text to embed
     * @returns {Promise<number[]>} - Embedding vector (1536 dimensions)
     */
    async generateEmbedding(text) {
        if (!text || typeof text !== 'string' || text.trim().length === 0) {
            throw new Error('Invalid text provided for embedding');
        }

        try {
            const response = await this.client.embeddings.create({
                model: this.model,
                input: text.trim(),
            });

            return response.data[0].embedding;
        } catch (error) {
            console.error('Embedding generation error:', error);
            throw new Error(`Failed to generate embedding: ${error.message}`);
        }
    }

    /**
     * Generate embeddings for multiple texts in batch
     * @param {string[]} texts - Array of texts to embed
     * @returns {Promise<number[][]>} - Array of embedding vectors
     */
    async generateEmbeddings(texts) {
        if (!Array.isArray(texts) || texts.length === 0) {
            throw new Error('Invalid texts array provided');
        }

        try {
            // Filter out empty texts
            const validTexts = texts.filter(t => t && typeof t === 'string' && t.trim().length > 0);

            if (validTexts.length === 0) {
                throw new Error('No valid texts provided for embedding');
            }

            // OpenAI API supports batch embeddings (up to 2048 inputs)
            const batchSize = 100; // Process in smaller batches for safety
            const allEmbeddings = [];

            for (let i = 0; i < validTexts.length; i += batchSize) {
                const batch = validTexts.slice(i, i + batchSize);

                const response = await this.client.embeddings.create({
                    model: this.model,
                    input: batch.map(t => t.trim()),
                });

                allEmbeddings.push(...response.data.map(d => d.embedding));
            }

            return allEmbeddings;
        } catch (error) {
            console.error('Batch embedding generation error:', error);
            throw new Error(`Failed to generate embeddings: ${error.message}`);
        }
    }

    /**
     * Calculate cosine similarity between two vectors
     * @param {number[]} vecA - First vector
     * @param {number[]} vecB - Second vector
     * @returns {number} - Similarity score (0 to 1)
     */
    cosineSimilarity(vecA, vecB) {
        if (vecA.length !== vecB.length) {
            throw new Error('Vectors must have the same dimensions');
        }

        let dotProduct = 0;
        let normA = 0;
        let normB = 0;

        for (let i = 0; i < vecA.length; i++) {
            dotProduct += vecA[i] * vecB[i];
            normA += vecA[i] * vecA[i];
            normB += vecB[i] * vecB[i];
        }

        normA = Math.sqrt(normA);
        normB = Math.sqrt(normB);

        if (normA === 0 || normB === 0) {
            return 0;
        }

        return dotProduct / (normA * normB);
    }

    /**
     * Prepare text for embedding by chunking if too long
     * @param {string} text - Text to prepare
     * @param {number} maxLength - Maximum character length per chunk
     * @returns {string[]} - Array of text chunks
     */
    chunkText(text, maxLength = 2000) {
        if (!text || text.length <= maxLength) {
            return [text];
        }

        const chunks = [];
        const sentences = text.match(/[^.!?]+[.!?]+/g) || [text];
        let currentChunk = '';

        for (const sentence of sentences) {
            if ((currentChunk + sentence).length <= maxLength) {
                currentChunk += sentence;
            } else {
                if (currentChunk) {
                    chunks.push(currentChunk.trim());
                }
                currentChunk = sentence;
            }
        }

        if (currentChunk) {
            chunks.push(currentChunk.trim());
        }

        return chunks.filter(chunk => chunk.length > 0);
    }

    /**
     * Format conversation messages for embedding
     * @param {Array} messages - Array of message objects
     * @returns {string} - Formatted text
     */
    formatConversationForEmbedding(messages) {
        if (!Array.isArray(messages) || messages.length === 0) {
            return '';
        }

        return messages
            .map(msg => {
                const role = msg.role === 'user' ? 'Student' : 'Counsellor';
                return `${role}: ${msg.content}`;
            })
            .join('\n');
    }

    /**
     * Format mood log for embedding
     * @param {Object} moodLog - Mood log object
     * @returns {string} - Formatted text
     */
    formatMoodLogForEmbedding(moodLog) {
        const parts = [];

        if (moodLog.mood) {
            parts.push(`Mood: ${moodLog.mood}`);
        }

        if (moodLog.intensity) {
            parts.push(`Intensity: ${moodLog.intensity}/5`);
        }

        if (moodLog.activities && moodLog.activities.length > 0) {
            parts.push(`Activities: ${moodLog.activities.join(', ')}`);
        }

        if (moodLog.notes) {
            parts.push(`Notes: ${moodLog.notes}`);
        }

        if (moodLog.triggers && moodLog.triggers.length > 0) {
            parts.push(`Triggers: ${moodLog.triggers.join(', ')}`);
        }

        return parts.join('. ');
    }

    /**
     * Format goal for embedding
     * @param {Object} goal - Goal object
     * @returns {string} - Formatted text
     */
    formatGoalForEmbedding(goal) {
        const parts = [];

        if (goal.title) {
            parts.push(`Goal: ${goal.title}`);
        }

        if (goal.description) {
            parts.push(goal.description);
        }

        if (goal.category) {
            parts.push(`Category: ${goal.category}`);
        }

        if (goal.milestones && goal.milestones.length > 0) {
            const milestoneTexts = goal.milestones.map(m => m.title).join(', ');
            parts.push(`Milestones: ${milestoneTexts}`);
        }

        return parts.join('. ');
    }
}

// Singleton instance
let embeddingServiceInstance = null;

export function getEmbeddingService() {
    if (!embeddingServiceInstance) {
        embeddingServiceInstance = new EmbeddingService();
    }
    return embeddingServiceInstance;
}

export default EmbeddingService;

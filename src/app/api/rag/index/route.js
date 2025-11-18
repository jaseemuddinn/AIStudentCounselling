import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth/auth';
import { getEmbeddingService } from '@/lib/ai/embedding-service';
import connectDB from '@/lib/db/mongodb';
import Conversation from '@/models/Conversation';
import Message from '@/models/Message';
import MoodLog from '@/models/MoodLog';

/**
 * POST /api/rag/index - Manually trigger indexing of documents
 * This can be used instead of running the command-line script
 */
export async function POST(request) {
    try {
        const session = await auth();

        // Require authentication
        if (!session) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            );
        }

        const { type = 'all', limit = 100, userId = null } = await request.json();

        await connectDB();
        const embeddingService = getEmbeddingService();

        const results = {
            conversations: { indexed: 0, errors: 0 },
            messages: { indexed: 0, errors: 0 },
            moodLogs: { indexed: 0, errors: 0 },
        };

        // Index conversations
        if (type === 'all' || type === 'conversations') {
            const filter = {
                $or: [
                    { embedding: { $exists: false } },
                    { embedding: null },
                ]
            };

            // Optionally filter by userId
            if (userId) {
                filter.userId = userId;
            }

            const conversations = await Conversation.find(filter).limit(limit);

            for (const conversation of conversations) {
                try {
                    const messages = await Message.find({ conversationId: conversation._id })
                        .sort({ createdAt: 1 })
                        .lean();

                    if (messages.length === 0) continue;

                    const conversationText = embeddingService.formatConversationForEmbedding(messages);
                    const summary = conversationText.length > 200
                        ? conversationText.substring(0, 200) + '...'
                        : conversationText;

                    const embedding = await embeddingService.generateEmbedding(conversationText);

                    conversation.summary = summary;
                    conversation.embedding = embedding;
                    await conversation.save();

                    results.conversations.indexed++;
                } catch (error) {
                    results.conversations.errors++;
                    console.error('Error indexing conversation:', error);
                }
            }
        }

        // Index messages
        if (type === 'all' || type === 'messages') {
            const messages = await Message.find({
                $or: [
                    { embedding: { $exists: false } },
                    { embedding: null }
                ]
            }).limit(limit);

            const batchSize = 10;
            for (let i = 0; i < messages.length; i += batchSize) {
                const batch = messages.slice(i, i + batchSize);

                try {
                    const texts = batch.map(msg => msg.content);
                    const embeddings = await embeddingService.generateEmbeddings(texts);

                    for (let j = 0; j < batch.length; j++) {
                        batch[j].embedding = embeddings[j];
                        await batch[j].save();
                        results.messages.indexed++;
                    }
                } catch (error) {
                    results.messages.errors += batch.length;
                    console.error('Error indexing message batch:', error);
                }
            }
        }

        // Index mood logs
        if (type === 'all' || type === 'moodLogs') {
            const moodLogs = await MoodLog.find({
                $or: [
                    { embedding: { $exists: false } },
                    { embedding: null }
                ]
            }).limit(limit);

            const batchSize = 10;
            for (let i = 0; i < moodLogs.length; i += batchSize) {
                const batch = moodLogs.slice(i, i + batchSize);

                try {
                    const texts = batch.map(log => embeddingService.formatMoodLogForEmbedding(log));
                    const embeddings = await embeddingService.generateEmbeddings(texts);

                    for (let j = 0; j < batch.length; j++) {
                        batch[j].embedding = embeddings[j];
                        await batch[j].save();
                        results.moodLogs.indexed++;
                    }
                } catch (error) {
                    results.moodLogs.errors += batch.length;
                    console.error('Error indexing mood log batch:', error);
                }
            }
        }

        return NextResponse.json({
            success: true,
            message: 'Indexing completed',
            results,
            total: results.conversations.indexed + results.messages.indexed + results.moodLogs.indexed,
        });

    } catch (error) {
        console.error('RAG Index API Error:', error);
        return NextResponse.json(
            { error: 'Failed to index documents', details: error.message },
            { status: 500 }
        );
    }
}

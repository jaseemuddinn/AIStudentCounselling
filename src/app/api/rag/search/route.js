import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth/auth';
import { getRAGService } from '@/lib/ai/rag-service';

/**
 * POST /api/rag/search - Test RAG retrieval (for debugging/admin)
 */
export async function POST(request) {
    try {
        const session = await auth();

        if (!session) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            );
        }

        const userId = session.user.id;
        const { query, topK = 5, minSimilarity = 0.7 } = await request.json();

        if (!query || !query.trim()) {
            return NextResponse.json(
                { error: 'Query is required' },
                { status: 400 }
            );
        }

        const ragService = getRAGService();

        // Retrieve all context types
        const results = await ragService.retrieveAllContext(query, userId, {
            topK: parseInt(topK),
            minSimilarity: parseFloat(minSimilarity),
            includeConversations: true,
            includeMessages: true,
            includeMoodLogs: true,
        });

        // Format for display
        const formattedContext = ragService.formatContextForPrompt(results);

        return NextResponse.json({
            success: true,
            query,
            results: {
                conversations: results.conversations?.length || 0,
                messages: results.messages?.length || 0,
                moodLogs: results.moodLogs?.length || 0,
            },
            data: results,
            formattedContext,
        });
    } catch (error) {
        console.error('RAG Search API Error:', error);
        return NextResponse.json(
            { error: 'Failed to search', details: error.message },
            { status: 500 }
        );
    }
}

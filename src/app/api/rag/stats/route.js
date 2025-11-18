import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth/auth';
import { getRAGService } from '@/lib/ai/rag-service';

/**
 * GET /api/rag/stats - Get RAG indexing statistics for current user
 */
export async function GET(request) {
    try {
        const session = await auth();

        if (!session) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            );
        }

        const userId = session.user.id;
        const ragService = getRAGService();

        const stats = await ragService.getStats(userId);

        return NextResponse.json({
            success: true,
            stats,
        });
    } catch (error) {
        console.error('RAG Stats API Error:', error);
        return NextResponse.json(
            { error: 'Failed to get RAG stats', details: error.message },
            { status: 500 }
        );
    }
}

import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth/auth';
import connectDB from '@/lib/db/mongodb';
import Recommendation from '@/models/Recommendation';

// GET /api/recommendations - List all recommendations
export async function GET() {
    try {
        const session = await auth();

        if (!session) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            );
        }

        const userId = session.user.id;

        await connectDB();

        const recommendations = await Recommendation.find({ userId })
            .sort({ createdAt: -1 })
            .lean();

        return NextResponse.json({
            success: true,
            recommendations: recommendations.map(rec => ({
                _id: rec._id.toString(),
                type: rec.type,
                title: rec.title,
                description: rec.description,
                reason: rec.reason,
                priority: rec.priority,
                status: rec.status,
                relevanceScore: rec.relevanceScore,
                metadata: rec.metadata,
                createdAt: rec.createdAt,
                updatedAt: rec.updatedAt,
            })),
        });
    } catch (error) {
        console.error('Get recommendations error:', error);
        return NextResponse.json(
            { error: 'Failed to fetch recommendations', details: error.message },
            { status: 500 }
        );
    }
}

// POST /api/recommendations - Create recommendation manually (admin/testing)
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
        const data = await request.json();

        await connectDB();

        const recommendation = await Recommendation.create({
            userId,
            type: data.type,
            title: data.title,
            description: data.description,
            reason: data.reason,
            priority: data.priority || 'medium',
            status: 'new',
            relevanceScore: data.relevanceScore || 70,
            metadata: data.metadata || {},
        });

        return NextResponse.json({
            success: true,
            message: 'Recommendation created successfully',
            recommendation: {
                _id: recommendation._id.toString(),
                type: recommendation.type,
                title: recommendation.title,
                description: recommendation.description,
                reason: recommendation.reason,
                priority: recommendation.priority,
                status: recommendation.status,
                relevanceScore: recommendation.relevanceScore,
                metadata: recommendation.metadata,
                createdAt: recommendation.createdAt,
            },
        });
    } catch (error) {
        console.error('Create recommendation error:', error);
        return NextResponse.json(
            { error: 'Failed to create recommendation', details: error.message },
            { status: 500 }
        );
    }
}

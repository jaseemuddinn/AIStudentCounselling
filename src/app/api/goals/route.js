import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth/auth';
import connectDB from '@/lib/db/mongodb';
import Goal from '@/models/Goal';

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
        await connectDB();

        const goals = await Goal.find({ userId }).sort({ createdAt: -1 });

        return NextResponse.json({
            success: true,
            goals: goals.map(goal => ({
                _id: goal._id.toString(),
                title: goal.title,
                description: goal.description,
                category: goal.category,
                status: goal.status,
                progressPercentage: goal.progressPercentage,
                targetDate: goal.targetDate,
                milestones: goal.milestones,
                createdAt: goal.createdAt,
                updatedAt: goal.updatedAt,
            })),
        });
    } catch (error) {
        console.error('Get goals error:', error);
        return NextResponse.json(
            { error: 'Failed to fetch goals', details: error.message },
            { status: 500 }
        );
    }
}

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

        const goal = await Goal.create({
            userId,
            title: data.title,
            description: data.description || '',
            category: data.category,
            targetDate: data.targetDate ? new Date(data.targetDate) : null,
            status: data.status || 'not-started',
            progressPercentage: data.progressPercentage || 0,
            milestones: data.milestones || [],
        });

        return NextResponse.json({
            success: true,
            message: 'Goal created successfully',
            goal: {
                id: goal._id,
                title: goal.title,
                description: goal.description,
                category: goal.category,
                status: goal.status,
                progressPercentage: goal.progressPercentage,
                targetDate: goal.targetDate,
                milestones: goal.milestones,
                createdAt: goal.createdAt,
            },
        });
    } catch (error) {
        console.error('Create goal error:', error);
        return NextResponse.json(
            { error: 'Failed to create goal', details: error.message },
            { status: 500 }
        );
    }
}

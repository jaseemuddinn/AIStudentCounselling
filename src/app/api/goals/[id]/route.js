import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth/auth';
import connectDB from '@/lib/db/mongodb';
import Goal from '@/models/Goal';

export async function GET(request, { params }) {
    try {
        const session = await auth();

        if (!session) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            );
        }

        const userId = session.user.id;
        const { id } = params;

        await connectDB();

        const goal = await Goal.findOne({ _id: id, userId });

        if (!goal) {
            return NextResponse.json(
                { error: 'Goal not found' },
                { status: 404 }
            );
        }

        return NextResponse.json({
            success: true,
            goal: {
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
            },
        });
    } catch (error) {
        console.error('Get goal error:', error);
        return NextResponse.json(
            { error: 'Failed to fetch goal', details: error.message },
            { status: 500 }
        );
    }
}

export async function PUT(request, { params }) {
    try {
        const session = await auth();

        if (!session) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            );
        }

        const userId = session.user.id;
        const { id } = params;
        const data = await request.json();

        await connectDB();

        // Build update object with only provided fields
        const updateData = {};
        if (data.title !== undefined) updateData.title = data.title;
        if (data.description !== undefined) updateData.description = data.description;
        if (data.category !== undefined) updateData.category = data.category;
        if (data.status !== undefined) updateData.status = data.status;
        if (data.progressPercentage !== undefined) updateData.progressPercentage = data.progressPercentage;
        if (data.targetDate !== undefined) updateData.targetDate = data.targetDate ? new Date(data.targetDate) : null;
        if (data.milestones !== undefined) updateData.milestones = data.milestones;

        // Auto-complete if progress reaches 100%
        if (data.progressPercentage === 100 && !data.status) {
            updateData.status = 'completed';
        }

        const goal = await Goal.findOneAndUpdate(
            { _id: id, userId },
            { $set: updateData },
            { new: true, runValidators: true }
        );

        if (!goal) {
            return NextResponse.json(
                { error: 'Goal not found' },
                { status: 404 }
            );
        }

        return NextResponse.json({
            success: true,
            message: 'Goal updated successfully',
            goal: {
                _id: goal._id.toString(),
                title: goal.title,
                description: goal.description,
                category: goal.category,
                status: goal.status,
                progressPercentage: goal.progressPercentage,
                targetDate: goal.targetDate,
                milestones: goal.milestones,
                updatedAt: goal.updatedAt,
            },
        });
    } catch (error) {
        console.error('Update goal error:', error);
        return NextResponse.json(
            { error: 'Failed to update goal', details: error.message },
            { status: 500 }
        );
    }
}

export async function DELETE(request, { params }) {
    try {
        const session = await auth();

        if (!session) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            );
        }

        const userId = session.user.id;
        const { id } = params;

        await connectDB();

        const goal = await Goal.findOneAndDelete({ _id: id, userId });

        if (!goal) {
            return NextResponse.json(
                { error: 'Goal not found' },
                { status: 404 }
            );
        }

        return NextResponse.json({
            success: true,
            message: 'Goal deleted successfully',
        });
    } catch (error) {
        console.error('Delete goal error:', error);
        return NextResponse.json(
            { error: 'Failed to delete goal', details: error.message },
            { status: 500 }
        );
    }
}

import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth/auth';
import connectDB from '@/lib/db/mongodb';
import Recommendation from '@/models/Recommendation';

// PATCH /api/recommendations/[id] - Update recommendation status
export async function PATCH(request, { params }) {
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

        const recommendation = await Recommendation.findOne({ _id: id, userId });

        if (!recommendation) {
            return NextResponse.json(
                { error: 'Recommendation not found' },
                { status: 404 }
            );
        }

        // Update status
        if (data.status !== undefined) {
            recommendation.status = data.status;
        }

        await recommendation.save();

        return NextResponse.json({
            success: true,
            message: 'Recommendation updated successfully',
            recommendation: {
                _id: recommendation._id.toString(),
                status: recommendation.status,
                updatedAt: recommendation.updatedAt,
            },
        });
    } catch (error) {
        console.error('Update recommendation error:', error);
        return NextResponse.json(
            { error: 'Failed to update recommendation', details: error.message },
            { status: 500 }
        );
    }
}

// DELETE /api/recommendations/[id] - Delete recommendation
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

        const recommendation = await Recommendation.findOneAndDelete({ _id: id, userId });

        if (!recommendation) {
            return NextResponse.json(
                { error: 'Recommendation not found' },
                { status: 404 }
            );
        }

        return NextResponse.json({
            success: true,
            message: 'Recommendation deleted successfully',
        });
    } catch (error) {
        console.error('Delete recommendation error:', error);
        return NextResponse.json(
            { error: 'Failed to delete recommendation', details: error.message },
            { status: 500 }
        );
    }
}

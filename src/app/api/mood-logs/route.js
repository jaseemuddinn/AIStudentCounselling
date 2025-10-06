import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth/auth';
import connectDB from '@/lib/db/mongodb';
import MoodLog from '@/models/MoodLog';

// GET /api/mood-logs - List mood logs for authenticated user
export async function GET(request) {
    try {
        const session = await auth();
        if (!session) {
            return NextResponse.json(
                { success: false, error: 'Unauthorized' },
                { status: 401 }
            );
        }

        await connectDB();

        // Get timeframe from query params (default 7 days)
        const { searchParams } = new URL(request.url);
        const timeframe = parseInt(searchParams.get('timeframe') || '7');

        // Calculate date range
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - timeframe);

        const logs = await MoodLog.find({
            userId: session.user.id,
            createdAt: { $gte: startDate }
        })
            .sort({ createdAt: -1 })
            .lean();

        return NextResponse.json({
            success: true,
            logs,
            count: logs.length
        });

    } catch (error) {
        console.error('Error fetching mood logs:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to fetch mood logs' },
            { status: 500 }
        );
    }
}

// POST /api/mood-logs - Create new mood log
export async function POST(request) {
    try {
        const session = await auth();
        if (!session) {
            return NextResponse.json(
                { success: false, error: 'Unauthorized' },
                { status: 401 }
            );
        }

        const body = await request.json();
        const { moodScore, emotions, notes, context } = body;

        // Validation
        if (!moodScore || moodScore < 1 || moodScore > 10) {
            return NextResponse.json(
                { success: false, error: 'Mood score must be between 1 and 10' },
                { status: 400 }
            );
        }

        if (!emotions || emotions.length === 0) {
            return NextResponse.json(
                { success: false, error: 'At least one emotion is required' },
                { status: 400 }
            );
        }

        await connectDB();

        const moodLog = await MoodLog.create({
            userId: session.user.id,
            moodScore,
            emotions,
            notes: notes || '',
            context: context || ''
        });

        return NextResponse.json({
            success: true,
            message: 'Mood logged successfully',
            log: moodLog
        }, { status: 201 });

    } catch (error) {
        console.error('Error creating mood log:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to create mood log' },
            { status: 500 }
        );
    }
}

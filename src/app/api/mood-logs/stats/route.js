import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth/auth';
import connectDB from '@/lib/db/mongodb';
import MoodLog from '@/models/MoodLog';

// GET /api/mood-logs/stats - Get mood statistics
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

        // Calculate date ranges
        const currentEndDate = new Date();
        const currentStartDate = new Date();
        currentStartDate.setDate(currentStartDate.getDate() - timeframe);

        const previousEndDate = new Date(currentStartDate);
        const previousStartDate = new Date(previousEndDate);
        previousStartDate.setDate(previousStartDate.getDate() - timeframe);

        // Fetch current period logs
        const currentLogs = await MoodLog.find({
            userId: session.user.id,
            createdAt: {
                $gte: currentStartDate,
                $lte: currentEndDate
            }
        }).lean();

        // Fetch previous period logs for trend calculation
        const previousLogs = await MoodLog.find({
            userId: session.user.id,
            createdAt: {
                $gte: previousStartDate,
                $lte: previousEndDate
            }
        }).lean();

        // Calculate statistics
        const totalLogs = currentLogs.length;

        // Average mood score
        const averageMood = totalLogs > 0
            ? currentLogs.reduce((sum, log) => sum + log.moodScore, 0) / totalLogs
            : null;

        // Previous period average for trend
        const previousAverageMood = previousLogs.length > 0
            ? previousLogs.reduce((sum, log) => sum + log.moodScore, 0) / previousLogs.length
            : null;

        // Calculate trend
        let trend = null;
        if (averageMood !== null && previousAverageMood !== null) {
            trend = averageMood - previousAverageMood;
        }

        // Most common emotion
        const emotionCounts = {};
        currentLogs.forEach(log => {
            log.emotions.forEach(emotion => {
                emotionCounts[emotion] = (emotionCounts[emotion] || 0) + 1;
            });
        });

        let mostCommonEmotion = null;
        let maxCount = 0;
        Object.entries(emotionCounts).forEach(([emotion, count]) => {
            if (count > maxCount) {
                maxCount = count;
                mostCommonEmotion = emotion;
            }
        });

        // Calculate mood distribution
        const moodDistribution = {
            low: currentLogs.filter(log => log.moodScore <= 3).length,
            medium: currentLogs.filter(log => log.moodScore >= 4 && log.moodScore <= 7).length,
            high: currentLogs.filter(log => log.moodScore >= 8).length
        };

        // Daily averages for chart data
        const dailyAverages = [];
        const dailyMoodMap = {};

        currentLogs.forEach(log => {
            const dateKey = new Date(log.createdAt).toISOString().split('T')[0];
            if (!dailyMoodMap[dateKey]) {
                dailyMoodMap[dateKey] = { sum: 0, count: 0 };
            }
            dailyMoodMap[dateKey].sum += log.moodScore;
            dailyMoodMap[dateKey].count += 1;
        });

        Object.entries(dailyMoodMap).forEach(([date, data]) => {
            dailyAverages.push({
                date,
                average: data.sum / data.count
            });
        });

        // Sort by date
        dailyAverages.sort((a, b) => new Date(a.date) - new Date(b.date));

        const stats = {
            totalLogs,
            averageMood,
            trend,
            mostCommonEmotion,
            moodDistribution,
            dailyAverages,
            emotionCounts,
            timeframe
        };

        return NextResponse.json({
            success: true,
            stats
        });

    } catch (error) {
        console.error('Error fetching mood stats:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to fetch mood statistics' },
            { status: 500 }
        );
    }
}

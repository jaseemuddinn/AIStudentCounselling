import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth/auth';
import connectDB from '@/lib/db/mongodb';
import Conversation from '@/models/Conversation';
import Goal from '@/models/Goal';
import Recommendation from '@/models/Recommendation';
import MoodLog from '@/models/MoodLog';
import StudentProfile from '@/models/StudentProfile';
import AcademicInfo from '@/models/AcademicInfo';
import CareerProfile from '@/models/CareerProfile';

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

        // Fetch all stats in parallel
        const [
            conversationsCount,
            activeGoalsCount,
            newRecommendationsCount,
            recentMoodLogs,
            studentProfile,
            academicInfo,
            careerProfile,
        ] = await Promise.all([
            // Count non-archived conversations
            Conversation.countDocuments({ userId, isArchived: false }),

            // Count active goals (not-started or in-progress)
            Goal.countDocuments({
                userId,
                status: { $in: ['not-started', 'in-progress'] }
            }),

            // Count new/unviewed recommendations
            Recommendation.countDocuments({
                userId,
                status: { $in: ['new', 'saved'] }
            }),

            // Get recent mood logs (last 7 days)
            MoodLog.find({
                userId,
                createdAt: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) }
            })
                .sort({ createdAt: -1 })
                .limit(7)
                .lean(),

            // Check profile completion status
            StudentProfile.findOne({ userId }).lean(),
            AcademicInfo.findOne({ userId }).lean(),
            CareerProfile.findOne({ userId }).lean(),
        ]);

        // Calculate average mood score from last 7 days
        let averageMoodScore = null;
        if (recentMoodLogs.length > 0) {
            const totalMood = recentMoodLogs.reduce((sum, log) => sum + log.moodScore, 0);
            averageMoodScore = (totalMood / recentMoodLogs.length).toFixed(1);
        }

        // Determine if profile is complete
        const isProfileComplete = !!(
            studentProfile?.onboardingCompleted &&
            academicInfo &&
            careerProfile
        );

        return NextResponse.json({
            success: true,
            stats: {
                conversations: conversationsCount,
                activeGoals: activeGoalsCount,
                recommendations: newRecommendationsCount,
                moodScore: averageMoodScore,
            },
            profileComplete: isProfileComplete,
        });
    } catch (error) {
        console.error('Dashboard Stats API Error:', error);
        return NextResponse.json(
            { error: 'Failed to fetch dashboard stats', details: error.message },
            { status: 500 }
        );
    }
}

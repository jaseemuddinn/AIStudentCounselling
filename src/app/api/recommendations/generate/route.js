import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth/auth';
import connectDB from '@/lib/db/mongodb';
import Recommendation from '@/models/Recommendation';
import StudentProfile from '@/models/StudentProfile';
import AcademicInfo from '@/models/AcademicInfo';
import CareerProfile from '@/models/CareerProfile';
import Goal from '@/models/Goal';
import { getAIService } from '@/lib/ai/ai-service';

// POST /api/recommendations/generate - Generate AI-powered recommendations
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

        await connectDB();

        // Fetch user profile data
        const [studentProfile, academicInfo, careerProfile, goals] = await Promise.all([
            StudentProfile.findOne({ userId }).lean(),
            AcademicInfo.findOne({ userId }).lean(),
            CareerProfile.findOne({ userId }).lean(),
            Goal.find({ userId, status: { $in: ['not-started', 'in-progress'] } })
                .limit(5)
                .lean(),
        ]);

        if (!studentProfile || !academicInfo || !careerProfile) {
            return NextResponse.json(
                { error: 'Please complete your profile before generating recommendations' },
                { status: 400 }
            );
        }

        // Build context for AI
        const studentContext = {
            profile: {
                name: session.user.name,
                email: session.user.email,
                dateOfBirth: studentProfile.dateOfBirth,
                gender: studentProfile.gender,
                location: studentProfile.location,
                preferredLanguage: studentProfile.preferredLanguage,
            },
            academic: {
                currentEducationLevel: academicInfo.currentEducationLevel,
                institution: academicInfo.institution,
                fieldOfStudy: academicInfo.fieldOfStudy,
                yearOfStudy: academicInfo.yearOfStudy,
                gpa: academicInfo.gpa,
                subjects: academicInfo.subjects,
                learningStyle: academicInfo.learningStyle,
                achievements: academicInfo.achievements,
            },
            career: {
                careerStage: careerProfile.careerStage,
                careerInterests: careerProfile.careerInterests,
                skills: careerProfile.skills,
                industryPreferences: careerProfile.industryPreferences,
                workEnvironmentPreference: careerProfile.workEnvironmentPreference,
                longTermGoal: careerProfile.longTermGoal,
            },
            goals: goals.map(g => ({
                title: g.title,
                category: g.category,
                status: g.status,
                targetDate: g.targetDate,
            })),
        };

        // Generate recommendations using AI
        const aiService = getAIService();
        const generatedRecommendations = await aiService.generateRecommendations(studentContext, 'all');

        // Save recommendations to database
        const savedRecommendations = [];
        for (const rec of generatedRecommendations) {
            const recommendation = await Recommendation.create({
                userId,
                type: rec.type,
                title: rec.title,
                description: rec.description,
                reason: rec.reason,
                priority: rec.priority,
                status: 'new',
                relevanceScore: rec.relevanceScore,
                metadata: rec.metadata || {},
            });
            savedRecommendations.push(recommendation);
        }

        return NextResponse.json({
            success: true,
            message: `Generated ${savedRecommendations.length} recommendations`,
            count: savedRecommendations.length,
            recommendations: savedRecommendations.map(rec => ({
                _id: rec._id.toString(),
                type: rec.type,
                title: rec.title,
                description: rec.description,
                priority: rec.priority,
                relevanceScore: rec.relevanceScore,
            })),
        });
    } catch (error) {
        console.error('Generate recommendations error:', error);
        return NextResponse.json(
            { error: 'Failed to generate recommendations', details: error.message },
            { status: 500 }
        );
    }
}

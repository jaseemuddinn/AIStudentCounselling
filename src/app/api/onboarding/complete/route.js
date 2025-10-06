import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth/auth';
import connectDB from '@/lib/db/mongodb';
import StudentProfile from '@/models/StudentProfile';
import AcademicInfo from '@/models/AcademicInfo';
import CareerProfile from '@/models/CareerProfile';
import Goal from '@/models/Goal';

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

        // Create or Update Student Profile
        const studentProfile = await StudentProfile.findOneAndUpdate(
            { userId },
            {
                $set: {
                    dateOfBirth: data.personal.dateOfBirth,
                    gender: data.personal.gender,
                    phone: data.personal.phone || '',
                    location: {
                        city: data.personal.city,
                        country: data.personal.country,
                    },
                    preferredLanguage: data.personal.preferredLanguage,
                    onboardingCompleted: true,
                    onboardingCompletedAt: new Date(),
                }
            },
            { new: true, upsert: true }
        );

        // Create or Update Academic Info
        if (data.academic && data.academic.currentEducationLevel) {
            await AcademicInfo.findOneAndUpdate(
                { userId },
                {
                    $set: {
                        currentEducationLevel: data.academic.currentEducationLevel,
                        institution: data.academic.institution,
                        fieldOfStudy: data.academic.fieldOfStudy,
                        yearOfStudy: data.academic.yearOfStudy || '',
                        gpa: data.academic.gpa || '',
                        subjects: data.academic.subjects || [],
                        learningStyle: data.academic.learningStyle || '',
                        achievements: data.academic.achievements || '',
                    },
                    $setOnInsert: { userId }
                },
                { new: true, upsert: true }
            );
        }

        // Create or Update Career Profile
        if (data.career && data.career.careerInterests) {
            await CareerProfile.findOneAndUpdate(
                { userId },
                {
                    $set: {
                        careerInterests: data.career.careerInterests,
                        skills: data.career.skills || [],
                        industryPreferences: data.career.industryPreferences || [],
                        workEnvironmentPreference: data.career.workEnvironmentPreference || '',
                        careerStage: data.career.careerStage,
                        longTermGoal: data.career.longTermGoal || '',
                    },
                    $setOnInsert: { userId }
                },
                { new: true, upsert: true }
            );
        }

        // Delete existing goals and create new ones
        if (data.goals && data.goals.length > 0) {
            // Remove old goals
            await Goal.deleteMany({ userId });

            // Create new goals
            const goalPromises = data.goals.map((goal) =>
                Goal.create({
                    userId,
                    title: goal.title,
                    description: goal.description || '',
                    category: goal.category,
                    targetDate: goal.targetDate ? new Date(goal.targetDate) : undefined,
                    status: 'not-started',
                    progressPercentage: 0,
                    milestones: [],
                })
            );
            await Promise.all(goalPromises);
        }

        return NextResponse.json({
            success: true,
            message: 'Onboarding completed successfully',
            profileId: studentProfile._id,
        });
    } catch (error) {
        console.error('Onboarding completion error:', error);
        return NextResponse.json(
            { error: 'Failed to complete onboarding', details: error.message },
            { status: 500 }
        );
    }
}

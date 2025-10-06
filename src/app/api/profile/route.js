import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth/auth';
import connectDB from '@/lib/db/mongodb';
import StudentProfile from '@/models/StudentProfile';
import AcademicInfo from '@/models/AcademicInfo';
import CareerProfile from '@/models/CareerProfile';
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

        // Fetch all profile data
        const [studentProfile, academicInfo, careerProfile, goals] = await Promise.all([
            StudentProfile.findOne({ userId }),
            AcademicInfo.findOne({ userId }),
            CareerProfile.findOne({ userId }),
            Goal.find({ userId }).sort({ createdAt: -1 }).limit(10),
        ]);

        if (!studentProfile) {
            return NextResponse.json(
                { message: 'Profile not found. Please complete onboarding.' },
                { status: 404 }
            );
        }

        // Format response
        const profileData = {
            personal: studentProfile ? {
                dateOfBirth: studentProfile.dateOfBirth,
                gender: studentProfile.gender,
                phone: studentProfile.phone,
                location: studentProfile.location,
                preferredLanguage: studentProfile.preferredLanguage,
                onboardingCompleted: studentProfile.onboardingCompleted,
                onboardingCompletedAt: studentProfile.onboardingCompletedAt,
            } : null,
            academic: academicInfo ? {
                currentEducationLevel: academicInfo.currentEducationLevel,
                institution: academicInfo.institution,
                fieldOfStudy: academicInfo.fieldOfStudy,
                yearOfStudy: academicInfo.yearOfStudy,
                gpa: academicInfo.gpa,
                subjects: academicInfo.subjects,
                learningStyle: academicInfo.learningStyle,
                achievements: academicInfo.achievements,
            } : null,
            career: careerProfile ? {
                careerInterests: careerProfile.careerInterests,
                skills: careerProfile.skills,
                industryPreferences: careerProfile.industryPreferences,
                workEnvironmentPreference: careerProfile.workEnvironmentPreference,
                careerStage: careerProfile.careerStage,
                longTermGoal: careerProfile.longTermGoal,
            } : null,
            goals: goals.map(goal => ({
                id: goal._id,
                title: goal.title,
                description: goal.description,
                category: goal.category,
                status: goal.status,
                progress: goal.progressPercentage,
                targetDate: goal.targetDate,
            })),
        };

        return NextResponse.json(profileData);
    } catch (error) {
        console.error('Get profile error:', error);
        return NextResponse.json(
            { error: 'Failed to fetch profile', details: error.message },
            { status: 500 }
        );
    }
}

export async function PUT(request) {
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

        // Update profile sections
        const updates = [];

        if (data.personal) {
            updates.push(
                StudentProfile.findOneAndUpdate(
                    { userId },
                    { $set: data.personal },
                    { new: true, upsert: true }
                )
            );
        }

        if (data.academic) {
            updates.push(
                AcademicInfo.findOneAndUpdate(
                    { userId },
                    { $set: data.academic },
                    { new: true, upsert: true }
                )
            );
        }

        if (data.career) {
            updates.push(
                CareerProfile.findOneAndUpdate(
                    { userId },
                    { $set: data.career },
                    { new: true, upsert: true }
                )
            );
        }

        await Promise.all(updates);

        return NextResponse.json({
            success: true,
            message: 'Profile updated successfully',
        });
    } catch (error) {
        console.error('Update profile error:', error);
        return NextResponse.json(
            { error: 'Failed to update profile', details: error.message },
            { status: 500 }
        );
    }
}

import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth/auth';
import connectDB from '@/lib/db/mongodb';
import StudentProfile from '@/models/StudentProfile';

export async function GET(request) {
    try {
        const session = await auth();

        if (!session) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            );
        }

        await connectDB();

        const profile = await StudentProfile.findOne({ userId: session.user.id });

        return NextResponse.json({
            completed: profile?.onboardingCompleted || false,
            profile: profile ? {
                hasPersonalInfo: !!profile.dateOfBirth,
                hasLocation: !!profile.location?.city,
            } : null,
        });
    } catch (error) {
        console.error('Check onboarding error:', error);
        return NextResponse.json(
            { error: 'Failed to check onboarding status' },
            { status: 500 }
        );
    }
}

import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import connectDB from '@/lib/db/mongodb';
import User from '@/models/User';
import StudentProfile from '@/models/StudentProfile';
import { registerSchema } from '@/lib/validations/schemas';

export async function POST(request) {
    try {
        const body = await request.json();

        // Validate input
        const validatedData = registerSchema.parse(body);

        await connectDB();

        // Check if user already exists
        const existingUser = await User.findOne({ email: validatedData.email.toLowerCase() });

        if (existingUser) {
            return NextResponse.json(
                { error: 'User with this email already exists' },
                { status: 400 }
            );
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(validatedData.password, 12);

        // Create user
        const user = await User.create({
            name: validatedData.name,
            email: validatedData.email.toLowerCase(),
            password: hashedPassword,
            role: 'student',
        });

        // Create student profile
        await StudentProfile.create({
            userId: user._id,
            profileCompleted: false,
            onboardingStep: 0,
        });

        return NextResponse.json(
            {
                message: 'User created successfully',
                user: {
                    id: user._id,
                    name: user.name,
                    email: user.email,
                },
            },
            { status: 201 }
        );
    } catch (error) {
        console.error('Registration error:', error);

        if (error.name === 'ZodError') {
            return NextResponse.json(
                { error: 'Validation error', details: error.errors },
                { status: 400 }
            );
        }

        return NextResponse.json(
            { error: 'Failed to create user' },
            { status: 500 }
        );
    }
}

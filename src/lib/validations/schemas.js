import { z } from 'zod';

// Authentication schemas
export const loginSchema = z.object({
    email: z.string().email('Invalid email address'),
    password: z.string().min(6, 'Password must be at least 6 characters'),
});

export const registerSchema = z.object({
    name: z.string().min(2, 'Name must be at least 2 characters'),
    email: z.string().email('Invalid email address'),
    password: z.string().min(6, 'Password must be at least 6 characters'),
    confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ['confirmPassword'],
});

// Profile schemas
export const personalInfoSchema = z.object({
    dateOfBirth: z.string().optional(),
    gender: z.enum(['male', 'female', 'other', 'prefer-not-to-say']).optional(),
    gradeLevel: z.string().optional(),
    institutionName: z.string().optional(),
    phoneNumber: z.string().optional(),
    emergencyContact: z.object({
        name: z.string().optional(),
        relationship: z.string().optional(),
        phone: z.string().optional(),
    }).optional(),
});

export const academicInfoSchema = z.object({
    currentGPA: z.number().min(0).max(4).optional(),
    favoriteSubjects: z.array(z.string()).optional(),
    challengingSubjects: z.array(z.string()).optional(),
    academicGoals: z.string().optional(),
    studyHoursPerWeek: z.number().min(0).optional(),
    learningStyle: z.enum(['visual', 'auditory', 'kinesthetic', 'reading-writing', 'mixed']).optional(),
});

export const careerInfoSchema = z.object({
    careerInterests: z.array(z.string()).optional(),
    dreamCareers: z.array(z.string()).optional(),
    strengths: z.array(z.string()).optional(),
    weaknesses: z.array(z.string()).optional(),
    workPreferences: z.object({
        environment: z.enum(['office', 'remote', 'hybrid', 'field', 'flexible']).optional(),
        workStyle: z.enum(['independent', 'team', 'both']).optional(),
        industryPreferences: z.array(z.string()).optional(),
    }).optional(),
});

// Chat schemas
export const chatMessageSchema = z.object({
    conversationId: z.string().optional(),
    message: z.string().min(1, 'Message cannot be empty'),
    mode: z.enum(['academic', 'career', 'emotional', 'general']).optional(),
});

// Goal schemas
export const goalSchema = z.object({
    title: z.string().min(1, 'Title is required'),
    description: z.string().optional(),
    category: z.enum(['academic', 'career', 'skill', 'personal', 'other']),
    targetDate: z.string().optional(),
});

// Mood log schemas
export const moodLogSchema = z.object({
    moodRating: z.number().min(1).max(10),
    emotions: z.array(z.string()).optional(),
    notes: z.string().optional(),
    context: z.enum(['morning', 'afternoon', 'evening', 'night', 'before-study', 'after-study', 'general']).optional(),
});

// File upload schemas
export const fileUploadSchema = z.object({
    file: z.any(),
    type: z.enum(['profile-picture', 'document']),
});

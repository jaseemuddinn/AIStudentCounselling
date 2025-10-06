import mongoose from 'mongoose';

const StudentProfileSchema = new mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
            unique: true,
        },
        dateOfBirth: {
            type: Date,
            required: false,
        },
        gender: {
            type: String,
            enum: ['male', 'female', 'other', 'prefer_not_to_say'],
            required: false,
        },
        phone: {
            type: String,
            required: false,
        },
        location: {
            city: {
                type: String,
                required: false,
            },
            country: {
                type: String,
                required: false,
            },
        },
        preferredLanguage: {
            type: String,
            required: false,
        },
        onboardingCompleted: {
            type: Boolean,
            default: false,
        },
        onboardingCompletedAt: {
            type: Date,
            required: false,
        },
        // Legacy fields (keeping for backward compatibility)
        gradeLevel: {
            type: String,
            required: false,
        },
        institutionName: {
            type: String,
            required: false,
        },
        phoneNumber: {
            type: String,
            required: false,
        },
        emergencyContact: {
            name: String,
            relationship: String,
            phone: String,
        },
        profileCompleted: {
            type: Boolean,
            default: false,
        },
        onboardingStep: {
            type: Number,
            default: 0,
        },
    },
    {
        timestamps: true,
    }
);

export default mongoose.models.StudentProfile || mongoose.model('StudentProfile', StudentProfileSchema);

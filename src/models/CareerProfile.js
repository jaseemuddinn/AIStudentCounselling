import mongoose from 'mongoose';

const CareerProfileSchema = new mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
            unique: true,
        },
        // Primary fields (from onboarding)
        careerInterests: [String],
        skills: [String],
        industryPreferences: [String],
        workEnvironmentPreference: {
            type: String,
            enum: ['office', 'remote', 'hybrid', 'fieldwork', 'flexible'],
            required: false,
        },
        careerStage: {
            type: String,
            enum: ['exploring', 'deciding', 'preparing', 'job_seeking', 'early_career', 'career_change'],
            required: false,
        },
        longTermGoal: {
            type: String,
            required: false,
        },
        // Legacy fields (keeping for backward compatibility)
        dreamCareers: [String],
        skillsDetailed: [{
            name: String,
            level: {
                type: String,
                enum: ['beginner', 'intermediate', 'advanced', 'expert'],
            },
        }],
        strengths: [String],
        weaknesses: [String],
        workPreferences: {
            environment: {
                type: String,
                enum: ['office', 'remote', 'hybrid', 'field', 'flexible'],
            },
            workStyle: {
                type: String,
                enum: ['independent', 'team', 'both'],
            },
            industryPreferences: [String],
        },
        personalityType: {
            type: String,
            required: false,
        },
        certifications: [{
            name: String,
            issuingOrg: String,
            dateObtained: Date,
            expiryDate: Date,
        }],
        workExperience: [{
            title: String,
            company: String,
            startDate: Date,
            endDate: Date,
            description: String,
            isCurrentRole: Boolean,
        }],
    },
    {
        timestamps: true,
    }
);

export default mongoose.models.CareerProfile || mongoose.model('CareerProfile', CareerProfileSchema);

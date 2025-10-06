import mongoose from 'mongoose';

const RecommendationSchema = new mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        type: {
            type: String,
            enum: ['course', 'career', 'skill', 'resource', 'program'],
            required: true,
        },
        title: {
            type: String,
            required: true,
        },
        description: {
            type: String,
            required: true,
        },
        reason: {
            type: String,
            required: true,
        },
        priority: {
            type: String,
            enum: ['low', 'medium', 'high'],
            default: 'medium',
        },
        status: {
            type: String,
            enum: ['new', 'viewed', 'saved', 'dismissed'],
            default: 'new',
        },
        relevanceScore: {
            type: Number,
            min: 0,
            max: 100,
            required: true,
        },
        metadata: {
            url: String,
            duration: String,
            cost: String,
            provider: String,
            category: String,
        },
    },
    {
        timestamps: true,
    }
);

// Indexes
RecommendationSchema.index({ userId: 1, status: 1, createdAt: -1 });
RecommendationSchema.index({ userId: 1, type: 1 });

export default mongoose.models.Recommendation || mongoose.model('Recommendation', RecommendationSchema);

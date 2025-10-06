import mongoose from 'mongoose';

const GoalSchema = new mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        title: {
            type: String,
            required: true,
        },
        description: {
            type: String,
            required: false,
        },
        category: {
            type: String,
            enum: ['academic', 'career', 'skill', 'personal', 'other'],
            required: true,
        },
        targetDate: {
            type: Date,
            required: false,
        },
        status: {
            type: String,
            enum: ['not-started', 'in-progress', 'completed', 'abandoned'],
            default: 'not-started',
        },
        progressPercentage: {
            type: Number,
            min: 0,
            max: 100,
            default: 0,
        },
        milestones: [{
            title: String,
            description: String,
            targetDate: Date,
            completed: {
                type: Boolean,
                default: false,
            },
            completedAt: Date,
        }],
    },
    {
        timestamps: true,
    }
);

// Indexes
GoalSchema.index({ userId: 1, status: 1 });
GoalSchema.index({ userId: 1, targetDate: 1 });

export default mongoose.models.Goal || mongoose.model('Goal', GoalSchema);

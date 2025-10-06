import mongoose from 'mongoose';

const ConversationSchema = new mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        title: {
            type: String,
            default: 'New Conversation',
        },
        mode: {
            type: String,
            enum: ['academic', 'career', 'emotional', 'general'],
            default: 'general',
        },
        isArchived: {
            type: Boolean,
            default: false,
        },
        lastMessageAt: {
            type: Date,
            default: Date.now,
        },
    },
    {
        timestamps: true,
    }
);

// Indexes
ConversationSchema.index({ userId: 1, createdAt: -1 });
ConversationSchema.index({ userId: 1, isArchived: 1 });

export default mongoose.models.Conversation || mongoose.model('Conversation', ConversationSchema);

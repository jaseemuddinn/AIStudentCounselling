import mongoose from 'mongoose';

const MoodLogSchema = new mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        moodScore: {
            type: Number,
            min: 1,
            max: 10,
            required: true,
        },
        emotions: {
            type: [String],
            required: true,
            validate: {
                validator: function (arr) {
                    return arr.length > 0;
                },
                message: 'At least one emotion is required'
            }
        },
        notes: {
            type: String,
            default: '',
            maxlength: 500,
        },
        context: {
            type: String,
            default: '',
            maxlength: 100,
        },
    },
    {
        timestamps: true,
    }
);

// Indexes
MoodLogSchema.index({ userId: 1, createdAt: -1 });

// Clear any existing model to prevent schema conflicts
if (mongoose.models.MoodLog) {
    delete mongoose.models.MoodLog;
}

export default mongoose.model('MoodLog', MoodLogSchema);

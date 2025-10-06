import mongoose from 'mongoose';

const AcademicInfoSchema = new mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
            unique: true,
        },
        // Education level fields
        currentEducationLevel: {
            type: String,
            enum: ['high_school', 'undergraduate', 'graduate', 'postgraduate', 'doctorate', 'other'],
            required: false,
        },
        institution: {
            type: String,
            required: false,
        },
        fieldOfStudy: {
            type: String,
            required: false,
        },
        yearOfStudy: {
            type: String,
            required: false,
        },
        gpa: {
            type: String,
            required: false,
        },
        subjects: [String],
        learningStyle: {
            type: String,
            enum: ['visual', 'auditory', 'kinesthetic', 'reading_writing'],
            required: false,
        },
        achievements: {
            type: String,
            required: false,
        },
        // Legacy fields (keeping for backward compatibility)
        currentGPA: {
            type: Number,
            min: 0,
            max: 4,
            required: false,
        },
        subjectsTaken: [{
            name: String,
            grade: String,
            year: String,
        }],
        favoriteSubjects: [String],
        challengingSubjects: [String],
        academicGoals: {
            type: String,
            required: false,
        },
        studyHoursPerWeek: {
            type: Number,
            required: false,
        },
        extracurriculars: [{
            activity: String,
            role: String,
            yearsInvolved: Number,
        }],
    },
    {
        timestamps: true,
    }
);

export default mongoose.models.AcademicInfo || mongoose.model('AcademicInfo', AcademicInfoSchema);

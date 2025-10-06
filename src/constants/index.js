// Chat modes
export const CHAT_MODES = {
    ACADEMIC: 'academic',
    CAREER: 'career',
    EMOTIONAL: 'emotional',
    GENERAL: 'general',
};

export const CHAT_MODE_LABELS = {
    [CHAT_MODES.ACADEMIC]: 'Academic Guidance',
    [CHAT_MODES.CAREER]: 'Career Counselling',
    [CHAT_MODES.EMOTIONAL]: 'Emotional Support',
    [CHAT_MODES.GENERAL]: 'General Chat',
};

export const CHAT_MODE_DESCRIPTIONS = {
    [CHAT_MODES.ACADEMIC]: 'Get help with courses, study strategies, and academic planning',
    [CHAT_MODES.CAREER]: 'Explore career paths, skills, and professional development',
    [CHAT_MODES.EMOTIONAL]: 'Find support for stress, motivation, and mental wellness',
    [CHAT_MODES.GENERAL]: 'General guidance and support',
};

// Recommendation types
export const RECOMMENDATION_TYPES = {
    COURSE: 'course',
    CAREER: 'career',
    SKILL: 'skill',
    RESOURCE: 'resource',
    PROGRAM: 'program',
};

// Goal categories
export const GOAL_CATEGORIES = {
    ACADEMIC: 'academic',
    CAREER: 'career',
    SKILL: 'skill',
    PERSONAL: 'personal',
    OTHER: 'other',
};

// Goal statuses
export const GOAL_STATUSES = {
    NOT_STARTED: 'not-started',
    IN_PROGRESS: 'in-progress',
    COMPLETED: 'completed',
    ABANDONED: 'abandoned',
};

// Learning styles
export const LEARNING_STYLES = [
    { value: 'visual', label: 'Visual' },
    { value: 'auditory', label: 'Auditory' },
    { value: 'kinesthetic', label: 'Kinesthetic' },
    { value: 'reading-writing', label: 'Reading/Writing' },
    { value: 'mixed', label: 'Mixed' },
];

// Work environments
export const WORK_ENVIRONMENTS = [
    { value: 'office', label: 'Office' },
    { value: 'remote', label: 'Remote' },
    { value: 'hybrid', label: 'Hybrid' },
    { value: 'field', label: 'Field Work' },
    { value: 'flexible', label: 'Flexible' },
];

// Work styles
export const WORK_STYLES = [
    { value: 'independent', label: 'Independent' },
    { value: 'team', label: 'Team-based' },
    { value: 'both', label: 'Both' },
];

// Skill levels
export const SKILL_LEVELS = [
    { value: 'beginner', label: 'Beginner' },
    { value: 'intermediate', label: 'Intermediate' },
    { value: 'advanced', label: 'Advanced' },
    { value: 'expert', label: 'Expert' },
];

// Mood contexts
export const MOOD_CONTEXTS = [
    { value: 'morning', label: 'Morning' },
    { value: 'afternoon', label: 'Afternoon' },
    { value: 'evening', label: 'Evening' },
    { value: 'night', label: 'Night' },
    { value: 'before-study', label: 'Before Study' },
    { value: 'after-study', label: 'After Study' },
    { value: 'general', label: 'General' },
];

// Common subjects
export const COMMON_SUBJECTS = [
    'Mathematics',
    'Physics',
    'Chemistry',
    'Biology',
    'Computer Science',
    'English',
    'History',
    'Geography',
    'Economics',
    'Business Studies',
    'Psychology',
    'Sociology',
    'Art',
    'Music',
    'Physical Education',
];

// Common career fields
export const CAREER_FIELDS = [
    'Technology',
    'Healthcare',
    'Engineering',
    'Business',
    'Education',
    'Arts & Design',
    'Science & Research',
    'Law',
    'Finance',
    'Marketing',
    'Media & Communications',
    'Social Services',
    'Government',
    'Hospitality',
    'Sports',
];

// Emotions for mood logging
export const EMOTIONS = [
    'Happy',
    'Excited',
    'Calm',
    'Anxious',
    'Stressed',
    'Sad',
    'Angry',
    'Frustrated',
    'Motivated',
    'Tired',
    'Overwhelmed',
    'Confident',
];

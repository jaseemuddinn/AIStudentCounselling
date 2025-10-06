import GeminiProvider from './gemini-provider';
import OpenAIProvider from './openai-provider';
import {
    getCurrentProvider,
    AI_PROVIDERS,
    SYSTEM_PROMPTS,
    CHAT_MODES,
    CRISIS_KEYWORDS,
    CRISIS_RESPONSE
} from './config';

class AIService {
    constructor() {
        this.provider = null;
        this.initializeProvider();
    }

    initializeProvider() {
        const currentProvider = getCurrentProvider();

        try {
            if (currentProvider === AI_PROVIDERS.GEMINI) {
                this.provider = new GeminiProvider();
                console.log('✅ AI Service initialized with Google Gemini');
            } else if (currentProvider === AI_PROVIDERS.OPENAI) {
                this.provider = new OpenAIProvider();
                console.log('✅ AI Service initialized with OpenAI');
            } else {
                throw new Error(`Unknown AI provider: ${currentProvider}`);
            }
        } catch (error) {
            console.error('Failed to initialize primary provider:', error.message);

            // Fallback logic
            if (currentProvider === AI_PROVIDERS.GEMINI) {
                console.log('Attempting to fallback to OpenAI...');
                try {
                    this.provider = new OpenAIProvider();
                    console.log('✅ Fallback to OpenAI successful');
                } catch (fallbackError) {
                    throw new Error('Both AI providers failed to initialize');
                }
            } else {
                console.log('Attempting to fallback to Gemini...');
                try {
                    this.provider = new GeminiProvider();
                    console.log('✅ Fallback to Gemini successful');
                } catch (fallbackError) {
                    throw new Error('Both AI providers failed to initialize');
                }
            }
        }
    }

    /**
     * Check if message contains crisis keywords
     */
    detectCrisis(message) {
        const lowerMessage = message.toLowerCase();
        return CRISIS_KEYWORDS.some(keyword => lowerMessage.includes(keyword));
    }

    /**
     * Build compressed context summary (optimized for token usage)
     */
    buildCompressedSummary(studentContext) {
        const parts = [];

        // Basic info
        if (studentContext.profile?.name) {
            parts.push(studentContext.profile.name);
        }

        // Academic snapshot
        if (studentContext.academic) {
            const academic = [];
            if (studentContext.academic.institution) academic.push(studentContext.academic.institution);
            if (studentContext.academic.fieldOfStudy) academic.push(studentContext.academic.fieldOfStudy);
            if (studentContext.academic.yearOfStudy) academic.push(`Year ${studentContext.academic.yearOfStudy}`);
            if (academic.length > 0) parts.push(academic.join(' '));
        }

        // Career interests (top 2-3)
        if (studentContext.career?.careerInterests?.length > 0) {
            const interests = studentContext.career.careerInterests.slice(0, 2).join(', ');
            parts.push(`Interests: ${interests}`);
        }

        // Active goals count
        if (studentContext.goals?.length > 0) {
            parts.push(`${studentContext.goals.length} active goal${studentContext.goals.length > 1 ? 's' : ''}`);
        }

        return parts.length > 0 ? `\n[Student: ${parts.join(' | ')}]` : '';
    }

    /**
     * Build mode-specific context (optimized for relevance)
     */
    buildModeSpecificContext(studentContext, mode) {
        let context = '';

        if (mode === 'academic' && studentContext.academic) {
            context += `\n\n🎓 Academic Context:`;
            if (studentContext.academic.institution) context += ` ${studentContext.academic.institution}`;
            if (studentContext.academic.fieldOfStudy) context += ` - ${studentContext.academic.fieldOfStudy}`;
            if (studentContext.academic.yearOfStudy) context += ` (Year ${studentContext.academic.yearOfStudy})`;
            if (studentContext.academic.gpa) context += `, GPA: ${studentContext.academic.gpa}`;
            if (studentContext.academic.learningStyle) {
                context += `\n- Learning Style: ${studentContext.academic.learningStyle.replace('_', ' ')}`;
            }
            if (studentContext.academic.subjects?.length > 0) {
                context += `\n- Subjects: ${studentContext.academic.subjects.join(', ')}`;
            }
        } else if (mode === 'career' && studentContext.career) {
            context += `\n\n💼 Career Context:`;
            if (studentContext.career.careerStage) {
                context += `\n- Stage: ${studentContext.career.careerStage.replace('_', ' ')}`;
            }
            if (studentContext.career.careerInterests?.length > 0) {
                context += `\n- Interests: ${studentContext.career.careerInterests.join(', ')}`;
            }
            if (studentContext.career.skills?.length > 0) {
                context += `\n- Skills: ${studentContext.career.skills.join(', ')}`;
            }
            if (studentContext.career.longTermGoal) {
                context += `\n- Goal: ${studentContext.career.longTermGoal}`;
            }
        }

        // Always include active goals for academic and career modes
        if ((mode === 'academic' || mode === 'career') && studentContext.goals?.length > 0) {
            context += `\n\n🎯 Active Goals:`;
            studentContext.goals.slice(0, 3).forEach((goal, i) => {
                context += `\n${i + 1}. ${goal.title} (${goal.category})`;
            });
        }

        return context;
    }

    /**
     * Build context from student profile and conversation history
     */
    buildContext(studentProfile, academicInfo, careerProfile, goals = []) {
        let context = '\n--- STUDENT CONTEXT ---';

        // Personal Information
        if (studentProfile) {
            context += `\n\n📋 Personal Profile:`;
            if (studentProfile.name) context += `\n- Name: ${studentProfile.name}`;
            if (studentProfile.dateOfBirth) {
                const age = new Date().getFullYear() - new Date(studentProfile.dateOfBirth).getFullYear();
                context += `\n- Age: ${age} years`;
            }
            if (studentProfile.gender && studentProfile.gender !== 'prefer_not_to_say') {
                context += `\n- Gender: ${studentProfile.gender}`;
            }
            if (studentProfile.location) {
                context += `\n- Location: ${studentProfile.location.city}, ${studentProfile.location.country}`;
            }
            if (studentProfile.preferredLanguage) {
                context += `\n- Preferred Language: ${studentProfile.preferredLanguage}`;
            }
        }

        // Academic Information
        if (academicInfo) {
            context += `\n\n🎓 Academic Background:`;
            if (academicInfo.currentEducationLevel) {
                context += `\n- Education Level: ${academicInfo.currentEducationLevel.replace('_', ' ')}`;
            }
            if (academicInfo.institution) {
                context += `\n- Institution: ${academicInfo.institution}`;
            }
            if (academicInfo.fieldOfStudy) {
                context += `\n- Field of Study: ${academicInfo.fieldOfStudy}`;
            }
            if (academicInfo.yearOfStudy) {
                context += `\n- Year of Study: ${academicInfo.yearOfStudy}`;
            }
            if (academicInfo.gpa) {
                context += `\n- GPA: ${academicInfo.gpa}`;
            }
            if (academicInfo.subjects && academicInfo.subjects.length > 0) {
                context += `\n- Current Subjects: ${academicInfo.subjects.join(', ')}`;
            }
            if (academicInfo.learningStyle) {
                context += `\n- Learning Style: ${academicInfo.learningStyle.replace('_', ' ')}`;
            }
            if (academicInfo.achievements) {
                context += `\n- Achievements: ${academicInfo.achievements}`;
            }
        }

        // Career Profile
        if (careerProfile) {
            context += `\n\n💼 Career Interests:`;
            if (careerProfile.careerStage) {
                context += `\n- Career Stage: ${careerProfile.careerStage.replace('_', ' ')}`;
            }
            if (careerProfile.careerInterests && careerProfile.careerInterests.length > 0) {
                context += `\n- Career Interests: ${careerProfile.careerInterests.join(', ')}`;
            }
            if (careerProfile.skills && careerProfile.skills.length > 0) {
                context += `\n- Skills: ${careerProfile.skills.join(', ')}`;
            }
            if (careerProfile.industryPreferences && careerProfile.industryPreferences.length > 0) {
                context += `\n- Industry Preferences: ${careerProfile.industryPreferences.join(', ')}`;
            }
            if (careerProfile.workEnvironmentPreference) {
                context += `\n- Work Environment: ${careerProfile.workEnvironmentPreference}`;
            }
            if (careerProfile.longTermGoal) {
                context += `\n- Long-term Goal: ${careerProfile.longTermGoal}`;
            }
        }

        // Active Goals
        if (goals && goals.length > 0) {
            context += `\n\n🎯 Active Goals:`;
            goals.forEach((goal, index) => {
                context += `\n${index + 1}. ${goal.title} (${goal.category})`;
                if (goal.targetDate) {
                    context += ` - Target: ${new Date(goal.targetDate).toLocaleDateString()}`;
                }
                context += ` - Status: ${goal.status}`;
            });
        }

        context += '\n\n--- END CONTEXT ---';
        context += '\n\nIMPORTANT: Use this context to provide personalized, relevant advice. Reference specific details when appropriate to show you understand the student\'s background and goals.';

        return context;
    }

    /**
     * Generate a chat response
     */
    async generateResponse({
        message,
        mode = CHAT_MODES.GENERAL,
        conversationHistory = [],
        studentContext = {},
        options = {},
        messageCount = 0,
    }) {
        try {
            // Check for crisis keywords
            if (this.detectCrisis(message)) {
                return {
                    content: CRISIS_RESPONSE,
                    role: 'assistant',
                    isCrisisResponse: true,
                };
            }

            // Determine if we need full context or optimized context
            const isNewConversation = messageCount === 0;
            const needsFullContext = isNewConversation || messageCount % 15 === 0;

            let context = '';

            if (needsFullContext) {
                // Send full context on first message or every 15 messages
                context = this.buildContext(
                    studentContext.profile,
                    studentContext.academic,
                    studentContext.career,
                    studentContext.goals
                );
            } else if (mode === CHAT_MODES.ACADEMIC || mode === CHAT_MODES.CAREER) {
                // For specific modes, send mode-specific context with compressed summary
                context = this.buildCompressedSummary(studentContext) +
                    this.buildModeSpecificContext(studentContext, mode);
            } else {
                // For general/emotional modes, just use compressed summary
                context = this.buildCompressedSummary(studentContext);
            }

            // Build system message
            const systemMessage = {
                role: 'system',
                content: SYSTEM_PROMPTS[mode] + (context ? `\n\n${context}` : ''),
            };

            // Build message array
            const messages = [
                systemMessage,
                ...conversationHistory,
                { role: 'user', content: message },
            ];

            // Get response from provider
            const response = await this.provider.chat(messages, options);

            return response;
        } catch (error) {
            console.error('AI Service Error:', error);
            throw error;
        }
    }

    /**
     * Generate recommendations based on student profile
     */
    async generateRecommendations(studentContext, type = 'general') {
        try {
            const context = this.buildContext(
                studentContext.profile,
                studentContext.academic,
                studentContext.career,
                studentContext.goals
            );

            const prompt = `Based on the following student profile, generate 5 personalized recommendations.
${context}

Include recommendations across different types:
- Courses (online courses, certifications)
- Career Paths (job roles, career directions)
- Skills (technical or soft skills to develop)
- Resources (books, articles, tools, websites)
- Programs (degree programs, bootcamps, workshops)

Provide recommendations in JSON format with the following structure:
[
  {
    "type": "course|career|skill|resource|program",
    "title": "Specific recommendation title",
    "description": "Detailed description (2-3 sentences explaining what it is)",
    "reason": "Why this is recommended based on the student's profile, goals, and interests",
    "priority": "high|medium|low",
    "relevanceScore": 85,
    "metadata": {
      "provider": "Platform/Organization name (optional)",
      "duration": "Time commitment (optional)",
      "cost": "Free, Paid, or price range (optional)",
      "url": "https://example.com (optional)",
      "category": "Specific category (optional)"
    }
  }
]

Requirements:
- Provide exactly 5 recommendations
- Vary the types (don't make them all the same type)
- Make them specific and actionable
- Ensure high relevance scores (70-100) based on profile match
- Prioritize based on the student's current stage and goals
- Include realistic metadata when possible

Return ONLY the JSON array, no other text.`;

            const response = await this.provider.generateText(prompt);

            // Parse JSON response
            try {
                // Extract JSON from response (handling markdown code blocks)
                let jsonStr = response.trim();

                // Remove markdown code blocks if present
                if (jsonStr.startsWith('```')) {
                    jsonStr = jsonStr.replace(/```json?\n?/g, '').replace(/```\n?$/g, '');
                }

                // Find JSON array
                const jsonMatch = jsonStr.match(/\[[\s\S]*\]/);
                if (jsonMatch) {
                    const recommendations = JSON.parse(jsonMatch[0]);

                    // Validate and sanitize recommendations
                    return recommendations.map(rec => ({
                        type: rec.type || 'resource',
                        title: rec.title || 'Untitled Recommendation',
                        description: rec.description || 'No description provided',
                        reason: rec.reason || 'Recommended based on your profile',
                        priority: ['high', 'medium', 'low'].includes(rec.priority) ? rec.priority : 'medium',
                        relevanceScore: Math.min(Math.max(rec.relevanceScore || 70, 0), 100),
                        metadata: rec.metadata || {},
                    }));
                }
                throw new Error('No JSON array found in response');
            } catch (parseError) {
                console.error('Failed to parse recommendations:', parseError);
                console.error('Response was:', response);

                // Return fallback recommendations
                return this.getFallbackRecommendations(studentContext);
            }
        } catch (error) {
            console.error('Generate Recommendations Error:', error);

            // Return fallback recommendations on error
            return this.getFallbackRecommendations(studentContext);
        }
    }

    /**
     * Get fallback recommendations when AI generation fails
     */
    getFallbackRecommendations(studentContext) {
        const recommendations = [];
        const fieldOfStudy = studentContext.academic?.fieldOfStudy || 'your field';
        const careerInterests = studentContext.career?.careerInterests?.[0] || 'your career interests';

        recommendations.push({
            type: 'course',
            title: `Advanced ${fieldOfStudy} Fundamentals`,
            description: `Deepen your understanding of core concepts in ${fieldOfStudy} through structured learning.`,
            reason: `Based on your current studies in ${fieldOfStudy}, this will strengthen your foundation.`,
            priority: 'high',
            relevanceScore: 85,
            metadata: {
                provider: 'Coursera',
                duration: '4-6 weeks',
                cost: 'Free with paid certificate option',
            },
        });

        recommendations.push({
            type: 'career',
            title: `${careerInterests} Professional`,
            description: `Explore career opportunities in ${careerInterests} with growing demand and competitive salaries.`,
            reason: `Aligns with your stated career interest in ${careerInterests}.`,
            priority: 'high',
            relevanceScore: 90,
            metadata: {
                category: 'Career Path',
            },
        });

        recommendations.push({
            type: 'skill',
            title: 'Problem-Solving and Critical Thinking',
            description: 'Develop essential skills for analyzing complex problems and making informed decisions.',
            reason: 'These skills are valuable across all career paths and academic pursuits.',
            priority: 'medium',
            relevanceScore: 80,
            metadata: {},
        });

        recommendations.push({
            type: 'resource',
            title: 'Professional Networking on LinkedIn',
            description: 'Build and maintain professional connections, showcase your work, and discover opportunities.',
            reason: 'Networking is crucial for career development at your stage.',
            priority: 'medium',
            relevanceScore: 75,
            metadata: {
                provider: 'LinkedIn',
                cost: 'Free',
                url: 'https://www.linkedin.com',
            },
        });

        recommendations.push({
            type: 'program',
            title: 'Industry Certification Programs',
            description: 'Earn recognized certifications to validate your skills and enhance employability.',
            reason: 'Certifications complement your academic background and demonstrate practical expertise.',
            priority: 'low',
            relevanceScore: 70,
            metadata: {
                duration: '3-6 months',
                cost: 'Varies by program',
            },
        });

        return recommendations;
    }


    /**
     * Analyze sentiment of a message
     */
    async analyzeSentiment(message) {
        try {
            const prompt = `Analyze the sentiment of the following message on a scale from -1 (very negative) to 1 (very positive). Return only the numeric score.

Message: "${message}"

Score:`;

            const response = await this.provider.generateText(prompt, {
                temperature: 0.3,
                maxTokens: 10,
            });

            // Extract number from response
            const score = parseFloat(response.trim());
            return isNaN(score) ? 0 : Math.max(-1, Math.min(1, score));
        } catch (error) {
            console.error('Sentiment Analysis Error:', error);
            return 0; // Return neutral if analysis fails
        }
    }

    /**
     * Generate a conversation title based on the first message
     */
    async generateConversationTitle(firstMessage) {
        try {
            const prompt = `Generate a short, descriptive title (max 6 words) for a conversation that starts with: "${firstMessage}"

Title:`;

            const response = await this.provider.generateText(prompt, {
                temperature: 0.5,
                maxTokens: 20,
            });

            return response.trim().replace(/^["']|["']$/g, ''); // Remove quotes if present
        } catch (error) {
            console.error('Generate Title Error:', error);
            return 'New Conversation';
        }
    }
}

// Singleton instance
let aiServiceInstance = null;

export function getAIService() {
    if (!aiServiceInstance) {
        aiServiceInstance = new AIService();
    }
    return aiServiceInstance;
}

export default AIService;

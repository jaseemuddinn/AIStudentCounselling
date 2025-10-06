import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth/auth';
import connectDB from '@/lib/db/mongodb';
import Conversation from '@/models/Conversation';
import Message from '@/models/Message';
import StudentProfile from '@/models/StudentProfile';
import AcademicInfo from '@/models/AcademicInfo';
import CareerProfile from '@/models/CareerProfile';
import Goal from '@/models/Goal';
import { getAIService } from '@/lib/ai/ai-service';

export async function POST(request) {
    try {
        const session = await auth();

        if (!session) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            );
        }

        const userId = session.user.id;
        const { message, mode, conversationId } = await request.json();

        if (!message || !message.trim()) {
            return NextResponse.json(
                { error: 'Message is required' },
                { status: 400 }
            );
        }

        await connectDB();

        let conversation;
        let isNewConversation = false;

        // Get or create conversation
        if (conversationId) {
            conversation = await Conversation.findOne({ _id: conversationId, userId });
            if (!conversation) {
                return NextResponse.json(
                    { error: 'Conversation not found' },
                    { status: 404 }
                );
            }
        } else {
            // Create new conversation
            isNewConversation = true;

            // Generate title using AI
            const aiService = getAIService();
            const title = await aiService.generateConversationTitle(message);

            conversation = await Conversation.create({
                userId,
                title: title || 'New Conversation',
                mode: mode || 'general',
                lastMessageAt: new Date(),
            });
        }

        // Save user message
        const userMessage = await Message.create({
            conversationId: conversation._id,
            userId,
            role: 'user',
            content: message,
        });

        // Get conversation history for context
        const conversationHistory = await Message.find({
            conversationId: conversation._id,
        })
            .sort({ createdAt: 1 })
            .limit(20)
            .lean();

        // Format history for AI
        const formattedHistory = conversationHistory
            .filter(msg => msg._id.toString() !== userMessage._id.toString())
            .map(msg => ({
                role: msg.role,
                content: msg.content,
            }));

        // Fetch comprehensive student profile for personalized context
        const [studentProfile, academicInfo, careerProfile, goals] = await Promise.all([
            StudentProfile.findOne({ userId }).lean(),
            AcademicInfo.findOne({ userId }).lean(),
            CareerProfile.findOne({ userId }).lean(),
            Goal.find({ userId, status: { $in: ['not-started', 'in-progress'] } })
                .limit(5)
                .lean(),
        ]);

        // Build rich student context for AI
        const studentContext = {
            profile: {
                name: session.user.name,
                email: session.user.email,
                dateOfBirth: studentProfile?.dateOfBirth,
                gender: studentProfile?.gender,
                location: studentProfile?.location,
                preferredLanguage: studentProfile?.preferredLanguage,
            },
            academic: academicInfo ? {
                currentEducationLevel: academicInfo.currentEducationLevel,
                institution: academicInfo.institution,
                fieldOfStudy: academicInfo.fieldOfStudy,
                yearOfStudy: academicInfo.yearOfStudy,
                gpa: academicInfo.gpa,
                subjects: academicInfo.subjects,
                learningStyle: academicInfo.learningStyle,
                achievements: academicInfo.achievements,
            } : null,
            career: careerProfile ? {
                careerStage: careerProfile.careerStage,
                careerInterests: careerProfile.careerInterests,
                skills: careerProfile.skills,
                industryPreferences: careerProfile.industryPreferences,
                workEnvironmentPreference: careerProfile.workEnvironmentPreference,
                longTermGoal: careerProfile.longTermGoal,
            } : null,
            goals: goals?.map(g => ({
                title: g.title,
                category: g.category,
                status: g.status,
                targetDate: g.targetDate,
            })) || [],
        };

        // Generate AI response
        const aiService = getAIService();
        const aiResponse = await aiService.generateResponse({
            message,
            mode: mode || 'general',
            conversationHistory: formattedHistory,
            studentContext,
            messageCount: conversationHistory.length,
            options: {
                temperature: 0.7,
                maxTokens: 1000,
            },
        });

        // Analyze sentiment
        const sentiment = await aiService.analyzeSentiment(message);

        // Save assistant message
        const assistantMessage = await Message.create({
            conversationId: conversation._id,
            userId,
            role: 'assistant',
            content: aiResponse.content,
            sentiment: sentiment,
        });

        // Update conversation
        conversation.lastMessageAt = new Date();
        conversation.messageCount = (conversation.messageCount || 0) + 2;
        await conversation.save();

        return NextResponse.json({
            success: true,
            conversationId: conversation._id,
            title: conversation.title,
            isNewConversation,
            userMessage: {
                id: userMessage._id,
                role: 'user',
                content: message,
                createdAt: userMessage.createdAt,
            },
            assistantMessage: {
                id: assistantMessage._id,
                role: 'assistant',
                content: assistantMessage.content,
                sentiment: assistantMessage.sentiment,
                createdAt: assistantMessage.createdAt,
            },
            isCrisisResponse: aiResponse.isCrisisResponse || false,
        });
    } catch (error) {
        console.error('Chat API Error:', error);
        return NextResponse.json(
            { error: 'Failed to process message', details: error.message },
            { status: 500 }
        );
    }
}

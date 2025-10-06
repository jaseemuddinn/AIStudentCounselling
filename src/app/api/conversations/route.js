import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth/auth';
import connectDB from '@/lib/db/mongodb';
import Conversation from '@/models/Conversation';

export async function GET(request) {
    try {
        const session = await auth();

        if (!session) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            );
        }

        const userId = session.user.id;
        await connectDB();

        const conversations = await Conversation.find({ userId })
            .sort({ lastMessageAt: -1 })
            .lean();

        return NextResponse.json({
            conversations: conversations.map(conv => ({
                id: conv._id,
                title: conv.title,
                mode: conv.mode,
                messageCount: conv.messageCount || 0,
                lastMessageAt: conv.lastMessageAt,
                createdAt: conv.createdAt,
                updatedAt: conv.updatedAt,
            })),
        });
    } catch (error) {
        console.error('Get conversations error:', error);
        return NextResponse.json(
            { error: 'Failed to fetch conversations', details: error.message },
            { status: 500 }
        );
    }
}

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
        const { title, mode } = await request.json();

        await connectDB();

        const conversation = await Conversation.create({
            userId,
            title: title || 'New Conversation',
            mode: mode || 'general',
            lastMessageAt: new Date(),
        });

        return NextResponse.json({
            success: true,
            conversation: {
                id: conversation._id,
                title: conversation.title,
                mode: conversation.mode,
                createdAt: conversation.createdAt,
            },
        });
    } catch (error) {
        console.error('Create conversation error:', error);
        return NextResponse.json(
            { error: 'Failed to create conversation', details: error.message },
            { status: 500 }
        );
    }
}

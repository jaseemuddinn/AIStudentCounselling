import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth/auth';
import connectDB from '@/lib/db/mongodb';
import Conversation from '@/models/Conversation';
import Message from '@/models/Message';

export async function GET(request, { params }) {
    try {
        const session = await auth();

        if (!session) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            );
        }

        const userId = session.user.id;
        const { id } = params;

        await connectDB();

        const conversation = await Conversation.findOne({ _id: id, userId });

        if (!conversation) {
            return NextResponse.json(
                { error: 'Conversation not found' },
                { status: 404 }
            );
        }

        const messages = await Message.find({ conversationId: id })
            .sort({ createdAt: 1 })
            .lean();

        return NextResponse.json({
            conversation: {
                id: conversation._id,
                title: conversation.title,
                mode: conversation.mode,
                messageCount: conversation.messageCount || 0,
                createdAt: conversation.createdAt,
            },
            messages: messages.map(msg => ({
                id: msg._id,
                role: msg.role,
                content: msg.content,
                sentiment: msg.sentiment,
                createdAt: msg.createdAt,
            })),
        });
    } catch (error) {
        console.error('Get conversation error:', error);
        return NextResponse.json(
            { error: 'Failed to fetch conversation', details: error.message },
            { status: 500 }
        );
    }
}

export async function PATCH(request, { params }) {
    try {
        const session = await auth();

        if (!session) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            );
        }

        const userId = session.user.id;
        const { id } = params;
        const { title, mode } = await request.json();

        await connectDB();

        const updateData = {};
        if (title !== undefined) updateData.title = title;
        if (mode !== undefined) updateData.mode = mode;

        const conversation = await Conversation.findOneAndUpdate(
            { _id: id, userId },
            { $set: updateData },
            { new: true, runValidators: true }
        );

        if (!conversation) {
            return NextResponse.json(
                { error: 'Conversation not found' },
                { status: 404 }
            );
        }

        return NextResponse.json({
            success: true,
            conversation: {
                id: conversation._id,
                title: conversation.title,
                mode: conversation.mode,
                updatedAt: conversation.updatedAt,
            },
        });
    } catch (error) {
        console.error('Update conversation error:', error);
        return NextResponse.json(
            { error: 'Failed to update conversation', details: error.message },
            { status: 500 }
        );
    }
}

export async function DELETE(request, { params }) {
    try {
        const session = await auth();

        if (!session) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            );
        }

        const userId = session.user.id;
        const { id } = params;

        await connectDB();

        const conversation = await Conversation.findOneAndDelete({ _id: id, userId });

        if (!conversation) {
            return NextResponse.json(
                { error: 'Conversation not found' },
                { status: 404 }
            );
        }

        // Delete all messages in this conversation
        await Message.deleteMany({ conversationId: id });

        return NextResponse.json({
            success: true,
            message: 'Conversation deleted successfully',
        });
    } catch (error) {
        console.error('Delete conversation error:', error);
        return NextResponse.json(
            { error: 'Failed to delete conversation', details: error.message },
            { status: 500 }
        );
    }
}

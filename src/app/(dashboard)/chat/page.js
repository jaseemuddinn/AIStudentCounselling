'use client';

import { useSession } from 'next-auth/react';
import { useEffect, useState, useRef } from 'react';
import { MessageSquare, Send, Loader2, Plus, MoreVertical, Trash2, Brain, GraduationCap, Briefcase, Heart, Sparkles, Edit, Check, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const CHAT_MODES = {
    GENERAL: {
        id: 'general',
        name: 'General',
        icon: MessageSquare,
        color: 'bg-blue-500',
        description: 'General guidance and support'
    },
    ACADEMIC: {
        id: 'academic',
        name: 'Academic',
        icon: GraduationCap,
        color: 'bg-green-500',
        description: 'Study tips and academic help'
    },
    CAREER: {
        id: 'career',
        name: 'Career',
        icon: Briefcase,
        color: 'bg-purple-500',
        description: 'Career guidance and planning'
    },
    EMOTIONAL: {
        id: 'emotional',
        name: 'Emotional',
        icon: Heart,
        color: 'bg-pink-500',
        description: 'Emotional support and wellness'
    },
};

export default function ChatPage() {
    const { data: session } = useSession();
    const [conversations, setConversations] = useState([]);
    const [selectedConversation, setSelectedConversation] = useState(null);
    const [messages, setMessages] = useState([]);
    const [inputMessage, setInputMessage] = useState('');
    const [chatMode, setChatMode] = useState(CHAT_MODES.GENERAL.id);
    const [isLoading, setIsLoading] = useState(false);
    const [isSending, setIsSending] = useState(false);
    const [showModeSelector, setShowModeSelector] = useState(false);
    const [isEditingTitle, setIsEditingTitle] = useState(false);
    const [editedTitle, setEditedTitle] = useState('');
    const messagesEndRef = useRef(null);
    const inputRef = useRef(null);

    // Fetch conversations on mount
    useEffect(() => {
        fetchConversations();
    }, []);

    // Scroll to bottom when messages change
    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    const fetchConversations = async () => {
        try {
            const response = await fetch('/api/conversations');
            if (response.ok) {
                const data = await response.json();
                setConversations(data.conversations || []);
            }
        } catch (error) {
            console.error('Error fetching conversations:', error);
        }
    };

    const fetchMessages = async (conversationId) => {
        setIsLoading(true);
        try {
            const response = await fetch(`/api/conversations/${conversationId}`);
            if (response.ok) {
                const data = await response.json();
                setMessages(data.messages || []);
            }
        } catch (error) {
            console.error('Error fetching messages:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleSelectConversation = (conversation) => {
        setSelectedConversation(conversation);
        setChatMode(conversation.mode || CHAT_MODES.GENERAL.id);
        fetchMessages(conversation.id);
    };

    const handleNewConversation = () => {
        setSelectedConversation(null);
        setMessages([]);
        setShowModeSelector(false);
        setChatMode(CHAT_MODES.GENERAL.id);
        inputRef.current?.focus();
    };

    const handleDeleteConversation = async (conversationId, e) => {
        e.stopPropagation();
        if (!confirm('Are you sure you want to delete this conversation?')) return;

        try {
            const response = await fetch(`/api/conversations/${conversationId}`, {
                method: 'DELETE',
            });

            if (response.ok) {
                setConversations(conversations.filter(c => c.id !== conversationId));
                if (selectedConversation?.id === conversationId) {
                    setSelectedConversation(null);
                    setMessages([]);
                }
            }
        } catch (error) {
            console.error('Error deleting conversation:', error);
            alert('Failed to delete conversation');
        }
    };

    const handleStartEditTitle = () => {
        setEditedTitle(selectedConversation?.title || '');
        setIsEditingTitle(true);
    };

    const handleCancelEditTitle = () => {
        setIsEditingTitle(false);
        setEditedTitle('');
    };

    const handleSaveTitle = async () => {
        if (!editedTitle.trim() || !selectedConversation) return;

        try {
            const response = await fetch(`/api/conversations/${selectedConversation.id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ title: editedTitle.trim() }),
            });

            if (response.ok) {
                // Update local state
                setSelectedConversation({
                    ...selectedConversation,
                    title: editedTitle.trim(),
                });

                // Update in conversations list
                setConversations(conversations.map(c =>
                    c.id === selectedConversation.id
                        ? { ...c, title: editedTitle.trim() }
                        : c
                ));

                setIsEditingTitle(false);
            }
        } catch (error) {
            console.error('Error updating title:', error);
            alert('Failed to update title');
        }
    };

    const handleSendMessage = async (e) => {
        e.preventDefault();
        if (!inputMessage.trim() || isSending) return;

        const userMessage = inputMessage.trim();
        setInputMessage('');
        setIsSending(true);

        // Add user message to UI immediately
        const tempUserMessage = {
            id: Date.now(),
            role: 'user',
            content: userMessage,
            createdAt: new Date().toISOString(),
        };
        setMessages(prev => [...prev, tempUserMessage]);

        try {
            const response = await fetch('/api/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    message: userMessage,
                    mode: chatMode,
                    conversationId: selectedConversation?.id || null,
                }),
            });

            if (response.ok) {
                const data = await response.json();

                // Update conversation list if new conversation
                if (!selectedConversation && data.conversationId) {
                    await fetchConversations();
                    setSelectedConversation({
                        id: data.conversationId,
                        title: data.title,
                        mode: chatMode,
                    });
                }

                // Add assistant message
                setMessages(prev => [
                    ...prev.filter(m => m.id !== tempUserMessage.id),
                    {
                        id: data.userMessage.id,
                        role: 'user',
                        content: userMessage,
                        createdAt: data.userMessage.createdAt,
                    },
                    {
                        id: data.assistantMessage.id,
                        role: 'assistant',
                        content: data.assistantMessage.content,
                        createdAt: data.assistantMessage.createdAt,
                        sentiment: data.assistantMessage.sentiment,
                    },
                ]);

                setShowModeSelector(false);
            } else {
                throw new Error('Failed to send message');
            }
        } catch (error) {
            console.error('Error sending message:', error);
            alert('Failed to send message. Please try again.');
            // Remove temp message on error
            setMessages(prev => prev.filter(m => m.id !== tempUserMessage.id));
        } finally {
            setIsSending(false);
            inputRef.current?.focus();
        }
    };

    const getModeInfo = (modeId) => {
        return Object.values(CHAT_MODES).find(m => m.id === modeId) || CHAT_MODES.GENERAL;
    };

    return (
        <div className="flex h-[calc(100vh-4rem)] bg-gray-50 text-black">
            {/* Sidebar - Conversations List */}
            <div className="w-80 bg-white border-r border-gray-200 flex flex-col">
                <div className="p-4 border-b border-gray-200">
                    <button
                        onClick={handleNewConversation}
                        className="w-full flex items-center justify-center px-4 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium"
                    >
                        <Plus className="h-5 w-5 mr-2" />
                        New Conversation
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto">
                    {conversations.length === 0 ? (
                        <div className="p-8 text-center">
                            <MessageSquare className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                            <p className="text-sm text-gray-500">No conversations yet</p>
                            <p className="text-xs text-gray-400 mt-1">Start a new chat to begin</p>
                        </div>
                    ) : (
                        <div className="divide-y divide-gray-100">
                            {conversations.map((conversation) => {
                                const modeInfo = getModeInfo(conversation.mode);
                                const Icon = modeInfo.icon;

                                return (
                                    <div
                                        key={conversation.id}
                                        onClick={() => handleSelectConversation(conversation)}
                                        className={`p-4 cursor-pointer hover:bg-gray-50 transition-colors group ${selectedConversation?.id === conversation.id ? 'bg-indigo-50' : ''
                                            }`}
                                    >
                                        <div className="flex items-start justify-between">
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-2 mb-1">
                                                    <div className={`${modeInfo.color} p-1 rounded`}>
                                                        <Icon className="h-3 w-3 text-white" />
                                                    </div>
                                                    <h3 className="text-sm font-medium text-gray-900 truncate">
                                                        {conversation.title}
                                                    </h3>
                                                </div>
                                                <p className="text-xs text-gray-500 truncate">
                                                    {new Date(conversation.updatedAt).toLocaleDateString()}
                                                </p>
                                            </div>
                                            <button
                                                onClick={(e) => handleDeleteConversation(conversation.id, e)}
                                                className="opacity-0 group-hover:opacity-100 text-gray-400 hover:text-red-600 transition-all p-1"
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </button>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            </div>

            {/* Main Chat Area */}
            <div className="flex-1 flex flex-col">
                {/* Chat Header */}
                {(selectedConversation || messages.length > 0) && (
                    <div className="bg-white border-b border-gray-200 px-6 py-4">
                        <div className="flex items-center justify-between">
                            <div className="flex-1">
                                <div className="flex items-center gap-3">
                                    {isEditingTitle ? (
                                        <div className="flex items-center gap-2">
                                            <input
                                                type="text"
                                                value={editedTitle}
                                                onChange={(e) => setEditedTitle(e.target.value)}
                                                onKeyDown={(e) => {
                                                    if (e.key === 'Enter') handleSaveTitle();
                                                    if (e.key === 'Escape') handleCancelEditTitle();
                                                }}
                                                className="px-3 py-1 border border-indigo-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-lg font-semibold"
                                                placeholder="Conversation title"
                                                autoFocus
                                            />
                                            <button
                                                onClick={handleSaveTitle}
                                                className="p-1.5 text-green-600 hover:bg-green-50 rounded transition-colors"
                                                title="Save (Enter)"
                                            >
                                                <Check className="h-5 w-5" />
                                            </button>
                                            <button
                                                onClick={handleCancelEditTitle}
                                                className="p-1.5 text-gray-600 hover:bg-gray-50 rounded transition-colors"
                                                title="Cancel (Esc)"
                                            >
                                                <X className="h-5 w-5" />
                                            </button>
                                        </div>
                                    ) : (
                                        <>
                                            <h2 className="text-lg font-semibold text-gray-900">
                                                {selectedConversation?.title || 'New Conversation'}
                                            </h2>
                                            {selectedConversation && (
                                                <button
                                                    onClick={handleStartEditTitle}
                                                    className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-50 rounded transition-colors"
                                                    title="Edit title"
                                                >
                                                    <Edit className="h-4 w-4" />
                                                </button>
                                            )}
                                        </>
                                    )}
                                    {(() => {
                                        const modeInfo = getModeInfo(chatMode);
                                        const Icon = modeInfo.icon;
                                        return (
                                            <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium text-white ${modeInfo.color}`}>
                                                <Icon className="h-3 w-3 mr-1" />
                                                {modeInfo.name}
                                            </span>
                                        );
                                    })()}
                                </div>
                            </div>
                            <button
                                onClick={() => setShowModeSelector(!showModeSelector)}
                                className="px-4 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                            >
                                Change Mode
                            </button>
                        </div>
                        {showModeSelector && (
                            <div className="mt-4 pt-4 border-t border-gray-200">
                                <p className="text-sm font-medium text-gray-700 mb-3">Switch to a different mode:</p>
                                <div className="grid grid-cols-4 gap-2">
                                    {Object.values(CHAT_MODES).map((mode) => {
                                        const Icon = mode.icon;
                                        return (
                                            <button
                                                key={mode.id}
                                                onClick={() => {
                                                    setChatMode(mode.id);
                                                    setShowModeSelector(false);
                                                }}
                                                className={`p-3 rounded-lg border transition-all ${chatMode === mode.id
                                                    ? 'border-indigo-500 bg-indigo-50'
                                                    : 'border-gray-200 hover:border-gray-300'
                                                    }`}
                                            >
                                                <div className={`${mode.color} w-8 h-8 rounded-lg flex items-center justify-center mx-auto mb-1`}>
                                                    <Icon className="h-4 w-4 text-white" />
                                                </div>
                                                <p className="text-xs font-medium text-gray-900 text-center">{mode.name}</p>
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {/* Messages Area */}
                <div className="flex-1 overflow-y-auto p-6 space-y-4">
                    {!selectedConversation && messages.length === 0 ? (
                        <div className="h-full flex items-center justify-center">
                            <div className="text-center max-w-md">
                                <Sparkles className="h-16 w-16 text-indigo-500 mx-auto mb-4" />
                                <h3 className="text-2xl font-bold text-gray-900 mb-2">
                                    Welcome to AI Counsellor
                                </h3>
                                <p className="text-gray-600 mb-4">
                                    I'm here to help you with academic guidance, career planning,
                                    emotional support, and general advice. Start a conversation to begin!
                                </p>
                                <div className="mb-4">
                                    <p className="text-sm font-medium text-gray-700 mb-3">Choose a mode to get started:</p>
                                    <div className="grid grid-cols-2 gap-3">
                                        {Object.values(CHAT_MODES).map((mode) => {
                                            const Icon = mode.icon;
                                            return (
                                                <button
                                                    key={mode.id}
                                                    onClick={() => setChatMode(mode.id)}
                                                    className={`p-4 rounded-lg border-2 transition-all text-left ${chatMode === mode.id
                                                        ? 'border-indigo-500 bg-indigo-50 shadow-md'
                                                        : 'border-gray-200 hover:border-gray-300'
                                                        }`}
                                                >
                                                    <div className={`${mode.color} w-10 h-10 rounded-lg flex items-center justify-center mb-2`}>
                                                        <Icon className="h-5 w-5 text-white" />
                                                    </div>
                                                    <h4 className="font-medium text-gray-900">{mode.name}</h4>
                                                    <p className="text-xs text-gray-500 mt-1">{mode.description}</p>
                                                </button>
                                            );
                                        })}
                                    </div>
                                </div>
                                <div className={`mt-4 p-3 rounded-lg ${chatMode === 'general' ? 'bg-blue-50 border-blue-200' :
                                    chatMode === 'academic' ? 'bg-green-50 border-green-200' :
                                        chatMode === 'career' ? 'bg-purple-50 border-purple-200' :
                                            'bg-pink-50 border-pink-200'
                                    } border`}>
                                    <p className="text-sm text-gray-700">
                                        <span className="font-semibold">Selected Mode:</span> {getModeInfo(chatMode).name}
                                    </p>
                                    <p className="text-xs text-gray-600 mt-1">
                                        💬 Your conversation history is preserved. I remember everything you share just like a good friend!
                                    </p>
                                </div>
                            </div>
                        </div>
                    ) : isLoading ? (
                        <div className="flex items-center justify-center h-full">
                            <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
                        </div>
                    ) : (
                        <>
                            <AnimatePresence>
                                {messages.map((message, index) => (
                                    <motion.div
                                        key={message.id}
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0 }}
                                        transition={{ duration: 0.2 }}
                                        className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                                    >
                                        <div
                                            className={`max-w-[70%] rounded-2xl px-4 py-3 ${message.role === 'user'
                                                ? 'bg-indigo-600 text-white'
                                                : 'bg-white border border-gray-200 text-gray-900'
                                                }`}
                                        >
                                            <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                                            <p
                                                className={`text-xs mt-2 ${message.role === 'user' ? 'text-indigo-200' : 'text-gray-400'
                                                    }`}
                                            >
                                                {new Date(message.createdAt).toLocaleTimeString([], {
                                                    hour: '2-digit',
                                                    minute: '2-digit',
                                                })}
                                            </p>
                                        </div>
                                    </motion.div>
                                ))}
                            </AnimatePresence>

                            {isSending && (
                                <motion.div
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="flex justify-start"
                                >
                                    <div className="bg-white border border-gray-200 rounded-2xl px-4 py-3">
                                        <div className="flex space-x-2">
                                            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                                            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                                            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                                        </div>
                                    </div>
                                </motion.div>
                            )}
                            <div ref={messagesEndRef} />
                        </>
                    )}
                </div>

                {/* Input Area */}
                <div className="bg-white border-t border-gray-200 p-4">
                    <form onSubmit={handleSendMessage} className="flex gap-3">
                        <input
                            ref={inputRef}
                            type="text"
                            value={inputMessage}
                            onChange={(e) => setInputMessage(e.target.value)}
                            placeholder={`Ask me anything about ${getModeInfo(chatMode).name.toLowerCase()}...`}
                            className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                            disabled={isSending}
                        />
                        <button
                            type="submit"
                            disabled={!inputMessage.trim() || isSending}
                            className="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                        >
                            {isSending ? (
                                <Loader2 className="h-5 w-5 animate-spin" />
                            ) : (
                                <Send className="h-5 w-5" />
                            )}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}

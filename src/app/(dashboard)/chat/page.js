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
        gradient: 'from-blue-500 to-cyan-500',
        bgGradient: 'from-blue-500/10 to-cyan-500/10',
        description: 'General guidance and support'
    },
    ACADEMIC: {
        id: 'academic',
        name: 'Academic',
        icon: GraduationCap,
        gradient: 'from-green-500 to-emerald-500',
        bgGradient: 'from-green-500/10 to-emerald-500/10',
        description: 'Study tips and academic help'
    },
    CAREER: {
        id: 'career',
        name: 'Career',
        icon: Briefcase,
        gradient: 'from-purple-500 to-pink-500',
        bgGradient: 'from-purple-500/10 to-pink-500/10',
        description: 'Career guidance and planning'
    },
    EMOTIONAL: {
        id: 'emotional',
        name: 'Emotional',
        icon: Heart,
        gradient: 'from-pink-500 to-rose-500',
        bgGradient: 'from-pink-500/10 to-rose-500/10',
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
        <div className="flex h-[calc(100vh)] text-black">
            {/* Sidebar - Conversations List */}
            <div className="w-80 backdrop-blur-xl bg-white/80 border-r border-white/20 flex flex-col shadow-xl">
                <div className="p-5 border-b border-neutral-200/50">
                    <button
                        onClick={handleNewConversation}
                        className="w-full flex items-center justify-center px-5 py-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-2xl hover:shadow-xl hover:shadow-indigo-500/30 transition-all duration-300 font-bold hover:scale-105"
                    >
                        <Plus className="h-5 w-5 mr-2" strokeWidth={2.5} />
                        New Conversation
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto">
                    {conversations.length === 0 ? (
                        <div className="p-10 text-center">
                            <div className="inline-flex items-center justify-center w-16 h-16 rounded-3xl bg-gradient-to-br from-neutral-100 to-neutral-200 mb-4">
                                <MessageSquare className="h-8 w-8 text-neutral-400" strokeWidth={2} />
                            </div>
                            <p className="text-sm font-semibold text-neutral-600 mb-1">No conversations yet</p>
                            <p className="text-xs text-neutral-400">Start a new chat to begin ✨</p>
                        </div>
                    ) : (
                        <div className="p-3 space-y-2">
                            {conversations.map((conversation) => {
                                const modeInfo = getModeInfo(conversation.mode);
                                const Icon = modeInfo.icon;

                                return (
                                    <div
                                        key={conversation.id}
                                        onClick={() => handleSelectConversation(conversation)}
                                        className={`p-4 cursor-pointer rounded-2xl transition-all duration-300 group relative overflow-hidden ${selectedConversation?.id === conversation.id
                                            ? 'bg-gradient-to-br ' + modeInfo.bgGradient + ' border-2 border-white shadow-lg'
                                            : 'bg-white/60 hover:bg-white border border-neutral-200/50 hover:shadow-lg'
                                            }`}
                                    >
                                        <div className="flex items-start justify-between relative z-10">
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-2 mb-2">
                                                    <div className={`bg-gradient-to-br ${modeInfo.gradient} p-1.5 rounded-xl shadow-md`}>
                                                        <Icon className="h-3.5 w-3.5 text-white" strokeWidth={2} />
                                                    </div>
                                                    <h3 className="text-sm font-bold text-black truncate">
                                                        {conversation.title}
                                                    </h3>
                                                </div>
                                                <p className="text-xs text-neutral-500 font-medium">
                                                    {new Date(conversation.updatedAt).toLocaleDateString()}
                                                </p>
                                            </div>
                                            <button
                                                onClick={(e) => handleDeleteConversation(conversation.id, e)}
                                                className="opacity-0 group-hover:opacity-100 text-neutral-400 hover:text-red-600 transition-all p-2 rounded-lg hover:bg-red-50"
                                            >
                                                <Trash2 className="h-4 w-4" strokeWidth={2} />
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
                    <div className="backdrop-blur-xl bg-white/70 border-b border-white/20 px-8 py-5 shadow-sm">
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
                                                className="px-4 py-2 border-2 border-indigo-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-xl font-bold shadow-sm"
                                                placeholder="Conversation title"
                                                autoFocus
                                            />
                                            <button
                                                onClick={handleSaveTitle}
                                                className="p-2 text-green-600 hover:bg-green-50 rounded-xl transition-all shadow-sm hover:shadow-md"
                                                title="Save (Enter)"
                                            >
                                                <Check className="h-5 w-5" strokeWidth={2.5} />
                                            </button>
                                            <button
                                                onClick={handleCancelEditTitle}
                                                className="p-2 text-neutral-600 hover:bg-neutral-100 rounded-xl transition-all"
                                                title="Cancel (Esc)"
                                            >
                                                <X className="h-5 w-5" strokeWidth={2.5} />
                                            </button>
                                        </div>
                                    ) : (
                                        <>
                                            <h2 className="text-2xl font-bold text-black">
                                                {selectedConversation?.title || 'New Conversation'}
                                            </h2>
                                            {selectedConversation && (
                                                <button
                                                    onClick={handleStartEditTitle}
                                                    className="p-2 text-neutral-400 hover:text-black hover:bg-neutral-100 rounded-xl transition-all"
                                                    title="Edit title"
                                                >
                                                    <Edit className="h-4 w-4" strokeWidth={2} />
                                                </button>
                                            )}
                                        </>
                                    )}
                                    {(() => {
                                        const modeInfo = getModeInfo(chatMode);
                                        const Icon = modeInfo.icon;
                                        return (
                                            <span className={`inline-flex items-center px-4 py-2 rounded-xl text-xs font-bold text-white bg-gradient-to-r ${modeInfo.gradient} shadow-lg`}>
                                                <Icon className="h-3.5 w-3.5 mr-1.5" strokeWidth={2.5} />
                                                {modeInfo.name}
                                            </span>
                                        );
                                    })()}
                                </div>
                            </div>
                            <button
                                onClick={() => setShowModeSelector(!showModeSelector)}
                                className="px-5 py-2.5 text-sm font-semibold border-2 border-neutral-300 rounded-xl hover:bg-neutral-100 hover:border-neutral-400 transition-all shadow-sm hover:shadow-md"
                            >
                                Change Mode
                            </button>
                        </div>
                        {showModeSelector && (
                            <div className="mt-5 pt-5 border-t border-neutral-200/50">
                                <p className="text-sm font-bold text-black mb-4">Switch to a different mode:</p>
                                <div className="grid grid-cols-4 gap-3">
                                    {Object.values(CHAT_MODES).map((mode) => {
                                        const Icon = mode.icon;
                                        return (
                                            <button
                                                key={mode.id}
                                                onClick={() => {
                                                    setChatMode(mode.id);
                                                    setShowModeSelector(false);
                                                }}
                                                className={`p-4 rounded-2xl border-2 transition-all duration-300 hover:scale-105 ${chatMode === mode.id
                                                    ? 'border-indigo-500 bg-gradient-to-br ' + mode.bgGradient + ' shadow-lg'
                                                    : 'border-neutral-200 hover:border-neutral-300 bg-white/60'
                                                    }`}
                                            >
                                                <div className={`bg-gradient-to-br ${mode.gradient} w-10 h-10 rounded-2xl flex items-center justify-center mx-auto mb-2 shadow-lg`}>
                                                    <Icon className="h-5 w-5 text-white" strokeWidth={2} />
                                                </div>
                                                <p className="text-xs font-bold text-black text-center">{mode.name}</p>
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {/* Messages Area */}
                <div className="flex-1 overflow-y-auto p-8 space-y-5">
                    {!selectedConversation && messages.length === 0 ? (
                        <div className="h-full flex items-center justify-center">
                            <div className="text-center max-w-2xl">
                                {/* <div className="inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-gradient-to-br from-indigo-500 to-purple-500 mb-6 shadow-2xl shadow-indigo-500/30">
                                    <Sparkles className="h-8 w-8 text-white" strokeWidth={2} />
                                </div> */}
                                <h3 className="text-4xl font-bold bg-gradient-to-r from-black to-neutral-600 bg-clip-text text-transparent mb-4">
                                    Welcome to AI Counsellor
                                </h3>
                                <p className="text-lg text-neutral-600 font-medium mb-8 leading-relaxed">
                                    I'm here to help you with academic guidance, career planning,
                                    emotional support, and general advice. Start a conversation to begin! ✨
                                </p>
                                <div className="mb-6">
                                    <p className="text-sm font-bold text-black mb-5">Choose a mode to get started:</p>
                                    <div className="grid grid-cols-2 gap-4">
                                        {Object.values(CHAT_MODES).map((mode) => {
                                            const Icon = mode.icon;
                                            return (
                                                <button
                                                    key={mode.id}
                                                    onClick={() => setChatMode(mode.id)}
                                                    className={`p-4 rounded-2xl border-2 transition-all duration-300 text-left hover:scale-102 ${chatMode === mode.id
                                                        ? 'border-indigo-500 bg-gradient-to-br ' + mode.bgGradient + ' shadow-xl'
                                                        : 'border-neutral-200 hover:border-neutral-300 bg-white/60 shadow-lg'
                                                        }`}
                                                >
                                                    <div className={`bg-gradient-to-br ${mode.gradient} w-12 h-12 rounded-2xl flex items-center justify-center mb-3 shadow-lg`}>
                                                        <Icon className="h-4 w-4 text-white" strokeWidth={2} />
                                                    </div>
                                                    <h4 className="font-bold text-black text-lg">{mode.name}</h4>
                                                    <p className="text-sm text-neutral-600 font-medium mt-2">{mode.description}</p>
                                                </button>
                                            );
                                        })}
                                    </div>
                                </div>
                                <div className={`mt-6 p-5 rounded-3xl bg-gradient-to-br ${getModeInfo(chatMode).bgGradient} border-2 border-white shadow-lg`}>
                                    <p className="text-base text-black font-bold">
                                        <span className="text-neutral-700">Selected Mode:</span> {getModeInfo(chatMode).name}
                                    </p>
                                    <p className="text-sm text-neutral-700 font-medium mt-2">
                                        💬 Your conversation history is preserved. I remember everything you share just like a good friend!
                                    </p>
                                </div>
                            </div>
                        </div>
                    ) : isLoading ? (
                        <div className="flex items-center justify-center h-full">
                            <div className="relative">
                                <div className="w-16 h-16 rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 animate-pulse"></div>
                                <Loader2 className="absolute inset-0 m-auto h-8 w-8 animate-spin text-white" strokeWidth={3} />
                            </div>
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
                                        transition={{ duration: 0.3 }}
                                        className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                                    >
                                        <div
                                            className={`max-w-[75%] rounded-3xl px-6 py-4 shadow-lg ${message.role === 'user'
                                                ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white'
                                                : 'backdrop-blur-xl bg-white/90 border border-white/50 text-black shadow-xl'
                                                }`}
                                        >
                                            <p className="text-base font-medium whitespace-pre-wrap leading-relaxed">{message.content}</p>
                                            <p
                                                className={`text-xs mt-3 font-semibold ${message.role === 'user' ? 'text-indigo-200' : 'text-neutral-400'
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
                                    <div className="backdrop-blur-xl bg-white/90 border border-white/50 rounded-3xl px-6 py-4 shadow-xl">
                                        <div className="flex space-x-2">
                                            <div className="w-2.5 h-2.5 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                                            <div className="w-2.5 h-2.5 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                                            <div className="w-2.5 h-2.5 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                                        </div>
                                    </div>
                                </motion.div>
                            )}
                            <div ref={messagesEndRef} />
                        </>
                    )}
                </div>

                {/* Input Area */}
                <div className="backdrop-blur-xl bg-white/70 border-t border-white/20 p-6 shadow-lg">
                    <form onSubmit={handleSendMessage} className="flex gap-4">
                        <input
                            ref={inputRef}
                            type="text"
                            value={inputMessage}
                            onChange={(e) => setInputMessage(e.target.value)}
                            placeholder={`Ask me anything about ${getModeInfo(chatMode).name.toLowerCase()}... ✨`}
                            className="flex-1 px-6 py-4 border-2 border-neutral-300 rounded-2xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all font-medium text-base shadow-sm"
                            disabled={isSending}
                        />
                        <button
                            type="submit"
                            disabled={!inputMessage.trim() || isSending}
                            className="px-8 py-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-2xl hover:shadow-2xl hover:shadow-indigo-500/30 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center font-bold hover:scale-105 disabled:hover:scale-100"
                        >
                            {isSending ? (
                                <Loader2 className="h-6 w-6 animate-spin" strokeWidth={2.5} />
                            ) : (
                                <Send className="h-6 w-6" strokeWidth={2.5} />
                            )}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}

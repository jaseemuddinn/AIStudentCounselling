'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import {
    Smile,
    Frown,
    Meh,
    Heart,
    CloudRain,
    Sun,
    Cloud,
    Zap,
    Coffee,
    Moon,
    TrendingUp,
    TrendingDown,
    Minus,
    Calendar,
    Clock,
    Save,
    Loader2,
    BarChart3,
    Activity,
    AlertCircle
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const EMOTIONS = [
    { value: 'happy', label: 'Happy', icon: Smile, gradient: 'from-yellow-500 to-orange-400', bgGradient: 'from-yellow-500/10 to-orange-400/10', textColor: 'text-yellow-600' },
    { value: 'excited', label: 'Excited', icon: Zap, gradient: 'from-orange-500 to-red-500', bgGradient: 'from-orange-500/10 to-red-500/10', textColor: 'text-orange-600' },
    { value: 'calm', label: 'Calm', icon: Sun, gradient: 'from-blue-400 to-cyan-400', bgGradient: 'from-blue-400/10 to-cyan-400/10', textColor: 'text-blue-500' },
    { value: 'content', label: 'Content', icon: Heart, gradient: 'from-pink-500 to-rose-500', bgGradient: 'from-pink-500/10 to-rose-500/10', textColor: 'text-pink-600' },
    { value: 'tired', label: 'Tired', icon: Moon, gradient: 'from-indigo-500 to-purple-500', bgGradient: 'from-indigo-500/10 to-purple-500/10', textColor: 'text-indigo-600' },
    { value: 'stressed', label: 'Stressed', icon: CloudRain, gradient: 'from-purple-500 to-pink-500', bgGradient: 'from-purple-500/10 to-pink-500/10', textColor: 'text-purple-600' },
    { value: 'anxious', label: 'Anxious', icon: Cloud, gradient: 'from-gray-500 to-neutral-600', bgGradient: 'from-gray-500/10 to-neutral-600/10', textColor: 'text-gray-600' },
    { value: 'sad', label: 'Sad', icon: Frown, gradient: 'from-blue-600 to-blue-800', bgGradient: 'from-blue-600/10 to-blue-800/10', textColor: 'text-blue-700' },
    { value: 'neutral', label: 'Neutral', icon: Meh, gradient: 'from-gray-400 to-gray-500', bgGradient: 'from-gray-400/10 to-gray-500/10', textColor: 'text-gray-500' },
    { value: 'energetic', label: 'Energetic', icon: Coffee, gradient: 'from-green-500 to-emerald-500', bgGradient: 'from-green-500/10 to-emerald-500/10', textColor: 'text-green-600' },
];

const MOOD_SCORE_LABELS = {
    1: '😢 Very Low',
    2: '😟 Low',
    3: '😕 Below Average',
    4: '😐 Slightly Below',
    5: '😶 Neutral',
    6: '🙂 Slightly Above',
    7: '😊 Good',
    8: '😄 Very Good',
    9: '😁 Excellent',
    10: '🤩 Amazing'
};

export default function MoodPage() {
    const { data: session } = useSession();
    const [moodScore, setMoodScore] = useState(5);
    const [selectedEmotions, setSelectedEmotions] = useState([]);
    const [notes, setNotes] = useState('');
    const [context, setContext] = useState('');
    const [saving, setSaving] = useState(false);
    const [moodLogs, setMoodLogs] = useState([]);
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [timeframe, setTimeframe] = useState('7'); // 7, 30, 90 days

    useEffect(() => {
        if (session) {
            fetchMoodData();
        }
    }, [session, timeframe]);

    const fetchMoodData = async () => {
        try {
            const [logsRes, statsRes] = await Promise.all([
                fetch(`/api/mood-logs?timeframe=${timeframe}`),
                fetch(`/api/mood-logs/stats?timeframe=${timeframe}`)
            ]);

            const logsData = await logsRes.json();
            const statsData = await statsRes.json();

            if (logsData.success) {
                setMoodLogs(logsData.logs);
            }
            if (statsData.success) {
                setStats(statsData.stats);
            }
        } catch (error) {
            console.error('Failed to fetch mood data:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleEmotionToggle = (emotion) => {
        setSelectedEmotions(prev =>
            prev.includes(emotion)
                ? prev.filter(e => e !== emotion)
                : [...prev, emotion]
        );
    };

    const handleSaveMood = async () => {
        if (selectedEmotions.length === 0) {
            alert('Please select at least one emotion');
            return;
        }

        setSaving(true);
        try {
            const response = await fetch('/api/mood-logs', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    moodScore,
                    emotions: selectedEmotions,
                    notes: notes.trim(),
                    context: context.trim()
                })
            });

            const data = await response.json();

            if (data.success) {
                // Reset form
                setMoodScore(5);
                setSelectedEmotions([]);
                setNotes('');
                setContext('');

                // Refresh data
                await fetchMoodData();

                alert('Mood logged successfully! 🎉');
            } else {
                alert(data.error || 'Failed to save mood log');
            }
        } catch (error) {
            console.error('Failed to save mood:', error);
            alert('Failed to save mood log. Please try again.');
        } finally {
            setSaving(false);
        }
    };

    const getMoodColor = (score) => {
        if (score <= 3) return 'text-red-500';
        if (score <= 5) return 'text-orange-500';
        if (score <= 7) return 'text-yellow-500';
        return 'text-green-500';
    };

    const getMoodBgColor = (score) => {
        if (score <= 3) return 'bg-red-50 border-red-200';
        if (score <= 5) return 'bg-orange-50 border-orange-200';
        if (score <= 7) return 'bg-yellow-50 border-yellow-200';
        return 'bg-green-50 border-green-200';
    };

    const getTrendIcon = () => {
        if (!stats || !stats.trend) return Minus;
        if (stats.trend > 0) return TrendingUp;
        if (stats.trend < 0) return TrendingDown;
        return Minus;
    };

    const getTrendColor = () => {
        if (!stats || !stats.trend) return 'text-gray-500';
        if (stats.trend > 0) return 'text-green-500';
        if (stats.trend < 0) return 'text-red-500';
        return 'text-gray-500';
    };

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        const today = new Date();
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);

        if (date.toDateString() === today.toDateString()) {
            return 'Today';
        } else if (date.toDateString() === yesterday.toDateString()) {
            return 'Yesterday';
        } else {
            return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
        }
    };

    const formatTime = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <div className="relative">
                    <div className="w-16 h-16 rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 animate-pulse"></div>
                    <Loader2 className="absolute inset-0 m-auto h-8 w-8 animate-spin text-white" strokeWidth={3} />
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen py-12 px-6 text-black">
            <div className="max-w-7xl mx-auto space-y-8">
                {/* Header */}
                <div className="flex items-center justify-between mb-16">
                    <div>
                        <div className="flex items-center gap-3 mb-4">
                            <div className="h-[2px] w-12 bg-gradient-to-r from-black to-neutral-400 rounded-full" />
                            <span className="text-xs tracking-[0.25em] text-neutral-400 uppercase font-semibold">Mood Tracking</span>
                        </div>
                        <h1 className="text-5xl font-bold tracking-tight bg-gradient-to-br from-black via-neutral-800 to-neutral-600 bg-clip-text text-transparent mb-4 flex items-center gap-4">
                            <Activity className="h-12 w-12 text-black" strokeWidth={2} />
                            Your Wellbeing
                        </h1>
                        <p className="text-xl text-neutral-600 font-medium">
                            Track your emotional wellbeing and identify patterns ✨
                        </p>
                    </div>
                </div>

                {/* Stats Cards */}
                {stats && (
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-5 mb-12">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="backdrop-blur-xl bg-gradient-to-br from-indigo-500 to-purple-600 rounded-3xl p-8 text-white shadow-2xl shadow-indigo-500/30 hover:-translate-y-1 transition-all duration-500"
                        >
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-indigo-100 text-sm font-bold uppercase tracking-wider">Average Mood</p>
                                    <p className="text-5xl font-bold mt-3">
                                        {stats.averageMood ? stats.averageMood.toFixed(1) : '-'}
                                    </p>
                                    <p className="text-indigo-100 text-sm mt-2 font-medium">out of 10</p>
                                </div>
                                <BarChart3 className="h-14 w-14 text-indigo-200" strokeWidth={2} />
                            </div>
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1 }}
                            className="backdrop-blur-xl bg-white/80 border border-white/20 rounded-3xl p-8 shadow-xl hover:shadow-2xl hover:-translate-y-1 transition-all duration-500"
                        >
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-neutral-500 text-sm font-bold uppercase tracking-wider">Total Logs</p>
                                    <p className="text-5xl font-bold text-black mt-3">{stats.totalLogs}</p>
                                    <p className="text-neutral-500 text-sm mt-2 font-medium">last {timeframe} days</p>
                                </div>
                                <Calendar className="h-12 w-12 text-neutral-400" strokeWidth={2} />
                            </div>
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2 }}
                            className="backdrop-blur-xl bg-white/80 border border-white/20 rounded-3xl p-8 shadow-xl hover:shadow-2xl hover:-translate-y-1 transition-all duration-500"
                        >
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-neutral-500 text-sm font-bold uppercase tracking-wider">Mood Trend</p>
                                    <p className={`text-5xl font-bold mt-3 ${getTrendColor()}`}>
                                        {stats.trend ? (stats.trend > 0 ? '+' : '') + stats.trend.toFixed(1) : '-'}
                                    </p>
                                    <p className="text-neutral-500 text-sm mt-2 font-medium">vs previous period</p>
                                </div>
                                {(() => {
                                    const TrendIcon = getTrendIcon();
                                    return <TrendIcon className={`h-12 w-12 ${getTrendColor()}`} strokeWidth={2} />;
                                })()}
                            </div>
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.3 }}
                            className="backdrop-blur-xl bg-white/80 border border-white/20 rounded-3xl p-8 shadow-xl hover:shadow-2xl hover:-translate-y-1 transition-all duration-500"
                        >
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-neutral-500 text-sm font-bold uppercase tracking-wider">Most Common</p>
                                    <p className="text-2xl font-bold text-black mt-3 capitalize">
                                        {stats.mostCommonEmotion || '-'}
                                    </p>
                                    <p className="text-neutral-500 text-sm mt-2 font-medium">primary emotion</p>
                                </div>
                                {stats.mostCommonEmotion && (() => {
                                    const emotion = EMOTIONS.find(e => e.value === stats.mostCommonEmotion);
                                    if (!emotion) return <Heart className="h-12 w-12 text-pink-400" strokeWidth={2} />;
                                    const EmotionIcon = emotion.icon;
                                    return <EmotionIcon className={`h-12 w-12 ${emotion.textColor}`} strokeWidth={2} />;
                                })()}
                            </div>
                        </motion.div>
                    </div>
                )}

                {/* Log New Mood */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    className="backdrop-blur-xl bg-white/80 border border-white/20 rounded-3xl p-10 shadow-xl"
                >
                    <h2 className="text-3xl font-bold text-black mb-8 flex items-center gap-3">
                        <Save className="h-7 w-7 text-indigo-600" strokeWidth={2} />
                        Log Your Mood
                    </h2>

                    {/* Mood Score Slider */}
                    <div className="mb-10">
                        <label className="block text-base font-bold text-black mb-5">
                            How are you feeling today?
                        </label>
                        <div className="space-y-6">
                            <div className="flex items-center gap-6">
                                <span className="text-6xl">{MOOD_SCORE_LABELS[moodScore].split(' ')[0]}</span>
                                <div className="flex-1">
                                    <input
                                        type="range"
                                        min="1"
                                        max="10"
                                        value={moodScore}
                                        onChange={(e) => setMoodScore(parseInt(e.target.value))}
                                        className="w-full h-4 rounded-2xl appearance-none cursor-pointer accent-indigo-600"
                                        style={{
                                            background: `linear-gradient(to right, 
                                            #ef4444 0%, 
                                            #f97316 30%, 
                                            #eab308 50%, 
                                            #84cc16 70%, 
                                            #22c55e 100%)`
                                        }}
                                    />
                                </div>
                                <span className={`text-4xl font-bold ${getMoodColor(moodScore)} min-w-[4rem] text-center`}>
                                    {moodScore}
                                </span>
                            </div>
                            <p className="text-center text-black font-bold text-xl">
                                {MOOD_SCORE_LABELS[moodScore]}
                            </p>
                        </div>
                    </div>

                    {/* Emotions Selection */}
                    <div className="mb-10">
                        <label className="block text-base font-bold text-black mb-5">
                            Select your emotions (choose one or more)
                        </label>
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
                            {EMOTIONS.map((emotion) => {
                                const EmotionIcon = emotion.icon;
                                const isSelected = selectedEmotions.includes(emotion.value);

                                return (
                                    <button
                                        key={emotion.value}
                                        onClick={() => handleEmotionToggle(emotion.value)}
                                        className={`
                                        relative flex flex-col items-center gap-3 p-5 rounded-3xl border-2 transition-all duration-300 overflow-hidden
                                        ${isSelected
                                                ? `bg-gradient-to-br ${emotion.gradient} text-white border-transparent shadow-2xl shadow-black/10 scale-105`
                                                : 'bg-white/60 border-neutral-200 text-neutral-600 hover:border-neutral-300 hover:scale-105 hover:shadow-lg'
                                            }
                                    `}
                                    >
                                        {isSelected && (
                                            <div className={`absolute inset-0 bg-gradient-to-br ${emotion.bgGradient} opacity-20`} />
                                        )}
                                        <EmotionIcon className={`h-7 w-7 relative z-10 ${isSelected ? 'text-white' : emotion.textColor}`} strokeWidth={2} />
                                        <span className="text-sm font-bold relative z-10">{emotion.label}</span>
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    {/* Context */}
                    <div className="mb-8">
                        <label className="block text-base font-bold text-black mb-3">
                            What's happening? (optional)
                        </label>
                        <input
                            type="text"
                            value={context}
                            onChange={(e) => setContext(e.target.value)}
                            placeholder="e.g., Exam week, Project deadline, Weekend relaxation..."
                            className="w-full px-6 py-4 border-2 border-neutral-300 rounded-2xl focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 font-medium text-base shadow-sm transition-all"
                            maxLength={100}
                        />
                    </div>

                    {/* Notes */}
                    <div className="mb-8">
                        <label className="block text-base font-bold text-black mb-3">
                            Additional notes (optional)
                        </label>
                        <textarea
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                            placeholder="Share more about how you're feeling or what's on your mind..."
                            className="w-full px-6 py-4 border-2 border-neutral-300 rounded-2xl focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 min-h-[120px] font-medium text-base shadow-sm transition-all resize-none"
                            maxLength={500}
                        />
                        <p className="text-sm text-neutral-500 mt-2 font-semibold">{notes.length}/500 characters</p>
                    </div>

                    {/* Save Button */}
                    <button
                        onClick={handleSaveMood}
                        disabled={saving || selectedEmotions.length === 0}
                        className={`
                        w-full px-8 py-5 rounded-2xl font-bold text-lg flex items-center justify-center gap-3 transition-all duration-300
                        ${saving || selectedEmotions.length === 0
                                ? 'bg-neutral-200 text-neutral-400 cursor-not-allowed'
                                : 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white hover:scale-105 shadow-2xl hover:shadow-indigo-500/50'
                            }
                    `}
                    >
                        {saving ? (
                            <>
                                <Loader2 className="h-6 w-6 animate-spin" />
                                Saving...
                            </>
                        ) : (
                            <>
                                <Save className="h-6 w-6" />
                                Save Mood Log
                            </>
                        )}
                    </button>
                </motion.div>

                {/* Mood History */}
                <div className="backdrop-blur-xl bg-white/80 rounded-3xl border border-white/20 shadow-2xl p-8">
                    <div className="flex items-center justify-between mb-8">
                        <h2 className="text-3xl font-bold text-black flex items-center gap-3">
                            <Clock className="h-8 w-8 text-indigo-600" strokeWidth={2.5} />
                            Mood History
                        </h2>
                        <div className="flex gap-3">
                            {['7', '30', '90'].map((days) => (
                                <button
                                    key={days}
                                    onClick={() => setTimeframe(days)}
                                    className={`
                                    px-6 py-3 rounded-2xl font-bold text-sm transition-all duration-300
                                    ${timeframe === days
                                            ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-xl scale-105'
                                            : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200 hover:scale-105'
                                        }
                                `}
                                >
                                    {days} days
                                </button>
                            ))}
                        </div>
                    </div>

                    {moodLogs.length === 0 ? (
                        <div className="text-center py-16">
                            <AlertCircle className="h-20 w-20 text-neutral-300 mx-auto mb-6" strokeWidth={1.5} />
                            <p className="text-neutral-900 text-2xl font-bold mb-3">No mood logs yet</p>
                            <p className="text-neutral-500 text-lg font-medium">Start tracking your mood to see patterns and insights</p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {moodLogs.map((log, index) => (
                                <motion.div
                                    key={log._id}
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: index * 0.05 }}
                                    className={`backdrop-blur-xl bg-white/60 border-2 rounded-3xl p-6 ${getMoodBgColor(log.moodScore)} hover:scale-[1.02] transition-all duration-300 shadow-xl`}
                                >
                                    <div className="flex items-start justify-between mb-4">
                                        <div className="flex items-center gap-4">
                                            <div className={`text-4xl ${getMoodColor(log.moodScore)} font-bold flex items-center justify-center w-16 h-16 bg-white/80 rounded-2xl shadow-lg backdrop-blur-sm`}>
                                                {log.moodScore}
                                            </div>
                                            <div>
                                                <p className="font-bold text-black text-lg">
                                                    {formatDate(log.createdAt)}
                                                </p>
                                                <p className="text-sm text-neutral-600 flex items-center gap-2 font-semibold">
                                                    <Clock className="h-4 w-4" />
                                                    {formatTime(log.createdAt)}
                                                </p>
                                            </div>
                                        </div>
                                        <span className="text-3xl">
                                            {MOOD_SCORE_LABELS[log.moodScore].split(' ')[0]}
                                        </span>
                                    </div>

                                    {/* Emotions */}
                                    <div className="flex flex-wrap gap-2 mb-4">
                                        {log.emotions.map((emotionValue) => {
                                            const emotion = EMOTIONS.find(e => e.value === emotionValue);
                                            if (!emotion) return null;
                                            const EmotionIcon = emotion.icon;

                                            return (
                                                <span
                                                    key={emotionValue}
                                                    className={`bg-gradient-to-br ${emotion.gradient} text-white px-4 py-2 rounded-2xl text-sm font-bold flex items-center gap-2 shadow-lg`}
                                                >
                                                    <EmotionIcon className="h-4 w-4" strokeWidth={2.5} />
                                                    {emotion.label}
                                                </span>
                                            );
                                        })}
                                    </div>

                                    {/* Context */}
                                    {log.context && (
                                        <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-4 mb-3 border border-white/20 shadow-sm">
                                            <p className="text-sm font-bold text-black">📌 {log.context}</p>
                                        </div>
                                    )}

                                    {/* Notes */}
                                    {log.notes && (
                                        <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-4 border border-white/20 shadow-sm">
                                            <p className="text-sm text-neutral-700 font-medium">{log.notes}</p>
                                        </div>
                                    )}
                                </motion.div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

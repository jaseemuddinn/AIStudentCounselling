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
    { value: 'happy', label: 'Happy', icon: Smile, color: 'bg-yellow-500', textColor: 'text-yellow-600' },
    { value: 'excited', label: 'Excited', icon: Zap, color: 'bg-orange-500', textColor: 'text-orange-600' },
    { value: 'calm', label: 'Calm', icon: Sun, color: 'bg-blue-400', textColor: 'text-blue-500' },
    { value: 'content', label: 'Content', icon: Heart, color: 'bg-pink-500', textColor: 'text-pink-600' },
    { value: 'tired', label: 'Tired', icon: Moon, color: 'bg-indigo-500', textColor: 'text-indigo-600' },
    { value: 'stressed', label: 'Stressed', icon: CloudRain, color: 'bg-purple-500', textColor: 'text-purple-600' },
    { value: 'anxious', label: 'Anxious', icon: Cloud, color: 'bg-gray-500', textColor: 'text-gray-600' },
    { value: 'sad', label: 'Sad', icon: Frown, color: 'bg-blue-600', textColor: 'text-blue-700' },
    { value: 'neutral', label: 'Neutral', icon: Meh, color: 'bg-gray-400', textColor: 'text-gray-500' },
    { value: 'energetic', label: 'Energetic', icon: Coffee, color: 'bg-green-500', textColor: 'text-green-600' },
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
                <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
            </div>
        );
    }

    return (
        <div className="space-y-6 text-black">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
                        <Activity className="h-8 w-8 text-indigo-600" />
                        Mood Tracking
                    </h1>
                    <p className="text-gray-600 mt-1">Track your emotional wellbeing and identify patterns</p>
                </div>
            </div>

            {/* Stats Cards */}
            {stats && (
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg p-6 text-white"
                    >
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-indigo-100 text-sm font-medium">Average Mood</p>
                                <p className="text-3xl font-bold mt-2">
                                    {stats.averageMood ? stats.averageMood.toFixed(1) : '-'}
                                </p>
                                <p className="text-indigo-100 text-xs mt-1">out of 10</p>
                            </div>
                            <BarChart3 className="h-12 w-12 text-indigo-200" />
                        </div>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="bg-white rounded-lg border-2 border-gray-200 p-6"
                    >
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-gray-600 text-sm font-medium">Total Logs</p>
                                <p className="text-3xl font-bold text-gray-900 mt-2">{stats.totalLogs}</p>
                                <p className="text-gray-500 text-xs mt-1">last {timeframe} days</p>
                            </div>
                            <Calendar className="h-10 w-10 text-gray-400" />
                        </div>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="bg-white rounded-lg border-2 border-gray-200 p-6"
                    >
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-gray-600 text-sm font-medium">Mood Trend</p>
                                <p className={`text-3xl font-bold mt-2 ${getTrendColor()}`}>
                                    {stats.trend ? (stats.trend > 0 ? '+' : '') + stats.trend.toFixed(1) : '-'}
                                </p>
                                <p className="text-gray-500 text-xs mt-1">vs previous period</p>
                            </div>
                            {(() => {
                                const TrendIcon = getTrendIcon();
                                return <TrendIcon className={`h-10 w-10 ${getTrendColor()}`} />;
                            })()}
                        </div>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                        className="bg-white rounded-lg border-2 border-gray-200 p-6"
                    >
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-gray-600 text-sm font-medium">Most Common</p>
                                <p className="text-lg font-bold text-gray-900 mt-2 capitalize">
                                    {stats.mostCommonEmotion || '-'}
                                </p>
                                <p className="text-gray-500 text-xs mt-1">primary emotion</p>
                            </div>
                            {stats.mostCommonEmotion && (() => {
                                const emotion = EMOTIONS.find(e => e.value === stats.mostCommonEmotion);
                                if (!emotion) return <Heart className="h-10 w-10 text-pink-400" />;
                                const EmotionIcon = emotion.icon;
                                return <EmotionIcon className={`h-10 w-10 ${emotion.textColor}`} />;
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
                className="bg-white rounded-lg border-2 border-gray-200 p-6"
            >
                <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                    <Save className="h-5 w-5 text-indigo-600" />
                    Log Your Mood
                </h2>

                {/* Mood Score Slider */}
                <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-700 mb-3">
                        How are you feeling today?
                    </label>
                    <div className="space-y-4">
                        <div className="flex items-center gap-4">
                            <span className="text-4xl">{MOOD_SCORE_LABELS[moodScore].split(' ')[0]}</span>
                            <div className="flex-1">
                                <input
                                    type="range"
                                    min="1"
                                    max="10"
                                    value={moodScore}
                                    onChange={(e) => setMoodScore(parseInt(e.target.value))}
                                    className="w-full h-3 bg-gradient-to-r from-red-500 via-yellow-500 to-green-500 rounded-lg appearance-none cursor-pointer slider"
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
                            <span className={`text-2xl font-bold ${getMoodColor(moodScore)} min-w-[3rem] text-center`}>
                                {moodScore}
                            </span>
                        </div>
                        <p className="text-center text-gray-600 font-medium">
                            {MOOD_SCORE_LABELS[moodScore]}
                        </p>
                    </div>
                </div>

                {/* Emotions Selection */}
                <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-700 mb-3">
                        Select your emotions (choose one or more)
                    </label>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
                        {EMOTIONS.map((emotion) => {
                            const EmotionIcon = emotion.icon;
                            const isSelected = selectedEmotions.includes(emotion.value);

                            return (
                                <button
                                    key={emotion.value}
                                    onClick={() => handleEmotionToggle(emotion.value)}
                                    className={`
                                        flex flex-col items-center gap-2 p-4 rounded-lg border-2 transition-all
                                        ${isSelected
                                            ? `${emotion.color} text-white border-transparent shadow-lg scale-105`
                                            : 'bg-white border-gray-200 text-gray-600 hover:border-gray-300'
                                        }
                                    `}
                                >
                                    <EmotionIcon className={`h-6 w-6 ${isSelected ? 'text-white' : emotion.textColor}`} />
                                    <span className="text-sm font-medium">{emotion.label}</span>
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* Context */}
                <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        What's happening? (optional)
                    </label>
                    <input
                        type="text"
                        value={context}
                        onChange={(e) => setContext(e.target.value)}
                        placeholder="e.g., Exam week, Project deadline, Weekend relaxation..."
                        className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-indigo-500"
                        maxLength={100}
                    />
                </div>

                {/* Notes */}
                <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Additional notes (optional)
                    </label>
                    <textarea
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        placeholder="Share more about how you're feeling or what's on your mind..."
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-indigo-500 min-h-[100px]"
                        maxLength={500}
                    />
                    <p className="text-sm text-gray-500 mt-1">{notes.length}/500 characters</p>
                </div>

                {/* Save Button */}
                <button
                    onClick={handleSaveMood}
                    disabled={saving || selectedEmotions.length === 0}
                    className={`
                        w-full py-3 px-4 rounded-lg font-medium flex items-center justify-center gap-2 transition-all
                        ${saving || selectedEmotions.length === 0
                            ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                            : 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-lg hover:shadow-xl'
                        }
                    `}
                >
                    {saving ? (
                        <>
                            <Loader2 className="h-5 w-5 animate-spin" />
                            Saving...
                        </>
                    ) : (
                        <>
                            <Save className="h-5 w-5" />
                            Save Mood Log
                        </>
                    )}
                </button>
            </motion.div>

            {/* Mood History */}
            <div className="bg-white rounded-lg border-2 border-gray-200 p-6">
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                        <Clock className="h-5 w-5 text-indigo-600" />
                        Mood History
                    </h2>
                    <div className="flex gap-2">
                        {['7', '30', '90'].map((days) => (
                            <button
                                key={days}
                                onClick={() => setTimeframe(days)}
                                className={`
                                    px-4 py-2 rounded-lg font-medium text-sm transition-all
                                    ${timeframe === days
                                        ? 'bg-indigo-600 text-white shadow-md'
                                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                    }
                                `}
                            >
                                {days} days
                            </button>
                        ))}
                    </div>
                </div>

                {moodLogs.length === 0 ? (
                    <div className="text-center py-12">
                        <AlertCircle className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                        <p className="text-gray-500 text-lg mb-2">No mood logs yet</p>
                        <p className="text-gray-400">Start tracking your mood to see patterns and insights</p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {moodLogs.map((log, index) => (
                            <motion.div
                                key={log._id}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: index * 0.05 }}
                                className={`border-2 rounded-lg p-4 ${getMoodBgColor(log.moodScore)}`}
                            >
                                <div className="flex items-start justify-between mb-3">
                                    <div className="flex items-center gap-3">
                                        <div className={`text-3xl ${getMoodColor(log.moodScore)} font-bold flex items-center justify-center w-12 h-12 bg-white rounded-lg shadow`}>
                                            {log.moodScore}
                                        </div>
                                        <div>
                                            <p className="font-semibold text-gray-900">
                                                {formatDate(log.createdAt)}
                                            </p>
                                            <p className="text-sm text-gray-600 flex items-center gap-1">
                                                <Clock className="h-3 w-3" />
                                                {formatTime(log.createdAt)}
                                            </p>
                                        </div>
                                    </div>
                                    <span className="text-2xl">
                                        {MOOD_SCORE_LABELS[log.moodScore].split(' ')[0]}
                                    </span>
                                </div>

                                {/* Emotions */}
                                <div className="flex flex-wrap gap-2 mb-3">
                                    {log.emotions.map((emotionValue) => {
                                        const emotion = EMOTIONS.find(e => e.value === emotionValue);
                                        if (!emotion) return null;
                                        const EmotionIcon = emotion.icon;

                                        return (
                                            <span
                                                key={emotionValue}
                                                className={`${emotion.color} text-white px-3 py-1 rounded-full text-sm font-medium flex items-center gap-1`}
                                            >
                                                <EmotionIcon className="h-4 w-4" />
                                                {emotion.label}
                                            </span>
                                        );
                                    })}
                                </div>

                                {/* Context */}
                                {log.context && (
                                    <div className="bg-white/50 rounded-lg p-3 mb-2">
                                        <p className="text-sm font-medium text-gray-700">📌 {log.context}</p>
                                    </div>
                                )}

                                {/* Notes */}
                                {log.notes && (
                                    <div className="bg-white/50 rounded-lg p-3">
                                        <p className="text-sm text-gray-700">{log.notes}</p>
                                    </div>
                                )}
                            </motion.div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}

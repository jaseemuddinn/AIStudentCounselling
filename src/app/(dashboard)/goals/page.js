'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import {
    Target,
    Plus,
    Calendar,
    TrendingUp,
    CheckCircle2,
    Circle,
    Pause,
    X,
    Edit2,
    Trash2,
    Filter,
    Loader2
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const CATEGORIES = [
    { value: 'academic', label: 'Academic', gradient: 'from-blue-500 to-cyan-500', bgGradient: 'from-blue-500/10 to-cyan-500/10', icon: '🎓' },
    { value: 'career', label: 'Career', gradient: 'from-purple-500 to-pink-500', bgGradient: 'from-purple-500/10 to-pink-500/10', icon: '💼' },
    { value: 'skill', label: 'Skill', gradient: 'from-green-500 to-emerald-500', bgGradient: 'from-green-500/10 to-emerald-500/10', icon: '🎯' },
    { value: 'personal', label: 'Personal', gradient: 'from-orange-500 to-yellow-500', bgGradient: 'from-orange-500/10 to-yellow-500/10', icon: '⭐' },
    { value: 'other', label: 'Other', gradient: 'from-neutral-500 to-neutral-600', bgGradient: 'from-neutral-500/10 to-neutral-600/10', icon: '📌' },
];

const STATUS_OPTIONS = [
    { value: 'not-started', label: 'Not Started', icon: Circle, color: 'text-gray-400' },
    { value: 'in-progress', label: 'In Progress', icon: TrendingUp, color: 'text-blue-500' },
    { value: 'completed', label: 'Completed', icon: CheckCircle2, color: 'text-green-500' },
    { value: 'abandoned', label: 'Abandoned', icon: Pause, color: 'text-red-500' },
];

export default function GoalsPage() {
    const { data: session } = useSession();
    const [goals, setGoals] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editingGoal, setEditingGoal] = useState(null);
    const [filterCategory, setFilterCategory] = useState('all');
    const [filterStatus, setFilterStatus] = useState('all');
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        category: 'academic',
        targetDate: '',
        status: 'not-started',
        progressPercentage: 0,
    });
    const [submitting, setSubmitting] = useState(false);

    // Fetch goals
    useEffect(() => {
        if (session) {
            fetchGoals();
        }
    }, [session]);

    const fetchGoals = async () => {
        try {
            const response = await fetch('/api/goals');
            const data = await response.json();
            if (data.success) {
                setGoals(data.goals);
            }
        } catch (error) {
            console.error('Failed to fetch goals:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleOpenModal = (goal = null) => {
        if (goal) {
            setEditingGoal(goal);
            setFormData({
                title: goal.title,
                description: goal.description || '',
                category: goal.category,
                targetDate: goal.targetDate ? new Date(goal.targetDate).toISOString().split('T')[0] : '',
                status: goal.status,
                progressPercentage: goal.progressPercentage || 0,
            });
        } else {
            setEditingGoal(null);
            setFormData({
                title: '',
                description: '',
                category: 'academic',
                targetDate: '',
                status: 'not-started',
                progressPercentage: 0,
            });
        }
        setShowModal(true);
    };

    const handleCloseModal = () => {
        setShowModal(false);
        setEditingGoal(null);
        setFormData({
            title: '',
            description: '',
            category: 'academic',
            targetDate: '',
            status: 'not-started',
            progressPercentage: 0,
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);

        try {
            const url = editingGoal ? `/api/goals/${editingGoal._id}` : '/api/goals';
            const method = editingGoal ? 'PUT' : 'POST';

            const response = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
            });

            const data = await response.json();

            if (data.success) {
                await fetchGoals();
                handleCloseModal();
            } else {
                alert(data.error || 'Failed to save goal');
            }
        } catch (error) {
            console.error('Failed to save goal:', error);
            alert('Failed to save goal');
        } finally {
            setSubmitting(false);
        }
    };

    const handleDelete = async (goalId) => {
        if (!confirm('Are you sure you want to delete this goal?')) return;

        try {
            const response = await fetch(`/api/goals/${goalId}`, {
                method: 'DELETE',
            });

            const data = await response.json();

            if (data.success) {
                await fetchGoals();
            } else {
                alert(data.error || 'Failed to delete goal');
            }
        } catch (error) {
            console.error('Failed to delete goal:', error);
            alert('Failed to delete goal');
        }
    };

    const handleProgressUpdate = async (goalId, newProgress) => {
        try {
            const response = await fetch(`/api/goals/${goalId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ progressPercentage: newProgress }),
            });

            const data = await response.json();

            if (data.success) {
                await fetchGoals();
            }
        } catch (error) {
            console.error('Failed to update progress:', error);
        }
    };

    // Filter goals
    const filteredGoals = goals.filter(goal => {
        const matchesCategory = filterCategory === 'all' || goal.category === filterCategory;
        const matchesStatus = filterStatus === 'all' || goal.status === filterStatus;
        return matchesCategory && matchesStatus;
    });

    // Calculate stats
    const stats = {
        total: goals.length,
        active: goals.filter(g => g.status === 'in-progress' || g.status === 'not-started').length,
        completed: goals.filter(g => g.status === 'completed').length,
        avgProgress: goals.length > 0
            ? Math.round(goals.reduce((sum, g) => sum + (g.progressPercentage || 0), 0) / goals.length)
            : 0,
    };

    return (
        <div className="min-h-screen py-12 px-6 text-black">
            {/* Header */}
            <div className="max-w-7xl mx-auto mb-16">
                <div className="flex items-center justify-between">
                    <div>
                        <div className="flex items-center gap-3 mb-4">
                            <div className="h-[2px] w-12 bg-gradient-to-r from-black to-neutral-400 rounded-full" />
                            <span className="text-xs tracking-[0.25em] text-neutral-400 uppercase font-semibold">Goals</span>
                        </div>
                        <h1 className="text-5xl font-bold tracking-tight bg-gradient-to-br from-black via-neutral-800 to-neutral-600 bg-clip-text text-transparent mb-4">
                            Your Goals
                        </h1>
                        <p className="text-xl text-neutral-600 font-medium">
                            Track and manage your academic and career goals ✨
                        </p>
                    </div>
                    <button
                        onClick={() => handleOpenModal()}
                        className="inline-flex items-center px-7 py-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-2xl hover:shadow-2xl hover:shadow-indigo-500/30 transition-all duration-300 font-bold hover:scale-105 text-base"
                    >
                        <Plus className="h-5 w-5 mr-2" strokeWidth={2.5} />
                        New Goal
                    </button>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="max-w-7xl mx-auto grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4 mb-16">
                <div className="backdrop-blur-xl bg-white/80 border border-white/20 shadow-xl rounded-3xl p-7 transition-all duration-500 hover:shadow-2xl hover:-translate-y-1">
                    <div className="flex items-start justify-between mb-8">
                        <div className="p-3 rounded-2xl bg-gradient-to-br from-blue-500 to-cyan-500 shadow-lg">
                            <Target className="h-5 w-5 text-white" strokeWidth={2} />
                        </div>
                    </div>
                    <div>
                        <p className="text-xs text-neutral-400 mb-2 font-medium tracking-wider uppercase">Total Goals</p>
                        <p className="text-4xl font-medium tracking-tighter text-black">{stats.total}</p>
                    </div>
                </div>

                <div className="backdrop-blur-xl bg-white/80 border border-white/20 shadow-xl rounded-3xl p-7 transition-all duration-500 hover:shadow-2xl hover:-translate-y-1">
                    <div className="flex items-start justify-between mb-8">
                        <div className="p-3 rounded-2xl bg-gradient-to-br from-orange-500 to-yellow-500 shadow-lg">
                            <TrendingUp className="h-5 w-5 text-white" strokeWidth={2} />
                        </div>
                    </div>
                    <div>
                        <p className="text-xs text-neutral-400 mb-2 font-medium tracking-wider uppercase">Active</p>
                        <p className="text-4xl font-medium tracking-tighter text-black">{stats.active}</p>
                    </div>
                </div>

                <div className="backdrop-blur-xl bg-white/80 border border-white/20 shadow-xl rounded-3xl p-7 transition-all duration-500 hover:shadow-2xl hover:-translate-y-1">
                    <div className="flex items-start justify-between mb-8">
                        <div className="p-3 rounded-2xl bg-gradient-to-br from-green-500 to-emerald-500 shadow-lg">
                            <CheckCircle2 className="h-5 w-5 text-white" strokeWidth={2} />
                        </div>
                    </div>
                    <div>
                        <p className="text-xs text-neutral-400 mb-2 font-medium tracking-wider uppercase">Completed</p>
                        <p className="text-4xl font-medium tracking-tighter text-black">{stats.completed}</p>
                    </div>
                </div>

                <div className="backdrop-blur-xl bg-white/80 border border-white/20 shadow-xl rounded-3xl p-7 transition-all duration-500 hover:shadow-2xl hover:-translate-y-1">
                    <div className="flex items-start justify-between mb-8">
                        <div className="p-3 rounded-2xl bg-gradient-to-br from-purple-500 to-pink-500 shadow-lg">
                            <TrendingUp className="h-5 w-5 text-white" strokeWidth={2} />
                        </div>
                    </div>
                    <div>
                        <p className="text-xs text-neutral-400 mb-2 font-medium tracking-wider uppercase">Avg Progress</p>
                        <p className="text-4xl font-medium tracking-tighter text-black">{stats.avgProgress}%</p>
                    </div>
                </div>
            </div>

            {/* Filters */}
            <div className="max-w-7xl mx-auto mb-8 flex flex-wrap gap-4">
                <div className="flex items-center gap-3">
                    <Filter className="h-5 w-5 text-neutral-500" strokeWidth={2} />
                    <select
                        value={filterCategory}
                        onChange={(e) => setFilterCategory(e.target.value)}
                        className="border-2 border-neutral-300 rounded-xl px-4 py-2.5 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white shadow-sm"
                    >
                        <option value="all">All Categories</option>
                        {CATEGORIES.map(cat => (
                            <option key={cat.value} value={cat.value}>{cat.icon} {cat.label}</option>
                        ))}
                    </select>

                    <select
                        value={filterStatus}
                        onChange={(e) => setFilterStatus(e.target.value)}
                        className="border-2 border-neutral-300 rounded-xl px-4 py-2.5 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white shadow-sm"
                    >
                        <option value="all">All Statuses</option>
                        {STATUS_OPTIONS.map(status => (
                            <option key={status.value} value={status.value}>{status.label}</option>
                        ))}
                    </select>
                </div>
            </div>

            {/* Goals List */}
            <div className="max-w-7xl mx-auto">
                {loading ? (
                    <div className="flex justify-center items-center py-20">
                        <div className="relative">
                            <div className="w-16 h-16 rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 animate-pulse"></div>
                            <Loader2 className="absolute inset-0 m-auto h-8 w-8 animate-spin text-white" strokeWidth={3} />
                        </div>
                    </div>
                ) : filteredGoals.length === 0 ? (
                    <div className="backdrop-blur-xl bg-white/80 border border-white/20 shadow-xl rounded-3xl p-16 text-center">
                        <div className="inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-gradient-to-br from-neutral-100 to-neutral-200 mb-6">
                            <Target className="h-10 w-10 text-neutral-400" strokeWidth={2} />
                        </div>
                        <h3 className="text-2xl font-bold text-black mb-3">No goals found</h3>
                        <p className="text-neutral-600 font-medium mb-8 text-lg">
                            {goals.length === 0
                                ? "Start by creating your first goal ✨"
                                : "Try adjusting your filters"
                            }
                        </p>
                        {goals.length === 0 && (
                            <button
                                onClick={() => handleOpenModal()}
                                className="inline-flex items-center px-7 py-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-2xl hover:shadow-2xl hover:shadow-indigo-500/30 transition-all duration-300 font-bold hover:scale-105"
                            >
                                <Plus className="h-5 w-5 mr-2" strokeWidth={2.5} />
                                Create Goal
                            </button>
                        )}
                    </div>
                ) : (
                    <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                        <AnimatePresence>
                            {filteredGoals.map((goal) => {
                                const category = CATEGORIES.find(c => c.value === goal.category);
                                const status = STATUS_OPTIONS.find(s => s.value === goal.status);
                                const StatusIcon = status.icon;
                                const isOverdue = goal.targetDate && new Date(goal.targetDate) < new Date() && goal.status !== 'completed';

                                return (
                                    <motion.div
                                        key={goal._id}
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: -20 }}
                                        className="backdrop-blur-xl bg-white/80 border border-white/20 shadow-xl rounded-3xl p-7 hover:shadow-2xl transition-all duration-500 hover:-translate-y-1 relative overflow-hidden"
                                    >
                                        {/* Gradient background based on category */}
                                        <div className={`absolute inset-0 bg-gradient-to-br ${category.bgGradient} opacity-50`} />

                                        <div className="relative z-10">
                                            {/* Header */}
                                            <div className="flex items-start justify-between mb-5">
                                                <div className="flex items-start gap-3 flex-1">
                                                    <span className={`bg-gradient-to-br ${category.gradient} text-white px-4 py-2 rounded-xl text-sm font-bold shadow-lg`}>
                                                        {category.icon} {category.label}
                                                    </span>
                                                    <div className={`flex items-center gap-2 ${status.color}`}>
                                                        <StatusIcon className="h-4 w-4" strokeWidth={2.5} />
                                                        <span className="text-xs font-bold">{status.label}</span>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <button
                                                        onClick={() => handleOpenModal(goal)}
                                                        className="p-2 text-neutral-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all"
                                                    >
                                                        <Edit2 className="h-4 w-4" strokeWidth={2} />
                                                    </button>
                                                    <button
                                                        onClick={() => handleDelete(goal._id)}
                                                        className="p-2 text-neutral-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all"
                                                    >
                                                        <Trash2 className="h-4 w-4" strokeWidth={2} />
                                                    </button>
                                                </div>
                                            </div>

                                            {/* Title */}
                                            <h3 className="text-2xl font-bold text-black mb-3">{goal.title}</h3>

                                            {/* Description */}
                                            {goal.description && (
                                                <p className="text-base text-neutral-700 font-medium mb-5 line-clamp-2">{goal.description}</p>
                                            )}

                                            {/* Progress Bar */}
                                            <div className="mb-5">
                                                <div className="flex items-center justify-between mb-3">
                                                    <span className="text-sm font-bold text-black">Progress</span>
                                                    <span className="text-lg font-bold text-black">{goal.progressPercentage || 0}%</span>
                                                </div>
                                                <div className="w-full bg-neutral-200 rounded-full h-3 shadow-inner">
                                                    <div
                                                        className={`h-3 rounded-full transition-all duration-500 ${goal.progressPercentage === 100
                                                            ? 'bg-gradient-to-r from-green-500 to-emerald-500 shadow-lg shadow-green-500/30'
                                                            : 'bg-gradient-to-r from-indigo-600 to-purple-600 shadow-lg shadow-indigo-500/30'
                                                            }`}
                                                        style={{ width: `${goal.progressPercentage || 0}%` }}
                                                    />
                                                </div>
                                                <input
                                                    type="range"
                                                    min="0"
                                                    max="100"
                                                    value={goal.progressPercentage || 0}
                                                    onChange={(e) => handleProgressUpdate(goal._id, parseInt(e.target.value))}
                                                    className="w-full mt-3 h-2 bg-neutral-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                                                />
                                            </div>

                                            {/* Target Date */}
                                            {goal.targetDate && (
                                                <div className="flex items-center gap-3 text-base">
                                                    <Calendar className={`h-5 w-5 ${isOverdue ? 'text-red-500' : 'text-neutral-500'}`} strokeWidth={2} />
                                                    <span className={isOverdue ? 'text-red-600 font-bold' : 'text-neutral-700 font-semibold'}>
                                                        {isOverdue ? 'Overdue: ' : 'Target: '}
                                                        {new Date(goal.targetDate).toLocaleDateString('en-US', {
                                                            month: 'short',
                                                            day: 'numeric',
                                                            year: 'numeric'
                                                        })}
                                                    </span>
                                                </div>
                                            )}
                                        </div>
                                    </motion.div>
                                );
                            })}
                        </AnimatePresence>
                    </div>
                )}

                {/* Modal */}
                <AnimatePresence>
                    {showModal && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
                            onClick={handleCloseModal}
                        >
                            <motion.div
                                initial={{ scale: 0.95, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                exit={{ scale: 0.95, opacity: 0 }}
                                className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
                                onClick={(e) => e.stopPropagation()}
                            >
                                <div className="p-6">
                                    <div className="flex items-center justify-between mb-6">
                                        <h2 className="text-2xl font-bold text-gray-900">
                                            {editingGoal ? 'Edit Goal' : 'Create New Goal'}
                                        </h2>
                                        <button
                                            onClick={handleCloseModal}
                                            className="text-gray-400 hover:text-gray-600"
                                        >
                                            <X className="h-6 w-6" />
                                        </button>
                                    </div>

                                    <form onSubmit={handleSubmit} className="space-y-4">
                                        {/* Title */}
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                Goal Title *
                                            </label>
                                            <input
                                                type="text"
                                                required
                                                value={formData.title}
                                                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                                placeholder="e.g., Complete Machine Learning Course"
                                            />
                                        </div>

                                        {/* Description */}
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                Description
                                            </label>
                                            <textarea
                                                value={formData.description}
                                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                                rows={3}
                                                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                                placeholder="Describe your goal..."
                                            />
                                        </div>

                                        {/* Category & Status */}
                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                                    Category *
                                                </label>
                                                <select
                                                    required
                                                    value={formData.category}
                                                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                                                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                                >
                                                    {CATEGORIES.map(cat => (
                                                        <option key={cat.value} value={cat.value}>
                                                            {cat.icon} {cat.label}
                                                        </option>
                                                    ))}
                                                </select>
                                            </div>

                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                                    Status *
                                                </label>
                                                <select
                                                    required
                                                    value={formData.status}
                                                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                                                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                                >
                                                    {STATUS_OPTIONS.map(status => (
                                                        <option key={status.value} value={status.value}>
                                                            {status.label}
                                                        </option>
                                                    ))}
                                                </select>
                                            </div>
                                        </div>

                                        {/* Target Date & Progress */}
                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                                    Target Date
                                                </label>
                                                <input
                                                    type="date"
                                                    value={formData.targetDate}
                                                    onChange={(e) => setFormData({ ...formData, targetDate: e.target.value })}
                                                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                                />
                                            </div>

                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                                    Progress: {formData.progressPercentage}%
                                                </label>
                                                <input
                                                    type="range"
                                                    min="0"
                                                    max="100"
                                                    value={formData.progressPercentage}
                                                    onChange={(e) => setFormData({ ...formData, progressPercentage: parseInt(e.target.value) })}
                                                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                                                />
                                            </div>
                                        </div>

                                        {/* Buttons */}
                                        <div className="flex justify-end gap-3 mt-6">
                                            <button
                                                type="button"
                                                onClick={handleCloseModal}
                                                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                                                disabled={submitting}
                                            >
                                                Cancel
                                            </button>
                                            <button
                                                type="submit"
                                                className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:opacity-50 flex items-center gap-2"
                                                disabled={submitting}
                                            >
                                                {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
                                                {editingGoal ? 'Update Goal' : 'Create Goal'}
                                            </button>
                                        </div>
                                    </form>
                                </div>
                            </motion.div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
}

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
    { value: 'academic', label: 'Academic', color: 'bg-blue-500', icon: '🎓' },
    { value: 'career', label: 'Career', color: 'bg-purple-500', icon: '💼' },
    { value: 'skill', label: 'Skill', color: 'bg-green-500', icon: '🎯' },
    { value: 'personal', label: 'Personal', color: 'bg-yellow-500', icon: '⭐' },
    { value: 'other', label: 'Other', color: 'bg-gray-500', icon: '📌' },
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
        <div className="py-6 px-4 sm:px-6 lg:px-8 text-black">
            {/* Header */}
            <div className="mb-8">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">Goals</h1>
                        <p className="mt-2 text-gray-600">
                            Track and manage your academic and career goals
                        </p>
                    </div>
                    <button
                        onClick={() => handleOpenModal()}
                        className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
                    >
                        <Plus className="h-5 w-5 mr-2" />
                        New Goal
                    </button>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4 mb-8">
                <div className="bg-white overflow-hidden shadow rounded-lg">
                    <div className="p-5">
                        <div className="flex items-center">
                            <div className="flex-shrink-0 rounded-md bg-blue-500 p-3">
                                <Target className="h-6 w-6 text-white" />
                            </div>
                            <div className="ml-5 w-0 flex-1">
                                <dl>
                                    <dt className="text-sm font-medium text-gray-500 truncate">Total Goals</dt>
                                    <dd className="text-2xl font-bold text-gray-900">{stats.total}</dd>
                                </dl>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="bg-white overflow-hidden shadow rounded-lg">
                    <div className="p-5">
                        <div className="flex items-center">
                            <div className="flex-shrink-0 rounded-md bg-yellow-500 p-3">
                                <TrendingUp className="h-6 w-6 text-white" />
                            </div>
                            <div className="ml-5 w-0 flex-1">
                                <dl>
                                    <dt className="text-sm font-medium text-gray-500 truncate">Active</dt>
                                    <dd className="text-2xl font-bold text-gray-900">{stats.active}</dd>
                                </dl>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="bg-white overflow-hidden shadow rounded-lg">
                    <div className="p-5">
                        <div className="flex items-center">
                            <div className="flex-shrink-0 rounded-md bg-green-500 p-3">
                                <CheckCircle2 className="h-6 w-6 text-white" />
                            </div>
                            <div className="ml-5 w-0 flex-1">
                                <dl>
                                    <dt className="text-sm font-medium text-gray-500 truncate">Completed</dt>
                                    <dd className="text-2xl font-bold text-gray-900">{stats.completed}</dd>
                                </dl>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="bg-white overflow-hidden shadow rounded-lg">
                    <div className="p-5">
                        <div className="flex items-center">
                            <div className="flex-shrink-0 rounded-md bg-purple-500 p-3">
                                <TrendingUp className="h-6 w-6 text-white" />
                            </div>
                            <div className="ml-5 w-0 flex-1">
                                <dl>
                                    <dt className="text-sm font-medium text-gray-500 truncate">Avg Progress</dt>
                                    <dd className="text-2xl font-bold text-gray-900">{stats.avgProgress}%</dd>
                                </dl>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Filters */}
            <div className="mb-6 flex flex-wrap gap-4">
                <div className="flex items-center gap-2">
                    <Filter className="h-5 w-5 text-gray-500" />
                    <select
                        value={filterCategory}
                        onChange={(e) => setFilterCategory(e.target.value)}
                        className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    >
                        <option value="all">All Categories</option>
                        {CATEGORIES.map(cat => (
                            <option key={cat.value} value={cat.value}>{cat.icon} {cat.label}</option>
                        ))}
                    </select>
                </div>

                <select
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                    className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                    <option value="all">All Statuses</option>
                    {STATUS_OPTIONS.map(status => (
                        <option key={status.value} value={status.value}>{status.label}</option>
                    ))}
                </select>
            </div>

            {/* Goals List */}
            {loading ? (
                <div className="flex justify-center items-center py-12">
                    <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
                </div>
            ) : filteredGoals.length === 0 ? (
                <div className="bg-white shadow rounded-lg p-12 text-center">
                    <Target className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No goals found</h3>
                    <p className="text-gray-500 mb-6">
                        {goals.length === 0
                            ? "Start by creating your first goal"
                            : "Try adjusting your filters"
                        }
                    </p>
                    {goals.length === 0 && (
                        <button
                            onClick={() => handleOpenModal()}
                            className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
                        >
                            <Plus className="h-5 w-5 mr-2" />
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
                                    className="bg-white shadow rounded-lg p-6 hover:shadow-md transition-shadow"
                                >
                                    {/* Header */}
                                    <div className="flex items-start justify-between mb-4">
                                        <div className="flex items-start gap-3 flex-1">
                                            <span className={`${category.color} text-white px-2 py-1 rounded text-xs font-medium`}>
                                                {category.icon} {category.label}
                                            </span>
                                            <div className={`flex items-center gap-2 ${status.color}`}>
                                                <StatusIcon className="h-4 w-4" />
                                                <span className="text-xs font-medium">{status.label}</span>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <button
                                                onClick={() => handleOpenModal(goal)}
                                                className="text-gray-400 hover:text-indigo-600"
                                            >
                                                <Edit2 className="h-4 w-4" />
                                            </button>
                                            <button
                                                onClick={() => handleDelete(goal._id)}
                                                className="text-gray-400 hover:text-red-600"
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </button>
                                        </div>
                                    </div>

                                    {/* Title */}
                                    <h3 className="text-lg font-semibold text-gray-900 mb-2">{goal.title}</h3>

                                    {/* Description */}
                                    {goal.description && (
                                        <p className="text-sm text-gray-600 mb-4 line-clamp-2">{goal.description}</p>
                                    )}

                                    {/* Progress Bar */}
                                    <div className="mb-4">
                                        <div className="flex items-center justify-between mb-2">
                                            <span className="text-xs font-medium text-gray-700">Progress</span>
                                            <span className="text-xs font-medium text-gray-900">{goal.progressPercentage || 0}%</span>
                                        </div>
                                        <div className="w-full bg-gray-200 rounded-full h-2">
                                            <div
                                                className={`h-2 rounded-full transition-all ${goal.progressPercentage === 100 ? 'bg-green-500' : 'bg-indigo-600'
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
                                            className="w-full mt-2 h-1 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                                        />
                                    </div>

                                    {/* Target Date */}
                                    {goal.targetDate && (
                                        <div className="flex items-center gap-2 text-sm">
                                            <Calendar className={`h-4 w-4 ${isOverdue ? 'text-red-500' : 'text-gray-400'}`} />
                                            <span className={isOverdue ? 'text-red-600 font-medium' : 'text-gray-600'}>
                                                {isOverdue ? 'Overdue: ' : 'Target: '}
                                                {new Date(goal.targetDate).toLocaleDateString('en-US', {
                                                    month: 'short',
                                                    day: 'numeric',
                                                    year: 'numeric'
                                                })}
                                            </span>
                                        </div>
                                    )}
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
    );
}

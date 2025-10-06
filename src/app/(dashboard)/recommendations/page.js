'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import {
    Lightbulb,
    Filter,
    Sparkles,
    Loader2,
    BookOpen,
    Briefcase,
    Target,
    FileText,
    GraduationCap,
    Eye,
    Bookmark,
    X,
    TrendingUp,
    Clock,
    ExternalLink,
    AlertCircle
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';

const RECOMMENDATION_TYPES = [
    { value: 'all', label: 'All Types', icon: Lightbulb, color: 'bg-gray-500' },
    { value: 'course', label: 'Courses', icon: BookOpen, color: 'bg-blue-500' },
    { value: 'career', label: 'Career Paths', icon: Briefcase, color: 'bg-purple-500' },
    { value: 'skill', label: 'Skills', icon: Target, color: 'bg-green-500' },
    { value: 'resource', label: 'Resources', icon: FileText, color: 'bg-yellow-500' },
    { value: 'program', label: 'Programs', icon: GraduationCap, color: 'bg-indigo-500' },
];

const PRIORITY_LEVELS = [
    { value: 'all', label: 'All Priorities', color: 'text-gray-600' },
    { value: 'high', label: 'High Priority', color: 'text-red-600' },
    { value: 'medium', label: 'Medium Priority', color: 'text-yellow-600' },
    { value: 'low', label: 'Low Priority', color: 'text-green-600' },
];

const STATUS_FILTERS = [
    { value: 'all', label: 'All Status', color: 'text-gray-600' },
    { value: 'new', label: 'New', color: 'text-blue-600' },
    { value: 'viewed', label: 'Viewed', color: 'text-purple-600' },
    { value: 'saved', label: 'Saved', color: 'text-green-600' },
    { value: 'dismissed', label: 'Dismissed', color: 'text-gray-400' },
];

export default function RecommendationsPage() {
    const { data: session } = useSession();
    const [recommendations, setRecommendations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [generating, setGenerating] = useState(false);
    const [filterType, setFilterType] = useState('all');
    const [filterPriority, setFilterPriority] = useState('all');
    const [filterStatus, setFilterStatus] = useState('all');
    const [sortBy, setSortBy] = useState('date'); // date, relevance, priority
    const [selectedRecommendation, setSelectedRecommendation] = useState(null);
    const [showDetailModal, setShowDetailModal] = useState(false);

    useEffect(() => {
        if (session) {
            fetchRecommendations();
        }
    }, [session]);

    const fetchRecommendations = async () => {
        try {
            const response = await fetch('/api/recommendations');
            const data = await response.json();
            if (data.success) {
                setRecommendations(data.recommendations);
            }
        } catch (error) {
            console.error('Failed to fetch recommendations:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleGenerateRecommendations = async () => {
        setGenerating(true);
        try {
            const response = await fetch('/api/recommendations/generate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
            });

            const data = await response.json();

            if (data.success) {
                await fetchRecommendations();
                alert(`Generated ${data.count} new recommendations!`);
            } else {
                alert(data.error || 'Failed to generate recommendations');
            }
        } catch (error) {
            console.error('Failed to generate recommendations:', error);
            alert('Failed to generate recommendations. Please try again.');
        } finally {
            setGenerating(false);
        }
    };

    const handleUpdateStatus = async (recommendationId, newStatus) => {
        try {
            const response = await fetch(`/api/recommendations/${recommendationId}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status: newStatus }),
            });

            const data = await response.json();

            if (data.success) {
                setRecommendations(prev =>
                    prev.map(rec =>
                        rec._id === recommendationId
                            ? { ...rec, status: newStatus }
                            : rec
                    )
                );

                // Close modal if dismissing
                if (newStatus === 'dismissed' && showDetailModal) {
                    setShowDetailModal(false);
                }
            }
        } catch (error) {
            console.error('Failed to update recommendation status:', error);
        }
    };

    const handleViewDetails = (recommendation) => {
        // Mark as viewed if it's new
        if (recommendation.status === 'new') {
            handleUpdateStatus(recommendation._id, 'viewed');
        }
        setSelectedRecommendation(recommendation);
        setShowDetailModal(true);
    };

    // Filter and sort recommendations
    const filteredRecommendations = recommendations
        .filter(rec => {
            const matchesType = filterType === 'all' || rec.type === filterType;
            const matchesPriority = filterPriority === 'all' || rec.priority === filterPriority;
            const matchesStatus = filterStatus === 'all' || rec.status === filterStatus;
            return matchesType && matchesPriority && matchesStatus;
        })
        .sort((a, b) => {
            if (sortBy === 'relevance') {
                return (b.relevanceScore || 0) - (a.relevanceScore || 0);
            } else if (sortBy === 'priority') {
                const priorityOrder = { high: 3, medium: 2, low: 1 };
                return priorityOrder[b.priority] - priorityOrder[a.priority];
            } else {
                return new Date(b.createdAt) - new Date(a.createdAt);
            }
        });

    // Calculate stats
    const stats = {
        total: recommendations.length,
        new: recommendations.filter(r => r.status === 'new').length,
        saved: recommendations.filter(r => r.status === 'saved').length,
        avgRelevance: recommendations.length > 0
            ? Math.round(recommendations.reduce((sum, r) => sum + (r.relevanceScore || 0), 0) / recommendations.length)
            : 0,
    };

    const getPriorityColor = (priority) => {
        switch (priority) {
            case 'high': return 'text-red-600 bg-red-50 border-red-200';
            case 'medium': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
            case 'low': return 'text-green-600 bg-green-50 border-green-200';
            default: return 'text-gray-600 bg-gray-50 border-gray-200';
        }
    };

    const getTypeIcon = (type) => {
        const typeObj = RECOMMENDATION_TYPES.find(t => t.value === type);
        return typeObj ? typeObj.icon : Lightbulb;
    };

    const getTypeColor = (type) => {
        const typeObj = RECOMMENDATION_TYPES.find(t => t.value === type);
        return typeObj ? typeObj.color : 'bg-gray-500';
    };

    return (
        <div className="py-6 px-4 sm:px-6 lg:px-8 text-black">
            {/* Header */}
            <div className="mb-8">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900 flex items-center">
                            <Lightbulb className="h-8 w-8 mr-3 text-yellow-500" />
                            Recommendations
                        </h1>
                        <p className="mt-2 text-gray-600">
                            Personalized suggestions to enhance your learning journey
                        </p>
                    </div>
                    <button
                        onClick={handleGenerateRecommendations}
                        disabled={generating}
                        className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {generating ? (
                            <>
                                <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                                Generating...
                            </>
                        ) : (
                            <>
                                <Sparkles className="h-5 w-5 mr-2" />
                                Generate New
                            </>
                        )}
                    </button>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4 mb-8">
                <div className="bg-white overflow-hidden shadow rounded-lg">
                    <div className="p-5">
                        <div className="flex items-center">
                            <div className="flex-shrink-0 rounded-md bg-blue-500 p-3">
                                <Lightbulb className="h-6 w-6 text-white" />
                            </div>
                            <div className="ml-5 w-0 flex-1">
                                <dl>
                                    <dt className="text-sm font-medium text-gray-500 truncate">Total</dt>
                                    <dd className="text-2xl font-bold text-gray-900">{stats.total}</dd>
                                </dl>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="bg-white overflow-hidden shadow rounded-lg">
                    <div className="p-5">
                        <div className="flex items-center">
                            <div className="flex-shrink-0 rounded-md bg-purple-500 p-3">
                                <Sparkles className="h-6 w-6 text-white" />
                            </div>
                            <div className="ml-5 w-0 flex-1">
                                <dl>
                                    <dt className="text-sm font-medium text-gray-500 truncate">New</dt>
                                    <dd className="text-2xl font-bold text-gray-900">{stats.new}</dd>
                                </dl>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="bg-white overflow-hidden shadow rounded-lg">
                    <div className="p-5">
                        <div className="flex items-center">
                            <div className="flex-shrink-0 rounded-md bg-green-500 p-3">
                                <Bookmark className="h-6 w-6 text-white" />
                            </div>
                            <div className="ml-5 w-0 flex-1">
                                <dl>
                                    <dt className="text-sm font-medium text-gray-500 truncate">Saved</dt>
                                    <dd className="text-2xl font-bold text-gray-900">{stats.saved}</dd>
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
                                    <dt className="text-sm font-medium text-gray-500 truncate">Avg Relevance</dt>
                                    <dd className="text-2xl font-bold text-gray-900">{stats.avgRelevance}%</dd>
                                </dl>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Filters */}
            <div className="mb-6 bg-white shadow rounded-lg p-4">
                <div className="flex flex-wrap gap-4 items-center">
                    <div className="flex items-center gap-2">
                        <Filter className="h-5 w-5 text-gray-500" />
                        <span className="text-sm font-medium text-gray-700">Filters:</span>
                    </div>

                    {/* Type Filter */}
                    <select
                        value={filterType}
                        onChange={(e) => setFilterType(e.target.value)}
                        className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    >
                        {RECOMMENDATION_TYPES.map(type => (
                            <option key={type.value} value={type.value}>{type.label}</option>
                        ))}
                    </select>

                    {/* Priority Filter */}
                    <select
                        value={filterPriority}
                        onChange={(e) => setFilterPriority(e.target.value)}
                        className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    >
                        {PRIORITY_LEVELS.map(priority => (
                            <option key={priority.value} value={priority.value}>{priority.label}</option>
                        ))}
                    </select>

                    {/* Status Filter */}
                    <select
                        value={filterStatus}
                        onChange={(e) => setFilterStatus(e.target.value)}
                        className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    >
                        {STATUS_FILTERS.map(status => (
                            <option key={status.value} value={status.value}>{status.label}</option>
                        ))}
                    </select>

                    {/* Sort By */}
                    <div className="ml-auto flex items-center gap-2">
                        <span className="text-sm font-medium text-gray-700">Sort by:</span>
                        <select
                            value={sortBy}
                            onChange={(e) => setSortBy(e.target.value)}
                            className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        >
                            <option value="date">Date</option>
                            <option value="relevance">Relevance</option>
                            <option value="priority">Priority</option>
                        </select>
                    </div>
                </div>
            </div>

            {/* Recommendations List */}
            {loading ? (
                <div className="flex justify-center items-center py-12">
                    <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
                </div>
            ) : filteredRecommendations.length === 0 ? (
                <div className="bg-white shadow rounded-lg p-12 text-center">
                    <Lightbulb className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                        {recommendations.length === 0 ? 'No recommendations yet' : 'No matching recommendations'}
                    </h3>
                    <p className="text-gray-500 mb-6">
                        {recommendations.length === 0
                            ? 'Generate AI-powered recommendations based on your profile'
                            : 'Try adjusting your filters to see more recommendations'
                        }
                    </p>
                    {recommendations.length === 0 && (
                        <button
                            onClick={handleGenerateRecommendations}
                            disabled={generating}
                            className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 disabled:opacity-50"
                        >
                            {generating ? (
                                <>
                                    <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                                    Generating...
                                </>
                            ) : (
                                <>
                                    <Sparkles className="h-5 w-5 mr-2" />
                                    Generate Recommendations
                                </>
                            )}
                        </button>
                    )}
                </div>
            ) : (
                <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                    <AnimatePresence>
                        {filteredRecommendations.map((recommendation) => {
                            const TypeIcon = getTypeIcon(recommendation.type);
                            const typeColor = getTypeColor(recommendation.type);

                            return (
                                <motion.div
                                    key={recommendation._id}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -20 }}
                                    className="bg-white shadow rounded-lg p-6 hover:shadow-md transition-shadow cursor-pointer"
                                    onClick={() => handleViewDetails(recommendation)}
                                >
                                    {/* Header */}
                                    <div className="flex items-start justify-between mb-3">
                                        <div className="flex items-center gap-3">
                                            <div className={`${typeColor} text-white p-2 rounded-lg`}>
                                                <TypeIcon className="h-5 w-5" />
                                            </div>
                                            <div>
                                                <span className={`inline-block px-2 py-1 text-xs font-medium rounded-full capitalize ${getPriorityColor(recommendation.priority)
                                                    } border`}>
                                                    {recommendation.priority}
                                                </span>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            {recommendation.status === 'new' && (
                                                <span className="inline-block px-2 py-1 bg-blue-100 text-blue-700 text-xs font-medium rounded-full">
                                                    NEW
                                                </span>
                                            )}
                                            {recommendation.status === 'saved' && (
                                                <Bookmark className="h-5 w-5 text-green-500 fill-current" />
                                            )}
                                        </div>
                                    </div>

                                    {/* Title */}
                                    <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2">
                                        {recommendation.title}
                                    </h3>

                                    {/* Description */}
                                    <p className="text-sm text-gray-600 mb-4 line-clamp-3">
                                        {recommendation.description}
                                    </p>

                                    {/* Relevance Score */}
                                    <div className="mb-4">
                                        <div className="flex items-center justify-between mb-1">
                                            <span className="text-xs font-medium text-gray-700">Relevance</span>
                                            <span className="text-xs font-medium text-gray-900">
                                                {recommendation.relevanceScore}%
                                            </span>
                                        </div>
                                        <div className="w-full bg-gray-200 rounded-full h-2">
                                            <div
                                                className="bg-gradient-to-r from-purple-500 to-indigo-500 h-2 rounded-full transition-all"
                                                style={{ width: `${recommendation.relevanceScore}%` }}
                                            />
                                        </div>
                                    </div>

                                    {/* Footer */}
                                    <div className="flex items-center justify-between text-xs text-gray-500">
                                        <span className="flex items-center capitalize">
                                            {recommendation.type.replace('_', ' ')}
                                        </span>
                                        <span className="flex items-center">
                                            <Clock className="h-3 w-3 mr-1" />
                                            {new Date(recommendation.createdAt).toLocaleDateString()}
                                        </span>
                                    </div>

                                    {/* Quick Actions */}
                                    <div className="mt-4 pt-4 border-t border-gray-200 flex gap-2">
                                        {recommendation.status !== 'saved' && (
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleUpdateStatus(recommendation._id, 'saved');
                                                }}
                                                className="flex-1 px-3 py-2 bg-green-50 text-green-700 rounded-md hover:bg-green-100 transition-colors text-sm font-medium flex items-center justify-center"
                                            >
                                                <Bookmark className="h-4 w-4 mr-1" />
                                                Save
                                            </button>
                                        )}
                                        {recommendation.status !== 'dismissed' && (
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleUpdateStatus(recommendation._id, 'dismissed');
                                                }}
                                                className="flex-1 px-3 py-2 bg-gray-50 text-gray-700 rounded-md hover:bg-gray-100 transition-colors text-sm font-medium flex items-center justify-center"
                                            >
                                                <X className="h-4 w-4 mr-1" />
                                                Dismiss
                                            </button>
                                        )}
                                    </div>
                                </motion.div>
                            );
                        })}
                    </AnimatePresence>
                </div>
            )}

            {/* Detail Modal */}
            <AnimatePresence>
                {showDetailModal && selectedRecommendation && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-white/30 backdrop-blur-md flex items-center justify-center z-50 p-4"
                        onClick={() => setShowDetailModal(false)}
                    >
                        <motion.div
                            initial={{ scale: 0.95, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.95, opacity: 0 }}
                            className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div className="p-6">
                                {/* Header */}
                                <div className="flex items-start justify-between mb-4">
                                    <div className="flex items-start gap-4 flex-1">
                                        <div className={`${getTypeColor(selectedRecommendation.type)} text-white p-3 rounded-lg`}>
                                            {(() => {
                                                const TypeIcon = getTypeIcon(selectedRecommendation.type);
                                                return <TypeIcon className="h-6 w-6" />;
                                            })()}
                                        </div>
                                        <div className="flex-1">
                                            <h2 className="text-2xl font-bold text-gray-900 mb-2">
                                                {selectedRecommendation.title}
                                            </h2>
                                            <div className="flex items-center gap-2 flex-wrap">
                                                <span className={`inline-block px-3 py-1 text-sm font-medium rounded-full capitalize ${getPriorityColor(selectedRecommendation.priority)
                                                    } border`}>
                                                    {selectedRecommendation.priority} priority
                                                </span>
                                                <span className="inline-block px-3 py-1 bg-gray-100 text-gray-700 text-sm font-medium rounded-full capitalize">
                                                    {selectedRecommendation.type}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => setShowDetailModal(false)}
                                        className="text-gray-400 hover:text-gray-600"
                                    >
                                        <X className="h-6 w-6" />
                                    </button>
                                </div>

                                {/* Relevance Score */}
                                <div className="mb-6">
                                    <div className="flex items-center justify-between mb-2">
                                        <span className="text-sm font-medium text-gray-700">Relevance Score</span>
                                        <span className="text-lg font-bold text-gray-900">
                                            {selectedRecommendation.relevanceScore}%
                                        </span>
                                    </div>
                                    <div className="w-full bg-gray-200 rounded-full h-3">
                                        <div
                                            className="bg-gradient-to-r from-purple-500 to-indigo-500 h-3 rounded-full transition-all"
                                            style={{ width: `${selectedRecommendation.relevanceScore}%` }}
                                        />
                                    </div>
                                </div>

                                {/* Description */}
                                <div className="mb-6">
                                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Description</h3>
                                    <p className="text-gray-700 leading-relaxed">
                                        {selectedRecommendation.description}
                                    </p>
                                </div>

                                {/* Reason */}
                                <div className="mb-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
                                    <h3 className="text-lg font-semibold text-gray-900 mb-2 flex items-center">
                                        <AlertCircle className="h-5 w-5 mr-2 text-blue-600" />
                                        Why this is recommended
                                    </h3>
                                    <p className="text-gray-700 leading-relaxed">
                                        {selectedRecommendation.reason}
                                    </p>
                                </div>

                                {/* Metadata */}
                                {selectedRecommendation.metadata && Object.keys(selectedRecommendation.metadata).length > 0 && (
                                    <div className="mb-6">
                                        <h3 className="text-lg font-semibold text-gray-900 mb-3">Details</h3>
                                        <div className="grid grid-cols-2 gap-4">
                                            {selectedRecommendation.metadata.provider && (
                                                <div>
                                                    <p className="text-sm text-gray-500">Provider</p>
                                                    <p className="text-base font-medium text-gray-900">
                                                        {selectedRecommendation.metadata.provider}
                                                    </p>
                                                </div>
                                            )}
                                            {selectedRecommendation.metadata.duration && (
                                                <div>
                                                    <p className="text-sm text-gray-500">Duration</p>
                                                    <p className="text-base font-medium text-gray-900">
                                                        {selectedRecommendation.metadata.duration}
                                                    </p>
                                                </div>
                                            )}
                                            {selectedRecommendation.metadata.cost && (
                                                <div>
                                                    <p className="text-sm text-gray-500">Cost</p>
                                                    <p className="text-base font-medium text-gray-900">
                                                        {selectedRecommendation.metadata.cost}
                                                    </p>
                                                </div>
                                            )}
                                            {selectedRecommendation.metadata.category && (
                                                <div>
                                                    <p className="text-sm text-gray-500">Category</p>
                                                    <p className="text-base font-medium text-gray-900">
                                                        {selectedRecommendation.metadata.category}
                                                    </p>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                )}

                                {/* Actions */}
                                <div className="flex gap-3 pt-4 border-t border-gray-200">
                                    {selectedRecommendation.metadata?.url && (
                                        <a
                                            href={selectedRecommendation.metadata.url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="flex-1 px-4 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium flex items-center justify-center"
                                        >
                                            <ExternalLink className="h-5 w-5 mr-2" />
                                            Visit Resource
                                        </a>
                                    )}
                                    {selectedRecommendation.status !== 'saved' && (
                                        <button
                                            onClick={() => {
                                                handleUpdateStatus(selectedRecommendation._id, 'saved');
                                                setShowDetailModal(false);
                                            }}
                                            className="flex-1 px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium flex items-center justify-center"
                                        >
                                            <Bookmark className="h-5 w-5 mr-2" />
                                            Save
                                        </button>
                                    )}
                                    {selectedRecommendation.status !== 'dismissed' && (
                                        <button
                                            onClick={() => {
                                                handleUpdateStatus(selectedRecommendation._id, 'dismissed');
                                                setShowDetailModal(false);
                                            }}
                                            className="px-4 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors font-medium flex items-center justify-center"
                                        >
                                            <X className="h-5 w-5 mr-2" />
                                            Dismiss
                                        </button>
                                    )}
                                </div>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}

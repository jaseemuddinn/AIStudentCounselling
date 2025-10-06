'use client';

import { useSession } from 'next-auth/react';
import { useEffect, useState } from 'react';
import { User, Mail, Calendar, MapPin, GraduationCap, Briefcase, Target, Edit, Loader2, Plus, X, Trash2, CheckCircle } from 'lucide-react';
import Link from 'next/link';

export default function ProfilePage() {
    const { data: session } = useSession();
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [showAddGoalModal, setShowAddGoalModal] = useState(false);
    const [showEditGoalModal, setShowEditGoalModal] = useState(false);
    const [selectedGoal, setSelectedGoal] = useState(null);
    const [savingGoal, setSavingGoal] = useState(false);
    const [newGoal, setNewGoal] = useState({
        title: '',
        description: '',
        category: '',
        targetDate: '',
    });
    const [editGoal, setEditGoal] = useState({
        title: '',
        description: '',
        category: '',
        targetDate: '',
        status: '',
    });

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const response = await fetch('/api/profile');
                if (response.ok) {
                    const data = await response.json();
                    setProfile(data);
                }
            } catch (error) {
                console.error('Error fetching profile:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchProfile();
    }, []);

    // Prevent body scroll when modal is open
    useEffect(() => {
        if (showAddGoalModal || showEditGoalModal) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }

        // Cleanup on unmount
        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [showAddGoalModal, showEditGoalModal]);

    const handleAddGoal = async (e) => {
        e.preventDefault();
        if (!newGoal.title || !newGoal.category) return;

        setSavingGoal(true);
        try {
            const response = await fetch('/api/goals', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    title: newGoal.title,
                    description: newGoal.description,
                    category: newGoal.category,
                    targetDate: newGoal.targetDate || null,
                    status: 'not-started',
                    progressPercentage: 0,
                }),
            });

            if (response.ok) {
                // Refresh profile data
                const profileResponse = await fetch('/api/profile');
                if (profileResponse.ok) {
                    const data = await profileResponse.json();
                    setProfile(data);
                }

                // Reset form and close modal
                setNewGoal({ title: '', description: '', category: '', targetDate: '' });
                setShowAddGoalModal(false);
            }
        } catch (error) {
            console.error('Error adding goal:', error);
            alert('Failed to add goal. Please try again.');
        } finally {
            setSavingGoal(false);
        }
    };

    const handleEditGoalClick = (goal) => {
        setSelectedGoal(goal);
        setEditGoal({
            title: goal.title,
            description: goal.description || '',
            category: goal.category,
            targetDate: goal.targetDate ? new Date(goal.targetDate).toISOString().split('T')[0] : '',
            status: goal.status,
        });
        setShowEditGoalModal(true);
    };

    const handleUpdateGoal = async (e) => {
        e.preventDefault();
        if (!editGoal.title || !editGoal.category) return;

        setSavingGoal(true);
        try {
            const response = await fetch(`/api/goals/${selectedGoal.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    title: editGoal.title,
                    description: editGoal.description,
                    category: editGoal.category,
                    targetDate: editGoal.targetDate || null,
                    status: editGoal.status,
                }),
            });

            if (response.ok) {
                // Refresh profile data
                const profileResponse = await fetch('/api/profile');
                if (profileResponse.ok) {
                    const data = await profileResponse.json();
                    setProfile(data);
                }

                setShowEditGoalModal(false);
                setSelectedGoal(null);
            }
        } catch (error) {
            console.error('Error updating goal:', error);
            alert('Failed to update goal. Please try again.');
        } finally {
            setSavingGoal(false);
        }
    };

    const handleDeleteGoal = async () => {
        if (!confirm('Are you sure you want to delete this goal?')) return;

        setSavingGoal(true);
        try {
            const response = await fetch(`/api/goals/${selectedGoal.id}`, {
                method: 'DELETE',
            });

            if (response.ok) {
                // Refresh profile data
                const profileResponse = await fetch('/api/profile');
                if (profileResponse.ok) {
                    const data = await profileResponse.json();
                    setProfile(data);
                }

                setShowEditGoalModal(false);
                setSelectedGoal(null);
            }
        } catch (error) {
            console.error('Error deleting goal:', error);
            alert('Failed to delete goal. Please try again.');
        } finally {
            setSavingGoal(false);
        }
    };

    const handleMarkAsCompleted = async () => {
        setSavingGoal(true);
        try {
            const response = await fetch(`/api/goals/${selectedGoal.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    status: 'completed',
                    progressPercentage: 100,
                }),
            });

            if (response.ok) {
                // Refresh profile data
                const profileResponse = await fetch('/api/profile');
                if (profileResponse.ok) {
                    const data = await profileResponse.json();
                    setProfile(data);
                }

                setShowEditGoalModal(false);
                setSelectedGoal(null);
            }
        } catch (error) {
            console.error('Error marking goal as completed:', error);
            alert('Failed to update goal. Please try again.');
        } finally {
            setSavingGoal(false);
        }
    }; if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
            </div>
        );
    }

    return (
        <div className="py-6 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
            {/* Header */}
            <div className="mb-8 flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">My Profile</h1>
                    <p className="mt-2 text-gray-600">
                        View and manage your personal information
                    </p>
                </div>
                <Link
                    href="/profile/edit"
                    className="inline-flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                >
                    <Edit className="h-5 w-5 mr-2" />
                    Edit Profile
                </Link>
            </div>

            {/* Profile Card */}
            <div className="bg-white shadow rounded-lg overflow-hidden mb-6">
                {/* Header Section */}
                <div className="bg-gradient-to-r from-indigo-500 to-purple-600 h-32"></div>
                <div className="px-6 pb-6">
                    <div className="flex items-end -mt-16 mb-4">
                        <div className="bg-white rounded-full p-2 shadow-lg">
                            <div className="bg-indigo-100 rounded-full p-4">
                                <User className="h-16 w-16 text-indigo-600" />
                            </div>
                        </div>
                    </div>
                    <div>
                        <h2 className="text-2xl font-bold text-gray-900">{session?.user?.name}</h2>
                        <p className="text-gray-600 flex items-center mt-1">
                            <Mail className="h-4 w-4 mr-2" />
                            {session?.user?.email}
                        </p>
                    </div>
                </div>
            </div>

            {profile ? (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Personal Information */}
                    {profile.personal && (
                        <div className="bg-white shadow rounded-lg p-6">
                            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                                <User className="h-5 w-5 mr-2 text-indigo-600" />
                                Personal Information
                            </h3>
                            <div className="space-y-3">
                                {profile.personal.dateOfBirth && (
                                    <div>
                                        <p className="text-sm text-gray-500">Date of Birth</p>
                                        <p className="text-base text-gray-900">
                                            {new Date(profile.personal.dateOfBirth).toLocaleDateString()}
                                        </p>
                                    </div>
                                )}
                                {profile.personal.gender && (
                                    <div>
                                        <p className="text-sm text-gray-500">Gender</p>
                                        <p className="text-base text-gray-900 capitalize">
                                            {profile.personal.gender.replace('_', ' ')}
                                        </p>
                                    </div>
                                )}
                                {profile.personal.phone && (
                                    <div>
                                        <p className="text-sm text-gray-500">Phone</p>
                                        <p className="text-base text-gray-900">{profile.personal.phone}</p>
                                    </div>
                                )}
                                {profile.personal.location && (
                                    <div>
                                        <p className="text-sm text-gray-500 flex items-center">
                                            <MapPin className="h-4 w-4 mr-1" />
                                            Location
                                        </p>
                                        <p className="text-base text-gray-900">
                                            {profile.personal.location.city}, {profile.personal.location.country}
                                        </p>
                                    </div>
                                )}
                                {profile.personal.preferredLanguage && (
                                    <div>
                                        <p className="text-sm text-gray-500">Preferred Language</p>
                                        <p className="text-base text-gray-900 capitalize">
                                            {profile.personal.preferredLanguage}
                                        </p>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Academic Information */}
                    {profile.academic && (
                        <div className="bg-white shadow rounded-lg p-6">
                            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                                <GraduationCap className="h-5 w-5 mr-2 text-green-600" />
                                Academic Information
                            </h3>
                            <div className="space-y-3">
                                {profile.academic.currentEducationLevel && (
                                    <div>
                                        <p className="text-sm text-gray-500">Education Level</p>
                                        <p className="text-base text-gray-900 capitalize">
                                            {profile.academic.currentEducationLevel.replace('_', ' ')}
                                        </p>
                                    </div>
                                )}
                                {profile.academic.institution && (
                                    <div>
                                        <p className="text-sm text-gray-500">Institution</p>
                                        <p className="text-base text-gray-900">{profile.academic.institution}</p>
                                    </div>
                                )}
                                {profile.academic.fieldOfStudy && (
                                    <div>
                                        <p className="text-sm text-gray-500">Field of Study</p>
                                        <p className="text-base text-gray-900">{profile.academic.fieldOfStudy}</p>
                                    </div>
                                )}
                                {profile.academic.yearOfStudy && (
                                    <div>
                                        <p className="text-sm text-gray-500">Year of Study</p>
                                        <p className="text-base text-gray-900">{profile.academic.yearOfStudy}</p>
                                    </div>
                                )}
                                {profile.academic.gpa && (
                                    <div>
                                        <p className="text-sm text-gray-500">GPA</p>
                                        <p className="text-base text-gray-900">{profile.academic.gpa}</p>
                                    </div>
                                )}
                                {profile.academic.subjects && profile.academic.subjects.length > 0 && (
                                    <div>
                                        <p className="text-sm text-gray-500 mb-2">Subjects</p>
                                        <div className="flex flex-wrap gap-2">
                                            {profile.academic.subjects.map((subject, index) => (
                                                <span
                                                    key={index}
                                                    className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm"
                                                >
                                                    {subject}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                )}
                                {profile.academic.learningStyle && (
                                    <div>
                                        <p className="text-sm text-gray-500">Learning Style</p>
                                        <p className="text-base text-gray-900 capitalize">
                                            {profile.academic.learningStyle.replace('_', ' ')}
                                        </p>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Career Information */}
                    {profile.career && (
                        <div className="bg-white shadow rounded-lg p-6">
                            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                                <Briefcase className="h-5 w-5 mr-2 text-purple-600" />
                                Career Information
                            </h3>
                            <div className="space-y-3">
                                {profile.career.careerStage && (
                                    <div>
                                        <p className="text-sm text-gray-500">Career Stage</p>
                                        <p className="text-base text-gray-900 capitalize">
                                            {profile.career.careerStage.replace('_', ' ')}
                                        </p>
                                    </div>
                                )}
                                {profile.career.careerInterests && profile.career.careerInterests.length > 0 && (
                                    <div>
                                        <p className="text-sm text-gray-500 mb-2">Career Interests</p>
                                        <div className="flex flex-wrap gap-2">
                                            {profile.career.careerInterests.map((interest, index) => (
                                                <span
                                                    key={index}
                                                    className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm"
                                                >
                                                    {interest}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                )}
                                {profile.career.skills && profile.career.skills.length > 0 && (
                                    <div>
                                        <p className="text-sm text-gray-500 mb-2">Skills</p>
                                        <div className="flex flex-wrap gap-2">
                                            {profile.career.skills.map((skill, index) => (
                                                <span
                                                    key={index}
                                                    className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm"
                                                >
                                                    {skill}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                )}
                                {profile.career.industryPreferences && profile.career.industryPreferences.length > 0 && (
                                    <div>
                                        <p className="text-sm text-gray-500 mb-2">Industry Preferences</p>
                                        <div className="flex flex-wrap gap-2">
                                            {profile.career.industryPreferences.map((industry, index) => (
                                                <span
                                                    key={index}
                                                    className="px-3 py-1 bg-orange-100 text-orange-700 rounded-full text-sm"
                                                >
                                                    {industry}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                )}
                                {profile.career.workEnvironmentPreference && (
                                    <div>
                                        <p className="text-sm text-gray-500">Work Environment</p>
                                        <p className="text-base text-gray-900 capitalize">
                                            {profile.career.workEnvironmentPreference}
                                        </p>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Goals */}
                    {profile.goals && profile.goals.length > 0 && (
                        <div className="bg-white shadow rounded-lg p-6">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                                    <Target className="h-5 w-5 mr-2 text-yellow-600" />
                                    Goals ({profile.goals.length})
                                </h3>
                                <button
                                    onClick={() => setShowAddGoalModal(true)}
                                    className="inline-flex items-center px-3 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors text-sm"
                                >
                                    <Plus className="h-4 w-4 mr-1" />
                                    Add Goal
                                </button>
                            </div>
                            <div className="space-y-3">
                                {profile.goals.slice(0, 3).map((goal, index) => (
                                    <div
                                        key={index}
                                        onClick={() => handleEditGoalClick(goal)}
                                        className="border-l-4 border-indigo-500 cursor-pointer hover:bg-gray-50 -ml-2 pl-4 py-2 rounded-r transition-colors"
                                    >
                                        <div className="flex items-start justify-between">
                                            <div className="flex-1">
                                                <p className="font-medium text-gray-900">{goal.title}</p>
                                                {goal.description && (
                                                    <p className="text-sm text-gray-600 mt-1 line-clamp-2">{goal.description}</p>
                                                )}
                                                <div className="flex items-center gap-3 mt-2">
                                                    <span className="text-xs px-2 py-1 bg-indigo-100 text-indigo-700 rounded-full capitalize">
                                                        {goal.category}
                                                    </span>
                                                    {goal.targetDate && (
                                                        <span className="text-xs text-gray-500 flex items-center">
                                                            <Calendar className="h-3 w-3 mr-1" />
                                                            {new Date(goal.targetDate).toLocaleDateString()}
                                                        </span>
                                                    )}
                                                    <span className={`text-xs px-2 py-1 rounded-full capitalize ${goal.status === 'completed' ? 'bg-green-100 text-green-700' :
                                                            goal.status === 'in-progress' ? 'bg-blue-100 text-blue-700' :
                                                                'bg-gray-100 text-gray-700'
                                                        }`}>
                                                        {goal.status.replace('-', ' ')}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                                {profile.goals.length > 3 && (
                                    <Link
                                        href="/goals"
                                        className="text-sm text-indigo-600 hover:text-indigo-700 inline-block mt-2"
                                    >
                                        View all {profile.goals.length} goals →
                                    </Link>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            ) : (
                <div className="bg-white shadow rounded-lg p-12 text-center">
                    <User className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                        Profile Not Complete
                    </h3>
                    <p className="text-gray-600 mb-4">
                        Complete your onboarding to see your full profile information.
                    </p>
                    <Link
                        href="/onboarding"
                        className="inline-flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                    >
                        Complete Onboarding
                    </Link>
                </div>
            )}

            {/* Add Goal Modal */}
            {showAddGoalModal && (
                <div className="fixed inset-0 text-black bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-white border-gray-200 border rounded-2xl shadow-2xl max-w-md w-full p-6 animate-in fade-in zoom-in duration-200">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-xl font-bold text-gray-900 flex items-center">
                                <Target className="h-6 w-6 mr-2 text-indigo-600" />
                                Add New Goal
                            </h3>
                            <button
                                onClick={() => setShowAddGoalModal(false)}
                                className="text-gray-400 hover:text-gray-600"
                            >
                                <X className="h-6 w-6" />
                            </button>
                        </div>

                        <form onSubmit={handleAddGoal} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Goal Title *
                                </label>
                                <input
                                    type="text"
                                    value={newGoal.title}
                                    onChange={(e) => setNewGoal({ ...newGoal, title: e.target.value })}
                                    placeholder="e.g., Complete Machine Learning Course"
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Description (Optional)
                                </label>
                                <textarea
                                    value={newGoal.description}
                                    onChange={(e) => setNewGoal({ ...newGoal, description: e.target.value })}
                                    rows={3}
                                    placeholder="Describe your goal in more detail..."
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Category *
                                </label>
                                <select
                                    value={newGoal.category}
                                    onChange={(e) => setNewGoal({ ...newGoal, category: e.target.value })}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                    required
                                >
                                    <option value="">Select category</option>
                                    <option value="academic">Academic</option>
                                    <option value="career">Career</option>
                                    <option value="skill">Skill Development</option>
                                    <option value="personal">Personal Growth</option>
                                    <option value="other">Other</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Target Date (Optional)
                                </label>
                                <input
                                    type="date"
                                    value={newGoal.targetDate}
                                    onChange={(e) => setNewGoal({ ...newGoal, targetDate: e.target.value })}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                />
                            </div>

                            <div className="flex gap-3 pt-4">
                                <button
                                    type="button"
                                    onClick={() => setShowAddGoalModal(false)}
                                    className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={savingGoal || !newGoal.title || !newGoal.category}
                                    className="flex-1 px-4 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                                >
                                    {savingGoal ? (
                                        <>
                                            <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                                            Adding...
                                        </>
                                    ) : (
                                        <>
                                            <Plus className="h-5 w-5 mr-2" />
                                            Add Goal
                                        </>
                                    )}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Edit Goal Modal */}
            {showEditGoalModal && selectedGoal && (
                <div className="fixed inset-0 text-black bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-white border-gray-200 border rounded-2xl shadow-2xl max-w-md w-full p-6 animate-in fade-in zoom-in duration-200">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-xl font-bold text-gray-900 flex items-center">
                                <Target className="h-6 w-6 mr-2 text-indigo-600" />
                                Edit Goal
                            </h3>
                            <button
                                onClick={() => setShowEditGoalModal(false)}
                                className="text-gray-400 hover:text-gray-600"
                            >
                                <X className="h-6 w-6" />
                            </button>
                        </div>

                        <form onSubmit={handleUpdateGoal} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Goal Title *
                                </label>
                                <input
                                    type="text"
                                    value={editGoal.title}
                                    onChange={(e) => setEditGoal({ ...editGoal, title: e.target.value })}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Description
                                </label>
                                <textarea
                                    value={editGoal.description}
                                    onChange={(e) => setEditGoal({ ...editGoal, description: e.target.value })}
                                    rows={3}
                                    placeholder="Describe your goal in more detail..."
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Category *
                                </label>
                                <select
                                    value={editGoal.category}
                                    onChange={(e) => setEditGoal({ ...editGoal, category: e.target.value })}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                    required
                                >
                                    <option value="academic">Academic</option>
                                    <option value="career">Career</option>
                                    <option value="skill">Skill Development</option>
                                    <option value="personal">Personal Growth</option>
                                    <option value="other">Other</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Target Date
                                </label>
                                <input
                                    type="date"
                                    value={editGoal.targetDate}
                                    onChange={(e) => setEditGoal({ ...editGoal, targetDate: e.target.value })}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Status
                                </label>
                                <select
                                    value={editGoal.status}
                                    onChange={(e) => setEditGoal({ ...editGoal, status: e.target.value })}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                >
                                    <option value="not-started">Not Started</option>
                                    <option value="in-progress">In Progress</option>
                                    <option value="completed">Completed</option>
                                    <option value="abandoned">Abandoned</option>
                                </select>
                            </div>

                            <div className="flex gap-3 pt-4">
                                <button
                                    type="submit"
                                    disabled={savingGoal || !editGoal.title || !editGoal.category}
                                    className="flex-1 px-4 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                                >
                                    {savingGoal ? (
                                        <>
                                            <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                                            Updating...
                                        </>
                                    ) : (
                                        <>
                                            <Edit className="h-5 w-5 mr-2" />
                                            Update
                                        </>
                                    )}
                                </button>
                            </div>

                            <div className="flex gap-3 pt-2 border-t border-gray-200">
                                <button
                                    type="button"
                                    onClick={handleMarkAsCompleted}
                                    disabled={savingGoal || editGoal.status === 'completed'}
                                    className="flex-1 px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center text-sm"
                                >
                                    <CheckCircle className="h-4 w-4 mr-2" />
                                    Mark Complete
                                </button>
                                <button
                                    type="button"
                                    onClick={handleDeleteGoal}
                                    disabled={savingGoal}
                                    className="flex-1 px-4 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center text-sm"
                                >
                                    <Trash2 className="h-4 w-4 mr-2" />
                                    Delete
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}

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
            <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50">
                <Loader2 className="h-12 w-12 animate-spin text-indigo-600" strokeWidth={2.5} />
            </div>
        );
    }

    return (
        <div className="py-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
            {/* Header */}
            <div className="mb-10 flex justify-between items-start">
                <div>
                    <h1 className="text-5xl font-bold bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent tracking-tight">
                        My Profile
                    </h1>
                    <p className="mt-3 text-neutral-600 text-lg font-medium">
                        View and manage your personal information
                    </p>
                </div>
                <Link
                    href="/profile/edit"
                    className="inline-flex items-center px-6 py-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-2xl hover:scale-105 transition-all duration-300 font-bold shadow-2xl hover:shadow-indigo-500/50"
                >
                    <Edit className="h-5 w-5 mr-2" strokeWidth={2.5} />
                    Edit Profile
                </Link>
            </div>

            {/* Profile Card */}
            <div className="backdrop-blur-xl bg-white/80 shadow-2xl rounded-3xl overflow-hidden mb-8 border border-white/20">
                {/* Header Section */}
                <div className="bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 h-40 relative">
                    <div className="absolute inset-0 bg-gradient-to-br from-indigo-600/20 to-purple-600/20"></div>
                </div>
                <div className="px-8 pb-8">
                    <div className="flex items-end -mt-20 mb-6">
                        <div className="bg-white/90 backdrop-blur-sm rounded-full p-3 shadow-2xl border-4 border-white">
                            <div className="bg-gradient-to-br from-indigo-500 to-purple-500 rounded-full p-6">
                                <User className="h-20 w-20 text-white" strokeWidth={2.5} />
                            </div>
                        </div>
                    </div>
                    <div>
                        <h2 className="text-4xl font-bold text-black">{session?.user?.name}</h2>
                        <p className="text-neutral-600 flex items-center mt-2 text-lg font-semibold">
                            <Mail className="h-5 w-5 mr-2" strokeWidth={2.5} />
                            {session?.user?.email}
                        </p>
                    </div>
                </div>
            </div>

            {profile ? (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Personal Information */}
                    {profile.personal && (
                        <div className="backdrop-blur-xl bg-white/80 shadow-2xl rounded-3xl p-8 border border-white/20 hover:-translate-y-1 transition-all duration-300">
                            <h3 className="text-2xl font-bold text-black mb-6 flex items-center">
                                <User className="h-7 w-7 mr-3 text-indigo-600" strokeWidth={2.5} />
                                Personal Information
                            </h3>
                            <div className="space-y-5">
                                {profile.personal.dateOfBirth && (
                                    <div>
                                        <p className="text-sm text-neutral-500 font-bold mb-1">Date of Birth</p>
                                        <p className="text-base text-black font-semibold">
                                            {new Date(profile.personal.dateOfBirth).toLocaleDateString()}
                                        </p>
                                    </div>
                                )}
                                {profile.personal.gender && (
                                    <div>
                                        <p className="text-sm text-neutral-500 font-bold mb-1">Gender</p>
                                        <p className="text-base text-black font-semibold capitalize">
                                            {profile.personal.gender.replace('_', ' ')}
                                        </p>
                                    </div>
                                )}
                                {profile.personal.phone && (
                                    <div>
                                        <p className="text-sm text-neutral-500 font-bold mb-1">Phone</p>
                                        <p className="text-base text-black font-semibold">{profile.personal.phone}</p>
                                    </div>
                                )}
                                {profile.personal.location && (
                                    <div>
                                        <p className="text-sm text-neutral-500 flex items-center font-bold mb-1">
                                            <MapPin className="h-4 w-4 mr-1" strokeWidth={2.5} />
                                            Location
                                        </p>
                                        <p className="text-base text-black font-semibold">
                                            {profile.personal.location.city}, {profile.personal.location.country}
                                        </p>
                                    </div>
                                )}
                                {profile.personal.preferredLanguage && (
                                    <div>
                                        <p className="text-sm text-neutral-500 font-bold mb-1">Preferred Language</p>
                                        <p className="text-base text-black font-semibold capitalize">
                                            {profile.personal.preferredLanguage}
                                        </p>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Academic Information */}
                    {profile.academic && (
                        <div className="backdrop-blur-xl bg-white/80 shadow-2xl rounded-3xl p-8 border border-white/20 hover:-translate-y-1 transition-all duration-300">
                            <h3 className="text-2xl font-bold text-black mb-6 flex items-center">
                                <GraduationCap className="h-7 w-7 mr-3 text-green-600" strokeWidth={2.5} />
                                Academic Information
                            </h3>
                            <div className="space-y-5">
                                {profile.academic.currentEducationLevel && (
                                    <div>
                                        <p className="text-sm text-neutral-500 font-bold mb-1">Education Level</p>
                                        <p className="text-base text-black font-semibold capitalize">
                                            {profile.academic.currentEducationLevel.replace('_', ' ')}
                                        </p>
                                    </div>
                                )}
                                {profile.academic.institution && (
                                    <div>
                                        <p className="text-sm text-neutral-500 font-bold mb-1">Institution</p>
                                        <p className="text-base text-black font-semibold">{profile.academic.institution}</p>
                                    </div>
                                )}
                                {profile.academic.fieldOfStudy && (
                                    <div>
                                        <p className="text-sm text-neutral-500 font-bold mb-1">Field of Study</p>
                                        <p className="text-base text-black font-semibold">{profile.academic.fieldOfStudy}</p>
                                    </div>
                                )}
                                {profile.academic.yearOfStudy && (
                                    <div>
                                        <p className="text-sm text-neutral-500 font-bold mb-1">Year of Study</p>
                                        <p className="text-base text-black font-semibold">{profile.academic.yearOfStudy}</p>
                                    </div>
                                )}
                                {profile.academic.gpa && (
                                    <div>
                                        <p className="text-sm text-neutral-500 font-bold mb-1">GPA</p>
                                        <p className="text-base text-black font-semibold">{profile.academic.gpa}</p>
                                    </div>
                                )}
                                {profile.academic.subjects && profile.academic.subjects.length > 0 && (
                                    <div>
                                        <p className="text-sm text-neutral-500 font-bold mb-3">Subjects</p>
                                        <div className="flex flex-wrap gap-2">
                                            {profile.academic.subjects.map((subject, index) => (
                                                <span
                                                    key={index}
                                                    className="px-4 py-2 bg-gradient-to-br from-green-500 to-emerald-500 text-white rounded-2xl text-sm font-bold shadow-lg"
                                                >
                                                    {subject}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                )}
                                {profile.academic.learningStyle && (
                                    <div>
                                        <p className="text-sm text-neutral-500 font-bold mb-1">Learning Style</p>
                                        <p className="text-base text-black font-semibold capitalize">
                                            {profile.academic.learningStyle.replace('_', ' ')}
                                        </p>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Career Information */}
                    {profile.career && (
                        <div className="backdrop-blur-xl bg-white/80 shadow-2xl rounded-3xl p-8 border border-white/20 hover:-translate-y-1 transition-all duration-300">
                            <h3 className="text-2xl font-bold text-black mb-6 flex items-center">
                                <Briefcase className="h-7 w-7 mr-3 text-purple-600" strokeWidth={2.5} />
                                Career Information
                            </h3>
                            <div className="space-y-5">
                                {profile.career.careerStage && (
                                    <div>
                                        <p className="text-sm text-neutral-500 font-bold mb-1">Career Stage</p>
                                        <p className="text-base text-black font-semibold capitalize">
                                            {profile.career.careerStage.replace('_', ' ')}
                                        </p>
                                    </div>
                                )}
                                {profile.career.careerInterests && profile.career.careerInterests.length > 0 && (
                                    <div>
                                        <p className="text-sm text-neutral-500 font-bold mb-3">Career Interests</p>
                                        <div className="flex flex-wrap gap-2">
                                            {profile.career.careerInterests.map((interest, index) => (
                                                <span
                                                    key={index}
                                                    className="px-4 py-2 bg-gradient-to-br from-purple-500 to-pink-500 text-white rounded-2xl text-sm font-bold shadow-lg"
                                                >
                                                    {interest}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                )}
                                {profile.career.skills && profile.career.skills.length > 0 && (
                                    <div>
                                        <p className="text-sm text-neutral-500 font-bold mb-3">Skills</p>
                                        <div className="flex flex-wrap gap-2">
                                            {profile.career.skills.map((skill, index) => (
                                                <span
                                                    key={index}
                                                    className="px-4 py-2 bg-gradient-to-br from-blue-500 to-cyan-500 text-white rounded-2xl text-sm font-bold shadow-lg"
                                                >
                                                    {skill}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                )}
                                {profile.career.industryPreferences && profile.career.industryPreferences.length > 0 && (
                                    <div>
                                        <p className="text-sm text-neutral-500 font-bold mb-3">Industry Preferences</p>
                                        <div className="flex flex-wrap gap-2">
                                            {profile.career.industryPreferences.map((industry, index) => (
                                                <span
                                                    key={index}
                                                    className="px-4 py-2 bg-gradient-to-br from-orange-500 to-yellow-500 text-white rounded-2xl text-sm font-bold shadow-lg"
                                                >
                                                    {industry}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                )}
                                {profile.career.workEnvironmentPreference && (
                                    <div>
                                        <p className="text-sm text-neutral-500 font-bold mb-1">Work Environment</p>
                                        <p className="text-base text-black font-semibold capitalize">
                                            {profile.career.workEnvironmentPreference}
                                        </p>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Goals */}
                    {profile.goals && profile.goals.length > 0 && (
                        <div className="backdrop-blur-xl bg-white/80 shadow-2xl rounded-3xl p-8 border border-white/20 hover:-translate-y-1 transition-all duration-300">
                            <div className="flex items-center justify-between mb-6">
                                <h3 className="text-2xl font-bold text-black flex items-center">
                                    <Target className="h-7 w-7 mr-3 text-yellow-600" strokeWidth={2.5} />
                                    Goals ({profile.goals.length})
                                </h3>
                                <button
                                    onClick={() => setShowAddGoalModal(true)}
                                    className="inline-flex items-center px-4 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-2xl hover:scale-105 transition-all duration-300 text-sm font-bold shadow-xl"
                                >
                                    <Plus className="h-5 w-5 mr-2" strokeWidth={2.5} />
                                    Add Goal
                                </button>
                            </div>
                            <div className="space-y-4">
                                {profile.goals.slice(0, 3).map((goal, index) => (
                                    <div
                                        key={index}
                                        onClick={() => handleEditGoalClick(goal)}
                                        className="border-l-4 border-indigo-500 cursor-pointer hover:bg-white/60 bg-white/40 backdrop-blur-sm -ml-2 pl-6 py-4 rounded-r-2xl transition-all duration-300 hover:scale-[1.02] shadow-lg"
                                    >
                                        <div className="flex items-start justify-between">
                                            <div className="flex-1">
                                                <p className="font-bold text-black text-lg">{goal.title}</p>
                                                {goal.description && (
                                                    <p className="text-sm text-neutral-600 mt-2 line-clamp-2 font-medium">{goal.description}</p>
                                                )}
                                                <div className="flex items-center gap-3 mt-3 flex-wrap">
                                                    <span className="text-xs px-3 py-1.5 bg-gradient-to-r from-indigo-500 to-purple-500 text-white rounded-full capitalize font-bold shadow-md">
                                                        {goal.category}
                                                    </span>
                                                    {goal.targetDate && (
                                                        <span className="text-xs text-neutral-600 flex items-center font-semibold">
                                                            <Calendar className="h-4 w-4 mr-1" strokeWidth={2.5} />
                                                            {new Date(goal.targetDate).toLocaleDateString()}
                                                        </span>
                                                    )}
                                                    <span className={`text-xs px-3 py-1.5 rounded-full capitalize font-bold shadow-md ${goal.status === 'completed' ? 'bg-gradient-to-r from-green-500 to-emerald-500 text-white' :
                                                        goal.status === 'in-progress' ? 'bg-gradient-to-r from-blue-500 to-cyan-500 text-white' :
                                                            'bg-neutral-200 text-neutral-700'
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
                                        className="text-sm text-indigo-600 hover:text-indigo-700 inline-block mt-3 font-bold hover:scale-105 transition-transform"
                                    >
                                        View all {profile.goals.length} goals →
                                    </Link>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            ) : (
                <div className="backdrop-blur-xl bg-white/80 shadow-2xl rounded-3xl p-16 text-center border border-white/20">
                    <User className="h-20 w-20 text-neutral-300 mx-auto mb-6" strokeWidth={1.5} />
                    <h3 className="text-2xl font-bold text-black mb-3">
                        Profile Not Complete
                    </h3>
                    <p className="text-neutral-600 mb-6 text-lg font-medium">
                        Complete your onboarding to see your full profile information.
                    </p>
                    <Link
                        href="/onboarding"
                        className="inline-flex items-center px-6 py-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-2xl hover:scale-105 transition-all duration-300 font-bold shadow-2xl hover:shadow-indigo-500/50"
                    >
                        Complete Onboarding
                    </Link>
                </div>
            )}

            {/* Add Goal Modal */}
            {showAddGoalModal && (
                <div className="fixed inset-0 text-black bg-black/60 backdrop-blur-md flex items-center justify-center z-50 p-4">
                    <div className="backdrop-blur-2xl bg-white/95 border-2 border-white/30 rounded-3xl shadow-2xl max-w-md w-full p-8 animate-in fade-in zoom-in duration-200">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-2xl font-bold text-black flex items-center">
                                <Target className="h-7 w-7 mr-3 text-indigo-600" strokeWidth={2.5} />
                                Add New Goal
                            </h3>
                            <button
                                onClick={() => setShowAddGoalModal(false)}
                                className="text-neutral-400 hover:text-neutral-600 hover:scale-110 transition-all"
                            >
                                <X className="h-7 w-7" strokeWidth={2.5} />
                            </button>
                        </div>

                        <form onSubmit={handleAddGoal} className="space-y-5">
                            <div>
                                <label className="block text-sm font-bold text-black mb-2">
                                    Goal Title *
                                </label>
                                <input
                                    type="text"
                                    value={newGoal.title}
                                    onChange={(e) => setNewGoal({ ...newGoal, title: e.target.value })}
                                    placeholder="e.g., Complete Machine Learning Course"
                                    className="w-full px-5 py-4 border-2 border-neutral-300 rounded-2xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 font-medium shadow-sm transition-all"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-black mb-2">
                                    Description (Optional)
                                </label>
                                <textarea
                                    value={newGoal.description}
                                    onChange={(e) => setNewGoal({ ...newGoal, description: e.target.value })}
                                    rows={3}
                                    placeholder="Describe your goal in more detail..."
                                    className="w-full px-5 py-4 border-2 border-neutral-300 rounded-2xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 font-medium shadow-sm transition-all resize-none"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-black mb-2">
                                    Category *
                                </label>
                                <select
                                    value={newGoal.category}
                                    onChange={(e) => setNewGoal({ ...newGoal, category: e.target.value })}
                                    className="w-full px-5 py-4 border-2 border-neutral-300 rounded-2xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 font-medium shadow-sm transition-all"
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
                                <label className="block text-sm font-bold text-black mb-2">
                                    Target Date (Optional)
                                </label>
                                <input
                                    type="date"
                                    value={newGoal.targetDate}
                                    onChange={(e) => setNewGoal({ ...newGoal, targetDate: e.target.value })}
                                    className="w-full px-5 py-4 border-2 border-neutral-300 rounded-2xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 font-medium shadow-sm transition-all"
                                />
                            </div>

                            <div className="flex gap-4 pt-6">
                                <button
                                    type="button"
                                    onClick={() => setShowAddGoalModal(false)}
                                    className="flex-1 px-5 py-4 border-2 border-neutral-300 text-neutral-700 rounded-2xl hover:bg-neutral-50 hover:scale-105 transition-all font-bold"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={savingGoal || !newGoal.title || !newGoal.category}
                                    className="flex-1 px-5 py-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-2xl hover:scale-105 transition-all font-bold disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center shadow-xl"
                                >
                                    {savingGoal ? (
                                        <>
                                            <Loader2 className="h-5 w-5 mr-2 animate-spin" strokeWidth={2.5} />
                                            Adding...
                                        </>
                                    ) : (
                                        <>
                                            <Plus className="h-5 w-5 mr-2" strokeWidth={2.5} />
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
                <div className="fixed inset-0 text-black bg-black/60 backdrop-blur-md flex items-center justify-center z-50 p-4">
                    <div className="backdrop-blur-2xl bg-white/95 border-2 border-white/30 rounded-3xl shadow-2xl max-w-md w-full p-8 animate-in fade-in zoom-in duration-200">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-2xl font-bold text-black flex items-center">
                                <Target className="h-7 w-7 mr-3 text-indigo-600" strokeWidth={2.5} />
                                Edit Goal
                            </h3>
                            <button
                                onClick={() => setShowEditGoalModal(false)}
                                className="text-neutral-400 hover:text-neutral-600 hover:scale-110 transition-all"
                            >
                                <X className="h-7 w-7" strokeWidth={2.5} />
                            </button>
                        </div>

                        <form onSubmit={handleUpdateGoal} className="space-y-5">
                            <div>
                                <label className="block text-sm font-bold text-black mb-2">
                                    Goal Title *
                                </label>
                                <input
                                    type="text"
                                    value={editGoal.title}
                                    onChange={(e) => setEditGoal({ ...editGoal, title: e.target.value })}
                                    className="w-full px-5 py-4 border-2 border-neutral-300 rounded-2xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 font-medium shadow-sm transition-all"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-black mb-2">
                                    Description
                                </label>
                                <textarea
                                    value={editGoal.description}
                                    onChange={(e) => setEditGoal({ ...editGoal, description: e.target.value })}
                                    rows={3}
                                    placeholder="Describe your goal in more detail..."
                                    className="w-full px-5 py-4 border-2 border-neutral-300 rounded-2xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 font-medium shadow-sm transition-all resize-none"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-black mb-2">
                                    Category *
                                </label>
                                <select
                                    value={editGoal.category}
                                    onChange={(e) => setEditGoal({ ...editGoal, category: e.target.value })}
                                    className="w-full px-5 py-4 border-2 border-neutral-300 rounded-2xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 font-medium shadow-sm transition-all"
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
                                <label className="block text-sm font-bold text-black mb-2">
                                    Target Date
                                </label>
                                <input
                                    type="date"
                                    value={editGoal.targetDate}
                                    onChange={(e) => setEditGoal({ ...editGoal, targetDate: e.target.value })}
                                    className="w-full px-5 py-4 border-2 border-neutral-300 rounded-2xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 font-medium shadow-sm transition-all"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-black mb-2">
                                    Status
                                </label>
                                <select
                                    value={editGoal.status}
                                    onChange={(e) => setEditGoal({ ...editGoal, status: e.target.value })}
                                    className="w-full px-5 py-4 border-2 border-neutral-300 rounded-2xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 font-medium shadow-sm transition-all"
                                >
                                    <option value="not-started">Not Started</option>
                                    <option value="in-progress">In Progress</option>
                                    <option value="completed">Completed</option>
                                    <option value="abandoned">Abandoned</option>
                                </select>
                            </div>

                            <div className="flex gap-4 pt-6">
                                <button
                                    type="submit"
                                    disabled={savingGoal || !editGoal.title || !editGoal.category}
                                    className="flex-1 px-5 py-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-2xl hover:scale-105 transition-all font-bold disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center shadow-xl"
                                >
                                    {savingGoal ? (
                                        <>
                                            <Loader2 className="h-5 w-5 mr-2 animate-spin" strokeWidth={2.5} />
                                            Updating...
                                        </>
                                    ) : (
                                        <>
                                            <Edit className="h-5 w-5 mr-2" strokeWidth={2.5} />
                                            Update
                                        </>
                                    )}
                                </button>
                            </div>

                            <div className="flex gap-4 pt-5 border-t-2 border-neutral-200">
                                <button
                                    type="button"
                                    onClick={handleMarkAsCompleted}
                                    disabled={savingGoal || editGoal.status === 'completed'}
                                    className="flex-1 px-4 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-2xl hover:scale-105 transition-all font-bold disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center text-sm shadow-xl"
                                >
                                    <CheckCircle className="h-5 w-5 mr-2" strokeWidth={2.5} />
                                    Mark Complete
                                </button>
                                <button
                                    type="button"
                                    onClick={handleDeleteGoal}
                                    disabled={savingGoal}
                                    className="flex-1 px-4 py-3 bg-gradient-to-r from-red-600 to-rose-600 text-white rounded-2xl hover:scale-105 transition-all font-bold disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center text-sm shadow-xl"
                                >
                                    <Trash2 className="h-5 w-5 mr-2" strokeWidth={2.5} />
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

'use client';

import { useSession } from 'next-auth/react';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { User, Save, Loader2, ArrowLeft, Calendar, Plus, X } from 'lucide-react';
import Link from 'next/link';

// Validation schemas
const personalInfoSchema = z.object({
    dateOfBirth: z.string().min(1, 'Date of birth is required'),
    gender: z.enum(['male', 'female', 'other', 'prefer_not_to_say']),
    phone: z.string().optional(),
    city: z.string().min(2, 'City is required'),
    country: z.string().min(2, 'Country is required'),
    preferredLanguage: z.string().min(1, 'Preferred language is required'),
});

export default function EditProfilePage() {
    const { data: session } = useSession();
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [activeTab, setActiveTab] = useState('personal');
    const [message, setMessage] = useState({ type: '', text: '' });

    // Personal Info Form
    const {
        register: registerPersonal,
        handleSubmit: handleSubmitPersonal,
        setValue: setValuePersonal,
        formState: { errors: errorsPersonal },
    } = useForm({
        resolver: zodResolver(personalInfoSchema),
    });

    // Academic Info State
    const [academicData, setAcademicData] = useState({
        currentEducationLevel: '',
        institution: '',
        fieldOfStudy: '',
        yearOfStudy: '',
        gpa: '',
        subjects: [],
        learningStyle: '',
        achievements: '',
    });
    const [currentSubject, setCurrentSubject] = useState('');

    // Career Info State
    const [careerData, setCareerData] = useState({
        careerStage: '',
        careerInterests: [],
        skills: [],
        industryPreferences: [],
        workEnvironmentPreference: '',
        longTermGoal: '',
    });
    const [currentInterest, setCurrentInterest] = useState('');
    const [currentSkill, setCurrentSkill] = useState('');
    const [currentIndustry, setCurrentIndustry] = useState('');

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const response = await fetch('/api/profile');
                if (response.ok) {
                    const data = await response.json();

                    // Set personal info
                    if (data.personal) {
                        setValuePersonal('dateOfBirth', data.personal.dateOfBirth?.split('T')[0] || '');
                        setValuePersonal('gender', data.personal.gender || '');
                        setValuePersonal('phone', data.personal.phone || '');
                        setValuePersonal('city', data.personal.location?.city || '');
                        setValuePersonal('country', data.personal.location?.country || '');
                        setValuePersonal('preferredLanguage', data.personal.preferredLanguage || '');
                    }

                    // Set academic info
                    if (data.academic) {
                        setAcademicData(data.academic);
                    }

                    // Set career info
                    if (data.career) {
                        setCareerData(data.career);
                    }
                }
            } catch (error) {
                console.error('Error fetching profile:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchProfile();
    }, [setValuePersonal]);

    const onSubmitPersonal = async (data) => {
        setSaving(true);
        setMessage({ type: '', text: '' });

        try {
            const response = await fetch('/api/profile', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    personal: {
                        dateOfBirth: data.dateOfBirth,
                        gender: data.gender,
                        phone: data.phone,
                        location: {
                            city: data.city,
                            country: data.country,
                        },
                        preferredLanguage: data.preferredLanguage,
                    },
                }),
            });

            if (response.ok) {
                setMessage({ type: 'success', text: 'Personal information updated successfully!' });
                setTimeout(() => router.push('/profile'), 2000);
            } else {
                setMessage({ type: 'error', text: 'Failed to update profile. Please try again.' });
            }
        } catch (error) {
            setMessage({ type: 'error', text: 'An error occurred. Please try again.' });
        } finally {
            setSaving(false);
        }
    };

    const saveAcademicInfo = async () => {
        setSaving(true);
        setMessage({ type: '', text: '' });

        try {
            const response = await fetch('/api/profile', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ academic: academicData }),
            });

            if (response.ok) {
                setMessage({ type: 'success', text: 'Academic information updated successfully!' });
                setTimeout(() => router.push('/profile'), 2000);
            } else {
                setMessage({ type: 'error', text: 'Failed to update profile. Please try again.' });
            }
        } catch (error) {
            setMessage({ type: 'error', text: 'An error occurred. Please try again.' });
        } finally {
            setSaving(false);
        }
    };

    const saveCareerInfo = async () => {
        setSaving(true);
        setMessage({ type: '', text: '' });

        try {
            const response = await fetch('/api/profile', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ career: careerData }),
            });

            if (response.ok) {
                setMessage({ type: 'success', text: 'Career information updated successfully!' });
                setTimeout(() => router.push('/profile'), 2000);
            } else {
                setMessage({ type: 'error', text: 'Failed to update profile. Please try again.' });
            }
        } catch (error) {
            setMessage({ type: 'error', text: 'An error occurred. Please try again.' });
        } finally {
            setSaving(false);
        }
    };

    // Helper functions for array fields
    const addSubject = () => {
        if (currentSubject.trim()) {
            setAcademicData(prev => ({
                ...prev,
                subjects: [...prev.subjects, currentSubject.trim()],
            }));
            setCurrentSubject('');
        }
    };

    const removeSubject = (index) => {
        setAcademicData(prev => ({
            ...prev,
            subjects: prev.subjects.filter((_, i) => i !== index),
        }));
    };

    const addCareerInterest = () => {
        if (currentInterest.trim()) {
            setCareerData(prev => ({
                ...prev,
                careerInterests: [...prev.careerInterests, currentInterest.trim()],
            }));
            setCurrentInterest('');
        }
    };

    const removeCareerInterest = (index) => {
        setCareerData(prev => ({
            ...prev,
            careerInterests: prev.careerInterests.filter((_, i) => i !== index),
        }));
    };

    const addSkill = () => {
        if (currentSkill.trim()) {
            setCareerData(prev => ({
                ...prev,
                skills: [...prev.skills, currentSkill.trim()],
            }));
            setCurrentSkill('');
        }
    };

    const removeSkill = (index) => {
        setCareerData(prev => ({
            ...prev,
            skills: prev.skills.filter((_, i) => i !== index),
        }));
    };

    const addIndustry = () => {
        if (currentIndustry.trim()) {
            setCareerData(prev => ({
                ...prev,
                industryPreferences: [...prev.industryPreferences, currentIndustry.trim()],
            }));
            setCurrentIndustry('');
        }
    };

    const removeIndustry = (index) => {
        setCareerData(prev => ({
            ...prev,
            industryPreferences: prev.industryPreferences.filter((_, i) => i !== index),
        }));
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
            </div>
        );
    }

    return (
        <div className="py-6 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto text-black">
            {/* Header */}
            <div className="mb-8">
                <Link
                    href="/profile"
                    className="inline-flex items-center text-indigo-600 hover:text-indigo-700 mb-4"
                >
                    <ArrowLeft className="h-5 w-5 mr-2" />
                    Back to Profile
                </Link>
                <h1 className="text-3xl font-bold text-gray-900">Edit Profile</h1>
                <p className="mt-2 text-gray-600">Update your personal information</p>
            </div>

            {/* Message */}
            {message.text && (
                <div
                    className={`mb-6 p-4 rounded-lg ${message.type === 'success'
                            ? 'bg-green-50 text-green-800 border border-green-200'
                            : 'bg-red-50 text-red-800 border border-red-200'
                        }`}
                >
                    {message.text}
                </div>
            )}

            {/* Tabs */}
            <div className="mb-6 border-b border-gray-200">
                <nav className="-mb-px flex space-x-8">
                    {[
                        { id: 'personal', label: 'Personal Info' },
                        { id: 'academic', label: 'Academic Info' },
                        { id: 'career', label: 'Career Info' },
                    ].map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`${activeTab === tab.id
                                    ? 'border-indigo-500 text-indigo-600'
                                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
                        >
                            {tab.label}
                        </button>
                    ))}
                </nav>
            </div>

            {/* Tab Content */}
            <div className="bg-white shadow rounded-lg p-6">
                {/* Personal Info Tab */}
                {activeTab === 'personal' && (
                    <form onSubmit={handleSubmitPersonal(onSubmitPersonal)} className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Date of Birth *
                                </label>
                                <input
                                    type="date"
                                    {...registerPersonal('dateOfBirth')}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                />
                                {errorsPersonal.dateOfBirth && (
                                    <p className="mt-1 text-sm text-red-600">
                                        {errorsPersonal.dateOfBirth.message}
                                    </p>
                                )}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Gender *
                                </label>
                                <select
                                    {...registerPersonal('gender')}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                >
                                    <option value="">Select gender</option>
                                    <option value="male">Male</option>
                                    <option value="female">Female</option>
                                    <option value="other">Other</option>
                                    <option value="prefer_not_to_say">Prefer not to say</option>
                                </select>
                                {errorsPersonal.gender && (
                                    <p className="mt-1 text-sm text-red-600">
                                        {errorsPersonal.gender.message}
                                    </p>
                                )}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Phone Number
                                </label>
                                <input
                                    type="tel"
                                    {...registerPersonal('phone')}
                                    placeholder="+1 234 567 8900"
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Preferred Language *
                                </label>
                                <select
                                    {...registerPersonal('preferredLanguage')}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                >
                                    <option value="">Select a language</option>
                                    <option value="english">English</option>
                                    <option value="spanish">Spanish</option>
                                    <option value="french">French</option>
                                    <option value="german">German</option>
                                    <option value="mandarin">Mandarin</option>
                                    <option value="hindi">Hindi</option>
                                    <option value="arabic">Arabic</option>
                                    <option value="other">Other</option>
                                </select>
                                {errorsPersonal.preferredLanguage && (
                                    <p className="mt-1 text-sm text-red-600">
                                        {errorsPersonal.preferredLanguage.message}
                                    </p>
                                )}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    City *
                                </label>
                                <input
                                    type="text"
                                    {...registerPersonal('city')}
                                    placeholder="New York"
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                />
                                {errorsPersonal.city && (
                                    <p className="mt-1 text-sm text-red-600">{errorsPersonal.city.message}</p>
                                )}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Country *
                                </label>
                                <input
                                    type="text"
                                    {...registerPersonal('country')}
                                    placeholder="United States"
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                />
                                {errorsPersonal.country && (
                                    <p className="mt-1 text-sm text-red-600">{errorsPersonal.country.message}</p>
                                )}
                            </div>
                        </div>

                        <div className="flex justify-end">
                            <button
                                type="submit"
                                disabled={saving}
                                className="inline-flex items-center px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50"
                            >
                                {saving ? (
                                    <>
                                        <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                                        Saving...
                                    </>
                                ) : (
                                    <>
                                        <Save className="h-5 w-5 mr-2" />
                                        Save Changes
                                    </>
                                )}
                            </button>
                        </div>
                    </form>
                )}

                {/* Academic Info Tab */}
                {activeTab === 'academic' && (
                    <div className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Education Level
                                </label>
                                <select
                                    value={academicData.currentEducationLevel}
                                    onChange={(e) =>
                                        setAcademicData({ ...academicData, currentEducationLevel: e.target.value })
                                    }
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                >
                                    <option value="">Select level</option>
                                    <option value="high_school">High School</option>
                                    <option value="undergraduate">Undergraduate</option>
                                    <option value="graduate">Graduate</option>
                                    <option value="postgraduate">Postgraduate</option>
                                    <option value="doctorate">Doctorate</option>
                                    <option value="other">Other</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Institution
                                </label>
                                <input
                                    type="text"
                                    value={academicData.institution}
                                    onChange={(e) =>
                                        setAcademicData({ ...academicData, institution: e.target.value })
                                    }
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Field of Study
                                </label>
                                <input
                                    type="text"
                                    value={academicData.fieldOfStudy}
                                    onChange={(e) =>
                                        setAcademicData({ ...academicData, fieldOfStudy: e.target.value })
                                    }
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Year of Study
                                </label>
                                <input
                                    type="text"
                                    value={academicData.yearOfStudy}
                                    onChange={(e) =>
                                        setAcademicData({ ...academicData, yearOfStudy: e.target.value })
                                    }
                                    placeholder="e.g., 3rd Year"
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">GPA</label>
                                <input
                                    type="text"
                                    value={academicData.gpa}
                                    onChange={(e) => setAcademicData({ ...academicData, gpa: e.target.value })}
                                    placeholder="e.g., 3.8/4.0"
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Learning Style
                                </label>
                                <select
                                    value={academicData.learningStyle}
                                    onChange={(e) =>
                                        setAcademicData({ ...academicData, learningStyle: e.target.value })
                                    }
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                >
                                    <option value="">Select style</option>
                                    <option value="visual">Visual</option>
                                    <option value="auditory">Auditory</option>
                                    <option value="kinesthetic">Kinesthetic</option>
                                    <option value="reading_writing">Reading/Writing</option>
                                </select>
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Subjects</label>
                            <div className="flex gap-2 mb-2">
                                <input
                                    type="text"
                                    value={currentSubject}
                                    onChange={(e) => setCurrentSubject(e.target.value)}
                                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addSubject())}
                                    placeholder="Add a subject"
                                    className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                />
                                <button
                                    type="button"
                                    onClick={addSubject}
                                    className="px-4 py-3 bg-indigo-100 text-indigo-600 rounded-lg hover:bg-indigo-200"
                                >
                                    <Plus className="h-5 w-5" />
                                </button>
                            </div>
                            {academicData.subjects?.length > 0 && (
                                <div className="flex flex-wrap gap-2">
                                    {academicData.subjects.map((subject, index) => (
                                        <span
                                            key={index}
                                            className="inline-flex items-center gap-1 px-3 py-1 bg-indigo-100 text-indigo-700 rounded-full text-sm"
                                        >
                                            {subject}
                                            <button type="button" onClick={() => removeSubject(index)}>
                                                <X className="h-4 w-4" />
                                            </button>
                                        </span>
                                    ))}
                                </div>
                            )}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Achievements
                            </label>
                            <textarea
                                value={academicData.achievements}
                                onChange={(e) =>
                                    setAcademicData({ ...academicData, achievements: e.target.value })
                                }
                                rows={4}
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none"
                            />
                        </div>

                        <div className="flex justify-end">
                            <button
                                type="button"
                                onClick={saveAcademicInfo}
                                disabled={saving}
                                className="inline-flex items-center px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50"
                            >
                                {saving ? (
                                    <>
                                        <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                                        Saving...
                                    </>
                                ) : (
                                    <>
                                        <Save className="h-5 w-5 mr-2" />
                                        Save Changes
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                )}

                {/* Career Info Tab */}
                {activeTab === 'career' && (
                    <div className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Career Stage
                                </label>
                                <select
                                    value={careerData.careerStage}
                                    onChange={(e) => setCareerData({ ...careerData, careerStage: e.target.value })}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                >
                                    <option value="">Select stage</option>
                                    <option value="exploring">Exploring Options</option>
                                    <option value="deciding">Deciding Career Path</option>
                                    <option value="preparing">Preparing/Training</option>
                                    <option value="job_seeking">Job Seeking</option>
                                    <option value="early_career">Early Career</option>
                                    <option value="career_change">Career Change</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Work Environment
                                </label>
                                <select
                                    value={careerData.workEnvironmentPreference}
                                    onChange={(e) =>
                                        setCareerData({ ...careerData, workEnvironmentPreference: e.target.value })
                                    }
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                >
                                    <option value="">Select preference</option>
                                    <option value="office">Office-based</option>
                                    <option value="remote">Remote/Work from Home</option>
                                    <option value="hybrid">Hybrid</option>
                                    <option value="fieldwork">Fieldwork</option>
                                    <option value="flexible">Flexible</option>
                                </select>
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Career Interests
                            </label>
                            <div className="flex gap-2 mb-2">
                                <input
                                    type="text"
                                    value={currentInterest}
                                    onChange={(e) => setCurrentInterest(e.target.value)}
                                    onKeyPress={(e) =>
                                        e.key === 'Enter' && (e.preventDefault(), addCareerInterest())
                                    }
                                    placeholder="Add a career interest"
                                    className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                />
                                <button
                                    type="button"
                                    onClick={addCareerInterest}
                                    className="px-4 py-3 bg-indigo-100 text-indigo-600 rounded-lg hover:bg-indigo-200"
                                >
                                    <Plus className="h-5 w-5" />
                                </button>
                            </div>
                            {careerData.careerInterests?.length > 0 && (
                                <div className="flex flex-wrap gap-2">
                                    {careerData.careerInterests.map((interest, index) => (
                                        <span
                                            key={index}
                                            className="inline-flex items-center gap-1 px-3 py-1 bg-indigo-100 text-indigo-700 rounded-full text-sm"
                                        >
                                            {interest}
                                            <button type="button" onClick={() => removeCareerInterest(index)}>
                                                <X className="h-4 w-4" />
                                            </button>
                                        </span>
                                    ))}
                                </div>
                            )}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Skills</label>
                            <div className="flex gap-2 mb-2">
                                <input
                                    type="text"
                                    value={currentSkill}
                                    onChange={(e) => setCurrentSkill(e.target.value)}
                                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addSkill())}
                                    placeholder="Add a skill"
                                    className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                />
                                <button
                                    type="button"
                                    onClick={addSkill}
                                    className="px-4 py-3 bg-green-100 text-green-600 rounded-lg hover:bg-green-200"
                                >
                                    <Plus className="h-5 w-5" />
                                </button>
                            </div>
                            {careerData.skills?.length > 0 && (
                                <div className="flex flex-wrap gap-2">
                                    {careerData.skills.map((skill, index) => (
                                        <span
                                            key={index}
                                            className="inline-flex items-center gap-1 px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm"
                                        >
                                            {skill}
                                            <button type="button" onClick={() => removeSkill(index)}>
                                                <X className="h-4 w-4" />
                                            </button>
                                        </span>
                                    ))}
                                </div>
                            )}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Industry Preferences
                            </label>
                            <div className="flex gap-2 mb-2">
                                <input
                                    type="text"
                                    value={currentIndustry}
                                    onChange={(e) => setCurrentIndustry(e.target.value)}
                                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addIndustry())}
                                    placeholder="Add an industry"
                                    className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                />
                                <button
                                    type="button"
                                    onClick={addIndustry}
                                    className="px-4 py-3 bg-purple-100 text-purple-600 rounded-lg hover:bg-purple-200"
                                >
                                    <Plus className="h-5 w-5" />
                                </button>
                            </div>
                            {careerData.industryPreferences?.length > 0 && (
                                <div className="flex flex-wrap gap-2">
                                    {careerData.industryPreferences.map((industry, index) => (
                                        <span
                                            key={index}
                                            className="inline-flex items-center gap-1 px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm"
                                        >
                                            {industry}
                                            <button type="button" onClick={() => removeIndustry(index)}>
                                                <X className="h-4 w-4" />
                                            </button>
                                        </span>
                                    ))}
                                </div>
                            )}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Long-term Career Goal
                            </label>
                            <textarea
                                value={careerData.longTermGoal}
                                onChange={(e) => setCareerData({ ...careerData, longTermGoal: e.target.value })}
                                rows={4}
                                placeholder="Describe your long-term career aspirations..."
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none"
                            />
                        </div>

                        <div className="flex justify-end">
                            <button
                                type="button"
                                onClick={saveCareerInfo}
                                disabled={saving}
                                className="inline-flex items-center px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50"
                            >
                                {saving ? (
                                    <>
                                        <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                                        Saving...
                                    </>
                                ) : (
                                    <>
                                        <Save className="h-5 w-5 mr-2" />
                                        Save Changes
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

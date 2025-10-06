'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useState } from 'react';
import { Plus, X } from 'lucide-react';

const careerInfoSchema = z.object({
    careerInterests: z.array(z.string()).min(1, 'Add at least one career interest'),
    skills: z.array(z.string()).optional(),
    industryPreferences: z.array(z.string()).optional(),
    workEnvironmentPreference: z.string().optional(),
    careerStage: z.string().min(1, 'Career stage is required'),
    longTermGoal: z.string().optional(),
});

export default function CareerInfoStep({ data, onUpdate, onNext, onBack }) {
    const {
        register,
        handleSubmit,
        formState: { errors },
        setValue,
        watch,
    } = useForm({
        resolver: zodResolver(careerInfoSchema),
        defaultValues: {
            careerInterests: data.careerInterests || [],
            skills: data.skills || [],
            industryPreferences: data.industryPreferences || [],
            ...data,
        },
    });

    const [currentInterest, setCurrentInterest] = useState('');
    const [currentSkill, setCurrentSkill] = useState('');
    const [currentIndustry, setCurrentIndustry] = useState('');

    const careerInterests = watch('careerInterests') || [];
    const skills = watch('skills') || [];
    const industryPreferences = watch('industryPreferences') || [];

    const addItem = (value, field, currentValue, setValue, setCurrentValue) => {
        if (currentValue.trim()) {
            const newItems = [...value, currentValue.trim()];
            setValue(field, newItems);
            setCurrentValue('');
        }
    };

    const removeItem = (index, field, currentValue, setValue) => {
        const newItems = currentValue.filter((_, i) => i !== index);
        setValue(field, newItems);
    };

    const onSubmit = (formData) => {
        onUpdate(formData);
        onNext();
    };

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                    Career Interests
                </h2>
                <p className="text-gray-600">
                    Tell us about your career aspirations and professional goals
                </p>
            </div>

            {/* Career Stage */}
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                    Career Stage *
                </label>
                <select
                    {...register('careerStage')}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                >
                    <option value="">Select your current stage</option>
                    <option value="exploring">Exploring Options</option>
                    <option value="deciding">Deciding Career Path</option>
                    <option value="preparing">Preparing/Training</option>
                    <option value="job_seeking">Job Seeking</option>
                    <option value="early_career">Early Career</option>
                    <option value="career_change">Career Change</option>
                </select>
                {errors.careerStage && (
                    <p className="mt-1 text-sm text-red-600">{errors.careerStage.message}</p>
                )}
            </div>

            {/* Career Interests */}
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                    Career Interests * (Add at least one)
                </label>
                <div className="flex gap-2 mb-2">
                    <input
                        type="text"
                        value={currentInterest}
                        onChange={(e) => setCurrentInterest(e.target.value)}
                        onKeyPress={(e) =>
                            e.key === 'Enter' &&
                            (e.preventDefault(),
                                addItem(
                                    careerInterests,
                                    'careerInterests',
                                    currentInterest,
                                    setValue,
                                    setCurrentInterest
                                ))
                        }
                        placeholder="e.g., Software Engineering, Data Science"
                        className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    />
                    <button
                        type="button"
                        onClick={() =>
                            addItem(
                                careerInterests,
                                'careerInterests',
                                currentInterest,
                                setValue,
                                setCurrentInterest
                            )
                        }
                        className="px-4 py-3 bg-indigo-100 text-indigo-600 rounded-lg hover:bg-indigo-200 transition-colors"
                    >
                        <Plus className="h-5 w-5" />
                    </button>
                </div>
                {careerInterests.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-2">
                        {careerInterests.map((interest, index) => (
                            <span
                                key={index}
                                className="inline-flex items-center gap-1 px-3 py-1 bg-indigo-100 text-indigo-700 rounded-full text-sm"
                            >
                                {interest}
                                <button
                                    type="button"
                                    onClick={() =>
                                        removeItem(index, 'careerInterests', careerInterests, setValue)
                                    }
                                    className="hover:text-indigo-900"
                                >
                                    <X className="h-4 w-4" />
                                </button>
                            </span>
                        ))}
                    </div>
                )}
                {errors.careerInterests && (
                    <p className="mt-1 text-sm text-red-600">
                        {errors.careerInterests.message}
                    </p>
                )}
            </div>

            {/* Skills */}
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                    Skills (Optional)
                </label>
                <div className="flex gap-2 mb-2">
                    <input
                        type="text"
                        value={currentSkill}
                        onChange={(e) => setCurrentSkill(e.target.value)}
                        onKeyPress={(e) =>
                            e.key === 'Enter' &&
                            (e.preventDefault(),
                                addItem(skills, 'skills', currentSkill, setValue, setCurrentSkill))
                        }
                        placeholder="e.g., Python, Project Management"
                        className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    />
                    <button
                        type="button"
                        onClick={() =>
                            addItem(skills, 'skills', currentSkill, setValue, setCurrentSkill)
                        }
                        className="px-4 py-3 bg-indigo-100 text-indigo-600 rounded-lg hover:bg-indigo-200 transition-colors"
                    >
                        <Plus className="h-5 w-5" />
                    </button>
                </div>
                {skills.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                        {skills.map((skill, index) => (
                            <span
                                key={index}
                                className="inline-flex items-center gap-1 px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm"
                            >
                                {skill}
                                <button
                                    type="button"
                                    onClick={() => removeItem(index, 'skills', skills, setValue)}
                                    className="hover:text-green-900"
                                >
                                    <X className="h-4 w-4" />
                                </button>
                            </span>
                        ))}
                    </div>
                )}
            </div>

            {/* Industry Preferences */}
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                    Industry Preferences (Optional)
                </label>
                <div className="flex gap-2 mb-2">
                    <input
                        type="text"
                        value={currentIndustry}
                        onChange={(e) => setCurrentIndustry(e.target.value)}
                        onKeyPress={(e) =>
                            e.key === 'Enter' &&
                            (e.preventDefault(),
                                addItem(
                                    industryPreferences,
                                    'industryPreferences',
                                    currentIndustry,
                                    setValue,
                                    setCurrentIndustry
                                ))
                        }
                        placeholder="e.g., Technology, Healthcare"
                        className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    />
                    <button
                        type="button"
                        onClick={() =>
                            addItem(
                                industryPreferences,
                                'industryPreferences',
                                currentIndustry,
                                setValue,
                                setCurrentIndustry
                            )
                        }
                        className="px-4 py-3 bg-indigo-100 text-indigo-600 rounded-lg hover:bg-indigo-200 transition-colors"
                    >
                        <Plus className="h-5 w-5" />
                    </button>
                </div>
                {industryPreferences.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                        {industryPreferences.map((industry, index) => (
                            <span
                                key={index}
                                className="inline-flex items-center gap-1 px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm"
                            >
                                {industry}
                                <button
                                    type="button"
                                    onClick={() =>
                                        removeItem(
                                            index,
                                            'industryPreferences',
                                            industryPreferences,
                                            setValue
                                        )
                                    }
                                    className="hover:text-purple-900"
                                >
                                    <X className="h-4 w-4" />
                                </button>
                            </span>
                        ))}
                    </div>
                )}
            </div>

            {/* Work Environment Preference */}
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                    Work Environment Preference (Optional)
                </label>
                <select
                    {...register('workEnvironmentPreference')}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                >
                    <option value="">Select your preference</option>
                    <option value="office">Office-based</option>
                    <option value="remote">Remote/Work from Home</option>
                    <option value="hybrid">Hybrid</option>
                    <option value="fieldwork">Fieldwork</option>
                    <option value="flexible">Flexible</option>
                </select>
            </div>

            {/* Long Term Goal */}
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                    Long-term Career Goal (Optional)
                </label>
                <textarea
                    {...register('longTermGoal')}
                    rows={4}
                    placeholder="Describe where you see yourself in 5-10 years..."
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none"
                />
            </div>

            {/* Navigation Buttons */}
            <div className="flex gap-3">
                <button
                    type="button"
                    onClick={onBack}
                    className="flex-1 bg-gray-200 text-gray-700 py-3 rounded-lg hover:bg-gray-300 transition-colors font-medium"
                >
                    Back
                </button>
                <button
                    type="submit"
                    className="flex-1 bg-indigo-600 text-white py-3 rounded-lg hover:bg-indigo-700 transition-colors font-medium"
                >
                    Continue to Goals
                </button>
            </div>
        </form>
    );
}

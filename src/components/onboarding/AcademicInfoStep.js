'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useState } from 'react';
import { Plus, X } from 'lucide-react';

const academicInfoSchema = z.object({
    currentEducationLevel: z.string().min(1, 'Education level is required'),
    institution: z.string().min(2, 'Institution name is required'),
    fieldOfStudy: z.string().min(2, 'Field of study is required'),
    yearOfStudy: z.string().optional(),
    gpa: z.string().optional(),
    subjects: z.array(z.string()).optional(),
    learningStyle: z.string().optional(),
    achievements: z.string().optional(),
});

export default function AcademicInfoStep({ data, onUpdate, onNext, onBack }) {
    const {
        register,
        handleSubmit,
        formState: { errors },
        setValue,
        watch,
    } = useForm({
        resolver: zodResolver(academicInfoSchema),
        defaultValues: {
            ...data,
            subjects: data.subjects || [],
        },
    });

    const [currentSubject, setCurrentSubject] = useState('');
    const subjects = watch('subjects') || [];

    const addSubject = () => {
        if (currentSubject.trim()) {
            const newSubjects = [...subjects, currentSubject.trim()];
            setValue('subjects', newSubjects);
            setCurrentSubject('');
        }
    };

    const removeSubject = (index) => {
        const newSubjects = subjects.filter((_, i) => i !== index);
        setValue('subjects', newSubjects);
    };

    const onSubmit = (formData) => {
        onUpdate(formData);
        onNext();
    };

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                    Academic Details
                </h2>
                <p className="text-gray-600">
                    Share your educational background and academic interests
                </p>
            </div>

            {/* Current Education Level */}
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                    Current Education Level *
                </label>
                <select
                    {...register('currentEducationLevel')}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                >
                    <option value="">Select your education level</option>
                    <option value="high_school">High School</option>
                    <option value="undergraduate">Undergraduate</option>
                    <option value="graduate">Graduate</option>
                    <option value="postgraduate">Postgraduate</option>
                    <option value="doctorate">Doctorate</option>
                    <option value="other">Other</option>
                </select>
                {errors.currentEducationLevel && (
                    <p className="mt-1 text-sm text-red-600">
                        {errors.currentEducationLevel.message}
                    </p>
                )}
            </div>

            {/* Institution */}
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                    Institution/University *
                </label>
                <input
                    type="text"
                    {...register('institution')}
                    placeholder="e.g., Harvard University"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
                {errors.institution && (
                    <p className="mt-1 text-sm text-red-600">{errors.institution.message}</p>
                )}
            </div>

            {/* Field of Study */}
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                    Field of Study/Major *
                </label>
                <input
                    type="text"
                    {...register('fieldOfStudy')}
                    placeholder="e.g., Computer Science"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
                {errors.fieldOfStudy && (
                    <p className="mt-1 text-sm text-red-600">{errors.fieldOfStudy.message}</p>
                )}
            </div>

            {/* Year of Study */}
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                    Year of Study (Optional)
                </label>
                <input
                    type="text"
                    {...register('yearOfStudy')}
                    placeholder="e.g., 3rd Year"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
            </div>

            {/* GPA */}
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                    GPA/Grade (Optional)
                </label>
                <input
                    type="text"
                    {...register('gpa')}
                    placeholder="e.g., 3.8/4.0"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
            </div>

            {/* Subjects */}
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                    Key Subjects/Courses (Optional)
                </label>
                <div className="flex gap-2 mb-2">
                    <input
                        type="text"
                        value={currentSubject}
                        onChange={(e) => setCurrentSubject(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addSubject())}
                        placeholder="e.g., Data Structures"
                        className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    />
                    <button
                        type="button"
                        onClick={addSubject}
                        className="px-4 py-3 bg-indigo-100 text-indigo-600 rounded-lg hover:bg-indigo-200 transition-colors"
                    >
                        <Plus className="h-5 w-5" />
                    </button>
                </div>
                {subjects.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                        {subjects.map((subject, index) => (
                            <span
                                key={index}
                                className="inline-flex items-center gap-1 px-3 py-1 bg-indigo-100 text-indigo-700 rounded-full text-sm"
                            >
                                {subject}
                                <button
                                    type="button"
                                    onClick={() => removeSubject(index)}
                                    className="hover:text-indigo-900"
                                >
                                    <X className="h-4 w-4" />
                                </button>
                            </span>
                        ))}
                    </div>
                )}
            </div>

            {/* Learning Style */}
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                    Preferred Learning Style (Optional)
                </label>
                <select
                    {...register('learningStyle')}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                >
                    <option value="">Select your learning style</option>
                    <option value="visual">Visual (Learning through seeing)</option>
                    <option value="auditory">Auditory (Learning through listening)</option>
                    <option value="kinesthetic">Kinesthetic (Learning through doing)</option>
                    <option value="reading_writing">Reading/Writing</option>
                </select>
            </div>

            {/* Achievements */}
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                    Academic Achievements (Optional)
                </label>
                <textarea
                    {...register('achievements')}
                    rows={4}
                    placeholder="Share any awards, honors, or notable accomplishments..."
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
                    Continue to Career Interests
                </button>
            </div>
        </form>
    );
}

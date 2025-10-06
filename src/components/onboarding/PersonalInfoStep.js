'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Calendar } from 'lucide-react';

const personalInfoSchema = z.object({
    dateOfBirth: z.string().min(1, 'Date of birth is required'),
    gender: z.enum(['male', 'female', 'other', 'prefer_not_to_say'], {
        errorMap: () => ({ message: 'Please select a gender' }),
    }),
    phone: z.string().optional(),
    city: z.string().min(2, 'City is required'),
    country: z.string().min(2, 'Country is required'),
    preferredLanguage: z.string().min(1, 'Preferred language is required'),
});

export default function PersonalInfoStep({ data, onUpdate, onNext }) {
    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm({
        resolver: zodResolver(personalInfoSchema),
        defaultValues: data,
    });

    const onSubmit = (formData) => {
        onUpdate(formData);
        onNext();
    };

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                    Personal Information
                </h2>
                <p className="text-gray-600">
                    Tell us a bit about yourself to help us personalize your experience
                </p>
            </div>

            {/* Date of Birth */}
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                    Date of Birth *
                </label>
                <div className="relative">
                    <input
                        type="date"
                        {...register('dateOfBirth')}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    />
                    <Calendar className="absolute right-3 top-3.5 h-5 w-5 text-gray-400 pointer-events-none" />
                </div>
                {errors.dateOfBirth && (
                    <p className="mt-1 text-sm text-red-600">{errors.dateOfBirth.message}</p>
                )}
            </div>

            {/* Gender */}
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                    Gender *
                </label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {[
                        { value: 'male', label: 'Male' },
                        { value: 'female', label: 'Female' },
                        { value: 'other', label: 'Other' },
                        { value: 'prefer_not_to_say', label: 'Prefer not to say' },
                    ].map((option) => (
                        <label
                            key={option.value}
                            className="flex items-center justify-center px-4 py-3 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50 has-[:checked]:border-indigo-600 has-[:checked]:bg-indigo-50"
                        >
                            <input
                                type="radio"
                                {...register('gender')}
                                value={option.value}
                                className="sr-only"
                            />
                            <span className="text-sm font-medium text-gray-700">
                                {option.label}
                            </span>
                        </label>
                    ))}
                </div>
                {errors.gender && (
                    <p className="mt-1 text-sm text-red-600">{errors.gender.message}</p>
                )}
            </div>

            {/* Phone */}
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                    Phone Number (Optional)
                </label>
                <input
                    type="tel"
                    {...register('phone')}
                    placeholder="+1 234 567 8900"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
            </div>

            {/* City */}
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                    City *
                </label>
                <input
                    type="text"
                    {...register('city')}
                    placeholder="New York"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
                {errors.city && (
                    <p className="mt-1 text-sm text-red-600">{errors.city.message}</p>
                )}
            </div>

            {/* Country */}
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                    Country *
                </label>
                <input
                    type="text"
                    {...register('country')}
                    placeholder="United States"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
                {errors.country && (
                    <p className="mt-1 text-sm text-red-600">{errors.country.message}</p>
                )}
            </div>

            {/* Preferred Language */}
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                    Preferred Language *
                </label>
                <select
                    {...register('preferredLanguage')}
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
                {errors.preferredLanguage && (
                    <p className="mt-1 text-sm text-red-600">
                        {errors.preferredLanguage.message}
                    </p>
                )}
            </div>

            {/* Submit Button */}
            <button
                type="submit"
                className="w-full bg-indigo-600 text-white py-3 rounded-lg hover:bg-indigo-700 transition-colors font-medium"
            >
                Continue to Academic Details
            </button>
        </form>
    );
}

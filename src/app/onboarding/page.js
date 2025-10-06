'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
    User,
    GraduationCap,
    Briefcase,
    Target,
    CheckCircle,
    ArrowRight,
    ArrowLeft,
    Loader2
} from 'lucide-react';
import PersonalInfoStep from '@/components/onboarding/PersonalInfoStep';
import AcademicInfoStep from '@/components/onboarding/AcademicInfoStep';
import CareerInfoStep from '@/components/onboarding/CareerInfoStep';
import GoalsStep from '@/components/onboarding/GoalsStep';

const steps = [
    {
        id: 1,
        title: 'Personal Information',
        description: 'Tell us about yourself',
        icon: User,
    },
    {
        id: 2,
        title: 'Academic Details',
        description: 'Your educational background',
        icon: GraduationCap,
    },
    {
        id: 3,
        title: 'Career Interests',
        description: 'Your aspirations and goals',
        icon: Briefcase,
    },
    {
        id: 4,
        title: 'Set Your Goals',
        description: 'Define your objectives',
        icon: Target,
    },
];

export default function OnboardingPage() {
    const { data: session, status } = useSession();
    const router = useRouter();
    const [currentStep, setCurrentStep] = useState(1);
    const [formData, setFormData] = useState({
        personal: {},
        academic: {},
        career: {},
        goals: [],
    });
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        if (status === 'unauthenticated') {
            router.push('/login');
        }
    }, [status, router]);

    const updateFormData = (step, data) => {
        setFormData(prev => ({
            ...prev,
            [step]: data,
        }));
    };

    const nextStep = () => {
        if (currentStep < steps.length) {
            setCurrentStep(prev => prev + 1);
        }
    };

    const prevStep = () => {
        if (currentStep > 1) {
            setCurrentStep(prev => prev - 1);
        }
    };

    const handleComplete = async () => {
        setIsLoading(true);
        try {
            // Save all onboarding data
            const response = await fetch('/api/onboarding/complete', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
            });

            if (!response.ok) {
                throw new Error('Failed to save onboarding data');
            }

            // Redirect to dashboard
            router.push('/dashboard');
        } catch (error) {
            console.error('Onboarding error:', error);
            alert('Failed to complete onboarding. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    if (status === 'loading') {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto text-black">
            {/* Header */}
            <div className="text-center mb-8">
                <h1 className="text-3xl font-bold text-gray-900 mb-2">
                    Complete Your Profile
                </h1>
                <p className="text-gray-600">
                    Help us personalize your counselling experience
                </p>
            </div>

            {/* Progress Bar */}
            <div className="mb-8">
                <div className="flex items-center justify-between mb-4">
                    {steps.map((step, index) => {
                        const Icon = step.icon;
                        const isActive = currentStep === step.id;
                        const isCompleted = currentStep > step.id;

                        return (
                            <div key={step.id} className="flex items-center flex-1">
                                <div className="flex flex-col items-center flex-1">
                                    <div
                                        className={`w-12 h-12 rounded-full flex items-center justify-center mb-2 transition-colors ${isCompleted
                                                ? 'bg-green-500 text-white'
                                                : isActive
                                                    ? 'bg-indigo-600 text-white'
                                                    : 'bg-gray-200 text-gray-400'
                                            }`}
                                    >
                                        {isCompleted ? (
                                            <CheckCircle className="h-6 w-6" />
                                        ) : (
                                            <Icon className="h-6 w-6" />
                                        )}
                                    </div>
                                    <div className="text-center hidden md:block">
                                        <p
                                            className={`text-sm font-medium ${isActive ? 'text-indigo-600' : 'text-gray-500'
                                                }`}
                                        >
                                            {step.title}
                                        </p>
                                    </div>
                                </div>
                                {index < steps.length - 1 && (
                                    <div
                                        className={`h-1 flex-1 mx-2 ${isCompleted ? 'bg-green-500' : 'bg-gray-200'
                                            }`}
                                    />
                                )}
                            </div>
                        );
                    })}
                </div>
                <div className="text-center text-sm text-gray-500">
                    Step {currentStep} of {steps.length}
                </div>
            </div>

            {/* Step Content */}
            <div className="bg-white rounded-2xl shadow-xl p-8 mb-6">
                <AnimatePresence mode="wait">
                    <motion.div
                        key={currentStep}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        transition={{ duration: 0.3 }}
                    >
                        {currentStep === 1 && (
                            <PersonalInfoStep
                                data={formData.personal}
                                onUpdate={(data) => updateFormData('personal', data)}
                                onNext={nextStep}
                            />
                        )}
                        {currentStep === 2 && (
                            <AcademicInfoStep
                                data={formData.academic}
                                onUpdate={(data) => updateFormData('academic', data)}
                                onNext={nextStep}
                                onBack={prevStep}
                            />
                        )}
                        {currentStep === 3 && (
                            <CareerInfoStep
                                data={formData.career}
                                onUpdate={(data) => updateFormData('career', data)}
                                onNext={nextStep}
                                onBack={prevStep}
                            />
                        )}
                        {currentStep === 4 && (
                            <GoalsStep
                                data={formData.goals}
                                onUpdate={(data) => updateFormData('goals', data)}
                                onComplete={handleComplete}
                                onBack={prevStep}
                                isLoading={isLoading}
                            />
                        )}
                    </motion.div>
                </AnimatePresence>
            </div>

            {/* Navigation Buttons */}
            <div className="flex justify-between items-center">
                <button
                    onClick={prevStep}
                    disabled={currentStep === 1}
                    className="flex items-center px-4 py-2 text-gray-600 hover:text-gray-900 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    <ArrowLeft className="h-5 w-5 mr-2" />
                    Back
                </button>
                <button
                    onClick={() => router.push('/dashboard')}
                    className="text-sm text-gray-500 hover:text-gray-700"
                >
                    Skip for now
                </button>
            </div>
        </div>
    );
}

'use client';

import { useState } from 'react';
import { Plus, X, Target, Calendar, Loader2 } from 'lucide-react';

export default function GoalsStep({ data, onUpdate, onComplete, onBack, isLoading }) {
    const [goals, setGoals] = useState(data || []);
    const [newGoal, setNewGoal] = useState({
        title: '',
        description: '',
        category: '',
        targetDate: '',
    });

    const addGoal = () => {
        if (newGoal.title && newGoal.category) {
            const goal = {
                ...newGoal,
                id: Date.now().toString(),
            };
            const updatedGoals = [...goals, goal];
            setGoals(updatedGoals);
            onUpdate(updatedGoals);
            setNewGoal({
                title: '',
                description: '',
                category: '',
                targetDate: '',
            });
        }
    };

    const removeGoal = (id) => {
        const updatedGoals = goals.filter((goal) => goal.id !== id);
        setGoals(updatedGoals);
        onUpdate(updatedGoals);
    };

    const handleComplete = () => {
        onUpdate(goals);
        onComplete();
    };

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Set Your Goals</h2>
                <p className="text-gray-600">
                    Define your academic and career goals to track your progress
                </p>
            </div>

            {/* Add New Goal Form */}
            <div className="bg-gray-50 p-6 rounded-lg space-y-4">
                <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                    <Target className="h-5 w-5 text-indigo-600" />
                    Add a New Goal
                </h3>

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
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Description (Optional)
                    </label>
                    <textarea
                        value={newGoal.description}
                        onChange={(e) =>
                            setNewGoal({ ...newGoal, description: e.target.value })
                        }
                        rows={3}
                        placeholder="Describe your goal in more detail..."
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none"
                    />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Category *
                        </label>
                        <select
                            value={newGoal.category}
                            onChange={(e) =>
                                setNewGoal({ ...newGoal, category: e.target.value })
                            }
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                        >
                            <option value="">Select category</option>
                            <option value="academic">Academic</option>
                            <option value="career">Career</option>
                            <option value="skill">Skill Development</option>
                            <option value="personal">Personal Growth</option>
                            <option value="project">Project</option>
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Target Date (Optional)
                        </label>
                        <div className="relative">
                            <input
                                type="date"
                                value={newGoal.targetDate}
                                onChange={(e) =>
                                    setNewGoal({ ...newGoal, targetDate: e.target.value })
                                }
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                            />
                            <Calendar className="absolute right-3 top-3.5 h-5 w-5 text-gray-400 pointer-events-none" />
                        </div>
                    </div>
                </div>

                <button
                    type="button"
                    onClick={addGoal}
                    disabled={!newGoal.title || !newGoal.category}
                    className="w-full bg-indigo-100 text-indigo-600 py-3 rounded-lg hover:bg-indigo-200 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                    <Plus className="h-5 w-5" />
                    Add Goal
                </button>
            </div>

            {/* Goals List */}
            {goals.length > 0 && (
                <div className="space-y-3">
                    <h3 className="font-semibold text-gray-900">Your Goals ({goals.length})</h3>
                    {goals.map((goal) => (
                        <div
                            key={goal.id}
                            className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                        >
                            <div className="flex items-start justify-between">
                                <div className="flex-1">
                                    <div className="flex items-center gap-2 mb-1">
                                        <h4 className="font-semibold text-gray-900">{goal.title}</h4>
                                        <span
                                            className={`px-2 py-1 text-xs rounded-full ${goal.category === 'academic'
                                                    ? 'bg-blue-100 text-blue-700'
                                                    : goal.category === 'career'
                                                        ? 'bg-green-100 text-green-700'
                                                        : goal.category === 'skill'
                                                            ? 'bg-purple-100 text-purple-700'
                                                            : goal.category === 'personal'
                                                                ? 'bg-pink-100 text-pink-700'
                                                                : 'bg-orange-100 text-orange-700'
                                                }`}
                                        >
                                            {goal.category}
                                        </span>
                                    </div>
                                    {goal.description && (
                                        <p className="text-sm text-gray-600 mb-2">
                                            {goal.description}
                                        </p>
                                    )}
                                    {goal.targetDate && (
                                        <div className="flex items-center gap-1 text-sm text-gray-500">
                                            <Calendar className="h-4 w-4" />
                                            <span>Target: {new Date(goal.targetDate).toLocaleDateString()}</span>
                                        </div>
                                    )}
                                </div>
                                <button
                                    type="button"
                                    onClick={() => removeGoal(goal.id)}
                                    className="text-gray-400 hover:text-red-500 transition-colors"
                                >
                                    <X className="h-5 w-5" />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {goals.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                    <Target className="h-12 w-12 mx-auto mb-3 text-gray-400" />
                    <p>No goals added yet. Add your first goal above!</p>
                </div>
            )}

            {/* Navigation Buttons */}
            <div className="flex gap-3 pt-4 border-t">
                <button
                    type="button"
                    onClick={onBack}
                    disabled={isLoading}
                    className="flex-1 bg-gray-200 text-gray-700 py-3 rounded-lg hover:bg-gray-300 transition-colors font-medium disabled:opacity-50"
                >
                    Back
                </button>
                <button
                    type="button"
                    onClick={handleComplete}
                    disabled={isLoading}
                    className="flex-1 bg-green-600 text-white py-3 rounded-lg hover:bg-green-700 transition-colors font-medium disabled:opacity-50 flex items-center justify-center gap-2"
                >
                    {isLoading ? (
                        <>
                            <Loader2 className="h-5 w-5 animate-spin" />
                            Completing...
                        </>
                    ) : (
                        'Complete Onboarding'
                    )}
                </button>
            </div>

            <p className="text-center text-sm text-gray-500">
                Don't worry, you can always add or modify goals later from your dashboard
            </p>
        </div>
    );
}

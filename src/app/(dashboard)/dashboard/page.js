'use client';

import { useSession } from 'next-auth/react';
import { MessageSquare, Target, Lightbulb, TrendingUp, Calendar, Smile, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { useState, useEffect } from 'react';

export default function DashboardPage() {
    const { data: session } = useSession();
    const [dashboardData, setDashboardData] = useState(null);
    const [loading, setLoading] = useState(true);

    // Fetch dashboard stats
    useEffect(() => {
        const fetchDashboardStats = async () => {
            try {
                const response = await fetch('/api/dashboard/stats');
                const data = await response.json();

                if (data.success) {
                    setDashboardData(data);
                }
            } catch (error) {
                console.error('Failed to fetch dashboard stats:', error);
            } finally {
                setLoading(false);
            }
        };

        if (session) {
            fetchDashboardStats();
        }
    }, [session]);

    const stats = [
        {
            name: 'Conversations',
            value: loading ? '...' : (dashboardData?.stats?.conversations || 0).toString(),
            icon: MessageSquare,
            color: 'bg-blue-500',
            href: '/chat'
        },
        {
            name: 'Active Goals',
            value: loading ? '...' : (dashboardData?.stats?.activeGoals || 0).toString(),
            icon: Target,
            color: 'bg-green-500',
            href: '/goals'
        },
        {
            name: 'Recommendations',
            value: loading ? '...' : (dashboardData?.stats?.recommendations || 0).toString(),
            icon: Lightbulb,
            color: 'bg-purple-500',
            href: '/recommendations'
        },
        {
            name: 'Mood Score',
            value: loading ? '...' : (dashboardData?.stats?.moodScore || '-'),
            icon: Smile,
            color: 'bg-yellow-500',
            href: '/mood'
        },
    ];

    const quickActions = [
        {
            title: 'Start a Chat',
            description: 'Get personalized guidance from our AI counsellor',
            icon: MessageSquare,
            color: 'bg-blue-500',
            href: '/chat',
        },
        {
            title: 'Set a Goal',
            description: 'Define your academic or career objectives',
            icon: Target,
            color: 'bg-green-500',
            href: '/goals',
        },
        {
            title: 'View Recommendations',
            description: 'Explore personalized course and career suggestions',
            icon: Lightbulb,
            color: 'bg-purple-500',
            href: '/recommendations',
        },
        {
            title: 'Log Your Mood',
            description: 'Track your emotional wellbeing',
            icon: Smile,
            color: 'bg-yellow-500',
            href: '/mood',
        },
    ];

    return (
        <div className="py-6 px-4 sm:px-6 lg:px-8">
            {/* Welcome Section */}
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900">
                    Welcome back, {session?.user?.name?.split(' ')[0] || 'Student'}! 👋
                </h1>
                <p className="mt-2 text-gray-600">
                    Here's your personalized dashboard. Ready to continue your learning journey?
                </p>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4 mb-8">
                {stats.map((stat) => {
                    const Icon = stat.icon;
                    return (
                        <Link
                            key={stat.name}
                            href={stat.href}
                            className="bg-white overflow-hidden shadow rounded-lg hover:shadow-md transition-shadow"
                        >
                            <div className="p-5">
                                <div className="flex items-center">
                                    <div className={`flex-shrink-0 rounded-md ${stat.color} p-3`}>
                                        <Icon className="h-6 w-6 text-white" />
                                    </div>
                                    <div className="ml-5 w-0 flex-1">
                                        <dl>
                                            <dt className="text-sm font-medium text-gray-500 truncate">{stat.name}</dt>
                                            <dd className="text-2xl font-bold text-gray-900">{stat.value}</dd>
                                        </dl>
                                    </div>
                                </div>
                            </div>
                        </Link>
                    );
                })}
            </div>

            {/* Quick Actions */}
            <div className="mb-8">
                <h2 className="text-xl font-bold text-gray-900 mb-4">Quick Actions</h2>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    {quickActions.map((action) => {
                        const Icon = action.icon;
                        return (
                            <Link
                                key={action.title}
                                href={action.href}
                                className="bg-white p-6 rounded-lg shadow hover:shadow-md transition-shadow border border-gray-200"
                            >
                                <div className={`inline-flex rounded-lg ${action.color} p-3 mb-4`}>
                                    <Icon className="h-6 w-6 text-white" />
                                </div>
                                <h3 className="text-lg font-semibold text-gray-900 mb-2">{action.title}</h3>
                                <p className="text-sm text-gray-600">{action.description}</p>
                            </Link>
                        );
                    })}
                </div>
            </div>

            {/* Getting Started Section - Only show if profile is incomplete */}
            {!loading && !dashboardData?.profileComplete && (
                <div className="bg-gradient-to-r from-indigo-500 to-purple-600 rounded-lg shadow-lg p-6 text-white">
                    <div className="md:flex md:items-center md:justify-between">
                        <div className="flex-1 min-w-0">
                            <h2 className="text-2xl font-bold">Complete Your Profile</h2>
                            <p className="mt-2 text-indigo-100">
                                Help us understand you better to provide personalized recommendations and guidance.
                            </p>
                        </div>
                        <div className="mt-4 flex md:mt-0 md:ml-4">
                            <Link
                                href="/profile"
                                className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-indigo-600 bg-white hover:bg-gray-50"
                            >
                                Complete Profile
                            </Link>
                        </div>
                    </div>
                </div>
            )}

            {/* Recent Activity */}
            <div className="mt-8">
                <h2 className="text-xl font-bold text-gray-900 mb-4">Recent Activity</h2>
                <div className="bg-white shadow rounded-lg">
                    <div className="p-6 text-center text-gray-500">
                        <Calendar className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                        <p className="text-sm">No recent activity yet.</p>
                        <p className="text-sm mt-1">Start a conversation or set a goal to see your activity here.</p>
                    </div>
                </div>
            </div>
        </div>
    );
}

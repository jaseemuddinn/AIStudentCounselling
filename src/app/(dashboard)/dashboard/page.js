'use client';

import { useSession } from 'next-auth/react';
import { MessageSquare, Target, Lightbulb, TrendingUp, Calendar, Smile, Loader2, ArrowUpRight, Sparkles } from 'lucide-react';
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
            value: loading ? '—' : (dashboardData?.stats?.conversations || 0).toString(),
            icon: MessageSquare,
            href: '/chat',
            change: '+12%'
        },
        {
            name: 'Active Goals',
            value: loading ? '—' : (dashboardData?.stats?.activeGoals || 0).toString(),
            icon: Target,
            href: '/goals',
            change: '+3'
        },
        {
            name: 'Recommendations',
            value: loading ? '—' : (dashboardData?.stats?.recommendations || 0).toString(),
            icon: Lightbulb,
            href: '/recommendations',
            change: 'New'
        },
        {
            name: 'Mood Score',
            value: loading ? '—' : (dashboardData?.stats?.moodScore || '—'),
            icon: Smile,
            href: '/mood',
            change: '↑ 8.2'
        },
    ];

    const quickActions = [
        {
            title: 'New Conversation',
            description: 'Get personalized AI guidance',
            icon: MessageSquare,
            href: '/chat',
            badge: 'Most used'
        },
        {
            title: 'Set Goal',
            description: 'Define objectives',
            icon: Target,
            href: '/goals',
        },
        {
            title: 'Get Recommendations',
            description: 'Discover opportunities',
            icon: Sparkles,
            href: '/recommendations',
        },
        {
            title: 'Track Mood',
            description: 'Monitor wellbeing',
            icon: Smile,
            href: '/mood',
        },
    ];

    return (
        <div className="min-h-screen bg-gradient-to-br from-neutral-50 via-white to-neutral-100 relative overflow-hidden">
            {/* Animated Background Elements */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-20 right-[10%] w-[500px] h-[500px] bg-gradient-to-br from-blue-50 to-purple-50 rounded-full blur-3xl opacity-30 animate-pulse" />
                <div className="absolute bottom-20 left-[5%] w-[400px] h-[400px] bg-gradient-to-tr from-pink-50 to-orange-50 rounded-full blur-3xl opacity-20" />
                <div className="absolute top-[40%] left-[40%] w-[300px] h-[300px] bg-gradient-to-br from-cyan-50 to-teal-50 rounded-full blur-3xl opacity-25" />
            </div>

            <div className="max-w-7xl mx-auto px-6 py-12 relative z-10">
                {/* Header */}
                <div className="mb-20">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="h-[3px] w-16 bg-gradient-to-r from-black via-neutral-700 to-transparent rounded-full animate-pulse" />
                        <span className="text-xs tracking-[0.25em] text-neutral-400 uppercase font-semibold">Dashboard</span>
                    </div>
                    <h1 className="text-6xl md:text-7xl font-bold tracking-tight bg-gradient-to-br from-black via-neutral-800 to-neutral-600 bg-clip-text text-transparent mb-6 leading-[1.1]">
                        Welcome back,<br /><span className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">{session?.user?.name?.split(' ')[0] || 'Student'}</span>
                    </h1>
                    <p className="text-xl text-neutral-600 font-medium leading-relaxed max-w-2xl">
                        Your personalized learning journey at a glance ✨
                    </p>
                </div>

                {/* Stats Grid - Modern Glassmorphism Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 mb-20">
                    {stats.map((stat, index) => {
                        const Icon = stat.icon;
                        const gradients = [
                            'from-blue-500/10 to-purple-500/10',
                            'from-green-500/10 to-emerald-500/10',
                            'from-purple-500/10 to-pink-500/10',
                            'from-orange-500/10 to-yellow-500/10'
                        ];
                        const iconGradients = [
                            'from-blue-500 to-purple-500',
                            'from-green-500 to-emerald-500',
                            'from-purple-500 to-pink-500',
                            'from-orange-500 to-yellow-500'
                        ];
                        return (
                            <Link
                                key={stat.name}
                                href={stat.href}
                                className="group relative backdrop-blur-xl bg-white/80 border border-white/20 shadow-xl shadow-black/5 hover:shadow-2xl hover:shadow-black/10 rounded-3xl p-7 transition-all duration-700 hover:-translate-y-2 overflow-hidden"
                            >
                                {/* Gradient Background */}
                                <div className={`absolute inset-0 bg-gradient-to-br ${gradients[index]} opacity-0 group-hover:opacity-100 transition-opacity duration-700`} />

                                <div className="relative">
                                    <div className="flex items-start justify-between mb-10">
                                        <div className={`p-3 rounded-2xl bg-gradient-to-br ${iconGradients[index]} shadow-lg`}>
                                            <Icon className="h-5 w-5 text-white" strokeWidth={2} />
                                        </div>
                                        <ArrowUpRight className="h-5 w-5 text-neutral-400 group-hover:text-black group-hover:translate-x-1 group-hover:-translate-y-1 transition-all duration-500" strokeWidth={2} />
                                    </div>
                                    <div>
                                        <p className="text-xs text-neutral-500 mb-3 font-bold tracking-wider uppercase">{stat.name}</p>
                                        <p className="text-5xl font-bold tracking-tight text-black mb-3">{stat.value}</p>
                                        {stat.change && (
                                            <span className="inline-flex items-center gap-1 text-xs text-neutral-500 font-semibold bg-neutral-100 px-3 py-1 rounded-full">
                                                {stat.change}
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </Link>
                        );
                    })}
                </div>

                {/* Quick Actions - Modern Bento Grid */}
                <div className="mb-20">
                    <h2 className="text-3xl font-bold tracking-tight text-black mb-8 flex items-center gap-3">
                        Quick Actions
                        <span className="flex h-2 w-2 relative">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-black opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-black"></span>
                        </span>
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        {quickActions.map((action, index) => {
                            const Icon = action.icon;
                            const hoverColors = [
                                'group-hover:from-blue-500/5 group-hover:to-purple-500/5',
                                'group-hover:from-green-500/5 group-hover:to-emerald-500/5',
                                'group-hover:from-purple-500/5 group-hover:to-pink-500/5',
                                'group-hover:from-orange-500/5 group-hover:to-yellow-500/5'
                            ];
                            return (
                                <Link
                                    key={action.title}
                                    href={action.href}
                                    className="group relative backdrop-blur-sm bg-white/60 hover:bg-white/90 rounded-3xl p-8 transition-all duration-500 border border-neutral-200/50 hover:border-neutral-300 hover:shadow-2xl hover:shadow-black/5 hover:-translate-y-1 overflow-hidden"
                                >
                                    <div className={`absolute inset-0 bg-gradient-to-br ${hoverColors[index]} opacity-0 group-hover:opacity-100 transition-all duration-500`} />

                                    {action.badge && (
                                        <span className="absolute top-5 right-5 text-[10px] text-black font-bold tracking-wider uppercase px-3 py-1.5 bg-gradient-to-r from-yellow-400 to-orange-400 rounded-full shadow-lg">
                                            {action.badge}
                                        </span>
                                    )}

                                    <div className="relative">
                                        <div className="mb-12 inline-block p-3 rounded-2xl bg-neutral-100 group-hover:bg-black transition-all duration-500 shadow-md group-hover:shadow-xl group-hover:scale-110">
                                            <Icon className="h-6 w-6 text-neutral-600 group-hover:text-white transition-colors duration-500" strokeWidth={2} />
                                        </div>
                                        <h3 className="text-lg font-bold text-black mb-2 tracking-tight">{action.title}</h3>
                                        <p className="text-sm text-neutral-600 font-medium leading-relaxed">{action.description}</p>
                                    </div>
                                </Link>
                            );
                        })}
                    </div>
                </div>

                {/* Profile Completion Banner - Modern Gradient */}
                {!loading && !dashboardData?.profileComplete && (
                    <div className="relative overflow-hidden bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 text-white rounded-3xl p-12 mb-20 shadow-2xl shadow-purple-500/20">
                        {/* Animated gradient overlay */}
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent animate-pulse" />

                        {/* Decorative elements */}
                        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl" />
                        <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/10 rounded-full blur-3xl" />

                        <div className="relative flex flex-col md:flex-row items-center justify-between gap-6">
                            <div>
                                <h3 className="text-2xl font-bold mb-3 tracking-tight">Complete your profile 🎯</h3>
                                <p className="text-base text-white/90 font-medium max-w-md leading-relaxed">
                                    Help us personalize your experience with tailored recommendations and insights
                                </p>
                            </div>
                            <Link
                                href="/profile"
                                className="px-8 py-4 bg-white text-purple-600 text-base font-bold rounded-2xl hover:bg-neutral-100 transition-all duration-300 hover:shadow-2xl hover:shadow-white/30 hover:scale-105 whitespace-nowrap"
                            >
                                Complete now →
                            </Link>
                        </div>
                    </div>
                )}

                {/* Recent Activity - Modern Glass Card */}
                <div>
                    <h2 className="text-3xl font-bold tracking-tight text-black mb-8">Recent Activity</h2>
                    <div className="backdrop-blur-xl bg-white/70 border border-white/50 shadow-xl shadow-black/5 rounded-3xl p-20">
                        <div className="text-center">
                            <div className="inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-gradient-to-br from-neutral-100 to-neutral-200 border border-neutral-300 mb-6 shadow-lg">
                                <Calendar className="h-9 w-9 text-neutral-400" strokeWidth={2} />
                            </div>
                            <p className="text-lg text-neutral-600 font-semibold mb-2 tracking-tight">No activity yet</p>
                            <p className="text-base text-neutral-500 font-medium leading-relaxed">
                                Start a conversation or set a goal to see your progress ✨
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

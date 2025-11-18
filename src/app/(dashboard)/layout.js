'use client';

import { signOut } from 'next-auth/react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
    LayoutDashboard,
    MessageSquare,
    Target,
    Lightbulb,
    User,
    Settings,
    LogOut,
    Menu,
    X,
    Smile
} from 'lucide-react';
import { useState } from 'react';

const navigation = [
    { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { name: 'Chat', href: '/chat', icon: MessageSquare },
    { name: 'Goals', href: '/goals', icon: Target },
    { name: 'Recommendations', href: '/recommendations', icon: Lightbulb },
    { name: 'Mood Tracker', href: '/mood', icon: Smile },
    { name: 'Profile', href: '/profile', icon: User },
];

export default function DashboardLayout({ children }) {
    const pathname = usePathname();
    const [sidebarOpen, setSidebarOpen] = useState(false);

    return (
        <div className="min-h-screen bg-gradient-to-br from-neutral-50 via-white to-neutral-100">
            {/* Animated Background Elements */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-20 right-[10%] w-[500px] h-[500px] bg-gradient-to-br from-blue-50 to-purple-50 rounded-full blur-3xl opacity-30 animate-pulse" />
                <div className="absolute bottom-20 left-[5%] w-[400px] h-[400px] bg-gradient-to-tr from-pink-50 to-orange-50 rounded-full blur-3xl opacity-20" />
            </div>

            {/* Mobile sidebar */}
            <div
                className={`fixed inset-0 z-50 lg:hidden ${sidebarOpen ? 'block' : 'hidden'
                    }`}
            >
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setSidebarOpen(false)} />
                <div className="fixed inset-y-0 left-0 flex w-72 flex-col backdrop-blur-2xl bg-white/90 border-r border-white/20 shadow-2xl">
                    <div className="flex items-center justify-between h-20 px-6 border-b border-neutral-200/50">
                        <div className="flex items-center space-x-3">
                            <div className="text-3xl">🎓</div>
                            <span className="text-xl font-bold bg-gradient-to-r from-black to-neutral-600 bg-clip-text text-transparent">Counsellor</span>
                        </div>
                        <button onClick={() => setSidebarOpen(false)} className="p-2 rounded-xl hover:bg-neutral-100 transition-colors">
                            <X className="h-6 w-6 text-neutral-600" />
                        </button>
                    </div>
                    <nav className="flex-1 px-4 py-6 space-y-2">
                        {navigation.map((item) => {
                            const Icon = item.icon;
                            const isActive = pathname === item.href;
                            return (
                                <Link
                                    key={item.name}
                                    href={item.href}
                                    className={`flex items-center px-5 py-4 text-sm font-semibold rounded-2xl transition-all duration-300 ${isActive
                                        ? 'bg-gradient-to-r from-indigo-500 to-purple-500 text-white shadow-lg shadow-indigo-500/30'
                                        : 'text-neutral-700 hover:bg-neutral-100 hover:translate-x-1'
                                        }`}
                                    onClick={() => setSidebarOpen(false)}
                                >
                                    <Icon className="mr-4 h-5 w-5" strokeWidth={2} />
                                    {item.name}
                                </Link>
                            );
                        })}
                    </nav>
                    <div className="p-4 border-t border-neutral-200/50">
                        <button
                            onClick={() => signOut({ callbackUrl: '/login' })}
                            className="flex items-center w-full px-5 py-4 text-sm font-semibold text-red-600 hover:bg-red-50 rounded-2xl transition-all duration-300"
                        >
                            <LogOut className="mr-4 h-5 w-5" strokeWidth={2} />
                            Sign Out
                        </button>
                    </div>
                </div>
            </div>

            {/* Desktop sidebar */}
            <div className="hidden lg:fixed lg:inset-y-0 lg:flex lg:w-72 lg:flex-col lg:z-40">
                <div className="flex flex-col flex-1 backdrop-blur-2xl bg-white/80 border-r border-white/20 shadow-xl">
                    <div className="flex items-center h-20 px-6 border-b border-neutral-200/50">
                        <div className="text-3xl">🎓</div>
                        <span className="ml-3 text-xl font-bold bg-gradient-to-r from-black to-neutral-600 bg-clip-text text-transparent">Counsellor</span>
                    </div>
                    <nav className="flex-1 px-4 py-6 space-y-2">
                        {navigation.map((item) => {
                            const Icon = item.icon;
                            const isActive = pathname === item.href;
                            return (
                                <Link
                                    key={item.name}
                                    href={item.href}
                                    className={`flex items-center px-5 py-4 text-sm font-semibold rounded-2xl transition-all duration-300 ${isActive
                                        ? 'bg-gradient-to-r from-indigo-500 to-purple-500 text-white shadow-lg shadow-indigo-500/30 scale-105'
                                        : 'text-neutral-700 hover:bg-neutral-100 hover:translate-x-1'
                                        }`}
                                >
                                    <Icon className="mr-4 h-5 w-5" strokeWidth={2} />
                                    {item.name}
                                </Link>
                            );
                        })}
                    </nav>
                    <div className="p-4 border-t border-neutral-200/50">
                        <button
                            onClick={() => signOut({ callbackUrl: '/login' })}
                            className="flex items-center w-full px-5 py-4 text-sm font-semibold text-red-600 hover:bg-red-50 rounded-2xl transition-all duration-300 hover:scale-105"
                        >
                            <LogOut className="mr-4 h-5 w-5" strokeWidth={2} />
                            Sign Out
                        </button>
                    </div>
                </div>
            </div>

            {/* Main content */}
            <div className="lg:pl-72">
                {/* Top bar */}
                <div className="sticky top-0 z-40 flex h-20 backdrop-blur-xl bg-white/70 border-b border-white/20 lg:hidden shadow-sm">
                    <button
                        onClick={() => setSidebarOpen(true)}
                        className="px-6 text-neutral-600 hover:text-black transition-colors"
                    >
                        <Menu className="h-6 w-6" strokeWidth={2} />
                    </button>
                    <div className="flex items-center flex-1 px-4">
                        <div className="text-3xl">🎓</div>
                        <span className="ml-3 text-xl font-bold bg-gradient-to-r from-black to-neutral-600 bg-clip-text text-transparent">Counsellor</span>
                    </div>
                </div>

                {/* Page content */}
                <main className="flex-1 relative z-10">
                    {children}
                </main>
            </div>
        </div>
    );
}

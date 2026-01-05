'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { getCurrentUser, signOut } from '@/lib/auth';
import { getDesigns, deleteDesign } from '@/lib/database';
import { Design } from '@/lib/types';
import {
    Sparkles,
    Plus,
    Folder,
    Settings,
    LogOut,
    User,
    Palette,
    Trash2,
    Edit2,
} from 'lucide-react';

export default function DashboardPage() {
    const router = useRouter();
    const [user, setUser] = useState<any>(null);
    const [designs, setDesigns] = useState<Design[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        setLoading(true);
        const currentUser = await getCurrentUser();
        setUser(currentUser);

        if (currentUser) {
            try {
                const userDesigns = await getDesigns(currentUser.id);
                setDesigns(userDesigns);
            } catch (error) {
                console.error('Error loading designs:', error);
            }
        }
        setLoading(false);
    };

    const handleDeleteDesign = async (id: string) => {
        if (!confirm('Are you sure you want to delete this design?')) return;
        try {
            await deleteDesign(id);
            loadData();
        } catch (error) {
            console.error('Error deleting design:', error);
        }
    };

    const handleSignOut = async () => {
        await signOut();
        router.push('/');
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-purple-50 dark:from-slate-900 dark:to-purple-950">
            {/* Navigation */}
            <nav className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800">
                <div className="max-w-7xl mx-auto px-6 py-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-8">
                            <Link href="/dashboard" className="flex items-center space-x-2">
                                <Sparkles className="w-6 h-6 text-purple-600" />
                                <span className="text-xl font-bold text-slate-900 dark:text-white">
                                    SmartCanvas
                                </span>
                            </Link>

                            <div className="flex items-center space-x-6">
                                <Link
                                    href="/dashboard"
                                    className="text-sm font-medium text-purple-600 dark:text-purple-400"
                                >
                                    My Designs
                                </Link>
                                <Link
                                    href="/dashboard/brand-kits"
                                    className="text-sm font-medium text-slate-600 dark:text-slate-400 hover:text-purple-600 dark:hover:text-purple-400"
                                >
                                    Brand Kits
                                </Link>
                            </div>
                        </div>

                        <div className="flex items-center space-x-4">
                            <button
                                onClick={() => router.push('/editor/new')}
                                className="px-4 py-2 bg-purple-600 text-white rounded-lg font-medium hover:bg-purple-700 transition-colors flex items-center gap-2"
                            >
                                <Plus className="w-4 h-4" />
                                New Design
                            </button>

                            <button
                                onClick={handleSignOut}
                                className="p-2 text-slate-600 dark:text-slate-400 hover:text-red-600 dark:hover:text-red-400"
                            >
                                <LogOut className="w-5 h-5" />
                            </button>
                        </div>
                    </div>
                </div>
            </nav>

            {/* Main Content */}
            <main className="max-w-7xl mx-auto px-6 py-12">
                {/* Welcome Section */}
                <div className="mb-12">
                    <h1 className="text-4xl font-bold text-slate-900 dark:text-white mb-2">
                        Welcome back{user?.email ? `, ${user.email.split('@')[0]}` : ''}!
                    </h1>
                    <p className="text-slate-600 dark:text-slate-400">
                        Start creating amazing designs with AI
                    </p>
                </div>

                {/* Quick Actions */}
                <div className="grid md:grid-cols-2 gap-6 mb-12">
                    <button
                        onClick={() => router.push('/editor/new')}
                        className="group bg-white dark:bg-slate-900 rounded-2xl p-8 border-2 border-dashed border-slate-300 dark:border-slate-700 hover:border-purple-500 dark:hover:border-purple-500 transition-all hover:scale-105"
                    >
                        <div className="w-14 h-14 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center mb-4">
                            <Sparkles className="w-7 h-7 text-white" />
                        </div>
                        <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">
                            AI Layout Wizard
                        </h3>
                        <p className="text-slate-600 dark:text-slate-400">
                            Generate professional layouts from a simple prompt
                        </p>
                    </button>

                    <button
                        onClick={() => router.push('/dashboard/brand-kits')}
                        className="group bg-white dark:bg-slate-900 rounded-2xl p-8 border border-slate-200 dark:border-slate-800 hover:border-purple-500 dark:hover:border-purple-500 transition-all hover:scale-105"
                    >
                        <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center mb-4">
                            <Palette className="w-7 h-7 text-white" />
                        </div>
                        <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">
                            Brand Kits
                        </h3>
                        <p className="text-slate-600 dark:text-slate-400">
                            Manage your brand colors, logos, and fonts
                        </p>
                    </button>
                </div>

                {/* Recent Designs */}
                <div>
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Recent Designs</h2>
                    </div>

                    {designs.length === 0 ? (
                        <div className="bg-white dark:bg-slate-900 rounded-2xl p-12 border border-slate-200 dark:border-slate-800 text-center">
                            <Folder className="w-16 h-16 text-slate-300 dark:text-slate-700 mx-auto mb-4" />
                            <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-2">
                                No designs yet
                            </h3>
                            <p className="text-slate-600 dark:text-slate-400 mb-6">
                                Create your first design with our AI Layout Wizard
                            </p>
                            <button
                                onClick={() => router.push('/editor/new')}
                                className="px-6 py-3 bg-purple-600 text-white rounded-lg font-medium hover:bg-purple-700 transition-colors inline-flex items-center gap-2"
                            >
                                <Plus className="w-4 h-4" />
                                Create First Design
                            </button>
                        </div>
                    ) : (
                        <div className="grid md:grid-cols-3 lg:grid-cols-4 gap-6">
                            {designs.slice(0, 8).map((design) => (
                                <div
                                    key={design.id}
                                    className="bg-white dark:bg-slate-900 rounded-2xl p-4 border border-slate-200 dark:border-slate-800 hover:shadow-lg transition-shadow group"
                                >
                                    <div className="aspect-video bg-gradient-to-br from-purple-100 to-pink-100 dark:from-purple-900/30 dark:to-pink-900/30 rounded-lg mb-3 flex items-center justify-center">
                                        <Sparkles className="w-8 h-8 text-purple-400" />
                                    </div>
                                    <h3 className="font-semibold text-slate-900 dark:text-white truncate mb-1">
                                        {design.name}
                                    </h3>
                                    <p className="text-xs text-slate-500 dark:text-slate-400 mb-3">
                                        {design.format} • {new Date(design.updatedAt || design.createdAt).toLocaleDateString()}
                                    </p>
                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => router.push(`/editor/${design.id}`)}
                                            className="flex-1 py-2 bg-purple-600 text-white rounded-lg text-xs font-medium hover:bg-purple-700 flex items-center justify-center gap-1"
                                        >
                                            <Edit2 className="w-3 h-3" />
                                            Edit
                                        </button>
                                        <button
                                            onClick={() => handleDeleteDesign(design.id)}
                                            className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
}

'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, Palette, Trash2, Edit2, Loader2, ArrowLeft } from 'lucide-react';
import { HexColorPicker } from 'react-colorful';
import { getCurrentUser } from '@/lib/auth';
import { getBrandKits, createBrandKit, deleteBrandKit, updateBrandKit } from '@/lib/database';
import { BrandKit } from '@/lib/types';

export default function BrandKitsPage() {
    const router = useRouter();
    const [user, setUser] = useState<any>(null);
    const [brandKits, setBrandKits] = useState<BrandKit[]>([]);
    const [loading, setLoading] = useState(true);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [newKitName, setNewKitName] = useState('');
    const [newKitColors, setNewKitColors] = useState<string[]>(['#9333ea', '#ec4899', '#f97316']);
    const [currentColorIndex, setCurrentColorIndex] = useState(0);

    // Edit modal state
    const [showEditModal, setShowEditModal] = useState(false);
    const [editingKit, setEditingKit] = useState<BrandKit | null>(null);
    const [editKitName, setEditKitName] = useState('');
    const [editKitColors, setEditKitColors] = useState<string[]>([]);
    const [editColorIndex, setEditColorIndex] = useState(0);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        setLoading(true);
        const currentUser = await getCurrentUser();
        setUser(currentUser);

        if (currentUser) {
            const kits = await getBrandKits(currentUser.id);
            setBrandKits(kits);
        }

        setLoading(false);
    };

    const handleCreateKit = async () => {
        if (!user || !newKitName) return;

        try {
            await createBrandKit({
                userId: user.id,
                name: newKitName,
                colors: newKitColors,
                fonts: [{ family: 'Inter', weights: [400, 700] }],
            });

            setShowCreateModal(false);
            setNewKitName('');
            setNewKitColors(['#9333ea', '#ec4899', '#f97316']);
            loadData();
        } catch (error) {
            console.error('Error creating brand kit:', error);
            alert('Failed to create brand kit');
        }
    };

    const handleDeleteKit = async (id: string) => {
        if (!confirm('Are you sure you want to delete this brand kit?')) return;

        try {
            await deleteBrandKit(id);
            loadData();
        } catch (error) {
            console.error('Error deleting brand kit:', error);
            alert('Failed to delete brand kit');
        }
    };

    const updateColor = (color: string) => {
        const updated = [...newKitColors];
        updated[currentColorIndex] = color;
        setNewKitColors(updated);
    };

    const addColor = () => {
        setNewKitColors([...newKitColors, '#000000']);
        setCurrentColorIndex(newKitColors.length);
    };

    // Edit functions
    const openEditModal = (kit: BrandKit) => {
        setEditingKit(kit);
        setEditKitName(kit.name);
        setEditKitColors([...kit.colors]);
        setEditColorIndex(0);
        setShowEditModal(true);
    };

    const handleUpdateKit = async () => {
        if (!editingKit || !editKitName) return;

        try {
            await updateBrandKit(editingKit.id, {
                name: editKitName,
                colors: editKitColors,
            });

            setShowEditModal(false);
            setEditingKit(null);
            loadData();
        } catch (error) {
            console.error('Error updating brand kit:', error);
            alert('Failed to update brand kit');
        }
    };

    const updateEditColor = (color: string) => {
        const updated = [...editKitColors];
        updated[editColorIndex] = color;
        setEditKitColors(updated);
    };

    const addEditColor = () => {
        setEditKitColors([...editKitColors, '#000000']);
        setEditColorIndex(editKitColors.length);
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-50 to-purple-50 flex items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-purple-600" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-purple-50 dark:from-slate-900 dark:to-purple-950">
            {/* Header */}
            <div className="max-w-7xl mx-auto px-6 py-12">
                <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => router.push('/dashboard')}
                            className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-slate-700 dark:text-slate-300"
                        >
                            <ArrowLeft className="w-5 h-5" />
                        </button>
                        <div>
                            <h1 className="text-4xl font-bold text-slate-900 dark:text-white mb-2">Brand Kits</h1>
                            <p className="text-slate-600 dark:text-slate-400">
                                Manage your brand colors, logos, and fonts
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={() => setShowCreateModal(true)}
                        className="px-6 py-3 bg-purple-600 text-white rounded-lg font-medium hover:bg-purple-700 flex items-center gap-2"
                    >
                        <Plus className="w-5 h-5" />
                        New Brand Kit
                    </button>
                </div>

                {/* Brand Kits Grid */}
                {brandKits.length === 0 ? (
                    <div className="bg-white dark:bg-slate-900 rounded-2xl p-12 border border-slate-200 dark:border-slate-800 text-center">
                        <Palette className="w-16 h-16 text-slate-300 dark:text-slate-700 mx-auto mb-4" />
                        <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-2">
                            No brand kits yet
                        </h3>
                        <p className="text-slate-600 dark:text-slate-400 mb-6">
                            Create your first brand kit to ensure consistent designs
                        </p>
                        <button
                            onClick={() => setShowCreateModal(true)}
                            className="px-6 py-3 bg-purple-600 text-white rounded-lg font-medium hover:bg-purple-700 inline-flex items-center gap-2"
                        >
                            <Plus className="w-4 h-4" />
                            Create Brand Kit
                        </button>
                    </div>
                ) : (
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {brandKits.map((kit) => (
                            <div
                                key={kit.id}
                                className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 hover:shadow-lg transition-shadow"
                            >
                                <div className="flex items-start justify-between mb-4">
                                    <h3 className="text-xl font-bold text-slate-900 dark:text-white">{kit.name}</h3>
                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => openEditModal(kit)}
                                            className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg"
                                        >
                                            <Edit2 className="w-4 h-4 text-slate-600 dark:text-slate-400" />
                                        </button>
                                        <button
                                            onClick={() => handleDeleteKit(kit.id)}
                                            className="p-2 hover:bg-red-100 dark:hover:bg-red-900/20 rounded-lg"
                                        >
                                            <Trash2 className="w-4 h-4 text-red-600" />
                                        </button>
                                    </div>
                                </div>

                                {/* Colors */}
                                <div>
                                    <p className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                                        Brand Colors
                                    </p>
                                    <div className="flex gap-2">
                                        {kit.colors.map((color, idx) => (
                                            <div
                                                key={idx}
                                                className="w-12 h-12 rounded-lg border-2 border-white dark:border-slate-800 shadow-sm"
                                                style={{ backgroundColor: color }}
                                                title={color}
                                            />
                                        ))}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Create Modal */}
            {showCreateModal && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-6">
                    <div className="bg-white dark:bg-slate-900 rounded-2xl p-8 max-w-2xl w-full">
                        <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-6">
                            Create Brand Kit
                        </h2>

                        <div className="space-y-6">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                                    Brand Name
                                </label>
                                <input
                                    type="text"
                                    value={newKitName}
                                    onChange={(e) => setNewKitName(e.target.value)}
                                    className="w-full px-4 py-3 border border-slate-300 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                                    placeholder="e.g., My Awesome Brand"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                                    Brand Colors
                                </label>
                                <div className="flex gap-3 mb-4">
                                    {newKitColors.map((color, idx) => (
                                        <button
                                            key={idx}
                                            onClick={() => setCurrentColorIndex(idx)}
                                            className={`w-16 h-16 rounded-lg border-4 transition-all ${currentColorIndex === idx
                                                ? 'border-purple-600 scale-110'
                                                : 'border-slate-200 dark:border-slate-700'
                                                }`}
                                            style={{ backgroundColor: color }}
                                        />
                                    ))}
                                    <button
                                        onClick={addColor}
                                        className="w-16 h-16 rounded-lg border-2 border-dashed border-slate-300 dark:border-slate-700 hover:border-purple-500 flex items-center justify-center"
                                    >
                                        <Plus className="w-6 h-6 text-slate-400" />
                                    </button>
                                </div>

                                <HexColorPicker
                                    color={newKitColors[currentColorIndex]}
                                    onChange={updateColor}
                                    style={{ width: '100%' }}
                                />
                            </div>

                            <div className="flex gap-4 pt-4">
                                <button
                                    onClick={() => setShowCreateModal(false)}
                                    className="flex-1 px-6 py-3 border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 rounded-lg font-medium hover:bg-slate-100 dark:hover:bg-slate-800"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleCreateKit}
                                    disabled={!newKitName}
                                    className="flex-1 px-6 py-3 bg-purple-600 text-white rounded-lg font-medium hover:bg-purple-700 disabled:opacity-50"
                                >
                                    Create Brand Kit
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Edit Modal */}
            {showEditModal && editingKit && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-6">
                    <div className="bg-white dark:bg-slate-900 rounded-2xl p-8 max-w-2xl w-full">
                        <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-6">
                            Edit Brand Kit
                        </h2>

                        <div className="space-y-6">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                                    Brand Name
                                </label>
                                <input
                                    type="text"
                                    value={editKitName}
                                    onChange={(e) => setEditKitName(e.target.value)}
                                    className="w-full px-4 py-3 border border-slate-300 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                                    placeholder="e.g., My Awesome Brand"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                                    Brand Colors
                                </label>
                                <div className="flex gap-3 mb-4">
                                    {editKitColors.map((color, idx) => (
                                        <button
                                            key={idx}
                                            onClick={() => setEditColorIndex(idx)}
                                            className={`w-16 h-16 rounded-lg border-4 transition-all ${editColorIndex === idx
                                                ? 'border-purple-600 scale-110'
                                                : 'border-slate-200 dark:border-slate-700'
                                                }`}
                                            style={{ backgroundColor: color }}
                                        />
                                    ))}
                                    <button
                                        onClick={addEditColor}
                                        className="w-16 h-16 rounded-lg border-2 border-dashed border-slate-300 dark:border-slate-700 hover:border-purple-500 flex items-center justify-center"
                                    >
                                        <Plus className="w-6 h-6 text-slate-400" />
                                    </button>
                                </div>

                                <HexColorPicker
                                    color={editKitColors[editColorIndex] || '#000000'}
                                    onChange={updateEditColor}
                                    style={{ width: '100%' }}
                                />
                            </div>

                            <div className="flex gap-4 pt-4">
                                <button
                                    onClick={() => {
                                        setShowEditModal(false);
                                        setEditingKit(null);
                                    }}
                                    className="flex-1 px-6 py-3 border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 rounded-lg font-medium hover:bg-slate-100 dark:hover:bg-slate-800"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleUpdateKit}
                                    disabled={!editKitName}
                                    className="flex-1 px-6 py-3 bg-purple-600 text-white rounded-lg font-medium hover:bg-purple-700 disabled:opacity-50"
                                >
                                    Save Changes
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

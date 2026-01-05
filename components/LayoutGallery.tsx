'use client';

import { useState } from 'react';
import { Layout } from '@/lib/types';
import { Loader2 } from 'lucide-react';

interface LayoutGalleryProps {
    layouts: Layout[];
    onSelect: (layout: Layout) => void;
    loading?: boolean;
}

export default function LayoutGallery({ layouts, onSelect, loading }: LayoutGalleryProps) {
    const [selectedId, setSelectedId] = useState<string | null>(null);

    const handleSelect = (layout: Layout) => {
        setSelectedId(layout.id);
        onSelect(layout);
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-purple-600" />
            </div>
        );
    }

    if (layouts.length === 0) {
        return (
            <div className="text-center py-12 text-slate-500">
                No layouts generated yet. Fill in the form and click Generate Layout.
            </div>
        );
    }

    return (
        <div className="space-y-4">
            <h3 className="font-semibold text-slate-900 dark:text-white">Generated Layouts</h3>
            <div className="grid gap-4">
                {layouts.map((layout) => (
                    <button
                        key={layout.id}
                        onClick={() => handleSelect(layout)}
                        className={`relative w-full aspect-video rounded-lg border-2 transition-all overflow-hidden ${selectedId === layout.id
                                ? 'border-purple-600 ring-2 ring-purple-200'
                                : 'border-slate-200 dark:border-slate-700 hover:border-purple-400'
                            }`}
                    >
                        <div
                            className="absolute inset-0"
                            style={{ backgroundColor: layout.backgroundColor || '#ffffff' }}
                        >
                            {/* Simplified preview */}
                            <div className="p-4 space-y-2">
                                {layout.elements.slice(0, 3).map((element, idx) => (
                                    <div
                                        key={idx}
                                        className="h-4 rounded"
                                        style={{
                                            width: `${Math.min(80, (element.width / layout.width) * 100)}%`,
                                            backgroundColor:
                                                element.type === 'text' ? '#333' : element.fill || '#ccc',
                                        }}
                                    />
                                ))}
                            </div>
                        </div>
                        <div className="absolute bottom-0 left-0 right-0 bg-black/50 backdrop-blur-sm text-white p-2 text-sm">
                            {layout.name}
                        </div>
                    </button>
                ))}
            </div>
        </div>
    );
}

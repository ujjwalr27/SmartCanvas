'use client';

import { useState } from 'react';
import { Layout } from '@/lib/types';
import { Wand2, Loader2 } from 'lucide-react';

interface CopyGeneratorProps {
    copyType: 'headline' | 'cta' | 'body';
    productName: string;
    offer?: string;
    targetAudience?: string;
    tone?: 'professional' | 'playful' | 'urgent' | 'casual';
    onSelect: (copy: string) => void;
}

export default function CopyGenerator({
    copyType,
    productName,
    offer,
    targetAudience,
    tone = 'professional',
    onSelect,
}: CopyGeneratorProps) {
    const [suggestions, setSuggestions] = useState<string[]>([]);
    const [loading, setLoading] = useState(false);

    const generateCopy = async () => {
        if (!productName) return;

        setLoading(true);
        try {
            const response = await fetch('/api/ai/generate-copy', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    productName,
                    offer,
                    targetAudience,
                    tone,
                    copyType,
                }),
            });

            if (!response.ok) throw new Error('Failed to generate copy');

            const data = await response.json();
            setSuggestions(data.suggestions || []);
        } catch (error) {
            console.error('Error generating copy:', error);
            alert('Failed to generate copy');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-4">
            <button
                onClick={generateCopy}
                disabled={!productName || loading}
                className="w-full py-3 bg-purple-600 text-white rounded-lg font-medium hover:bg-purple-700 disabled:opacity-50 flex items-center justify-center gap-2"
            >
                {loading ? (
                    <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        Generating...
                    </>
                ) : (
                    <>
                        <Wand2 className="w-5 h-5" />
                        Generate {copyType === 'headline' ? 'Headlines' : copyType === 'cta' ? 'CTAs' : 'Body Copy'}
                    </>
                )}
            </button>

            {suggestions.length > 0 && (
                <div className="space-y-2">
                    <p className="text-sm font-medium text-slate-700 dark:text-slate-300">
                        Select a {copyType}:
                    </p>
                    {suggestions.map((suggestion, idx) => (
                        <button
                            key={idx}
                            onClick={() => onSelect(suggestion)}
                            className="w-full p-3 text-left border border-slate-200 dark:border-slate-700 rounded-lg hover:border-purple-400 hover:bg-purple-50 dark:hover:bg-purple-900/20 transition-colors"
                        >
                            <p className="text-sm text-slate-900 dark:text-white">{suggestion}</p>
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
}

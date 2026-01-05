'use client';

import { useState } from 'react';
import { DesignFormat, FORMAT_SPECS } from '@/lib/types';
import { Loader2 } from 'lucide-react';

interface FormatSelectorProps {
    currentFormat: DesignFormat;
    onFormatChange: (format: DesignFormat) => void;
    disabled?: boolean;
}

export default function FormatSelector({
    currentFormat,
    onFormatChange,
    disabled,
}: FormatSelectorProps) {
    return (
        <div className="space-y-3">
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                Design Format
            </label>
            <div className="grid grid-cols-2 gap-3">
                {Object.entries(FORMAT_SPECS).map(([key, spec]) => (
                    <button
                        key={key}
                        onClick={() => onFormatChange(key as DesignFormat)}
                        disabled={disabled}
                        className={`p-4 rounded-lg border-2 transition-all text-left disabled:opacity-50 ${currentFormat === key
                                ? 'border-purple-600 bg-purple-50 dark:bg-purple-900/20'
                                : 'border-slate-200 dark:border-slate-700 hover:border-purple-400'
                            }`}
                    >
                        <div className="font-semibold text-sm text-slate-900 dark:text-white">
                            {spec.name}
                        </div>
                        <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                            {spec.width} × {spec.height}
                        </div>
                    </button>
                ))}
            </div>
        </div>
    );
}

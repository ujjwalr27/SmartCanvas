'use client';

import { ComplianceViolation } from '@/lib/types';
import { AlertCircle, CheckCircle2, AlertTriangle } from 'lucide-react';

interface CompliancePanelProps {
    violations: ComplianceViolation[];
    passed: boolean;
    onFixViolation?: (violationId: string) => void;
}

export default function CompliancePanel({ violations, passed, onFixViolation }: CompliancePanelProps) {
    if (passed) {
        return (
            <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-6">
                <div className="flex items-center gap-3 mb-2">
                    <CheckCircle2 className="w-6 h-6 text-green-600 dark:text-green-400" />
                    <h3 className="font-semibold text-green-900 dark:text-green-100">
                        Design is Compliant
                    </h3>
                </div>
                <p className="text-sm text-green-700 dark:text-green-300">
                    All checks passed! Your design meets all brand guidelines.
                </p>
            </div>
        );
    }

    const errors = violations.filter((v) => v.severity === 'error');
    const warnings = violations.filter((v) => v.severity === 'warning');

    return (
        <div className="space-y-4">
            {errors.length > 0 && (
                <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-6">
                    <div className="flex items-center gap-3 mb-4">
                        <AlertCircle className="w-6 h-6 text-red-600 dark:text-red-400" />
                        <h3 className="font-semibold text-red-900 dark:text-red-100">
                            {errors.length} Critical {errors.length === 1 ? 'Issue' : 'Issues'}
                        </h3>
                    </div>
                    <div className="space-y-3">
                        {errors.map((violation, idx) => (
                            <div key={idx} className="bg-white dark:bg-slate-900 rounded-lg p-4">
                                <p className="font-medium text-red-900 dark:text-red-100 text-sm mb-1">
                                    {violation.issue}
                                </p>
                                <p className="text-xs text-red-700 dark:text-red-300">
                                    💡 {violation.suggestion}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {warnings.length > 0 && (
                <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-6">
                    <div className="flex items-center gap-3 mb-4">
                        <AlertTriangle className="w-6 h-6 text-yellow-600 dark:text-yellow-400" />
                        <h3 className="font-semibold text-yellow-900 dark:text-yellow-100">
                            {warnings.length} {warnings.length === 1 ? 'Warning' : 'Warnings'}
                        </h3>
                    </div>
                    <div className="space-y-3">
                        {warnings.map((violation, idx) => (
                            <div key={idx} className="bg-white dark:bg-slate-900 rounded-lg p-4">
                                <p className="font-medium text-yellow-900 dark:text-yellow-100 text-sm mb-1">
                                    {violation.issue}
                                </p>
                                <p className="text-xs text-yellow-700 dark:text-yellow-300">
                                    💡 {violation.suggestion}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}

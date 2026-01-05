'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Play, Sparkles, ArrowLeft } from 'lucide-react';

export default function DemoPage() {
    const router = useRouter();
    const [step, setStep] = useState(0);

    const steps = [
        {
            title: 'Welcome to SmartCanvas',
            description: 'Watch how AI transforms a simple prompt into a professional ad design',
            image: '🎨',
        },
        {
            title: 'Step 1: Enter Campaign Details',
            description: 'Just describe your campaign: "Summer Sale - 20% off Ice Cream"',
            image: '✏️',
        },
        {
            title: 'Step 2: AI Generates Layouts',
            description: 'Gemini AI creates multiple professional layout options in seconds',
            image: '🤖',
        },
        {
            title: 'Step 3: Customize Your Design',
            description: 'Edit text, colors, and positions with our intuitive canvas editor',
            image: '🎯',
        },
        {
            title: 'Step 4: Multi-Format Export',
            description: 'One click to resize for Facebook, Instagram, Twitter, and more',
            image: '📱',
        },
        {
            title: 'Step 5: Check Compliance',
            description: 'AI validates your design against brand guidelines automatically',
            image: '✅',
        },
    ];

    return (
        <div className="min-h-screen bg-gradient-to-br from-purple-900 via-indigo-900 to-blue-900">
            <div className="max-w-5xl mx-auto px-6 py-12">
                {/* Header */}
                <button
                    onClick={() => router.push('/')}
                    className="mb-8 flex items-center gap-2 text-purple-200 hover:text-white transition-colors"
                >
                    <ArrowLeft className="w-5 h-5" />
                    Back to Home
                </button>

                {/* Demo Player */}
                <div className="bg-white/10 backdrop-blur-md rounded-2xl p-8 border border-white/20">
                    <div className="text-center mb-8">
                        <div className="text-6xl mb-4">{steps[step].image}</div>
                        <h2 className="text-3xl font-bold text-white mb-3">{steps[step].title}</h2>
                        <p className="text-xl text-purple-100">{steps[step].description}</p>
                    </div>

                    {/* Progress */}
                    <div className="flex gap-2 justify-center mb-8">
                        {steps.map((_, idx) => (
                            <div
                                key={idx}
                                className={`h-2 rounded-full transition-all ${idx === step ? 'w-12 bg-purple-400' : 'w-2 bg-white/30'
                                    }`}
                            />
                        ))}
                    </div>

                    {/* Controls */}
                    <div className="flex gap-4 justify-center">
                        <button
                            onClick={() => setStep(Math.max(0, step - 1))}
                            disabled={step === 0}
                            className="px-6 py-3 bg-white/20 text-white rounded-lg font-medium hover:bg-white/30 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            Previous
                        </button>
                        {step < steps.length - 1 ? (
                            <button
                                onClick={() => setStep(step + 1)}
                                className="px-6 py-3 bg-purple-600 text-white rounded-lg font-medium hover:bg-purple-700 flex items-center gap-2"
                            >
                                Next
                                <Play className="w-5 h-5" />
                            </button>
                        ) : (
                            <button
                                onClick={() => router.push('/auth/signup')}
                                className="px-8 py-3 bg-white text-purple-900 rounded-lg font-bold hover:bg-purple-50 transition-all hover:scale-105 flex items-center gap-2"
                            >
                                <Sparkles className="w-5 h-5" />
                                Get Started Free
                            </button>
                        )}
                    </div>
                </div>

                {/* Features List */}
                <div className="mt-12 grid md:grid-cols-3 gap-6">
                    <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
                        <div className="text-3xl mb-3">⚡</div>
                        <h3 className="text-xl font-bold text-white mb-2">Lightning Fast</h3>
                        <p className="text-purple-100">Generate professional designs in under 5 seconds</p>
                    </div>
                    <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
                        <div className="text-3xl mb-3">🎨</div>
                        <h3 className="text-xl font-bold text-white mb-2">Always On-Brand</h3>
                        <p className="text-purple-100">Automatic compliance with your brand guidelines</p>
                    </div>
                    <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
                        <div className="text-3xl mb-3">🚀</div>
                        <h3 className="text-xl font-bold text-white mb-2">Export Anywhere</h3>
                        <p className="text-purple-100">One design, all social media formats</p>
                    </div>
                </div>
            </div>
        </div>
    );
}

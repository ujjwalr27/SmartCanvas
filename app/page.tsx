'use client';

import { useRouter } from 'next/navigation';
import { Sparkles, Wand2, Palette, Zap } from 'lucide-react';

export default function HomePage() {
    const router = useRouter();

    return (
        <div className="min-h-screen bg-gradient-to-br from-purple-900 via-indigo-900 to-blue-900">
            {/* Hero Section */}
            <div className="relative overflow-hidden">
                {/* Animated background */}
                <div className="absolute inset-0 opacity-20">
                    <div className="absolute top-0 left-0 w-96 h-96 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl animate-blob"></div>
                    <div className="absolute top-0 right-0 w-96 h-96 bg-pink-500 rounded-full mix-blend-multiply filter blur-xl animate-blob animation-delay-2000"></div>
                    <div className="absolute bottom-0 left-1/2 w-96 h-96 bg-blue-500 rounded-full mix-blend-multiply filter blur-xl animate-blob animation-delay-4000"></div>
                </div>

                <div className="relative z-10">
                    {/* Navigation */}
                    <nav className="px-6 py-6 flex justify-between items-center">
                        <div className="flex items-center space-x-2">
                            <Sparkles className="w-8 h-8 text-purple-300" />
                            <span className="text-2xl font-bold text-white">SmartCanvas</span>
                        </div>
                        <div className="flex gap-4">
                            <button
                                onClick={() => router.push('/auth/login')}
                                className="px-6 py-2 text-white hover:text-purple-200 transition-colors"
                            >
                                Login
                            </button>
                            <button
                                onClick={() => router.push('/auth/signup')}
                                className="px-6 py-2 bg-white text-purple-900 rounded-lg font-semibold hover:bg-purple-100 transition-all hover:scale-105"
                            >
                                Get Started Free
                            </button>
                        </div>
                    </nav>

                    {/* Hero Content */}
                    <div className="max-w-7xl mx-auto px-6 py-24 text-center">
                        <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-sm rounded-full border border-white/20 mb-8">
                            <Zap className="w-4 h-4 text-yellow-300" />
                            <span className="text-sm text-purple-100">AI-Powered Design Automation</span>
                        </div>

                        <h1 className="text-6xl md:text-7xl font-bold text-white mb-6 leading-tight">
                            Create Professional Ads
                            <br />
                            <span className="bg-gradient-to-r from-purple-300 via-pink-300 to-orange-300 text-transparent bg-clip-text">
                                in Seconds with AI
                            </span>
                        </h1>

                        <p className="text-xl text-purple-100 mb-12 max-w-3xl mx-auto">
                            SmartCanvas transforms simple inputs into stunning, compliant ad designs.
                            Just describe your campaign, upload a product image, and let AI handle the rest.
                        </p>

                        <div className="flex gap-4 justify-center">
                            <button
                                onClick={() => router.push('/auth/signup')}
                                className="px-8 py-4 bg-white text-purple-900 rounded-xl font-bold text-lg hover:bg-purple-50 transition-all hover:scale-105 shadow-2xl"
                            >
                                Start Creating Free
                            </button>
                            <button
                                onClick={() => router.push('/demo')}
                                className="px-8 py-4 bg-white/10 backdrop-blur-sm text-white border-2 border-white/30 rounded-xl font-bold text-lg hover:bg-white/20 transition-all"
                            >
                                Watch Demo
                            </button>
                        </div>

                        {/* Stats */}
                        <div className="grid grid-cols-3 gap-8 max-w-3xl mx-auto mt-20">
                            <div>
                                <div className="text-4xl font-bold text-white mb-2">10x</div>
                                <div className="text-purple-200">Faster Design</div>
                            </div>
                            <div>
                                <div className="text-4xl font-bold text-white mb-2">100%</div>
                                <div className="text-purple-200">Brand Compliant</div>
                            </div>
                            <div>
                                <div className="text-4xl font-bold text-white mb-2">∞</div>
                                <div className="text-purple-200">Variations</div>
                            </div>
                        </div>
                    </div>

                    {/* Features */}
                    <div className="max-w-7xl mx-auto px-6 py-24">
                        <h2 className="text-4xl font-bold text-white text-center mb-16">
                            Everything You Need to Create Amazing Ads
                        </h2>

                        <div className="grid md:grid-cols-3 gap-8">
                            {/* Feature 1 */}
                            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-8 border border-white/20 hover:bg-white/15 transition-all">
                                <div className="w-14 h-14 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center mb-6">
                                    <Wand2 className="w-7 h-7 text-white" />
                                </div>
                                <h3 className="text-2xl font-bold text-white mb-4">AI Layout Generator</h3>
                                <p className="text-purple-100">
                                    Describe your campaign and watch as AI creates multiple professional layout options instantly.
                                </p>
                            </div>

                            {/* Feature 2 */}
                            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-8 border border-white/20 hover:bg-white/15 transition-all">
                                <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center mb-6">
                                    <Palette className="w-7 h-7 text-white" />
                                </div>
                                <h3 className="text-2xl font-bold text-white mb-4">Brand Kit Integration</h3>
                                <p className="text-purple-100">
                                    Upload your logo, colors, and fonts once. Every design stays perfectly on-brand automatically.
                                </p>
                            </div>

                            {/* Feature 3 */}
                            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-8 border border-white/20 hover:bg-white/15 transition-all">
                                <div className="w-14 h-14 bg-gradient-to-br from-orange-500 to-red-500 rounded-xl flex items-center justify-center mb-6">
                                    <Sparkles className="w-7 h-7 text-white" />
                                </div>
                                <h3 className="text-2xl font-bold text-white mb-4">Multi-Format Export</h3>
                                <p className="text-purple-100">
                                    One click to resize for Facebook, Instagram, Twitter, and more. AI adapts layouts intelligently.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Footer */}
            <footer className="relative z-10 border-t border-white/10 bg-black/20 backdrop-blur-sm">
                <div className="max-w-7xl mx-auto px-6 py-12">
                    <div className="text-center text-purple-200">
                        <p>&copy; 2024 SmartCanvas. Built with AI. Powered by creativity.</p>
                    </div>
                </div>
            </footer>

            <style jsx>{`
        @keyframes blob {
          0%, 100% { transform: translate(0, 0) scale(1); }
          25% { transform: translate(20px, -50px) scale(1.1); }
          50% { transform: translate(-20px, 20px) scale(0.9); }
          75% { transform: translate(50px, 50px) scale(1.05); }
        }
        .animate-blob {
          animation: blob 7s infinite;
        }
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        .animation-delay-4000 {
          animation-delay: 4s;
        }
      `}</style>
        </div>
    );
}

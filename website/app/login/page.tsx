'use client';

import React, { Suspense, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useSearchParams } from 'next/navigation';
import { Mail, Lock, Eye, EyeOff, ArrowRight, UserPlus, Shield } from 'lucide-react';

function LoginForm() {
    const { signInWithGoogle, signInWithEmail, signUpWithEmail, isLoading: authLoading } = useAuth();
    const searchParams = useSearchParams();
    const redirectError = searchParams.get('error');

    const [isSignUp, setIsSignUp] = useState(false);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(redirectError);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);

    const handleGoogleLogin = async () => {
        setIsLoading(true);
        setError(null);
        await signInWithGoogle();
    };

    const handleEmailSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError(null);
        setSuccessMessage(null);

        if (isSignUp) {
            const { error: signUpError } = await signUpWithEmail(email, password);
            if (signUpError) {
                setError(signUpError);
            } else {
                setSuccessMessage('Check your email for a confirmation link.');
                setEmail('');
                setPassword('');
            }
        } else {
            const { error: signInError } = await signInWithEmail(email, password);
            if (signInError) {
                setError(signInError);
            }
        }
        setIsLoading(false);
    };

    const resetState = () => {
        setError(null);
        setSuccessMessage(null);
        setEmail('');
        setPassword('');
    };

    if (authLoading) {
        return (
            <div className="min-h-screen bg-dot-grid flex items-center justify-center">
                <div className="flex items-center gap-4">
                    <div className="w-8 h-8 border-4 border-black border-t-transparent animate-spin" />
                    <span className="font-black uppercase italic text-xl tracking-tighter">Authenticating...</span>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-dot-grid flex items-center justify-center p-4">
            <div className="w-full max-w-lg">
                {/* Header */}
                <div className="text-center mb-8">
                    <h1 className="text-[64px] font-black italic -tracking-widest uppercase leading-none mb-2">
                        NAGARIK
                    </h1>
                    <div className="flex items-center justify-center gap-2">
                        <Shield size={14} className="text-gray-500" />
                        <p className="text-xs font-black uppercase tracking-widest text-gray-500">
                            Municipal Command Center
                        </p>
                    </div>
                </div>

                {/* Login Card */}
                <div className="bg-white border-8 border-black shadow-[16px_16px_0px_0px_rgba(0,0,0,1)]">
                    <div className="border-b-8 border-black p-6 bg-neon-green">
                        <h2 className="text-2xl font-black uppercase italic tracking-tighter">
                            {isSignUp ? 'Officer Registration' : 'System Access'}
                        </h2>
                        <p className="text-sm font-medium mt-1 text-black/70">
                            {isSignUp
                                ? 'Create an account to access the command center.'
                                : 'Authenticate to access civic intelligence systems.'}
                        </p>
                    </div>

                    <div className="p-8 space-y-6">
                        {/* Error Message */}
                        {error && (
                            <div className="border-4 border-red-500 bg-red-50 p-3 flex items-start gap-2">
                                <div className="w-2 h-2 bg-red-500 mt-1.5 flex-shrink-0" />
                                <p className="text-xs font-bold text-red-700 uppercase">{error}</p>
                            </div>
                        )}

                        {/* Success Message */}
                        {successMessage && (
                            <div className="border-4 border-green-500 bg-green-50 p-3 flex items-start gap-2">
                                <div className="w-2 h-2 bg-green-500 mt-1.5 flex-shrink-0" />
                                <p className="text-xs font-bold text-green-700 uppercase">{successMessage}</p>
                            </div>
                        )}

                        {/* Google OAuth */}
                        <button
                            onClick={handleGoogleLogin}
                            disabled={isLoading}
                            className="w-full flex items-center justify-center gap-4 bg-white border-4 border-black p-4 text-lg font-black uppercase italic shadow-brutal hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] active:translate-x-0 active:translate-y-0 active:shadow-none transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isLoading ? (
                                <div className="w-6 h-6 border-4 border-black border-t-transparent animate-spin" />
                            ) : (
                                <>
                                    <div className="bg-white p-1 rounded-sm border-2 border-black flex items-center justify-center flex-shrink-0">
                                        <img
                                            src="https://www.gstatic.com/images/branding/product/1x/gsa_512dp.png"
                                            alt="Google G"
                                            className="w-5 h-5 object-contain"
                                        />
                                    </div>
                                    <span className="whitespace-nowrap">Sign in with Google</span>
                                </>
                            )}
                        </button>

                        {/* Divider */}
                        <div className="flex items-center gap-4">
                            <div className="flex-1 h-1 bg-black" />
                            <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">Or</span>
                            <div className="flex-1 h-1 bg-black" />
                        </div>

                        {/* Email / Password Form */}
                        <form onSubmit={handleEmailSubmit} className="space-y-4">
                            <div className="space-y-1">
                                <label className="text-[10px] font-black uppercase tracking-widest text-gray-500">
                                    Email
                                </label>
                                <div className="relative">
                                    <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                                    <input
                                        type="email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        placeholder="officer@municipal.gov"
                                        required
                                        className="w-full border-4 border-black p-3 pl-10 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-neon-green focus:border-black placeholder:text-gray-300"
                                    />
                                </div>
                            </div>

                            <div className="space-y-1">
                                <label className="text-[10px] font-black uppercase tracking-widest text-gray-500">
                                    Password
                                </label>
                                <div className="relative">
                                    <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                                    <input
                                        type={showPassword ? 'text' : 'password'}
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        placeholder="••••••••"
                                        required
                                        minLength={6}
                                        className="w-full border-4 border-black p-3 pl-10 pr-10 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-neon-green focus:border-black placeholder:text-gray-300"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-black transition-colors"
                                    >
                                        {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                                    </button>
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={isLoading}
                                className="w-full flex items-center justify-center gap-3 bg-black text-white border-4 border-black p-4 font-black uppercase italic text-base shadow-[4px_4px_0px_0px_rgba(0,0,0,0.3)] hover:bg-gray-900 active:translate-y-[2px] active:shadow-none transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {isLoading ? (
                                    <div className="w-5 h-5 border-3 border-white border-t-transparent animate-spin" />
                                ) : (
                                    <>
                                        {isSignUp ? <UserPlus size={18} /> : <ArrowRight size={18} />}
                                        <span>{isSignUp ? 'Create Account' : 'Sign In'}</span>
                                    </>
                                )}
                            </button>
                        </form>

                        {/* Toggle sign-up / sign-in */}
                        <div className="text-center">
                            <button
                                type="button"
                                onClick={() => {
                                    setIsSignUp(!isSignUp);
                                    resetState();
                                }}
                                className="text-xs font-bold text-gray-500 hover:text-black uppercase tracking-wide transition-colors"
                            >
                                {isSignUp
                                    ? '← Already have an account? Sign In'
                                    : 'No account? Create One →'}
                            </button>
                        </div>

                        <div className="pt-2 flex items-center gap-2">
                            <div className="w-2 h-2 bg-neon-orange animate-pulse" />
                            <span className="text-[10px] font-black uppercase tracking-widest">Supabase_Auth_v2</span>
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="text-center mt-6">
                    <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">
                        Nagarik v1.0 — Civic Intelligence Platform
                    </p>
                </div>
            </div>
        </div>
    );
}

// Wrap with Suspense because useSearchParams() requires it in Next.js 14
export default function LoginPage() {
    return (
        <Suspense
            fallback={
                <div className="min-h-screen bg-dot-grid flex items-center justify-center">
                    <div className="flex items-center gap-4">
                        <div className="w-8 h-8 border-4 border-black border-t-transparent animate-spin" />
                        <span className="font-black uppercase italic text-xl tracking-tighter">Loading...</span>
                    </div>
                </div>
            }
        >
            <LoginForm />
        </Suspense>
    );
}

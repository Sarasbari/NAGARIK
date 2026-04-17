'use client';

import React, { useState } from 'react';
import { X } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

interface LoginModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export default function LoginModal({ isOpen, onClose }: LoginModalProps) {
    const { login } = useAuth();
    const [isLoading, setIsLoading] = useState(false);

    if (!isOpen) return null;

    const handleGoogleLogin = () => {
        setIsLoading(true);
        // Simulate Google OAuth delay
        setTimeout(() => {
            login();
            setIsLoading(false);
            onClose();
        }, 1500);
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <div className="bg-white border-8 border-black w-full max-w-md shadow-[16px_16px_0px_0px_rgba(0,0,0,1)] animate-in fade-in zoom-in duration-200">
                <div className="border-b-8 border-black p-6 flex justify-between items-center bg-neon-green">
                    <h2 className="text-3xl font-black uppercase italic tracking-tighter">System Access</h2>
                    <button onClick={onClose} className="p-1 hover:bg-black/10 transition-colors">
                        <X size={32} />
                    </button>
                </div>

                <div className="p-8 space-y-8">
                    <div className="space-y-2">
                        <p className="text-xs font-black uppercase tracking-widest text-gray-400">Authorization Required</p>
                        <h3 className="text-2xl font-black italic tracking-tight">Identity Verification</h3>
                        <p className="text-sm font-medium text-gray-600">Please sign in with your municipal G-Suite account to access the command center.</p>
                    </div>

                    <button
                        onClick={handleGoogleLogin}
                        disabled={isLoading}
                        className="w-full flex items-center justify-center gap-4 bg-white border-4 border-black p-4 text-xl font-black uppercase italic shadow-brutal hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] active:translate-x-0 active:translate-y-0 active:shadow-none transition-all disabled:opacity-50 disabled:cursor-not-allowed group"
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

                    <div className="pt-4 flex items-center gap-2">
                        <div className="w-2 h-2 bg-neon-orange animate-pulse" />
                        <span className="text-[10px] font-black uppercase tracking-widest">Secure_Layer_v4.2</span>
                    </div>
                </div>
            </div>
        </div>
    );
}

'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import LoginModal from './LoginModal';
import {
    LayoutDashboard,
    AlertTriangle,
    Droplets,
    Trash2,
    Flame,
    LogOut,
    User,
    Users,
    Loader2,
    Radar,
    Radio,
} from 'lucide-react';

interface NavItemProps {
    icon: React.ElementType;
    label: string;
    href: string;
}

const NavItem = ({ icon: Icon, label, href }: NavItemProps) => {
    const pathname = usePathname();
    const active = pathname === href;

    return (
        <Link
            href={href}
            className={`w-full flex items-center gap-3 px-4 py-3 border-b-4 border-black transition-all ${active
                ? 'bg-neon-green text-black font-bold'
                : 'hover:bg-gray-100 text-gray-700'
                }`}
        >
            <Icon size={20} className={active ? 'text-black' : 'text-gray-500'} />
            <span className="uppercase tracking-wider text-xs font-black">{label}</span>
        </Link>
    );
};

export default function Sidebar() {
    const { user, isLoggedIn, isLoading, signOut } = useAuth();
    const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
    const [isSigningOut, setIsSigningOut] = useState(false);

    const handleSignOut = async () => {
        setIsSigningOut(true);
        await signOut();
        setIsSigningOut(false);
    };

    // Get display name from Supabase user metadata
    const displayName = user?.user_metadata?.full_name
        || user?.user_metadata?.name
        || user?.email?.split('@')[0]
        || 'Officer';

    // Get avatar URL from Supabase user metadata (Google provides this)
    const avatarUrl = user?.user_metadata?.avatar_url
        || user?.user_metadata?.picture;

    // Generate initials for fallback avatar
    const initials = displayName
        .split(' ')
        .map((n: string) => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2);

    return (
        <aside className="w-64 h-screen border-r-4 border-black bg-white flex flex-col fixed left-0 top-0 z-50">
            <LoginModal isOpen={isLoginModalOpen} onClose={() => setIsLoginModalOpen(false)} />

            <div className="px-6 py-8 border-b-4 border-black flex flex-col justify-center bg-white overflow-hidden">
                <h1 className="text-[40px] font-black italic -tracking-widest uppercase leading-none">NAGARIK</h1>
            </div>

            <nav className="flex-1 overflow-y-auto">
                <NavItem icon={LayoutDashboard} label="Dashboard" href="/" />
                <NavItem icon={AlertTriangle} label="Active Potholes" href="/potholes" />
                <NavItem icon={Droplets} label="Water Leaks" href="/water-leaks" />
                <NavItem icon={Trash2} label="Overflowing Bins" href="/bins" />
                <NavItem icon={Flame} label="Fames" href="/fames" />
                <div className="border-b-4 border-black border-dashed" />
                <NavItem icon={Radar} label="Radar AI" href="/radar" />
                <NavItem icon={Radio} label="Command Center" href="/command" />
                <NavItem icon={Users} label="Unclaimed Works" href="/unclaimed" />
            </nav>

            <div className="p-4 bg-gray-50 border-t-4 border-black">
                {isLoading ? (
                    /* Auth loading skeleton */
                    <div className="flex items-center gap-3 animate-pulse">
                        <div className="w-12 h-12 border-4 border-gray-300 bg-gray-200 flex-shrink-0" />
                        <div className="flex flex-col gap-1">
                            <div className="h-3 w-20 bg-gray-200 rounded" />
                            <div className="h-2 w-14 bg-gray-200 rounded" />
                        </div>
                    </div>
                ) : isLoggedIn && user ? (
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 border-4 border-black bg-neon-green flex-shrink-0 relative overflow-hidden shadow-brutal-sm">
                            {avatarUrl ? (
                                <img src={avatarUrl} alt={displayName} className="w-full h-full object-cover" />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center font-black text-sm">
                                    {initials}
                                </div>
                            )}
                        </div>
                        <div className="flex flex-col min-w-0">
                            <span className="text-sm font-black uppercase tracking-tight leading-none truncate w-32">
                                {displayName}
                            </span>
                            <span className="text-[9px] font-medium text-gray-400 truncate w-32 mt-0.5">
                                {user.email}
                            </span>
                            <button
                                onClick={handleSignOut}
                                disabled={isSigningOut}
                                className="text-[10px] font-bold uppercase text-gray-500 hover:text-neon-orange transition-colors flex items-center gap-1 mt-1 disabled:opacity-50"
                            >
                                {isSigningOut ? (
                                    <Loader2 size={10} className="animate-spin" />
                                ) : (
                                    <LogOut size={10} />
                                )}
                                Log Out
                            </button>
                        </div>
                    </div>
                ) : (
                    <button
                        onClick={() => setIsLoginModalOpen(true)}
                        className="w-full flex items-center justify-center gap-2 border-4 border-black bg-neon-green p-3 font-black uppercase text-xs shadow-brutal hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] active:translate-x-0 active:translate-y-0 active:shadow-none transition-all"
                    >
                        <User size={14} /> Log In
                    </button>
                )}
            </div>
        </aside>
    );
}

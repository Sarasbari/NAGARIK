import React from 'react';
import {
    LayoutDashboard,
    Settings,
    Shield,
    Terminal,
    Network,
    Power,
    LifeBuoy,
    LogOut
} from 'lucide-react';

interface NavItemProps {
    icon: React.ElementType;
    label: string;
    active?: boolean;
}

const NavItem = ({ icon: Icon, label, active }: NavItemProps) => (
    <button
        className={`w-full flex items-center gap-3 px-4 py-3 border-b-4 border-black transition-all ${active
                ? 'bg-neon-green text-black font-bold'
                : 'hover:bg-gray-100 text-gray-700'
            }`}
    >
        <Icon size={20} className={active ? 'text-black' : 'text-gray-500'} />
        <span className="uppercase tracking-wider text-sm">{label}</span>
    </button>
);

export default function Sidebar() {
    return (
        <aside className="w-64 h-screen border-r-4 border-black bg-white flex flex-col fixed left-0 top-0 z-50">
            <div className="p-6 border-b-4 border-black flex flex-col">
                <h1 className="text-2xl font-black italic tracking-tighter uppercase">Infra-Cmd</h1>
                <span className="text-xs font-bold text-gray-500 mt-1">V 2.4.1</span>
            </div>

            <nav className="flex-1 overflow-y-auto">
                <NavItem icon={LayoutDashboard} label="Dashboard" active />
                <NavItem icon={Settings} label="Infrastructure" />
                <NavItem icon={Network} label="Network" />
                <NavItem icon={Shield} label="Security" />
                <NavItem icon={Terminal} label="Terminal" />
            </nav>

            <div className="p-4 flex flex-col gap-3 bg-gray-50 border-t-4 border-black">
                <button className="w-full bg-neon-orange text-white font-black py-4 border-4 border-black shadow-brutal active:translate-x-1 active:translate-y-1 active:shadow-none transition-all uppercase italic">
                    Force Reboot
                </button>

                <div className="flex flex-col gap-1 mt-2">
                    <button className="flex items-center gap-2 text-xs font-bold uppercase hover:text-neon-orange transition-colors">
                        <LifeBuoy size={14} /> Support
                    </button>
                    <button className="flex items-center gap-2 text-xs font-bold uppercase hover:text-neon-orange transition-colors">
                        <LogOut size={14} /> Log Out
                    </button>
                </div>
            </div>
        </aside>
    );
}

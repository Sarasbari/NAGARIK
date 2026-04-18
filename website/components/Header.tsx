import React from 'react';
import { Bell, Settings, User, RefreshCw, Activity } from 'lucide-react';

export default function Header() {
    return (
        <header className="h-20 border-b-4 border-black bg-white flex items-center justify-between px-6 sticky top-0 z-40">
            <div className="flex items-center gap-4">
                <div className="bg-neon-green border-4 border-black px-4 py-1 font-black uppercase text-sm italic tracking-tight">
                    City_Command_Center
                </div>

                <div className="flex items-center gap-6">
                    <div className="flex items-center gap-2 bg-gray-100 border-2 border-black px-3 py-1 rounded-full">
                        <div className="w-2 h-2 bg-neon-green rounded-full animate-pulse" />
                        <span className="text-[10px] font-bold uppercase">System_Online</span>
                    </div>

                    <div className="flex items-center gap-2 bg-gray-100 border-2 border-black px-3 py-1 rounded-full">
                        <RefreshCw size={10} className="animate-spin-slow" />
                        <span className="text-[10px] font-bold uppercase">Data_Synced</span>
                    </div>
                </div>
            </div>

            <nav className="flex items-center gap-8">
                <div className="flex gap-6">
                    <button className="text-xs font-bold uppercase border-b-2 border-neon-green pb-1">Live Feed</button>
                    <button className="text-xs font-bold uppercase text-gray-500 hover:text-black transition-colors">Incidents</button>
                    <button className="text-xs font-bold uppercase text-gray-500 hover:text-black transition-colors">Reports</button>
                </div>

                <div className="h-8 w-[2px] bg-black mx-2" />

                <div className="flex items-center gap-4">
                    <button className="p-1 hover:bg-gray-100 rounded transition-colors"><Bell size={20} /></button>
                    <button className="p-1 hover:bg-gray-100 rounded transition-colors"><Settings size={20} /></button>
                    <div className="w-10 h-10 border-4 border-black bg-gray-200 overflow-hidden">
                        <User className="w-full h-full p-1" />
                    </div>
                </div>
            </nav>
        </header>
    );
}

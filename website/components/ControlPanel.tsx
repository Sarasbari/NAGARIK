import React from 'react';
import {
    Radio,
    Radar,
    AlertTriangle,
    Droplets,
    Trash2,
    Zap,
    ArrowRight
} from 'lucide-react';
import Link from 'next/link';

export default function ControlPanel() {
    return (
        <div className="w-[420px] bg-white border-4 border-black flex flex-col shadow-brutal">
            <div className="p-4 border-b-4 border-black flex items-center gap-2 bg-neon-green">
                <Zap size={18} className="fill-current" />
                <h3 className="font-black uppercase tracking-wider text-sm">Quick Access Menu</h3>
            </div>

            <div className="p-6 space-y-8">
                {/* Core Operations */}
                <div className="space-y-4">
                    <label className="text-[10px] font-black uppercase text-gray-500 tracking-widest block border-b-2 border-black pb-2">Core Operations</label>
                    <Link href="/radar" className="w-full flex justify-between items-center bg-gray-50 border-4 border-black px-6 py-4 font-black uppercase tracking-tight hover:bg-[#ff4444] hover:text-white transition-all group">
                        <div className="flex items-center gap-3">
                            <Radar size={20} className="group-hover:animate-pulse" />
                            Radar (Predictive)
                        </div>
                        <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                    </Link>
                    <Link href="/command" className="w-full flex justify-between items-center bg-neon-green border-4 border-black px-6 py-4 font-black uppercase tracking-tight shadow-brutal-sm hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-brutal transition-all group">
                        <div className="flex items-center gap-3">
                            <Radio size={20} />
                            Command Center (Live)
                        </div>
                        <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                    </Link>
                </div>

                {/* Issue Categories */}
                <div className="space-y-4">
                    <label className="text-[10px] font-black uppercase text-gray-500 tracking-widest block border-b-2 border-dashed border-black pb-2">Category Intel</label>
                    
                    <Link href="/potholes" className="w-full flex justify-between items-center border-2 border-black px-4 py-3 font-bold uppercase text-sm hover:bg-gray-100 transition-colors">
                        <div className="flex items-center gap-2">
                            <AlertTriangle size={16} className="text-neon-orange" />
                            Road Potholes
                        </div>
                    </Link>
                    
                    <Link href="/water-leaks" className="w-full flex justify-between items-center border-2 border-black px-4 py-3 font-bold uppercase text-sm hover:bg-gray-100 transition-colors">
                        <div className="flex items-center gap-2">
                            <Droplets size={16} className="text-blue-500" />
                            Water & Drainage
                        </div>
                    </Link>
                    
                    <Link href="/bins" className="w-full flex justify-between items-center border-2 border-black px-4 py-3 font-bold uppercase text-sm hover:bg-gray-100 transition-colors">
                        <div className="flex items-center gap-2">
                            <Trash2 size={16} className="text-neon-orange" />
                            Overflowing Bins
                        </div>
                    </Link>
                </div>
            </div>
        </div>
    );
}

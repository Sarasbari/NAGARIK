import React from 'react';
import {
    Users,
    Map as MapIcon,
    Navigation,
    ChevronDown,
    Zap
} from 'lucide-react';

export default function ControlPanel() {
    return (
        <div className="w-[420px] bg-white border-4 border-black flex flex-col shadow-brutal">
            <div className="p-4 border-b-4 border-black flex items-center gap-2 bg-gray-50">
                <Zap size={18} className="fill-current" />
                <h3 className="font-black uppercase tracking-wider text-sm">Quick Access Tools</h3>
            </div>

            <div className="p-6 space-y-8">
                {/* Visualization Mode */}
                <div className="space-y-3">
                    <label className="text-[10px] font-black uppercase text-gray-500 tracking-widest">Visualization Mode</label>
                    <div className="flex border-4 border-black">
                        <button className="flex-1 bg-neon-green text-black font-black py-2 uppercase text-xs">Radar Mode</button>
                        <button className="flex-1 bg-white text-gray-400 font-bold py-2 uppercase text-xs border-l-4 border-black">Command Mode</button>
                    </div>
                </div>

                {/* System Filters */}
                <div className="space-y-6">
                    <label className="text-[10px] font-black uppercase text-gray-500 tracking-widest">System Filters</label>

                    <div className="space-y-2">
                        <span className="text-[10px] font-bold uppercase block">Issue Type</span>
                        <button className="w-full flex items-center justify-between border-4 border-black px-4 py-2 font-bold uppercase text-sm">
                            All Infrastructures <ChevronDown size={18} />
                        </button>
                    </div>

                    <div className="space-y-2">
                        <span className="text-[10px] font-bold uppercase block">Severity Threshold</span>
                        <div className="flex gap-2">
                            <button className="flex-1 border-2 border-black py-1 font-bold uppercase text-[10px] hover:bg-gray-100 italic transition-all">Low</button>
                            <button className="flex-1 border-2 border-black py-1 font-bold uppercase text-[10px] hover:bg-gray-100 italic transition-all">Med</button>
                            <button className="flex-1 bg-[#4A1D0D] border-2 border-black text-neon-orange py-1 font-black uppercase text-[10px] italic transition-all">Critical</button>
                        </div>
                    </div>
                </div>

                {/* Ward Assignment */}
                <div className="space-y-2 pb-8 border-b-4 border-black border-dashed">
                    <span className="text-[10px] font-bold uppercase block">Ward Assignment</span>
                    <button className="w-full flex items-center justify-between border-4 border-black px-4 py-2 font-bold uppercase text-sm">
                        District 01 - Downtown <ChevronDown size={18} />
                    </button>
                </div>

                {/* Action Buttons */}
                <div className="space-y-4 pt-4">
                    <button className="w-full flex justify-between items-center border-4 border-black px-6 py-4 font-black uppercase tracking-tight hover:bg-gray-50 transition-all">
                        Assign Crew <Users size={20} />
                    </button>
                    <button className="w-full flex justify-between items-center border-4 border-black px-6 py-4 font-black uppercase tracking-tight hover:bg-gray-50 transition-all">
                        Generate Heatmap <MapIcon size={20} />
                    </button>
                    <button className="w-full flex justify-between items-center bg-neon-green border-4 border-black px-6 py-4 font-black uppercase tracking-tight shadow-brutal-sm hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-brutal transition-all">
                        Auto-Route Units <Navigation size={20} />
                    </button>
                </div>
            </div>
        </div>
    );
}

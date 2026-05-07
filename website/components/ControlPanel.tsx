'use client';

import React, { useState, useEffect } from 'react';
import {
    Radio,
    Radar,
    AlertTriangle,
    Droplets,
    Trash2,
    Zap,
    ArrowRight,
    Clock
} from 'lucide-react';
import Link from 'next/link';
import IssueDetailModal from './IssueDetailModal';

const AcceptedWorkCard = ({ work, onClick }: { work: any; onClick: () => void }) => {
    const [timeLeft, setTimeLeft] = useState<string>('--:--:--');

    useEffect(() => {
        let slaHours = 120;
        const matchStr = `${work.category || ''} ${work.title || ''} ${work.description || ''}`.toLowerCase();
        if (matchStr.includes('garbage') || matchStr.includes('bin') || matchStr.includes('trash')) slaHours = 48;
        else if (matchStr.includes('drain') || matchStr.includes('water leak')) slaHours = 72;
        else if (matchStr.includes('pothole')) slaHours = 192;

        const targetTime = (work.acceptedAt || Date.now()) + (slaHours * 60 * 60 * 1000);

        const updateTimer = () => {
            const now = Date.now();
            const diff = targetTime - now;

            if (diff <= 0) {
                setTimeLeft('BREACHED');
                return;
            }

            const h = Math.floor(diff / (1000 * 60 * 60));
            const m = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
            const s = Math.floor((diff % (1000 * 60)) / 1000);

            setTimeLeft(
                `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`
            );
        };

        updateTimer();
        const intervalId = setInterval(updateTimer, 1000);
        return () => clearInterval(intervalId);
    }, [work]);

    return (
        <div onClick={onClick} className="border-2 border-black p-3 hover:bg-gray-50 transition-colors">
            <div className="flex justify-between items-start mb-2">
                <div className="text-[10px] uppercase font-black text-neon-orange tracking-widest">{work.id}</div>
                <span className={`text-[9px] font-black px-1.5 py-0.5 border border-black uppercase ${
                    work.status === 'CRITICAL' ? 'bg-neon-orange text-black' : 
                    work.status === 'HIGH' ? 'bg-yellow-400 text-black' : 
                    'bg-neon-green text-black'
                }`}>
                    {work.status}
                </span>
            </div>
            
            <div className="font-bold text-sm uppercase tracking-tight truncate border-b border-gray-200 pb-2 mb-2" title={work.title}>{work.title}</div>
            
            <div className="flex justify-between items-center text-xs">
                <div className="text-gray-600 font-medium flex items-center gap-1">
                    <div className="w-1.5 h-1.5 bg-black rounded-full"></div>
                    {work.location}
                </div>
                <div className="flex items-center gap-1 font-black text-[10px] bg-black text-neon-green px-2 py-0.5 shadow-[2px_2px_0px_0px_rgba(0,0,0,0.2)]">
                    <Clock size={10} className={timeLeft !== 'BREACHED' ? 'animate-pulse' : 'text-red-500'} />
                    <span className={timeLeft === 'BREACHED' ? 'text-red-500' : ''}>{timeLeft}</span>
                </div>
            </div>
        </div>
    );
};

export default function ControlPanel() {
    const [myWorks, setMyWorks] = useState<any[]>([]);
    const [selectedWork, setSelectedWork] = useState<any>(null);

    const loadWorks = () => {
        let works = JSON.parse(localStorage.getItem('acceptedWorks') || '[]');
        let needsSave = false;
        
        // Retroactively fix any works accepted before the timestamp update
        works = works.map((w: any) => {
            if (!w.acceptedAt) {
                needsSave = true;
                return { ...w, acceptedAt: Date.now() };
            }
            return w;
        });

        if (needsSave) {
            localStorage.setItem('acceptedWorks', JSON.stringify(works));
        }

        setMyWorks(works);
    };

    useEffect(() => {
        loadWorks();
        window.addEventListener('acceptedWorksChanged', loadWorks);
        return () => window.removeEventListener('acceptedWorksChanged', loadWorks);
    }, []);

    return (
        <div className="w-[420px] h-full relative bg-white border-4 border-black flex flex-col shadow-brutal">
            <IssueDetailModal 
                isOpen={!!selectedWork} 
                onClose={() => setSelectedWork(null)} 
                issue={selectedWork} 
                isAcceptedView={true}
            />
            
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

                {/* My Works */}
                <div className="space-y-4">
                    <label className="text-[10px] font-black uppercase text-gray-500 tracking-widest block border-b-2 border-dashed border-black pb-2">My Works</label>
                    
                    {myWorks.length === 0 ? (
                        <div className="border-2 border-black border-dashed p-6 text-center text-xs font-bold text-gray-500 uppercase">
                            No works accepted yet
                        </div>
                    ) : (
                        <div className="space-y-2 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar cursor-pointer">
                            {myWorks.map((work) => (
                                <AcceptedWorkCard key={work.id} work={work} onClick={() => setSelectedWork(work)} />
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

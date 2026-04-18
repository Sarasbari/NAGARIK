'use client';

import { Award, ShieldCheck, Zap } from 'lucide-react';
import Image from 'next/image';

const HEROES = [
    {
        name: 'Rajesh Kumar',
        achievement: 'Main Pipeline Burst Repair',
        description: 'Single-handedly coordinated the emergency response for the Sec 12 main line burst, saving 2M liters of water.',
        impact: 'CRITICAL LEAK SOLVED',
        tag: 'Infrastructure Hero',
        image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=400&h=400&auto=format&fit=crop',
        color: 'border-neon-orange'
    },
    {
        name: 'Priya Sharma',
        achievement: 'Pothole Neutralization Lead',
        description: 'Identified and verified over 85 potholes in the Indiranagar sector within 48 hours. Coordinated with contractors for 100% resolution.',
        impact: 'ROAD SAFETY CHAMPION',
        tag: 'Road Warrior',
        image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=400&h=400&auto=format&fit=crop',
        color: 'border-neon-green'
    },
    {
        name: 'Suresh Raina',
        achievement: 'Zone 4 Waste Management',
        description: 'Optimized the collection route for 42 overflowing bins in the central market district. Reduced overflow reports by 60%.',
        impact: 'CLEAN CITY ADVOCATE',
        tag: 'Sanitation Pro',
        image: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=400&h=400&auto=format&fit=crop',
        color: 'border-blue-500'
    },
    {
        name: 'Anita Desai',
        achievement: 'Community Alert Pioneer',
        description: 'Implemented the "First-Responder" protocol in her colony, resulting in 15 minute resolution times for minor leakages.',
        impact: 'CITIZEN SCIENTIST',
        tag: 'Top Contributor',
        image: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?q=80&w=400&h=400&auto=format&fit=crop',
        color: 'border-neon-green'
    }
];

function FameCard({ hero }: { hero: typeof HEROES[0] }) {
    return (
        <div className="bg-white border-4 border-black p-6 shadow-brutal flex gap-8 items-start hover:translate-x-[-4px] hover:translate-y-[-4px] hover:shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] transition-all group">
            {/* Big Photo */}
            <div className={`w-48 h-48 border-4 border-black relative overflow-hidden flex-shrink-0 grayscale group-hover:grayscale-0 transition-all`}>
                <img
                    src={hero.image}
                    alt={hero.name}
                    className="w-full h-full object-cover"
                />
                <div className={`absolute top-0 right-0 p-2 bg-black text-white text-[8px] font-black uppercase tracking-[0.2em]`}>
                    VERIFIED_SOLVER
                </div>
            </div>

            {/* Content Area */}
            <div className="flex-1 space-y-4">
                <div className="space-y-1">
                    <div className="flex justify-between items-start">
                        <span className="text-[10px] font-black uppercase tracking-widest bg-black text-white px-2 py-0.5">
                            {hero.tag}
                        </span>
                        <Award className="text-black" size={24} />
                    </div>
                    <h3 className="text-5xl font-black italic tracking-tighter uppercase leading-none mt-2">
                        {hero.name}
                    </h3>
                </div>

                <div className="space-y-2">
                    <div className="flex items-center gap-2">
                        <ShieldCheck size={16} className="text-neon-orange" />
                        <span className="text-xs font-black uppercase tracking-tighter">
                            {hero.achievement}
                        </span>
                    </div>
                    <p className="text-sm font-medium leading-tight text-gray-600 border-l-4 border-black pl-4 py-1 italic">
                        {hero.description}
                    </p>
                </div>

                <div className={`mt-auto border-t-4 border-black pt-4 flex justify-between items-end`}>
                    <div className="space-y-1">
                        <span className="text-[8px] font-black uppercase text-gray-500">IMPACT_METRIC</span>
                        <div className="text-xl font-black italic uppercase tracking-tight">
                            {hero.impact}
                        </div>
                    </div>
                    <div className="flex gap-1">
                        <div className="w-4 h-4 bg-neon-green border-2 border-black" />
                        <div className="w-4 h-4 bg-neon-orange border-2 border-black" />
                        <div className="w-4 h-4 bg-black border-2 border-black" />
                    </div>
                </div>
            </div>
        </div>
    );
}

export default function FamesPage() {
    return (
        <>
                <main className="flex-1 p-8 bg-dot-grid">
                    <div className="max-w-[1400px] mx-auto space-y-12">
                        {/* Page Header Area */}
                        <div className="flex justify-between items-end border-b-8 border-black pb-8">
                            <div className="space-y-2">
                                <div className="text-xs font-black uppercase tracking-[0.3em] text-gray-500 flex items-center gap-4">
                                    <div className="w-12 h-1 bg-black" />
                                    COMMUNITY SOLVERS REGISTRY
                                </div>
                                <h1 className="text-8xl font-black italic tracking-tighter uppercase leading-none">THE_RESOLVERS</h1>
                            </div>
                            <div className="bg-neon-green border-4 border-black p-4 flex flex-col items-center">
                                <span className="text-[10px] font-black uppercase tracking-widest">Total Resolved</span>
                                <span className="text-4xl font-black italic tracking-tighter">4,842</span>
                            </div>
                        </div>

                        {/* 2-Card Grid Layout */}
                        <div className="grid grid-cols-1 xl:grid-cols-2 gap-12">
                            {HEROES.map((hero, idx) => (
                                <FameCard key={idx} hero={hero} />
                            ))}
                        </div>

                        {/* Bottom Footer Section */}
                        <div className="bg-black text-white p-12 flex flex-col md:flex-row justify-between items-center border-4 border-black gap-8">
                            <div className="space-y-2 max-w-xl">
                                <h4 className="text-4xl font-black italic tracking-tighter uppercase leading-none">Become a hero?</h4>
                                <p className="text-sm font-medium italic text-gray-400">
                                    Citizen-led resolution is the backbone of NAGARIK. Report issues, coordinate with teams, and get your name in the Hall of Resolvers.
                                </p>
                            </div>
                            <button className="bg-neon-green text-black px-12 py-6 text-2xl font-black uppercase italic border-4 border-white shadow-[8px_8px_0px_0px_rgba(255,255,255,1)] hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-[12px_12px_0px_0px_rgba(255,255,255,1)] transition-all">
                                SUBMIT_REPORT
                            </button>
                        </div>
                    </div>
                </main>
        </>
    );
}

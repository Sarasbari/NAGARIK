'use client';

import React, { useState } from 'react';
import Sidebar from '@/components/Sidebar';
import Header from '@/components/Header';
import IssueCard from '@/components/IssueCard';
import IssueDetailModal from '@/components/IssueDetailModal';
import { useLocation } from '@/contexts/LocationContext';

const STATS = [
    { label: 'Open Reports', value: '842', bg: 'bg-white', color: 'text-black' },
    { label: 'Major Bursts', value: '15', bg: 'bg-neon-orange', color: 'text-white' },
    { label: 'Resolved Today', value: '45', bg: 'bg-neon-green', color: 'text-black' },
];

const LEAKS = [
    {
        title: 'Main Pipeline Burst - Sector 12',
        description: 'Significant flooding in the basement of nearby apartments. Pressure drop reported in District 03.',
        location: 'Gurgaon',
        subLocation: 'Cyber Hub North',
        timeAgo: '22 Mins Ago',
        status: 'CRITICAL' as const,
        image: 'https://images.unsplash.com/photo-1542013936693-884638332954?q=80&w=200&h=150&auto=format&fit=crop',
        stats: [
            { label: 'Water Loss Rate', value: '450 L/hr', color: 'text-neon-orange' },
            { label: 'Property Risk', value: 'SEVERE', color: 'text-neon-orange' }
        ]
    },
    {
        title: 'Faulty Hydrant Leakage',
        description: 'Valve failure causing continuous water wastage on the main road. Icy patches forming due to low temp.',
        location: 'Shimla',
        subLocation: 'Mall Road',
        timeAgo: '2 Hours Ago',
        status: 'MED' as const,
        image: 'https://images.unsplash.com/photo-1517646281694-2244a0467599?q=80&w=200&h=150&auto=format&fit=crop',
        stats: [
            { label: 'Pipe Pressure', value: '42 PSI', color: 'text-yellow-500' },
            { label: 'Traffic Impact', value: 'MINOR' }
        ]
    },
    {
        title: 'Underground Seepage - Metro Station',
        description: 'Water dripping from ceiling in the concourse area. Structural integrity assessment required.',
        location: 'Kolkata',
        subLocation: 'Park Street Metro',
        timeAgo: '5 Hours Ago',
        status: 'HIGH' as const,
        image: 'https://images.unsplash.com/photo-1521208690623-f4c02931a7f6?q=80&w=200&h=150&auto=format&fit=crop',
        stats: [
            { label: 'Structure Risk', value: 'ELEVATED', color: 'text-yellow-500' },
            { label: 'Repair Scope', value: 'COMPLEX' }
        ]
    }
];

export default function WaterLeaksPage() {
    const [selectedIssue, setSelectedIssue] = useState<any>(null);
    const { selectedCity } = useLocation();

    const filteredLeaks = selectedCity === 'All'
        ? LEAKS
        : LEAKS.filter(leak => leak.location === selectedCity);

    return (
        <div className="min-h-screen bg-white">
            <IssueDetailModal
                isOpen={!!selectedIssue}
                onClose={() => setSelectedIssue(null)}
                issue={selectedIssue}
            />
            <Sidebar />
            <div className="ml-64 flex flex-col min-h-screen">
                <Header title="WATER LEAKS" />

                <main className="flex-1 p-8 bg-dot-grid">
                    <div className="max-w-[1200px] mx-auto space-y-12">
                        {/* Top Stats Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                            {STATS.map((stat) => (
                                <div key={stat.label} className={`${stat.bg} ${stat.color} border-4 border-black p-8 shadow-brutal flex flex-col justify-center`}>
                                    <span className="text-[10px] font-black uppercase tracking-widest mb-2 italic">
                                        {stat.label}
                                    </span>
                                    <div className="text-6xl font-black tracking-tighter">
                                        {stat.value}
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Live Issue Stream Section */}
                        <div className="space-y-6">
                            <div className="flex justify-between items-end border-b-4 border-black border-dashed pb-4">
                                <h2 className="text-4xl font-black tracking-tighter uppercase italic">Live Leakage Stream</h2>
                                <div className="flex gap-4">
                                    <div className="flex items-center gap-2 border-2 border-black px-3 py-1 bg-white">
                                        <div className="w-2 h-2 bg-neon-orange" />
                                        <span className="text-[10px] font-black uppercase">Major Burst</span>
                                    </div>
                                    <div className="flex items-center gap-2 border-2 border-black px-3 py-1 bg-white">
                                        <div className="w-2 h-2 bg-neon-green" />
                                        <span className="text-[10px] font-black uppercase">Minor Seepage</span>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-6">
                                {LEAKS.map((leak, idx) => (
                                    <IssueCard
                                        key={idx}
                                        {...leak}
                                        onClick={() => setSelectedIssue(leak)}
                                    />
                                ))}
                            </div>
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
}

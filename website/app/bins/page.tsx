'use client';

import React, { useState } from 'react';
import Sidebar from '@/components/Sidebar';
import Header from '@/components/Header';
import IssueCard from '@/components/IssueCard';
import IssueDetailModal from '@/components/IssueDetailModal';
import { useLocation } from '@/contexts/LocationContext';

const STATS = [
    { label: 'Open Reports', value: '284', bg: 'bg-white', color: 'text-black' },
    { label: 'Critical Overflow', value: '12', bg: 'bg-neon-orange', color: 'text-white' },
    { label: 'Cleared Today', value: '56', bg: 'bg-neon-green', color: 'text-black' },
];

const BIN_ISSUES = [
    {
        title: 'Public Market Dumpster Overflow',
        description: 'Waste spilling onto pedestrian path. Biological hazard risk due to food waste. Immediate pickup required.',
        location: 'Mumbai',
        subLocation: 'Crawford Market',
        timeAgo: '5 Mins Ago',
        status: 'CRITICAL' as const,
        image: 'https://images.unsplash.com/photo-1532996122724-e3c354a0b15b?q=80&w=200&h=150&auto=format&fit=crop',
        stats: [
            { label: 'Fill Level', value: '110%', color: 'text-neon-orange' },
            { label: 'Bio Hazard', value: 'CRITICAL', color: 'text-neon-orange' }
        ]
    },
    {
        title: 'Residential Bin Max Capacity',
        description: 'Sensor alert: Bin #742 at 98% capacity. Scheduled pickup missed. Overflow expected within 1 hour.',
        location: 'Bangalore',
        subLocation: 'Indiranagar 100ft Rd',
        timeAgo: '45 Mins Ago',
        status: 'HIGH' as const,
        image: 'https://images.unsplash.com/photo-1591336397302-01f8d39c7e0c?q=80&w=200&h=150&auto=format&fit=crop',
        stats: [
            { label: 'Sensor Alert', value: '98%', color: 'text-yellow-500' },
            { label: 'Est. Fill Time', value: '1 HR' }
        ]
    },
    {
        title: 'Illegal Dumping - Coastal Road',
        description: 'Non-designated waste found at bin site. Construction debris blocking bin access.',
        location: 'Chennai',
        subLocation: 'Marina Beach South',
        timeAgo: '3 Hours Ago',
        status: 'MED' as const,
        image: 'https://images.unsplash.com/photo-1618477434951-7f9984687989?q=80&w=200&h=150&auto=format&fit=crop',
        stats: [
            { label: 'Debris Type', value: 'CONSTRUCTION' },
            { label: 'Pickup Delay', value: '+4 HRS', color: 'text-yellow-500' }
        ]
    },
    {
        title: 'Cyber City Corporate Dumping',
        description: 'Uncategorized tech waste overflowing from standard collection bins. Requires hazmat sorting.',
        location: 'Gurgaon',
        subLocation: 'DLF Cyber City',
        timeAgo: '10 Mins Ago',
        status: 'CRITICAL' as const,
        image: 'https://images.unsplash.com/photo-1473445730015-841f29a949ce?q=80&w=200&h=150&auto=format&fit=crop',
        stats: [
            { label: 'E-Waste Level', value: 'HIGH', color: 'text-neon-orange' },
            { label: 'Action Reqd', value: 'HAZMAT TEAM' }
        ]
    },
    {
        title: 'Connaught Place Festival Waste',
        description: 'Post-event cleanup missed. Cardboard and plastic scattered across 500m area. High visibility area.',
        location: 'Delhi',
        subLocation: 'Connaught Place Inner Circle',
        timeAgo: '20 Mins Ago',
        status: 'HIGH' as const,
        image: 'https://images.unsplash.com/photo-1605600659908-0ef719419d41?q=80&w=200&h=150&auto=format&fit=crop',
        stats: [
            { label: 'Spread Area', value: '500m sq', color: 'text-yellow-500' },
            { label: 'Bio Hazard', value: 'MODERATE' }
        ]
    },
    {
        title: 'Tech Park Dumpster Fire Risk',
        description: 'Large cardboard accumulation near smoking zone. Flammable material spilling outward.',
        location: 'Pune',
        subLocation: 'Hinjewadi Phase 2',
        timeAgo: '1 Hour Ago',
        status: 'CRITICAL' as const,
        image: 'https://images.unsplash.com/photo-1611284446314-60a58ac0deb9?q=80&w=200&h=150&auto=format&fit=crop',
        stats: [
            { label: 'Fire Risk', value: 'SEVERE', color: 'text-neon-orange' },
            { label: 'Material', value: 'CARDBOARD' }
        ]
    },
    {
        title: 'Old City Alleyway Blockage',
        description: 'Two full bins overturned, blocking narrow pedestrian alley. Stray animals scattering waste.',
        location: 'Ahmedabad',
        subLocation: 'Manek Chowk',
        timeAgo: '2 Hours Ago',
        status: 'HIGH' as const,
        image: 'https://images.unsplash.com/photo-1528323273322-d81458248d40?q=80&w=200&h=150&auto=format&fit=crop',
        stats: [
            { label: 'Path Blocked', value: 'YES', color: 'text-neon-orange' },
            { label: 'Animal Risk', value: 'HIGH' }
        ]
    },
    {
        title: 'Charminar Food Street Overflow',
        description: 'Weekend food waste exceeding bin capacity by 200%. Foul odor reported by tourists.',
        location: 'Hyderabad',
        subLocation: 'Laad Bazaar',
        timeAgo: '30 Mins Ago',
        status: 'CRITICAL' as const,
        image: 'https://images.unsplash.com/photo-1595278069441-2f29f803e599?q=80&w=200&h=150&auto=format&fit=crop',
        stats: [
            { label: 'Bio Hazard', value: 'CRITICAL', color: 'text-neon-orange' },
            { label: 'Waste Type', value: 'ORGANIC' }
        ]
    },
    {
        title: 'Hooghly Riverfront Illegal Dumping',
        description: 'Private contractors dumping construction waste into municipal bins meant for pedestrians.',
        location: 'Kolkata',
        subLocation: 'Prinsep Ghat',
        timeAgo: '4 Hours Ago',
        status: 'MED' as const,
        image: 'https://images.unsplash.com/photo-1595278069441-2f29f803e599?q=80&w=200&h=150&auto=format&fit=crop',
        stats: [
            { label: 'Violation', value: 'COMMERCIAL', color: 'text-yellow-500' },
            { label: 'Bin Damage', value: 'MINOR' }
        ]
    },
    {
        title: 'Tourist Hub Plastic Accumulation',
        description: 'Hundreds of plastic bottles overflowing from bins near the main palace entrance.',
        location: 'Jaipur',
        subLocation: 'City Palace Gate',
        timeAgo: '15 Mins Ago',
        status: 'HIGH' as const,
        image: 'https://images.unsplash.com/photo-1528323273322-d81458248d40?q=80&w=200&h=150&auto=format&fit=crop',
        stats: [
            { label: 'Plastic Vol', value: 'CRITICAL', color: 'text-yellow-500' },
            { label: 'Recyclable', value: 'YES' }
        ]
    }
];

export default function BinsPage() {
    const [selectedIssue, setSelectedIssue] = useState<any>(null);
    const { selectedCity } = useLocation();

    const filteredIssues = selectedCity === 'All'
        ? BIN_ISSUES
        : BIN_ISSUES.filter(issue => issue.location === selectedCity);

    return (
        <div className="min-h-screen bg-white">
            <IssueDetailModal
                isOpen={!!selectedIssue}
                onClose={() => setSelectedIssue(null)}
                issue={selectedIssue}
            />
            <Sidebar />
            <div className="ml-64 flex flex-col min-h-screen">
                <Header title="OVERFLOWING BINS" />

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
                                <h2 className="text-4xl font-black tracking-tighter uppercase italic">Waste Command Stream</h2>
                                <div className="flex gap-4">
                                    <div className="flex items-center gap-2 border-2 border-black px-3 py-1 bg-white">
                                        <div className="w-2 h-2 bg-neon-orange" />
                                        <span className="text-[10px] font-black uppercase">Critical Level</span>
                                    </div>
                                    <div className="flex items-center gap-2 border-2 border-black px-3 py-1 bg-white">
                                        <div className="w-2 h-2 bg-neon-green" />
                                        <span className="text-[10px] font-black uppercase">High Fill</span>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-6">
                                {filteredIssues.length > 0 ? (
                                    filteredIssues.map((issue, idx) => (
                                        <IssueCard
                                            key={idx}
                                            {...issue}
                                            onClick={() => setSelectedIssue(issue)}
                                        />
                                    ))
                                ) : (
                                    <div className="border-4 border-black p-8 text-center bg-gray-50 italic font-bold">
                                        NO OVERFLOWING BINS DETECTED IN {selectedCity.toUpperCase()}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
}

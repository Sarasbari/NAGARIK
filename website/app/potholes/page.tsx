'use client';

import React, { useState } from 'react';
import Sidebar from '@/components/Sidebar';
import Header from '@/components/Header';
import IssueCard from '@/components/IssueCard';
import IssueDetailModal from '@/components/IssueDetailModal';
import { useLocation } from '@/contexts/LocationContext';
import { AlertCircle, CheckCircle2 } from 'lucide-react';

const STATS = [
    { label: 'Open Reports', value: '1,284', bg: 'bg-white', color: 'text-black' },
    { label: 'Critical Hazard', value: '42', bg: 'bg-neon-orange', color: 'text-white' },
    { label: 'Resolved Today', value: '118', bg: 'bg-neon-green', color: 'text-black' },
];

const ISSUES = [
    {
        title: 'Major Road Crater - NH8 Intersection',
        description: 'Vehicle axle damage reported. Standing water obscures depth. High risk for two-wheelers.',
        location: 'Mumbai',
        subLocation: 'Bandra West',
        timeAgo: '14 Mins Ago',
        status: 'CRITICAL' as const,
        image: 'https://images.unsplash.com/photo-1598371839696-5c5bb00bdc28?q=80&w=200&h=150&auto=format&fit=crop'
    },
    {
        title: 'Sunken Utility Manhole',
        description: 'Sharp metallic edges exposed. Pavement around the cover has completely eroded.',
        location: 'Bangalore',
        subLocation: 'Koramangala 4th Block',
        timeAgo: '1 Hour Ago',
        status: 'HIGH' as const,
        image: 'https://images.unsplash.com/photo-1576085898323-21811b7a0274?q=80&w=200&h=150&auto=format&fit=crop'
    },
    {
        title: 'Series of "Teeth-Rattlers" Near School Zone',
        description: 'Five consecutive deep potholes causing dangerous swerving in a 20km/h zone.',
        location: 'Delhi',
        subLocation: 'RK Puram Sector 5',
        timeAgo: '3 Hours Ago',
        status: 'HIGH' as const,
        image: 'https://images.unsplash.com/photo-1576085898274-069be5a26c58?q=80&w=200&h=150&auto=format&fit=crop'
    },
    {
        title: 'Eroded Shoulder - Flyover Exit',
        description: 'Exit ramp pavement has collapsed at the edges. Dangerous for heavy trucks.',
        location: 'Chennai',
        subLocation: 'Guindy Loop',
        timeAgo: '6 Hours Ago',
        status: 'CRITICAL' as const,
        image: 'https://images.unsplash.com/photo-1598371839841-e94519961601?q=80&w=200&h=150&auto=format&fit=crop'
    }
];

export default function PotholesPage() {
    const [selectedIssue, setSelectedIssue] = useState<any>(null);
    const { selectedCity } = useLocation();

    const filteredIssues = selectedCity === 'All'
        ? ISSUES
        : ISSUES.filter(issue => issue.location === selectedCity);

    return (
        <div className="min-h-screen bg-white">
            <IssueDetailModal
                isOpen={!!selectedIssue}
                onClose={() => setSelectedIssue(null)}
                issue={selectedIssue}
            />
            <Sidebar />
            <div className="ml-64 flex flex-col min-h-screen">
                <Header title="ACTIVE POTHOLES" />

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
                                <h2 className="text-4xl font-black tracking-tighter uppercase italic">Live Issue Stream</h2>
                                <div className="flex gap-4">
                                    <div className="flex items-center gap-2 border-2 border-black px-3 py-1 bg-white">
                                        <div className="w-2 h-2 bg-neon-orange" />
                                        <span className="text-[10px] font-black uppercase">Critical Priority</span>
                                    </div>
                                    <div className="flex items-center gap-2 border-2 border-black px-3 py-1 bg-white">
                                        <div className="w-2 h-2 bg-neon-green" />
                                        <span className="text-[10px] font-black uppercase">High Priority</span>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-6">
                                {ISSUES.map((issue, idx) => (
                                    <IssueCard
                                        key={idx}
                                        {...issue}
                                        onClick={() => setSelectedIssue(issue)}
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

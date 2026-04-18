'use client';

import React, { useState, useEffect } from 'react';

import IssueCard from '@/components/IssueCard';
import IssueDetailModal from '@/components/IssueDetailModal';
import { useLocation } from '@/contexts/LocationContext';
import { createClient } from '@/utils/supabase/client';

interface Complaint {
    id: string;
    title: string;
    description: string;
    area: string;
    city: string;
    state: string;
    status: string;
    upvotes: number;
    image_url: string;
    submitted_at: string;
    landmark: string;
}

function timeAgo(dateStr: string): string {
    const diff = Date.now() - new Date(dateStr).getTime();
    const days = Math.floor(diff / 86400000);
    if (days > 0) return `${days}d ago`;
    const hours = Math.floor(diff / 3600000);
    if (hours > 0) return `${hours}h ago`;
    const mins = Math.floor(diff / 60000);
    return `${mins}m ago`;
}

function mapStatus(status: string, upvotes: number): 'CRITICAL' | 'HIGH' | 'MED' {
    if (status === 'Rejected') return 'MED';
    if (upvotes >= 50) return 'CRITICAL';
    if (upvotes >= 25) return 'HIGH';
    return 'MED';
}

export default function BinsPage() {
    const [selectedIssue, setSelectedIssue] = useState<any>(null);
    const [complaints, setComplaints] = useState<Complaint[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const { selectedCity } = useLocation();

    useEffect(() => {
        const fetchData = async () => {
            const supabase = createClient();
            const { data, error } = await supabase
                .from('complaints')
                .select('*')
                .eq('category', 'Overflowing Garbage')
                .order('submitted_at', { ascending: false });

            if (error) {
                console.error('Error fetching bins:', error.message);
            } else {
                setComplaints(data || []);
            }
            setIsLoading(false);
        };
        fetchData();
    }, []);

    const filteredComplaints = selectedCity === 'All'
        ? complaints
        : complaints.filter(c => c.city === selectedCity);

    const openCount = filteredComplaints.filter(c => c.status === 'Pending').length;
    const criticalCount = filteredComplaints.filter(c => c.upvotes >= 50).length;
    const resolvedCount = filteredComplaints.filter(c => c.status === 'Resolved').length;

    const STATS = [
        { label: 'Open Reports', value: isLoading ? '...' : String(openCount), bg: 'bg-white', color: 'text-black' },
        { label: 'Critical Overflow', value: isLoading ? '...' : String(criticalCount), bg: 'bg-neon-orange', color: 'text-white' },
        { label: 'Cleared', value: isLoading ? '...' : String(resolvedCount), bg: 'bg-neon-green', color: 'text-black' },
    ];

    return (
        <>
            <IssueDetailModal
                isOpen={!!selectedIssue}
                onClose={() => setSelectedIssue(null)}
                issue={selectedIssue}
            />
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
                                    <div className="flex items-center gap-2 px-3 py-1">
                                        <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                                        <span className="text-[10px] font-black uppercase text-green-600">Live</span>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-6">
                                {isLoading ? (
                                    <div className="border-4 border-black p-8 text-center bg-gray-50 animate-pulse">
                                        <span className="font-black uppercase italic">Loading complaints from Supabase...</span>
                                    </div>
                                ) : filteredComplaints.length > 0 ? (
                                    filteredComplaints.map((c) => (
                                        <IssueCard
                                            key={c.id}
                                            title={c.title}
                                            description={c.description}
                                            location={c.city}
                                            subLocation={c.area}
                                            timeAgo={timeAgo(c.submitted_at)}
                                            status={mapStatus(c.status, c.upvotes)}
                                            image={c.image_url || 'https://placehold.co/200x150?text=No+Image'}
                                            onClick={() => setSelectedIssue({
                                                id: c.id,
                                                title: c.title,
                                                description: c.description,
                                                location: c.city,
                                                subLocation: c.area,
                                                latitude: c.latitude,
                                                longitude: c.longitude,
                                                status: mapStatus(c.status, c.upvotes),
                                                image: c.image_url || 'https://placehold.co/600x400?text=No+Image',
                                                date: new Date(c.submitted_at).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }).toUpperCase(),
                                                stats: [
                                                    { label: 'Upvotes', value: String(c.upvotes), color: c.upvotes >= 50 ? 'text-neon-orange' : '' },
                                                    { label: 'Status', value: c.status.toUpperCase(), color: c.status === 'Resolved' ? 'text-green-600' : 'text-yellow-500' },
                                                ],
                                            })}
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
        </>
    );
}

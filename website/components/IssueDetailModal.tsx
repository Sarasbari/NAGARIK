'use client';

import React from 'react';
import { X, MapPin, Check, Ban } from 'lucide-react';

interface IssueDetailModalProps {
    isOpen: boolean;
    onClose: () => void;
    issue: {
        id?: string;
        title: string;
        description: string;
        location: string;
        subLocation: string;
        status: string;
        image: string;
        date?: string;
        reporterName?: string;
        reporterRole?: string;
        reporterDistrict?: string;
        stats?: { label: string; value: string; color?: string }[];
    } | null;
}

export default function IssueDetailModal({ isOpen, onClose, issue }: IssueDetailModalProps) {
    if (!isOpen || !issue) return null;

    const statusColor = issue.status === 'CRITICAL' ? 'bg-neon-orange' :
        (issue.status === 'HIGH' ? 'bg-yellow-400' : 'bg-neon-green');

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm overflow-y-auto">
            <div className="bg-white border-8 border-black w-full max-w-5xl shadow-[16px_16px_0px_0px_rgba(0,0,0,1)] animate-in fade-in zoom-in duration-200 my-auto">

                {/* Header Section */}
                <div className="bg-black text-white relative">
                    <button
                        onClick={onClose}
                        className="absolute top-4 right-4 text-white hover:text-neon-orange transition-colors"
                    >
                        <X size={32} />
                    </button>

                    <div className="p-6 pr-20 flex justify-between items-end">
                        <div className="space-y-4">
                            <div className={`inline-block ${statusColor} text-black font-black px-3 py-1 text-xs uppercase tracking-widest border-2 border-black`}>
                                ID: {issue.id || `PTH-${Math.floor(Math.random() * 9000) + 1000}`} // PRIORITY {issue.status}
                            </div>
                            <h2 className="text-4xl md:text-5xl font-black uppercase tracking-tighter italic">
                                {issue.title}
                            </h2>
                        </div>
                        <div className="text-right hidden md:block">
                            <div className="text-neon-green font-black text-2xl uppercase tracking-tighter">
                                {issue.date || '17 APR 2026'}
                            </div>
                            <div className="text-gray-400 font-bold text-sm tracking-widest">
                                14:23:45 IST
                            </div>
                        </div>
                    </div>
                </div>

                {/* Body Section */}
                <div className="grid grid-cols-1 md:grid-cols-2 border-t-8 border-black bg-white">

                    {/* Left Column (Evidence & Location) */}
                    <div className="border-r-0 md:border-r-8 border-black flex flex-col">
                        <div className="p-6 border-b-8 border-black flex-1">
                            <div className="relative border-4 border-black aspect-[4/3] bg-gray-200">
                                <div className="absolute top-4 left-4 bg-black text-white text-[10px] font-black uppercase tracking-widest px-3 py-1 border-2 border-white z-10 flex items-center gap-2">
                                    <div className="w-2 h-2 rounded-full bg-neon-orange animate-pulse" />
                                    Field Evidence
                                </div>
                                <img src={issue.image} alt="Evidence" className="w-full h-full object-cover" />
                            </div>
                        </div>

                        <div className="p-6 bg-gray-100 flex-1">
                            <div className="flex justify-between items-center mb-4">
                                <h3 className="font-black uppercase tracking-tighter text-xl">Exact Location</h3>
                                <div className="bg-black text-white px-3 py-1 text-[10px] font-black uppercase tracking-widest">
                                    COORD: 19.1136° N, 72.8297° E
                                </div>
                            </div>
                            <div className="border-4 border-black h-48 bg-gray-300 relative flex items-center justify-center overflow-hidden">
                                {/* Simulated map background with a grid to look tactical */}
                                <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(#000 1px, transparent 1px)', backgroundSize: '20px 20px' }}></div>
                                <div className="border-4 border-neon-orange p-2 animate-pulse bg-white/50 backdrop-blur-sm z-10">
                                    <MapPin size={32} className="text-neon-orange fill-neon-orange" />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right Column (Intel & Actions) */}
                    <div className="flex flex-col">
                        <div className="p-6 border-b-4 border-black bg-neon-green/10">
                            <h3 className="text-xs font-black text-gray-500 uppercase tracking-widest border-b-2 border-black pb-2 mb-4">
                                Reporter Intel
                            </h3>
                            <div className="flex items-center gap-4">
                                <div className="w-16 h-16 border-4 border-black bg-gray-200 flex-shrink-0 relative overflow-hidden">
                                    <img
                                        src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=200&h=200&auto=format&fit=crop"
                                        alt="Reporter"
                                        className="w-full h-full object-cover grayscale"
                                    />
                                </div>
                                <div>
                                    <div className="text-2xl font-black uppercase tracking-tighter">
                                        {issue.reporterName || 'Arjun Mehta'}
                                    </div>
                                    <div className="flex flex-col gap-1 mt-1">
                                        <span className="bg-black text-neon-green text-[10px] font-black px-2 py-0.5 uppercase tracking-widest self-start flex items-center gap-1">
                                            <Check size={10} /> {issue.reporterRole || 'Trusted Reporter'}
                                        </span>
                                        <span className="text-xs font-bold text-gray-600 flex items-center gap-1 -ml-1">
                                            <MapPin size={12} /> {issue.location} District
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="p-6 flex-1 bg-white">
                            <h3 className="text-xs font-black text-gray-500 uppercase tracking-widest border-b-2 border-black pb-2 mb-4">
                                Field Assessment
                            </h3>
                            <div className="bg-gray-100 border-4 border-black p-6 mb-6">
                                <p className="font-medium text-gray-700 text-sm leading-relaxed">
                                    "{issue.description}"
                                </p>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                {issue.stats ? (
                                    issue.stats.map((stat, idx) => (
                                        <div key={idx} className="border-4 border-black p-3">
                                            <div className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1">{stat.label}</div>
                                            <div className={`text-lg md:text-xl font-black uppercase tracking-tighter ${stat.color || ''}`}>
                                                {stat.value}
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <>
                                        <div className="border-4 border-black p-3">
                                            <div className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1">Estimated Size</div>
                                            <div className="text-xl font-black uppercase tracking-tighter">3ft x 4ft</div>
                                        </div>
                                        <div className="border-4 border-black p-3">
                                            <div className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1">Traffic Impact</div>
                                            <div className={`text-xl font-black uppercase tracking-tighter ${statusColor.replace('bg-', 'text-')}`}>
                                                SEVERE
                                            </div>
                                        </div>
                                    </>
                                )}
                            </div>
                        </div>

                        <div className="p-6 border-t-8 border-black grid grid-cols-2 gap-6 bg-gray-50">
                            <button
                                onClick={onClose}
                                className="flex items-center justify-center gap-2 bg-neon-green border-8 border-black p-4 text-2xl font-black uppercase shadow-brutal hover:translate-x-[-4px] hover:translate-y-[-4px] hover:shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] active:translate-x-0 active:translate-y-0 active:shadow-none transition-all"
                            >
                                <Check size={28} /> Accept
                            </button>
                            <button
                                onClick={onClose}
                                className="flex items-center justify-center gap-2 bg-neon-orange border-8 border-black p-4 text-2xl font-black uppercase shadow-brutal hover:translate-x-[-4px] hover:translate-y-[-4px] hover:shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] active:translate-x-0 active:translate-y-0 active:shadow-none transition-all"
                            >
                                <Ban size={28} /> Ignore
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

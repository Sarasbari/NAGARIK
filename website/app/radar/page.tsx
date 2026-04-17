'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
    MapContainer,
    TileLayer,
    CircleMarker,
    Popup,
    ZoomControl,
    useMapEvents,
} from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import Sidebar from '@/components/Sidebar';
import Header from '@/components/Header';
import { createClient } from '@/utils/supabase/client';
import { heatWeight } from '@/utils/routeOptimizer';
import {
    Radar as RadarIcon,
    Shield,
    AlertTriangle,
    Truck,
    CheckCircle2,
    X,
    MapPin,
    Zap,
    Activity,
} from 'lucide-react';

// ─── Types ──────────────────────────────────────────────────────────

interface Complaint {
    id: string;
    category: string;
    title: string;
    area: string;
    city: string;
    latitude: number;
    longitude: number;
    upvotes: number;
    status: string;
    submitted_at: string;
}

interface RiskZone {
    id: string;
    center: [number, number];
    radius: number;
    intensity: number; // 0-1
    complaints: Complaint[];
    area: string;
    city: string;
}

// ─── Risk Zone Clustering ───────────────────────────────────────────

function clusterIntoZones(complaints: Complaint[], radiusKm = 2): RiskZone[] {
    const zones: RiskZone[] = [];
    const used = new Set<string>();

    // Sort by weight (highest first)
    const sorted = [...complaints].sort((a, b) => {
        const wa = heatWeight(a.upvotes, a.submitted_at);
        const wb = heatWeight(b.upvotes, b.submitted_at);
        return wb - wa;
    });

    for (const complaint of sorted) {
        if (used.has(complaint.id)) continue;

        const cluster: Complaint[] = [];
        for (const other of sorted) {
            if (used.has(other.id)) continue;
            const dist = haversineDist(
                complaint.latitude, complaint.longitude,
                other.latitude, other.longitude
            );
            if (dist <= radiusKm) {
                cluster.push(other);
                used.add(other.id);
            }
        }

        if (cluster.length > 0) {
            const avgLat = cluster.reduce((s, c) => s + c.latitude, 0) / cluster.length;
            const avgLng = cluster.reduce((s, c) => s + c.longitude, 0) / cluster.length;
            const totalWeight = cluster.reduce((s, c) => s + heatWeight(c.upvotes, c.submitted_at), 0);
            const maxWeight = Math.max(...cluster.map(c => heatWeight(c.upvotes, c.submitted_at)));

            zones.push({
                id: `zone-${zones.length}`,
                center: [avgLat, avgLng],
                radius: Math.max(500, cluster.length * 200),
                intensity: Math.min(1, totalWeight / (cluster.length * 0.5)),
                complaints: cluster,
                area: cluster[0].area,
                city: cluster[0].city,
            });
        }
    }

    return zones;
}

function haversineDist(lat1: number, lng1: number, lat2: number, lng2: number): number {
    const R = 6371;
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lng2 - lng1) * Math.PI / 180;
    const a = Math.sin(dLat / 2) ** 2 +
        Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
        Math.sin(dLon / 2) ** 2;
    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function riskColor(intensity: number): string {
    if (intensity >= 0.7) return '#ef4444';
    if (intensity >= 0.5) return '#f97316';
    if (intensity >= 0.3) return '#eab308';
    return '#22c55e';
}

function riskLabel(intensity: number): string {
    if (intensity >= 0.7) return 'CRITICAL';
    if (intensity >= 0.5) return 'HIGH';
    if (intensity >= 0.3) return 'MEDIUM';
    return 'LOW';
}

// ─── Component ──────────────────────────────────────────────────────

export default function RadarPage() {
    const [complaints, setComplaints] = useState<Complaint[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [selectedZone, setSelectedZone] = useState<RiskZone | null>(null);
    const [dispatching, setDispatching] = useState(false);
    const [dispatched, setDispatched] = useState<Set<string>>(new Set());

    useEffect(() => {
        const fetch_ = async () => {
            const supabase = createClient();
            const { data, error } = await supabase
                .from('reports')
                .select('id, issue_type, ward, latitude, longitude, status, created_at, severity')
                .not('latitude', 'is', null)
                .not('longitude', 'is', null);
            if (!error && data) {
                const mappedData: Complaint[] = data.map(r => ({
                    id: r.id,
                    category: r.issue_type,
                    title: r.issue_type,
                    area: r.ward || 'Unknown Ward',
                    city: 'Mumbai', // Hardcoded fallback for now
                    latitude: r.latitude,
                    longitude: r.longitude,
                    upvotes: r.severity * 10,
                    status: 'Pending',
                    submitted_at: r.created_at
                }));
                setComplaints(mappedData);
            }
            setIsLoading(false);
        };
        fetch_();
    }, []);

    const zones = useMemo(() => clusterIntoZones(complaints), [complaints]);

    const stats = useMemo(() => ({
        totalZones: zones.length,
        criticalZones: zones.filter(z => z.intensity >= 0.7).length,
        highZones: zones.filter(z => z.intensity >= 0.5 && z.intensity < 0.7).length,
        totalIssues: complaints.length,
    }), [zones, complaints]);

    const handleDispatch = useCallback(async (zone: RiskZone) => {
        setDispatching(true);
        // Simulate dispatch delay
        await new Promise(r => setTimeout(r, 1500));
        setDispatched(prev => new Set(prev).add(zone.id));
        setDispatching(false);
        setSelectedZone(null);
    }, []);

    return (
        <div className="min-h-screen bg-white">
            <Sidebar />
            <div className="ml-64 flex flex-col min-h-screen">
                <Header title="RADAR — PREDICTIVE AI" />

                <main className="flex-1 p-8 bg-dot-grid">
                    <div className="max-w-[1600px] mx-auto space-y-6">

                        {/* Stats Row */}
                        <div className="grid grid-cols-4 gap-4">
                            <div className="bg-white border-4 border-black p-5 shadow-brutal">
                                <span className="text-[10px] font-black uppercase tracking-widest text-gray-500 italic">Risk Zones</span>
                                <div className="text-4xl font-black tracking-tighter">{stats.totalZones}</div>
                            </div>
                            <div className="bg-red-500 text-white border-4 border-black p-5 shadow-brutal">
                                <span className="text-[10px] font-black uppercase tracking-widest italic">Critical</span>
                                <div className="text-4xl font-black tracking-tighter">{stats.criticalZones}</div>
                            </div>
                            <div className="bg-orange-500 text-white border-4 border-black p-5 shadow-brutal">
                                <span className="text-[10px] font-black uppercase tracking-widest italic">High Risk</span>
                                <div className="text-4xl font-black tracking-tighter">{stats.highZones}</div>
                            </div>
                            <div className="bg-neon-green border-4 border-black p-5 shadow-brutal">
                                <span className="text-[10px] font-black uppercase tracking-widest italic">Dispatched</span>
                                <div className="text-4xl font-black tracking-tighter">{dispatched.size}</div>
                            </div>
                        </div>

                        {/* Map + Panel */}
                        <div className="flex gap-6" style={{ height: '65vh' }}>

                            {/* Map */}
                            <div className="flex-1 border-4 border-black shadow-brutal relative overflow-hidden bg-black">
                                {isLoading && (
                                    <div className="absolute inset-0 z-[2000] bg-black/80 flex items-center justify-center">
                                        <div className="flex items-center gap-3">
                                            <div className="w-5 h-5 border-2 border-white border-t-transparent animate-spin rounded-full" />
                                            <span className="text-white text-xs font-black uppercase tracking-widest">Scanning decay zones...</span>
                                        </div>
                                    </div>
                                )}

                                <MapContainer
                                    center={[22.5, 78.9]}
                                    zoom={5}
                                    scrollWheelZoom={true}
                                    className="h-full w-full"
                                    zoomControl={false}
                                    style={{ background: '#0a0a0a' }}
                                >
                                    <TileLayer
                                        url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
                                        attribution="&copy; CARTO"
                                    />
                                    <ZoomControl position="bottomright" />

                                    {/* Risk Zone Circles */}
                                    {zones.map(zone => {
                                        const isDispatched = dispatched.has(zone.id);
                                        const color = isDispatched ? '#22c55e' : riskColor(zone.intensity);
                                        return (
                                            <CircleMarker
                                                key={zone.id}
                                                center={zone.center}
                                                radius={Math.max(15, zone.complaints.length * 6)}
                                                pathOptions={{
                                                    fillColor: color,
                                                    fillOpacity: isDispatched ? 0.15 : zone.intensity * 0.5,
                                                    color: color,
                                                    weight: isDispatched ? 1 : 2,
                                                    opacity: isDispatched ? 0.3 : 0.8,
                                                }}
                                                eventHandlers={{
                                                    click: () => setSelectedZone(zone),
                                                }}
                                            >
                                                <Popup>
                                                    <div className="font-sans text-xs">
                                                        <span className="font-black uppercase" style={{ color }}>{riskLabel(zone.intensity)} RISK</span>
                                                        <p className="text-gray-600 mt-1">{zone.area}, {zone.city}</p>
                                                        <p className="text-gray-500">{zone.complaints.length} issues in zone</p>
                                                    </div>
                                                </Popup>
                                            </CircleMarker>
                                        );
                                    })}

                                    {/* Individual complaint dots (smaller) */}
                                    {complaints.map(c => (
                                        <CircleMarker
                                            key={`dot-${c.id}`}
                                            center={[c.latitude, c.longitude]}
                                            radius={3}
                                            pathOptions={{
                                                fillColor: '#fff',
                                                fillOpacity: 0.4,
                                                stroke: false,
                                            }}
                                        />
                                    ))}

                                    {/* Map Legend */}
                                    <div className="absolute bottom-6 left-6 z-[1000] bg-black/80 backdrop-blur-md border border-white/10 rounded-xl p-4 shadow-2xl">
                                        <div className="flex items-center gap-2 mb-3">
                                            <RadarIcon size={13} className="text-red-400" />
                                            <span className="text-[9px] font-black uppercase tracking-[0.2em] text-white">Decay Risk Index</span>
                                            <div className="w-1.5 h-1.5 bg-red-400 rounded-full animate-pulse ml-auto" />
                                        </div>
                                        <div className="flex flex-col gap-1.5">
                                            {[
                                                { label: 'CRITICAL', color: '#ef4444' },
                                                { label: 'HIGH', color: '#f97316' },
                                                { label: 'MEDIUM', color: '#eab308' },
                                                { label: 'LOW', color: '#22c55e' },
                                            ].map(l => (
                                                <div key={l.label} className="flex items-center gap-2">
                                                    <div className="w-3 h-3 rounded-full" style={{ background: l.color, boxShadow: `0 0 6px ${l.color}80` }} />
                                                    <span className="text-[8px] font-bold uppercase text-white/60 tracking-wider">{l.label}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </MapContainer>
                            </div>

                            {/* Dispatch Panel */}
                            <div className="w-[380px] border-4 border-black bg-white shadow-brutal flex flex-col overflow-hidden">
                                <div className="p-4 border-b-4 border-black bg-gray-50 flex items-center gap-2">
                                    <Shield size={18} />
                                    <h3 className="font-black uppercase tracking-wider text-sm">Zone Intel</h3>
                                </div>

                                <div className="flex-1 overflow-y-auto p-4 space-y-3">
                                    {selectedZone ? (
                                        <>
                                            {/* Selected Zone Detail */}
                                            <div className="border-4 border-black p-4" style={{ borderLeftColor: riskColor(selectedZone.intensity), borderLeftWidth: 8 }}>
                                                <div className="flex items-center justify-between mb-2">
                                                    <span className="text-[10px] font-black uppercase tracking-widest px-2 py-0.5 border-2 border-black" style={{ background: riskColor(selectedZone.intensity), color: 'white' }}>
                                                        {riskLabel(selectedZone.intensity)} RISK
                                                    </span>
                                                    <button onClick={() => setSelectedZone(null)} className="text-gray-400 hover:text-black">
                                                        <X size={14} />
                                                    </button>
                                                </div>
                                                <h4 className="text-lg font-black uppercase tracking-tight">{selectedZone.area}</h4>
                                                <p className="text-xs text-gray-500 font-bold">{selectedZone.city}</p>

                                                <div className="grid grid-cols-2 gap-3 mt-4">
                                                    <div className="border-2 border-black p-2 text-center">
                                                        <div className="text-2xl font-black">{selectedZone.complaints.length}</div>
                                                        <div className="text-[8px] font-black uppercase text-gray-500 tracking-widest">Issues</div>
                                                    </div>
                                                    <div className="border-2 border-black p-2 text-center">
                                                        <div className="text-2xl font-black">{Math.round(selectedZone.intensity * 100)}%</div>
                                                        <div className="text-[8px] font-black uppercase text-gray-500 tracking-widest">Risk Score</div>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Issues in Zone */}
                                            <div>
                                                <p className="text-[9px] font-black uppercase tracking-widest text-gray-400 mb-2">Issues in Zone</p>
                                                <div className="space-y-1.5 max-h-40 overflow-y-auto">
                                                    {selectedZone.complaints.map(c => (
                                                        <div key={c.id} className="border-2 border-black p-2 flex items-start gap-2">
                                                            <AlertTriangle size={12} className="text-orange-500 mt-0.5 shrink-0" />
                                                            <div>
                                                                <p className="text-[10px] font-bold leading-tight">{c.title}</p>
                                                                <p className="text-[9px] text-gray-400">{c.category} · {c.upvotes} upvotes</p>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>

                                            {/* Dispatch Button */}
                                            {dispatched.has(selectedZone.id) ? (
                                                <div className="border-4 border-black bg-neon-green p-4 flex items-center gap-3">
                                                    <CheckCircle2 size={24} />
                                                    <div>
                                                        <p className="font-black uppercase text-sm">Crew Dispatched</p>
                                                        <p className="text-[10px] font-bold">Preventive sealant crew en route</p>
                                                    </div>
                                                </div>
                                            ) : (
                                                <button
                                                    onClick={() => handleDispatch(selectedZone)}
                                                    disabled={dispatching}
                                                    className="w-full bg-neon-orange border-4 border-black p-4 font-black uppercase text-sm shadow-brutal hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] active:translate-x-0 active:translate-y-0 active:shadow-none transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                                                >
                                                    {dispatching ? (
                                                        <>
                                                            <div className="w-4 h-4 border-2 border-black border-t-transparent animate-spin rounded-full" />
                                                            Dispatching...
                                                        </>
                                                    ) : (
                                                        <>
                                                            <Truck size={18} />
                                                            Dispatch Preventive Crew
                                                        </>
                                                    )}
                                                </button>
                                            )}
                                        </>
                                    ) : (
                                        /* No zone selected */
                                        <div className="flex flex-col items-center justify-center h-full text-center">
                                            <div className="w-16 h-16 border-4 border-black bg-gray-100 flex items-center justify-center mb-4">
                                                <MapPin size={28} className="text-gray-400" />
                                            </div>
                                            <p className="font-black uppercase text-sm tracking-tight">Select a Risk Zone</p>
                                            <p className="text-[10px] text-gray-500 font-bold mt-1 max-w-[200px]">
                                                Click any colored circle on the map to view zone intel and dispatch a crew.
                                            </p>
                                        </div>
                                    )}
                                </div>

                                {/* Zone List */}
                                <div className="border-t-4 border-black p-4 bg-gray-50 max-h-48 overflow-y-auto">
                                    <p className="text-[9px] font-black uppercase tracking-widest text-gray-400 mb-2">All Zones ({zones.length})</p>
                                    <div className="space-y-1">
                                        {zones.slice(0, 10).map(z => (
                                            <button
                                                key={z.id}
                                                onClick={() => setSelectedZone(z)}
                                                className={`w-full flex items-center gap-2 px-2 py-1.5 border-2 border-black text-left transition-all hover:bg-gray-100 ${selectedZone?.id === z.id ? 'bg-black text-white' : ''}`}
                                            >
                                                <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: dispatched.has(z.id) ? '#22c55e' : riskColor(z.intensity) }} />
                                                <span className="text-[10px] font-bold uppercase truncate flex-1">{z.area}, {z.city}</span>
                                                <span className="text-[9px] font-black">{z.complaints.length}</span>
                                                {dispatched.has(z.id) && <CheckCircle2 size={10} className="text-green-500" />}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
}

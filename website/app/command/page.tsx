'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
    MapContainer,
    TileLayer,
    Marker,
    Popup,
    Polyline,
    CircleMarker,
    ZoomControl,
} from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import Sidebar from '@/components/Sidebar';
import Header from '@/components/Header';
import { createClient } from '@/utils/supabase/client';
import {
    nearestNeighborRoute,
    wardFairness,
    estimateTime,
    type GeoPoint,
    type RouteResult,
    type WardStats,
} from '@/utils/routeOptimizer';
import {
    Radio,
    Truck,
    Route,
    CheckCircle2,
    Clock,
    Fuel,
    MapPin,
    BarChart3,
    Navigation,
    Zap,
    AlertTriangle,
    Play,
    ChevronDown,
    ChevronUp,
} from 'lucide-react';

// ─── Types & Config ─────────────────────────────────────────────────

interface Complaint {
    id: string;
    category: string;
    title: string;
    description: string;
    area: string;
    city: string;
    latitude: number;
    longitude: number;
    upvotes: number;
    status: string;
    submitted_at: string;
}

const CATEGORY_COLORS: Record<string, string> = {
    'Road Pothole': '#ef4444',
    'Water Leak': '#3b82f6',
    'Drainage Blocking': '#06b6d4',
    'Overflowing Garbage': '#a855f7',
};

// Simulated truck fleet
const TRUCKS = [
    { id: 'MH-01-T1', driver: 'Ramesh Kumar', depot: { latitude: 19.076, longitude: 72.877 }, status: 'idle' as const, fuelPercent: 82 },
    { id: 'MH-01-T2', driver: 'Sunil Patil', depot: { latitude: 19.095, longitude: 72.860 }, status: 'idle' as const, fuelPercent: 64 },
    { id: 'MH-01-T3', driver: 'Mahesh Gupta', depot: { latitude: 19.050, longitude: 72.890 }, status: 'en_route' as const, fuelPercent: 41 },
];

// ─── Custom Icons ───────────────────────────────────────────────────

const truckIcon = (status: string) => L.divIcon({
    className: '',
    html: `<div style="
        width: 38px; height: 38px; border-radius: 50%;
        border: 3px solid #000; background: ${status === 'en_route' ? '#22c55e' : '#3b82f6'};
        display: flex; align-items: center; justify-content: center;
        font-size: 18px; box-shadow: 3px 3px 0 #000;
    ">🚛</div>`,
    iconSize: [38, 38],
    iconAnchor: [19, 19],
});

const issueIcon = (category: string) => {
    const color = CATEGORY_COLORS[category] || '#ef4444';
    return L.divIcon({
        className: '',
        html: `<div style="
            width: 14px; height: 14px; border-radius: 50%;
            background: ${color}; border: 2px solid #fff;
            box-shadow: 0 0 8px ${color}80, 0 2px 4px rgba(0,0,0,0.3);
        "></div>`,
        iconSize: [14, 14],
        iconAnchor: [7, 7],
    });
};

const stopIcon = (index: number) => L.divIcon({
    className: '',
    html: `<div style="
        width: 24px; height: 24px; border-radius: 50%;
        background: #000; color: #fff; font-weight: 900; font-size: 11px;
        display: flex; align-items: center; justify-content: center;
        border: 2px solid #fff; box-shadow: 0 2px 8px rgba(0,0,0,0.4);
    ">${index + 1}</div>`,
    iconSize: [24, 24],
    iconAnchor: [12, 12],
});

// ─── Component ──────────────────────────────────────────────────────

export default function CommandPage() {
    const [complaints, setComplaints] = useState<Complaint[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [selectedTruck, setSelectedTruck] = useState(TRUCKS[0]);
    const [showRoute, setShowRoute] = useState(false);
    const [dispatchComplete, setDispatchComplete] = useState(false);
    const [dispatching, setDispatching] = useState(false);
    const [showWardPanel, setShowWardPanel] = useState(false);
    const [selectedCity, setSelectedCity] = useState<string>('');

    useEffect(() => {
        const fetch_ = async () => {
            const supabase = createClient();
            const { data, error } = await supabase
                .from('reports')
                .select('id, issue_type, ward, latitude, longitude, status, created_at, severity, ai_confidence')
                .in('status', ['submitted', 'pending', 'Pending'])
                .not('latitude', 'is', null)
                .not('longitude', 'is', null)
                .order('created_at', { ascending: false });
            if (!error && data) {
                // Map the new table structure back to the component's Complaint interface for now pending refactor
                const mappedData: Complaint[] = data.map(r => ({
                    id: r.id,
                    category: r.issue_type,
                    title: r.issue_type,
                    description: `Confidence: ${r.ai_confidence ? (r.ai_confidence * 100).toFixed(0) + '%' : 'N/A'}. Severity: ${r.severity}`,
                    area: r.ward || 'Unknown Ward',
                    city: 'Mumbai', // Hardcoded fallback for now
                    latitude: r.latitude,
                    longitude: r.longitude,
                    upvotes: r.severity * 10,
                    status: 'Pending',
                    submitted_at: r.created_at
                }));
                setComplaints(mappedData);
                if (mappedData.length > 0) {
                    const cities = Array.from(new Set(mappedData.map(c => c.city)));
                    setSelectedCity(cities[0]);
                }
            }
            setIsLoading(false);
        };
        fetch_();
    }, []);

    // Available cities
    const cities = useMemo(() => Array.from(new Set(complaints.map(c => c.city))), [complaints]);

    // Filter by city for route
    const cityComplaints = useMemo(
        () => selectedCity ? complaints.filter(c => c.city === selectedCity) : complaints,
        [complaints, selectedCity]
    );

    // Compute optimized route
    const geoPoints: GeoPoint[] = useMemo(
        () => cityComplaints.map(c => ({
            id: c.id,
            latitude: c.latitude,
            longitude: c.longitude,
            city: c.city,
            area: c.area,
            title: c.title,
            category: c.category,
            upvotes: c.upvotes,
        })),
        [cityComplaints]
    );

    const route: RouteResult = useMemo(
        () => nearestNeighborRoute(geoPoints, selectedTruck.depot),
        [geoPoints, selectedTruck]
    );

    const fairness = useMemo(() => wardFairness(geoPoints), [geoPoints]);

    const routePositions: [number, number][] = useMemo(() => {
        if (!showRoute || route.orderedStops.length === 0) return [];
        const positions: [number, number][] = [
            [selectedTruck.depot.latitude, selectedTruck.depot.longitude],
            ...route.orderedStops.map(s => [s.latitude, s.longitude] as [number, number]),
        ];
        return positions;
    }, [showRoute, route, selectedTruck]);

    // Map center on selected city
    const mapCenter: [number, number] = useMemo(() => {
        if (cityComplaints.length > 0) {
            const avgLat = cityComplaints.reduce((s, c) => s + c.latitude, 0) / cityComplaints.length;
            const avgLng = cityComplaints.reduce((s, c) => s + c.longitude, 0) / cityComplaints.length;
            return [avgLat, avgLng];
        }
        return [19.076, 72.877];
    }, [cityComplaints]);

    const handleDispatch = useCallback(async () => {
        setDispatching(true);
        await new Promise(r => setTimeout(r, 2000));
        setDispatching(false);
        setDispatchComplete(true);
    }, []);

    const etaWithStops = estimateTime(route.totalDistanceKm, route.orderedStops.length);

    return (
        <div className="min-h-screen bg-white">
            <Sidebar />
            <div className="ml-64 flex flex-col min-h-screen">
                <Header title="COMMAND CENTER" />

                <main className="flex-1 p-6 bg-dot-grid">
                    <div className="max-w-[1600px] mx-auto">

                        {/* Stats Row */}
                        <div className="grid grid-cols-5 gap-3 mb-5">
                            <div className="bg-white border-4 border-black p-4 shadow-brutal">
                                <span className="text-[9px] font-black uppercase tracking-widest text-gray-500">Pending</span>
                                <div className="text-3xl font-black">{complaints.length}</div>
                            </div>
                            <div className="bg-white border-4 border-black p-4 shadow-brutal">
                                <span className="text-[9px] font-black uppercase tracking-widest text-gray-500">In City</span>
                                <div className="text-3xl font-black">{cityComplaints.length}</div>
                            </div>
                            <div className="bg-neon-orange text-white border-4 border-black p-4 shadow-brutal">
                                <span className="text-[9px] font-black uppercase tracking-widest">Route Dist</span>
                                <div className="text-3xl font-black">{route.totalDistanceKm} km</div>
                            </div>
                            <div className="bg-black text-white border-4 border-black p-4 shadow-brutal">
                                <span className="text-[9px] font-black uppercase tracking-widest text-gray-400">ETA</span>
                                <div className="text-3xl font-black">{etaWithStops} min</div>
                            </div>
                            <div className="border-4 border-black p-4 shadow-brutal" style={{ background: fairness.overallScore >= 70 ? '#bbf7d0' : fairness.overallScore >= 40 ? '#fef9c3' : '#fecaca' }}>
                                <span className="text-[9px] font-black uppercase tracking-widest">Fairness</span>
                                <div className="text-3xl font-black">{fairness.overallScore}%</div>
                            </div>
                        </div>

                        {/* Map + Panel */}
                        <div className="flex gap-5" style={{ height: '65vh' }}>

                            {/* Map */}
                            <div className="flex-1 border-4 border-black shadow-brutal relative overflow-hidden bg-black">
                                {isLoading && (
                                    <div className="absolute inset-0 z-[2000] bg-black/80 flex items-center justify-center">
                                        <div className="flex items-center gap-3">
                                            <div className="w-5 h-5 border-2 border-white border-t-transparent animate-spin rounded-full" />
                                            <span className="text-white text-xs font-black uppercase tracking-widest">Loading pending issues...</span>
                                        </div>
                                    </div>
                                )}

                                <MapContainer
                                    center={mapCenter}
                                    zoom={12}
                                    scrollWheelZoom={true}
                                    className="h-full w-full"
                                    zoomControl={false}
                                    style={{ background: '#0a0a0a' }}
                                    key={selectedCity} // Re-center on city change
                                >
                                    <TileLayer
                                        url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
                                        attribution="&copy; CARTO"
                                    />
                                    <ZoomControl position="bottomright" />

                                    {/* Issue Markers */}
                                    {cityComplaints.map(c => (
                                        <Marker
                                            key={c.id}
                                            position={[c.latitude, c.longitude]}
                                            icon={issueIcon(c.category)}
                                        >
                                            <Popup>
                                                <div className="font-sans w-56">
                                                    <p className="font-black text-xs uppercase" style={{ color: CATEGORY_COLORS[c.category] }}>{c.category}</p>
                                                    <p className="text-[11px] font-bold mt-1">{c.title}</p>
                                                    <p className="text-[10px] text-gray-500">{c.area} · {c.upvotes} upvotes</p>
                                                </div>
                                            </Popup>
                                        </Marker>
                                    ))}

                                    {/* Truck Markers */}
                                    {TRUCKS.map(t => (
                                        <Marker
                                            key={t.id}
                                            position={[t.depot.latitude, t.depot.longitude]}
                                            icon={truckIcon(t.status)}
                                        >
                                            <Popup>
                                                <div className="font-sans">
                                                    <p className="font-black text-sm">🚛 {t.id}</p>
                                                    <p className="text-xs text-gray-600">Driver: {t.driver}</p>
                                                    <p className="text-xs text-gray-500">Fuel: {t.fuelPercent}%</p>
                                                    <p className="text-xs font-bold" style={{ color: t.status === 'idle' ? '#3b82f6' : '#22c55e' }}>
                                                        {t.status === 'idle' ? '● IDLE' : '● EN ROUTE'}
                                                    </p>
                                                </div>
                                            </Popup>
                                        </Marker>
                                    ))}

                                    {/* Optimized Route */}
                                    {showRoute && routePositions.length > 1 && (
                                        <>
                                            <Polyline
                                                positions={routePositions}
                                                pathOptions={{
                                                    color: '#22c55e',
                                                    weight: 4,
                                                    dashArray: '12 6',
                                                    opacity: 0.9,
                                                }}
                                            />
                                            {/* Numbered Stop Markers */}
                                            {route.orderedStops.map((stop, i) => (
                                                <Marker
                                                    key={`stop-${stop.id}`}
                                                    position={[stop.latitude, stop.longitude]}
                                                    icon={stopIcon(i)}
                                                >
                                                    <Popup>
                                                        <div className="font-sans">
                                                            <p className="font-black text-xs">STOP #{i + 1}</p>
                                                            <p className="text-[11px] font-bold">{stop.title}</p>
                                                            <p className="text-[10px] text-gray-500">{stop.area}</p>
                                                        </div>
                                                    </Popup>
                                                </Marker>
                                            ))}
                                        </>
                                    )}

                                    {/* Status Overlay */}
                                    <div className="absolute top-4 left-4 z-[1000] bg-black/80 backdrop-blur-md border border-white/10 rounded-xl p-3 shadow-2xl">
                                        <div className="flex items-center gap-2">
                                            <Radio size={12} className="text-green-400" />
                                            <span className="text-[9px] font-black uppercase tracking-[0.15em] text-white">Command Active</span>
                                            <div className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse ml-1" />
                                        </div>
                                    </div>
                                </MapContainer>
                            </div>

                            {/* Dispatch Sidebar */}
                            <div className="w-[380px] border-4 border-black bg-white shadow-brutal flex flex-col overflow-hidden">
                                <div className="p-4 border-b-4 border-black bg-black text-white flex items-center gap-2">
                                    <Radio size={16} />
                                    <h3 className="font-black uppercase tracking-wider text-sm">Dispatch Control</h3>
                                </div>

                                <div className="flex-1 overflow-y-auto p-4 space-y-4">

                                    {/* City Selector */}
                                    <div>
                                        <label className="text-[9px] font-black uppercase tracking-widest text-gray-400 block mb-1">Target City</label>
                                        <select
                                            value={selectedCity}
                                            onChange={e => { setSelectedCity(e.target.value); setShowRoute(false); setDispatchComplete(false); }}
                                            className="w-full border-4 border-black p-2 font-black uppercase text-sm"
                                        >
                                            {cities.map(c => (
                                                <option key={c} value={c}>{c}</option>
                                            ))}
                                        </select>
                                    </div>

                                    {/* Truck Selection */}
                                    <div>
                                        <label className="text-[9px] font-black uppercase tracking-widest text-gray-400 block mb-1">Assign Truck</label>
                                        {TRUCKS.map(t => (
                                            <button
                                                key={t.id}
                                                onClick={() => { setSelectedTruck(t); setShowRoute(false); setDispatchComplete(false); }}
                                                className={`w-full flex items-center gap-3 px-3 py-2.5 border-2 border-black mb-1 transition-all ${selectedTruck.id === t.id ? 'bg-black text-white' : 'hover:bg-gray-100'}`}
                                            >
                                                <span className="text-lg">🚛</span>
                                                <div className="flex-1 text-left">
                                                    <p className="text-[11px] font-black uppercase">{t.id}</p>
                                                    <p className="text-[9px] font-bold opacity-60">{t.driver}</p>
                                                </div>
                                                <div className="flex items-center gap-1">
                                                    <Fuel size={10} className={t.fuelPercent > 50 ? 'text-green-500' : 'text-orange-500'} />
                                                    <span className="text-[9px] font-black">{t.fuelPercent}%</span>
                                                </div>
                                                <div className={`w-2 h-2 rounded-full ${t.status === 'idle' ? 'bg-blue-500' : 'bg-green-500 animate-pulse'}`} />
                                            </button>
                                        ))}
                                    </div>

                                    {/* Generate Route */}
                                    {!showRoute && !dispatchComplete && (
                                        <button
                                            onClick={() => setShowRoute(true)}
                                            className="w-full bg-neon-green border-4 border-black p-3 font-black uppercase text-sm shadow-brutal hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] active:translate-x-0 active:translate-y-0 active:shadow-none transition-all flex items-center justify-center gap-2"
                                        >
                                            <Route size={16} />
                                            Generate Optimal Route
                                        </button>
                                    )}

                                    {/* Route Preview */}
                                    {showRoute && !dispatchComplete && (
                                        <>
                                            <div className="border-4 border-black p-3 bg-gray-50">
                                                <div className="flex items-center gap-2 mb-3">
                                                    <Navigation size={14} className="text-green-600" />
                                                    <span className="text-[10px] font-black uppercase tracking-widest">Optimized Route</span>
                                                </div>
                                                <div className="grid grid-cols-3 gap-2 mb-3">
                                                    <div className="border-2 border-black p-2 text-center bg-white">
                                                        <div className="text-xl font-black">{route.orderedStops.length}</div>
                                                        <div className="text-[7px] font-black uppercase text-gray-400">Stops</div>
                                                    </div>
                                                    <div className="border-2 border-black p-2 text-center bg-white">
                                                        <div className="text-xl font-black">{route.totalDistanceKm}</div>
                                                        <div className="text-[7px] font-black uppercase text-gray-400">Km</div>
                                                    </div>
                                                    <div className="border-2 border-black p-2 text-center bg-white">
                                                        <div className="text-xl font-black">{etaWithStops}</div>
                                                        <div className="text-[7px] font-black uppercase text-gray-400">Min ETA</div>
                                                    </div>
                                                </div>

                                                {/* Stop List */}
                                                <div className="space-y-1 max-h-32 overflow-y-auto">
                                                    <div className="flex items-center gap-2 px-2 py-1 bg-blue-50 border border-blue-200">
                                                        <span className="w-5 h-5 bg-blue-500 text-white text-[9px] font-black flex items-center justify-center rounded-full">D</span>
                                                        <span className="text-[10px] font-bold text-blue-700">Depot ({selectedTruck.id})</span>
                                                    </div>
                                                    {route.orderedStops.map((stop, i) => (
                                                        <div key={stop.id} className="flex items-center gap-2 px-2 py-1 border border-gray-200">
                                                            <span className="w-5 h-5 bg-black text-white text-[9px] font-black flex items-center justify-center rounded-full">{i + 1}</span>
                                                            <div className="flex-1 min-w-0">
                                                                <p className="text-[10px] font-bold truncate">{stop.title}</p>
                                                                <p className="text-[8px] text-gray-400">{stop.area} · {stop.category}</p>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>

                                            {/* Ward Fairness */}
                                            <button
                                                onClick={() => setShowWardPanel(!showWardPanel)}
                                                className="w-full flex items-center justify-between px-3 py-2 border-2 border-black text-[10px] font-black uppercase tracking-widest"
                                            >
                                                <span className="flex items-center gap-2">
                                                    <BarChart3 size={12} />
                                                    Ward Fairness: {fairness.overallScore}%
                                                </span>
                                                {showWardPanel ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
                                            </button>

                                            {showWardPanel && (
                                                <div className="border-2 border-black p-3 space-y-1.5">
                                                    {fairness.wards.map(w => (
                                                        <div key={w.ward} className="flex items-center gap-2">
                                                            <span className="text-[9px] font-bold uppercase w-28 truncate">{w.ward}</span>
                                                            <div className="flex-1 bg-gray-200 h-2 rounded-full overflow-hidden">
                                                                <div
                                                                    className="h-full rounded-full"
                                                                    style={{
                                                                        width: `${w.fairnessScore}%`,
                                                                        background: w.fairnessScore >= 70 ? '#22c55e' : w.fairnessScore >= 40 ? '#eab308' : '#ef4444',
                                                                    }}
                                                                />
                                                            </div>
                                                            <span className="text-[9px] font-black w-5 text-right">{w.issueCount}</span>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}

                                            {/* Confirm Dispatch */}
                                            <button
                                                onClick={handleDispatch}
                                                disabled={dispatching}
                                                className="w-full bg-neon-orange border-4 border-black p-4 font-black uppercase text-sm shadow-brutal hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] active:translate-x-0 active:translate-y-0 active:shadow-none transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                                            >
                                                {dispatching ? (
                                                    <>
                                                        <div className="w-4 h-4 border-2 border-black border-t-transparent animate-spin rounded-full" />
                                                        Dispatching {selectedTruck.id}...
                                                    </>
                                                ) : (
                                                    <>
                                                        <Play size={16} />
                                                        Confirm Dispatch
                                                    </>
                                                )}
                                            </button>
                                        </>
                                    )}

                                    {/* Dispatch Confirmed */}
                                    {dispatchComplete && (
                                        <div className="border-4 border-black bg-neon-green p-5 space-y-2">
                                            <div className="flex items-center gap-2">
                                                <CheckCircle2 size={24} />
                                                <h4 className="font-black uppercase text-lg">Dispatched!</h4>
                                            </div>
                                            <p className="text-[11px] font-bold">
                                                Truck {selectedTruck.id} ({selectedTruck.driver}) is now en route through {route.orderedStops.length} stops.
                                            </p>
                                            <div className="grid grid-cols-2 gap-2 mt-3">
                                                <div className="border-2 border-black p-2 text-center bg-white">
                                                    <Clock size={14} className="mx-auto mb-1" />
                                                    <div className="text-lg font-black">{etaWithStops} min</div>
                                                    <div className="text-[8px] font-bold uppercase text-gray-500">ETA</div>
                                                </div>
                                                <div className="border-2 border-black p-2 text-center bg-white">
                                                    <Route size={14} className="mx-auto mb-1" />
                                                    <div className="text-lg font-black">{route.totalDistanceKm} km</div>
                                                    <div className="text-[8px] font-bold uppercase text-gray-500">Distance</div>
                                                </div>
                                            </div>
                                            <button
                                                onClick={() => { setShowRoute(false); setDispatchComplete(false); }}
                                                className="w-full mt-3 border-4 border-black p-2 font-black uppercase text-xs bg-white hover:bg-gray-100 transition-colors"
                                            >
                                                Dispatch Another
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
}

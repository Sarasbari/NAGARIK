'use client';

import React, { useState, useMemo, useEffect } from 'react';
import {
    MapContainer,
    TileLayer,
    Marker,
    Popup,
    ZoomControl,
    CircleMarker,
    Polygon,
    Tooltip,
} from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import {
    AlertCircle,
    Layers,
    Satellite,
    Map as MapIcon,
    Eye,
    EyeOff,
    Filter,
    CircleDot,
    ThumbsUp,
    Clock,
} from 'lucide-react';
import { createClient } from '@/utils/supabase/client';

// ─── Types ──────────────────────────────────────────────────────────

interface Complaint {
    id: string;
    category: string;
    title: string;
    description: string;
    area: string;
    city: string;
    state: string;
    latitude: number;
    longitude: number;
    status: string;
    upvotes: number;
    submitted_at: string;
}

// ─── Category Mapping ───────────────────────────────────────────────

const CATEGORY_MAP: Record<string, string> = {
    'Road Pothole': 'pothole',
    'Water Leak': 'water_leak',
    'Drainage Blocking': 'drainage',
    'Overflowing Garbage': 'garbage',
};

const CATEGORY_COLORS: Record<string, { bg: string; glow: string; label: string }> = {
    pothole:    { bg: '#ef4444', glow: '#ef444480', label: 'Pothole' },
    water_leak: { bg: '#3b82f6', glow: '#3b82f680', label: 'Water Leak' },
    drainage:   { bg: '#06b6d4', glow: '#06b6d480', label: 'Drainage' },
    garbage:    { bg: '#a855f7', glow: '#a855f780', label: 'Garbage' },
};

// ─── Custom Marker Icons ────────────────────────────────────────────

const issueIcon = (type: string, upvotes: number) => {
    const color = CATEGORY_COLORS[type] || CATEGORY_COLORS.pothole;
    // Scale marker based on upvotes
    const size = upvotes >= 60 ? 18 : upvotes >= 40 ? 14 : 11;
    const pulse = upvotes >= 60 ? `
        <div style="
            position: absolute; top: 50%; left: 50%;
            width: ${size + 14}px; height: ${size + 14}px;
            transform: translate(-50%, -50%);
            border-radius: 50%;
            border: 2px solid ${color.bg};
            opacity: 0.4;
            animation: pulse-ring 2s ease-out infinite;
        "></div>` : '';

    return L.divIcon({
        className: '',
        html: `
            <div style="position:relative; width:${size + 16}px; height:${size + 16}px;">
                ${pulse}
                <div style="
                    position: absolute; top: 50%; left: 50%;
                    width: ${size}px; height: ${size}px;
                    transform: translate(-50%, -50%);
                    border-radius: 50%;
                    background: ${color.bg};
                    border: 2px solid rgba(255,255,255,0.9);
                    box-shadow: 0 0 ${upvotes >= 60 ? 12 : 6}px ${color.glow}, 0 2px 4px rgba(0,0,0,0.3);
                "></div>
            </div>`,
        iconSize: [size + 16, size + 16],
        iconAnchor: [(size + 16) / 2, (size + 16) / 2],
    });
};

// ─── Tile Layers ────────────────────────────────────────────────────

const TILE_LAYERS = {
    satellite: {
        url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
        attribution: '&copy; Esri, Maxar, Earthstar Geographics',
        label: 'Satellite',
    },
    hybrid: {
        url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
        attribution: '&copy; Esri &copy; OSM',
        label: 'Hybrid',
    },
    dark: {
        url: 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png',
        attribution: '&copy; OSM &copy; CARTO',
        label: 'Dark',
    },
    light: {
        url: 'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png',
        attribution: '&copy; OSM &copy; CARTO',
        label: 'Light',
    },
};

const LABELS_URL = 'https://{s}.basemaps.cartocdn.com/light_only_labels/{z}/{x}/{y}{r}.png';

const STATUS_BADGES: Record<string, { label: string; class: string }> = {
    'Pending':  { label: 'Pending',  class: 'bg-yellow-100 text-yellow-700' },
    'Resolved': { label: 'Resolved', class: 'bg-green-100 text-green-700' },
    'Rejected': { label: 'Rejected', class: 'bg-red-100 text-red-700' },
};

// ─── Pulse animation ────────────────────────────────────────────────

const PulseStyle = () => (
    <style>{`
        @keyframes pulse-ring {
            0% { transform: translate(-50%, -50%) scale(0.8); opacity: 0.6; }
            100% { transform: translate(-50%, -50%) scale(1.6); opacity: 0; }
        }
    `}</style>
);

// ─── Helper ─────────────────────────────────────────────────────────

function timeAgo(dateStr: string): string {
    const diff = Date.now() - new Date(dateStr).getTime();
    const days = Math.floor(diff / 86400000);
    if (days > 0) return `${days}d ago`;
    const hours = Math.floor(diff / 3600000);
    if (hours > 0) return `${hours}h ago`;
    const mins = Math.floor(diff / 60000);
    return `${mins}m ago`;
}

// ─── Component ──────────────────────────────────────────────────────

type TileMode = keyof typeof TILE_LAYERS;
type IssueType = string;

export default function DashboardMap() {
    const center: [number, number] = [22.5, 78.9];
    const [tileMode, setTileMode] = useState<TileMode>('satellite');
    const [activeFilters, setActiveFilters] = useState<Set<IssueType>>(new Set(Object.keys(CATEGORY_COLORS)));
    const [showHeatZones, setShowHeatZones] = useState(true);
    const [showOverlayPanel, setShowOverlayPanel] = useState(true);
    const [complaints, setComplaints] = useState<Complaint[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    // Fetch complaints from Supabase
    useEffect(() => {
        const fetchComplaints = async () => {
            const supabase = createClient();
            const { data, error } = await supabase
                .from('complaints')
                .select('id, category, title, description, area, city, state, latitude, longitude, status, upvotes, submitted_at')
                .not('latitude', 'is', null)
                .not('longitude', 'is', null);

            if (error) {
                console.error('Error fetching complaints:', error.message);
            } else {
                setComplaints(data || []);
            }
            setIsLoading(false);
        };

        fetchComplaints();
    }, []);

    const currentTile = TILE_LAYERS[tileMode];

    const toggleFilter = (type: IssueType) => {
        setActiveFilters(prev => {
            const next = new Set(prev);
            if (next.has(type)) next.delete(type);
            else next.add(type);
            return next;
        });
    };

    const filteredComplaints = useMemo(
        () => complaints.filter(c => {
            const mappedType = CATEGORY_MAP[c.category] || 'pothole';
            return activeFilters.has(mappedType);
        }),
        [activeFilters, complaints]
    );

    const stats = useMemo(() => ({
        total: filteredComplaints.length,
        critical: filteredComplaints.filter(c => c.upvotes >= 50).length,
        pending: filteredComplaints.filter(c => c.status === 'Pending').length,
    }), [filteredComplaints]);

    return (
        <div className="flex-1 bg-black border-4 border-black relative overflow-hidden shadow-brutal min-h-[600px]">
            <PulseStyle />

            {/* Loading overlay */}
            {isLoading && (
                <div className="absolute inset-0 z-[2000] bg-black/80 flex items-center justify-center">
                    <div className="flex items-center gap-3">
                        <div className="w-5 h-5 border-2 border-white border-t-transparent animate-spin rounded-full" />
                        <span className="text-white text-xs font-black uppercase tracking-widest">Loading live data...</span>
                    </div>
                </div>
            )}

            <MapContainer
                center={center}
                zoom={5}
                scrollWheelZoom={true}
                className="h-full w-full"
                zoomControl={false}
                style={{ background: '#0a0a0a' }}
            >
                {/* Base tile layer */}
                <TileLayer attribution={currentTile.attribution} url={currentTile.url} />

                {/* Hybrid labels overlay */}
                {tileMode === 'hybrid' && (
                    <TileLayer url={LABELS_URL} attribution="&copy; CARTO" />
                )}

                <ZoomControl position="bottomright" />

                {/* ── Overlay: Heat zones ──────────────────────────── */}
                {showHeatZones && filteredComplaints.map(c => {
                    const mappedType = CATEGORY_MAP[c.category] || 'pothole';
                    const colors = CATEGORY_COLORS[mappedType] || CATEGORY_COLORS.pothole;
                    const radius = Math.max(20, Math.min(c.upvotes * 0.8, 60));
                    return (
                        <CircleMarker
                            key={`heat-${c.id}`}
                            center={[c.latitude, c.longitude]}
                            radius={radius}
                            pathOptions={{
                                fillColor: colors.bg,
                                fillOpacity: 0.12,
                                stroke: true,
                                color: colors.bg,
                                weight: 1,
                                opacity: 0.25,
                            }}
                        />
                    );
                })}

                {/* ── Issue Markers ────────────────────────────────── */}
                {filteredComplaints.map(c => {
                    const mappedType = CATEGORY_MAP[c.category] || 'pothole';
                    const cat = CATEGORY_COLORS[mappedType] || CATEGORY_COLORS.pothole;
                    const badge = STATUS_BADGES[c.status] || STATUS_BADGES['Pending'];
                    return (
                        <Marker
                            key={c.id}
                            position={[c.latitude, c.longitude]}
                            icon={issueIcon(mappedType, c.upvotes)}
                        >
                            <Popup className="leaflet-popup-custom">
                                <div className="font-sans w-60">
                                    <div className="flex items-center justify-between mb-1.5">
                                        <span className="font-black uppercase text-xs tracking-wide" style={{ color: cat.bg }}>
                                            {c.category}
                                        </span>
                                        <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full ${badge.class}`}>
                                            {badge.label}
                                        </span>
                                    </div>
                                    <p className="text-[11px] font-bold text-gray-800 mb-1 leading-tight">{c.title}</p>
                                    <p className="text-gray-500 text-[10px] mb-2">{c.area}, {c.city}</p>
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-1.5">
                                            <ThumbsUp size={10} className="text-gray-400" />
                                            <span className="text-[9px] font-bold text-gray-500">{c.upvotes} upvotes</span>
                                        </div>
                                        <div className="flex items-center gap-1">
                                            <Clock size={10} className="text-gray-400" />
                                            <span className="text-[9px] text-gray-400">{timeAgo(c.submitted_at)}</span>
                                        </div>
                                    </div>
                                </div>
                            </Popup>
                        </Marker>
                    );
                })}

                {/* ── Map Controls: Tile Switcher ─────────────────── */}
                <div className="absolute top-4 left-4 z-[1000] flex flex-col gap-0.5 bg-black/80 backdrop-blur-md border border-white/10 rounded-xl p-1 shadow-2xl">
                    {(Object.keys(TILE_LAYERS) as TileMode[]).map(mode => {
                        const icons = { satellite: Satellite, hybrid: Layers, dark: MapIcon, light: CircleDot };
                        const Icon = icons[mode];
                        return (
                            <button
                                key={mode}
                                onClick={() => setTileMode(mode)}
                                className={`flex items-center gap-2 px-3 py-2 rounded-lg text-[9px] font-black uppercase tracking-[0.15em] transition-all ${
                                    tileMode === mode
                                        ? 'bg-white text-black shadow-md'
                                        : 'text-white/50 hover:text-white hover:bg-white/5'
                                }`}
                            >
                                <Icon size={11} /> {TILE_LAYERS[mode].label}
                            </button>
                        );
                    })}
                </div>

                {/* ── Map Controls: Overlays Panel ────────────────── */}
                <div className="absolute top-4 right-16 z-[1000]">
                    <button
                        onClick={() => setShowOverlayPanel(p => !p)}
                        className="bg-black/80 backdrop-blur-md border border-white/10 rounded-xl p-2.5 text-white/70 hover:text-white transition-all shadow-2xl"
                    >
                        <Filter size={14} />
                    </button>

                    {showOverlayPanel && (
                        <div className="absolute top-12 right-0 w-56 bg-black/90 backdrop-blur-md border border-white/10 rounded-xl p-3 shadow-2xl space-y-3">
                            {/* Category filters */}
                            <div>
                                <p className="text-[8px] font-black uppercase tracking-[0.2em] text-white/40 mb-2">Issue Types</p>
                                <div className="grid grid-cols-2 gap-1">
                                    {Object.entries(CATEGORY_COLORS).map(([type, cfg]) => (
                                        <button
                                            key={type}
                                            onClick={() => toggleFilter(type)}
                                            className={`flex items-center gap-1.5 px-2 py-1.5 rounded-lg text-[8px] font-bold uppercase tracking-wider transition-all ${
                                                activeFilters.has(type)
                                                    ? 'bg-white/10 text-white'
                                                    : 'text-white/30 hover:text-white/50'
                                            }`}
                                        >
                                            <div
                                                className="w-2 h-2 rounded-full shrink-0"
                                                style={{
                                                    background: activeFilters.has(type) ? cfg.bg : '#4b5563',
                                                    boxShadow: activeFilters.has(type) ? `0 0 6px ${cfg.glow}` : 'none',
                                                }}
                                            />
                                            {cfg.label}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="border-t border-white/10" />

                            {/* Overlay toggles */}
                            <div>
                                <p className="text-[8px] font-black uppercase tracking-[0.2em] text-white/40 mb-2">Overlays</p>
                                <div className="space-y-1">
                                    <button
                                        onClick={() => setShowHeatZones(p => !p)}
                                        className={`flex items-center gap-2 w-full px-2 py-1.5 rounded-lg text-[9px] font-bold uppercase tracking-wider transition-all ${
                                            showHeatZones ? 'bg-white/10 text-white' : 'text-white/30 hover:text-white/50'
                                        }`}
                                    >
                                        {showHeatZones ? <Eye size={10} /> : <EyeOff size={10} />}
                                        Heat Zones
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* ── Stats Overlay ───────────────────────────────── */}
                <div className="absolute bottom-6 left-6 z-[1000] bg-black/80 backdrop-blur-md text-white border border-white/10 rounded-xl p-4 max-w-xs shadow-2xl">
                    <div className="flex items-center gap-2 mb-3">
                        <AlertCircle size={13} className="text-red-400" />
                        <h4 className="font-black uppercase text-[9px] tracking-[0.2em]">National Overview</h4>
                        <div className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse ml-auto" />
                        <span className="text-[7px] font-bold uppercase text-green-400 tracking-wider">Live</span>
                    </div>
                    <div className="grid grid-cols-3 gap-3">
                        <div>
                            <p className="text-lg font-black">{stats.total}</p>
                            <p className="text-[8px] uppercase text-white/40 font-bold tracking-wider">Reports</p>
                        </div>
                        <div>
                            <p className="text-lg font-black text-red-400">{stats.critical}</p>
                            <p className="text-[8px] uppercase text-white/40 font-bold tracking-wider">High Priority</p>
                        </div>
                        <div>
                            <p className="text-lg font-black text-yellow-400">{stats.pending}</p>
                            <p className="text-[8px] uppercase text-white/40 font-bold tracking-wider">Pending</p>
                        </div>
                    </div>
                </div>

                {/* ── Legend ──────────────────────────────────────── */}
                <div className="absolute bottom-6 right-6 z-[1000] bg-black/80 backdrop-blur-md border border-white/10 rounded-xl p-3 shadow-2xl">
                    <p className="text-[7px] font-black uppercase tracking-[0.2em] text-white/30 mb-2">Legend</p>
                    <div className="flex flex-col gap-1.5">
                        {Object.entries(CATEGORY_COLORS).filter(([type]) => activeFilters.has(type)).map(([type, cfg]) => (
                            <div key={type} className="flex items-center gap-2">
                                <div
                                    className="w-2 h-2 rounded-full shrink-0"
                                    style={{ background: cfg.bg, boxShadow: `0 0 4px ${cfg.glow}` }}
                                />
                                <span className="text-[8px] font-bold uppercase text-white/60 tracking-wider">{cfg.label}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </MapContainer>
        </div>
    );
}

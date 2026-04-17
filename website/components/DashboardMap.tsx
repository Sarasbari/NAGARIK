'use client';

import React, { useState, useMemo } from 'react';
import {
    MapContainer,
    TileLayer,
    Marker,
    Popup,
    ZoomControl,
    CircleMarker,
    Polygon,
    LayersControl,
    LayerGroup,
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
    Construction,
    Droplets,
    Flame,
    CircleDot,
} from 'lucide-react';

// ─── Custom Marker Icons ────────────────────────────────────────────

const CATEGORY_COLORS: Record<string, { bg: string; glow: string; label: string }> = {
    pothole:     { bg: '#ef4444', glow: '#ef444480', label: 'Pothole' },
    road_damage: { bg: '#f97316', glow: '#f9731680', label: 'Road Damage' },
    drainage:    { bg: '#3b82f6', glow: '#3b82f680', label: 'Drainage' },
    garbage:     { bg: '#a855f7', glow: '#a855f780', label: 'Garbage' },
    streetlight: { bg: '#eab308', glow: '#eab30880', label: 'Streetlight' },
    other:       { bg: '#6b7280', glow: '#6b728080', label: 'Other' },
};

const issueIcon = (type: string, severity: number) => {
    const color = CATEGORY_COLORS[type] || CATEGORY_COLORS.other;
    const size = severity >= 4 ? 18 : severity >= 3 ? 14 : 11;
    const pulse = severity >= 4 ? `
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
                    box-shadow: 0 0 ${severity >= 4 ? 12 : 6}px ${color.glow}, 0 2px 4px rgba(0,0,0,0.3);
                "></div>
            </div>`,
        iconSize: [size + 16, size + 16],
        iconAnchor: [(size + 16) / 2, (size + 16) / 2],
    });
};

// ─── Mock Data ──────────────────────────────────────────────────────

const MOCK_ISSUES = [
    { id: 1,  lat: 28.6139, lng: 77.2090, type: 'pothole',     severity: 5, area: 'Connaught Place, Delhi',     status: 'open',        reported: '2h ago' },
    { id: 2,  lat: 28.5355, lng: 77.3910, type: 'road_damage', severity: 4, area: 'Noida Sector 62',            status: 'assigned',    reported: '5h ago' },
    { id: 3,  lat: 19.0760, lng: 72.8777, type: 'pothole',     severity: 3, area: 'Marine Drive, Mumbai',       status: 'open',        reported: '1d ago' },
    { id: 4,  lat: 12.9716, lng: 77.5946, type: 'drainage',    severity: 4, area: 'MG Road, Bangalore',         status: 'in_progress', reported: '3h ago' },
    { id: 5,  lat: 22.5726, lng: 88.3639, type: 'road_damage', severity: 5, area: 'Park Street, Kolkata',       status: 'open',        reported: '30m ago' },
    { id: 6,  lat: 26.9124, lng: 75.7873, type: 'pothole',     severity: 3, area: 'MI Road, Jaipur',            status: 'resolved',    reported: '2d ago' },
    { id: 7,  lat: 17.3850, lng: 78.4867, type: 'drainage',    severity: 4, area: 'Banjara Hills, Hyderabad',   status: 'assigned',    reported: '6h ago' },
    { id: 8,  lat: 13.0827, lng: 80.2707, type: 'pothole',     severity: 2, area: 'T. Nagar, Chennai',          status: 'open',        reported: '1d ago' },
    { id: 9,  lat: 23.0225, lng: 72.5714, type: 'road_damage', severity: 3, area: 'SG Highway, Ahmedabad',      status: 'in_progress', reported: '8h ago' },
    { id: 10, lat: 18.5204, lng: 73.8567, type: 'pothole',     severity: 5, area: 'FC Road, Pune',              status: 'open',        reported: '1h ago' },
    { id: 11, lat: 28.6280, lng: 77.2190, type: 'garbage',     severity: 3, area: 'Karol Bagh, Delhi',          status: 'open',        reported: '4h ago' },
    { id: 12, lat: 19.0180, lng: 72.8560, type: 'streetlight', severity: 2, area: 'Dadar, Mumbai',              status: 'assigned',    reported: '12h ago' },
    { id: 13, lat: 28.5800, lng: 77.2300, type: 'drainage',    severity: 5, area: 'Saket, Delhi',               status: 'open',        reported: '45m ago' },
    { id: 14, lat: 12.9350, lng: 77.6100, type: 'garbage',     severity: 4, area: 'Koramangala, Bangalore',     status: 'in_progress', reported: '2h ago' },
    { id: 15, lat: 22.5450, lng: 88.3500, type: 'streetlight', severity: 3, area: 'Salt Lake, Kolkata',         status: 'open',        reported: '6h ago' },
];

// Ward boundary polygons (simplified mock)
const WARD_ZONES = [
    {
        name: 'Delhi NCR Zone',
        color: '#ef4444',
        positions: [
            [28.70, 77.10], [28.70, 77.45], [28.45, 77.45], [28.45, 77.10],
        ] as [number, number][],
        issueCount: 4,
    },
    {
        name: 'Mumbai Metro Zone',
        color: '#3b82f6',
        positions: [
            [19.15, 72.78], [19.15, 72.95], [18.95, 72.95], [18.95, 72.78],
        ] as [number, number][],
        issueCount: 3,
    },
    {
        name: 'Bangalore Urban Zone',
        color: '#10b981',
        positions: [
            [13.05, 77.50], [13.05, 77.70], [12.85, 77.70], [12.85, 77.50],
        ] as [number, number][],
        issueCount: 2,
    },
];

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
    open:        { label: 'Open',        class: 'bg-red-100 text-red-700' },
    assigned:    { label: 'Assigned',    class: 'bg-yellow-100 text-yellow-700' },
    in_progress: { label: 'In Progress', class: 'bg-blue-100 text-blue-700' },
    resolved:    { label: 'Resolved',    class: 'bg-green-100 text-green-700' },
};

// ─── Pulse animation (injected once via style tag) ──────────────────

const PulseStyle = () => (
    <style>{`
        @keyframes pulse-ring {
            0% { transform: translate(-50%, -50%) scale(0.8); opacity: 0.6; }
            100% { transform: translate(-50%, -50%) scale(1.6); opacity: 0; }
        }
    `}</style>
);

// ─── Component ──────────────────────────────────────────────────────

type TileMode = keyof typeof TILE_LAYERS;
type IssueType = string;

export default function DashboardMap() {
    const center: [number, number] = [22.5, 78.9];
    const [tileMode, setTileMode] = useState<TileMode>('satellite');
    const [activeFilters, setActiveFilters] = useState<Set<IssueType>>(new Set(Object.keys(CATEGORY_COLORS)));
    const [showHeatZones, setShowHeatZones] = useState(true);
    const [showWards, setShowWards] = useState(false);
    const [showOverlayPanel, setShowOverlayPanel] = useState(true);

    const currentTile = TILE_LAYERS[tileMode];

    const toggleFilter = (type: IssueType) => {
        setActiveFilters(prev => {
            const next = new Set(prev);
            if (next.has(type)) next.delete(type);
            else next.add(type);
            return next;
        });
    };

    const filteredIssues = useMemo(
        () => MOCK_ISSUES.filter(i => activeFilters.has(i.type)),
        [activeFilters]
    );

    const stats = useMemo(() => ({
        total: filteredIssues.length,
        critical: filteredIssues.filter(i => i.severity >= 4).length,
        open: filteredIssues.filter(i => i.status === 'open').length,
    }), [filteredIssues]);

    return (
        <div className="flex-1 bg-black border-4 border-black relative overflow-hidden shadow-brutal min-h-[600px]">
            <PulseStyle />
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
                {showHeatZones && filteredIssues.map(issue => (
                    <CircleMarker
                        key={`heat-${issue.id}`}
                        center={[issue.lat, issue.lng]}
                        radius={issue.severity * 18}
                        pathOptions={{
                            fillColor: CATEGORY_COLORS[issue.type]?.bg || '#6b7280',
                            fillOpacity: 0.12,
                            stroke: true,
                            color: CATEGORY_COLORS[issue.type]?.bg || '#6b7280',
                            weight: 1,
                            opacity: 0.25,
                        }}
                    />
                ))}

                {/* ── Overlay: Ward boundaries ────────────────────── */}
                {showWards && WARD_ZONES.map(ward => (
                    <Polygon
                        key={ward.name}
                        positions={ward.positions}
                        pathOptions={{
                            color: ward.color,
                            weight: 2,
                            fillColor: ward.color,
                            fillOpacity: 0.08,
                            dashArray: '8 4',
                        }}
                    >
                        <Tooltip sticky className="!bg-black/80 !text-white !border-white/20 !rounded-lg !text-[10px] !font-bold !uppercase !tracking-wider !px-3 !py-1.5">
                            {ward.name} — {ward.issueCount} issues
                        </Tooltip>
                    </Polygon>
                ))}

                {/* ── Issue Markers ────────────────────────────────── */}
                {filteredIssues.map(issue => {
                    const cat = CATEGORY_COLORS[issue.type] || CATEGORY_COLORS.other;
                    const badge = STATUS_BADGES[issue.status] || STATUS_BADGES.open;
                    return (
                        <Marker
                            key={issue.id}
                            position={[issue.lat, issue.lng]}
                            icon={issueIcon(issue.type, issue.severity)}
                        >
                            <Popup className="leaflet-popup-custom">
                                <div className="font-sans w-52">
                                    <div className="flex items-center justify-between mb-1.5">
                                        <span className="font-black uppercase text-xs tracking-wide" style={{ color: cat.bg }}>
                                            {cat.label}
                                        </span>
                                        <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full ${badge.class}`}>
                                            {badge.label}
                                        </span>
                                    </div>
                                    <p className="text-gray-600 text-xs mb-2">{issue.area}</p>
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-1">
                                            <span className="text-[9px] font-bold uppercase text-gray-400">Severity</span>
                                            <div className="flex gap-0.5">
                                                {[1, 2, 3, 4, 5].map(i => (
                                                    <div
                                                        key={i}
                                                        className="w-1.5 h-1.5 rounded-full"
                                                        style={{ background: i <= issue.severity ? cat.bg : '#e5e7eb' }}
                                                    />
                                                ))}
                                            </div>
                                        </div>
                                        <span className="text-[9px] text-gray-400">{issue.reported}</span>
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
                                    <button
                                        onClick={() => setShowWards(p => !p)}
                                        className={`flex items-center gap-2 w-full px-2 py-1.5 rounded-lg text-[9px] font-bold uppercase tracking-wider transition-all ${
                                            showWards ? 'bg-white/10 text-white' : 'text-white/30 hover:text-white/50'
                                        }`}
                                    >
                                        {showWards ? <Eye size={10} /> : <EyeOff size={10} />}
                                        Ward Boundaries
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
                    </div>
                    <div className="grid grid-cols-3 gap-3">
                        <div>
                            <p className="text-lg font-black">{stats.total}</p>
                            <p className="text-[8px] uppercase text-white/40 font-bold tracking-wider">Reports</p>
                        </div>
                        <div>
                            <p className="text-lg font-black text-red-400">{stats.critical}</p>
                            <p className="text-[8px] uppercase text-white/40 font-bold tracking-wider">Critical</p>
                        </div>
                        <div>
                            <p className="text-lg font-black text-yellow-400">{stats.open}</p>
                            <p className="text-[8px] uppercase text-white/40 font-bold tracking-wider">Open</p>
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

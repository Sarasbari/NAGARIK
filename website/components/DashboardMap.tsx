'use client';

import React, { useState } from 'react';
import { MapContainer, TileLayer, CircleMarker, Marker, Popup, ZoomControl, LayersControl } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix for default leaflet icons
const DefaultIcon = L.icon({
    iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
    shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
});
L.Marker.prototype.options.icon = DefaultIcon;

interface Report {
    id: string;
    category: string;
    status: string;
    severity: number;
    latitude: number;
    longitude: number;
    image_url: string;
    description: string;
    created_at: string;
    ml_reason: string | null;
}

interface DashboardMapProps {
    reports: Report[];
}

const CATEGORY_ICONS: Record<string, string> = {
    pothole: '🕳️',
    road_decay: '🛤️',
    garbage: '🗑️',
    waterlogging: '🌊',
    other: '📌',
};

const CATEGORY_LABELS: Record<string, string> = {
    pothole: 'Pothole',
    road_decay: 'Road Decay',
    garbage: 'Garbage',
    waterlogging: 'Waterlogging',
    other: 'Other',
};

function getSeverityColor(severity: number): string {
    if (severity >= 5) return '#ef4444';       // red
    if (severity >= 4) return '#f97316';       // orange
    if (severity >= 3) return '#eab308';       // yellow
    return '#22c55e';                          // green
}

function getSeverityRadius(severity: number): number {
    return 8 + severity * 2; // 10 to 18px
}

function getTimeAgo(dateStr: string): string {
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 60) return `${mins}m ago`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    return `${days}d ago`;
}

export default function DashboardMap({ reports }: DashboardMapProps) {
    const [mapId] = useState(() => `dashboard-map-${Math.random().toString(36).substr(2, 9)}`);
    const [selectedReport, setSelectedReport] = useState<Report | null>(null);

    // Auto-center: use first report with valid coords, else default to Kathmandu
    const validReports = reports.filter((r) => r.latitude && r.longitude);
    const center: [number, number] = validReports.length > 0
        ? [validReports[0].latitude, validReports[0].longitude]
        : [27.7172, 85.3240]; // Kathmandu default

    const openCount = reports.filter((r) => r.status !== 'resolved' && r.status !== 'rejected').length;
    const criticalCount = reports.filter((r) => r.severity >= 4).length;

    return (
        <div className="flex-1 bg-white border-4 border-black relative overflow-hidden shadow-brutal h-full">
            <MapContainer
                key={mapId}
                center={center}
                zoom={validReports.length > 0 ? 14 : 12}
                scrollWheelZoom={true}
                className="h-full w-full z-0"
                zoomControl={false}
            >
                <LayersControl position="topright">
                    <LayersControl.BaseLayer name="Dark Map">
                        <TileLayer
                            attribution='&copy; <a href="https://carto.com/attributions">CARTO</a>'
                            url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
                        />
                    </LayersControl.BaseLayer>
                    <LayersControl.BaseLayer name="Street Map (OSM)">
                        <TileLayer
                            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                        />
                    </LayersControl.BaseLayer>
                    <LayersControl.BaseLayer checked name="Satellite View">
                        <TileLayer
                            attribution='&copy; <a href="https://www.esri.com/">Esri</a>'
                            url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
                        />
                    </LayersControl.BaseLayer>
                </LayersControl>

                <ZoomControl position="bottomright" />

                {/* Severity-colored markers for each report */}
                {validReports.map((report) => {
                    const color = getSeverityColor(report.severity);
                    return (
                        <CircleMarker
                            key={report.id}
                            center={[report.latitude, report.longitude]}
                            radius={getSeverityRadius(report.severity)}
                            pathOptions={{
                                fillColor: color,
                                fillOpacity: 0.85,
                                color: '#000',
                                weight: 2,
                            }}
                            eventHandlers={{
                                click: () => setSelectedReport(report),
                            }}
                        >
                            <Popup>
                                <div className="min-w-[200px]">
                                    <div className="font-black text-sm uppercase tracking-tight">
                                        {CATEGORY_ICONS[report.category] || '📌'} {CATEGORY_LABELS[report.category] || report.category}
                                    </div>
                                    <div className="text-xs text-gray-500 mt-1">
                                        Severity <strong>{report.severity}/5</strong> · {getTimeAgo(report.created_at)}
                                    </div>
                                    {report.description && (
                                        <div className="text-xs mt-1 border-t pt-1 text-gray-700 line-clamp-2">{report.description}</div>
                                    )}
                                </div>
                            </Popup>
                        </CircleMarker>
                    );
                })}

                {/* Top stats overlay */}
                <div className="absolute top-4 left-4 z-[1000] flex gap-3">
                    <div className="bg-black text-white border-2 border-white px-3 py-2">
                        <span className="text-[10px] font-bold uppercase block text-gray-400">Open Reports</span>
                        <span className="text-xl font-black">{openCount}</span>
                    </div>
                    {criticalCount > 0 && (
                        <div className="bg-red-600 text-white border-2 border-white px-3 py-2 animate-pulse">
                            <span className="text-[10px] font-bold uppercase block text-red-200">Critical</span>
                            <span className="text-xl font-black">{criticalCount}</span>
                        </div>
                    )}
                    {reports.length === 0 && (
                        <div className="bg-yellow-500 text-black border-2 border-black px-3 py-2">
                            <span className="text-[10px] font-bold uppercase block">No Data</span>
                            <span className="text-xs font-black">Submit reports via the app</span>
                        </div>
                    )}
                </div>

                {/* Legend */}
                <div className="absolute bottom-6 right-6 z-[1000] bg-neon-green border-4 border-black p-3 flex gap-6">
                    <div className="flex items-center gap-2">
                        <div className="w-3 h-3 bg-green-500 rounded-full border border-black" />
                        <span className="text-[10px] font-black uppercase italic">Low 1-2</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-3 h-3 bg-yellow-500 rounded-full border border-black" />
                        <span className="text-[10px] font-black uppercase italic">Med 3</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-3 h-3 bg-orange-500 rounded-full border border-black" />
                        <span className="text-[10px] font-black uppercase italic">High 4</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-3 h-3 bg-red-500 rounded-full border border-black" />
                        <span className="text-[10px] font-black uppercase italic">Critical 5</span>
                    </div>
                </div>
            </MapContainer>

            {/* Slide-in panel for selected report */}
            {selectedReport && (
                <div className="absolute top-0 right-0 z-[2000] w-[380px] h-full bg-white border-l-4 border-black overflow-y-auto shadow-2xl animate-slide-in">
                    <div className="p-4 border-b-4 border-black bg-gray-50 flex justify-between items-center">
                        <h3 className="font-black uppercase text-sm tracking-wider">Issue Details</h3>
                        <button
                            onClick={() => setSelectedReport(null)}
                            className="text-xl font-black hover:text-red-500 transition-colors"
                        >
                            ✕
                        </button>
                    </div>

                    {selectedReport.image_url && (
                        <img
                            src={selectedReport.image_url}
                            alt="Report"
                            className="w-full h-48 object-cover border-b-4 border-black"
                        />
                    )}

                    <div className="p-6 space-y-4">
                        <div>
                            <span className="text-[10px] font-bold uppercase text-gray-500 tracking-widest block">Issue Type</span>
                            <span className="font-black text-lg uppercase">
                                {CATEGORY_ICONS[selectedReport.category] || '📌'} {CATEGORY_LABELS[selectedReport.category] || selectedReport.category}
                            </span>
                        </div>

                        {selectedReport.description && (
                            <div>
                                <span className="text-[10px] font-bold uppercase text-gray-500 tracking-widest block">Description</span>
                                <span className="font-medium text-sm text-gray-800">{selectedReport.description}</span>
                            </div>
                        )}

                        <div className="flex gap-4">
                            <div className="flex-1">
                                <span className="text-[10px] font-bold uppercase text-gray-500 tracking-widest block">Severity</span>
                                <div className="flex items-center gap-2 mt-1">
                                    <div
                                        className="w-4 h-4 rounded-full border-2 border-black"
                                        style={{ backgroundColor: getSeverityColor(selectedReport.severity) }}
                                    />
                                    <span className="font-black text-lg">{selectedReport.severity}/5</span>
                                </div>
                            </div>
                            <div className="flex-1">
                                <span className="text-[10px] font-bold uppercase text-gray-500 tracking-widest block">Status</span>
                                <span className="inline-block mt-1 bg-black text-neon-green px-3 py-1 font-bold text-xs uppercase">
                                    {selectedReport.status}
                                </span>
                            </div>
                        </div>

                        <div className="flex gap-4">
                            <div className="flex-1">
                                <span className="text-[10px] font-bold uppercase text-gray-500 tracking-widest block">Latitude</span>
                                <span className="font-mono text-sm">{selectedReport.latitude?.toFixed(6)}</span>
                            </div>
                            <div className="flex-1">
                                <span className="text-[10px] font-bold uppercase text-gray-500 tracking-widest block">Longitude</span>
                                <span className="font-mono text-sm">{selectedReport.longitude?.toFixed(6)}</span>
                            </div>
                        </div>

                        {selectedReport.ml_reason && (
                            <div className="bg-red-50 border border-red-200 p-2 rounded">
                                <span className="text-[10px] font-bold uppercase text-red-500 tracking-widest block">ML Rejection Reason</span>
                                <span className="font-bold text-sm text-red-700">{selectedReport.ml_reason}</span>
                            </div>
                        )}

                        <div>
                            <span className="text-[10px] font-bold uppercase text-gray-500 tracking-widest block">Reported At</span>
                            <span className="font-bold text-sm">
                                {new Date(selectedReport.created_at).toLocaleString('en-IN')}
                            </span>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

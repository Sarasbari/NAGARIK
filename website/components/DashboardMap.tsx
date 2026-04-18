'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { MapContainer, TileLayer, CircleMarker, Popup, ZoomControl, LayersControl } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { AlertCircle } from 'lucide-react';
import { createBrowserSupabaseClient } from '@/lib/supabase';

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
    issue_type: string;
    severity: number;
    status: string;
    image_url: string | null;  // Fixed from photo_url based on database schema
    latitude: number;
    longitude: number;
    ml_reason: string | null;  // Fixed from ai_confidence based on database schema
    created_at: string;
    category: string | null;   // Fixed from ward
}

function getSeverityColor(severity: number): string {
    if (severity >= 5) return '#ef4444';       // red
    if (severity >= 3) return '#f97316';       // orange
    return '#22c55e';                          // green
}

function getSeverityRadius(severity: number): number {
    return 6 + severity * 2; // 8 to 16px
}

export default function DashboardMap() {
    // NextJS React 18 strict mode forces DOM recycling. We give this map instance a statically generated
    // unique key on component mount to force React to physically destroy the DOM node instead of recycling it.
    const [mapId] = useState(() => `dashboard-map-${Math.random().toString(36).substr(2, 9)}`);

    const [reports, setReports] = useState<Report[]>([]);
    const [selectedReport, setSelectedReport] = useState<Report | null>(null);
    const center: [number, number] = [19.0760, 72.8777]; // Mumbai center

    const fetchReports = useCallback(async () => {
        const supabase = createBrowserSupabaseClient();
        const { data, error } = await supabase
            .from('reports')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) {
            console.error('[DashboardMap] fetch error:', error);
            return;
        }
        if (data) setReports(data);
    }, []);

    useEffect(() => {
        fetchReports();

        // Realtime subscription: new reports appear instantly
        const supabase = createBrowserSupabaseClient();
        const channel = supabase
            .channel('reports-realtime')
            .on(
                'postgres_changes',
                { event: 'INSERT', schema: 'public', table: 'reports' },
                (payload) => {
                    const newReport = payload.new as Report;
                    setReports((prev) => [newReport, ...prev]);
                }
            )
            .on(
                'postgres_changes',
                { event: 'UPDATE', schema: 'public', table: 'reports' },
                (payload) => {
                    const updated = payload.new as Report;
                    setReports((prev) =>
                        prev.map((r) => (r.id === updated.id ? updated : r))
                    );
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [fetchReports]);

    const openCount = reports.filter((r) => r.status !== 'resolved').length;
    const criticalCount = reports.filter((r) => r.severity === 5).length;

    return (
        <div className="flex-1 bg-white border-4 border-black relative overflow-hidden shadow-brutal h-full">
            <MapContainer
                key={mapId}
                center={center}
                zoom={12}
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
                {reports.map((report) => {
                    if (!report.latitude || !report.longitude) return null;
                    const color = getSeverityColor(report.severity);
                    return (
                        <CircleMarker
                            key={report.id}
                            center={[report.latitude, report.longitude]}
                            radius={getSeverityRadius(report.severity)}
                            pathOptions={{
                                fillColor: color,
                                fillOpacity: 0.8,
                                color: '#000',
                                weight: 2,
                            }}
                            eventHandlers={{
                                click: () => setSelectedReport(report),
                            }}
                        >
                            <Popup>
                                <div className="font-bold text-sm">
                                    {report.issue_type} — Severity {report.severity}/5
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
                    <div className="bg-red-600 text-white border-2 border-white px-3 py-2">
                        <span className="text-[10px] font-bold uppercase block text-red-200">Severity 5</span>
                        <span className="text-xl font-black">{criticalCount}</span>
                    </div>
                </div>

                {/* Legend */}
                <div className="absolute bottom-6 right-6 z-[1000] bg-neon-green border-4 border-black p-3 flex gap-6">
                    <div className="flex items-center gap-2">
                        <div className="w-3 h-3 bg-green-500 rounded-full border border-black" />
                        <span className="text-[10px] font-black uppercase italic">Low 1-2</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-3 h-3 bg-orange-500 rounded-full border border-black" />
                        <span className="text-[10px] font-black uppercase italic">Med 3-4</span>
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
                            <span className="font-black text-lg uppercase">{selectedReport.category || selectedReport.issue_type}</span>
                        </div>

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

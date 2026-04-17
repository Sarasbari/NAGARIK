'use client';

import React from 'react';
import { MapContainer, TileLayer, Marker, Popup, ZoomControl } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { AlertCircle, Users, Radio } from 'lucide-react';

// Fix for default leaflet icons
const DefaultIcon = L.icon({
    iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
    shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
});
L.Marker.prototype.options.icon = DefaultIcon;

export default function DashboardMap() {
    const center: [number, number] = [27.7172, 85.3240]; // Kathmandu center as example

    return (
        <div className="flex-1 bg-white border-4 border-black relative overflow-hidden shadow-brutal min-h-[600px]">
            <MapContainer
                center={center}
                zoom={13}
                scrollWheelZoom={false}
                className="h-full w-full"
                zoomControl={false}
            >
                <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
                    url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
                />

                <ZoomControl position="topright" />

                <Marker position={center}>
                    <Popup>
                        <div className="font-black uppercase tracking-tight italic">
                            Active Incident: Water Leak
                        </div>
                    </Popup>
                </Marker>

                {/* Custom UI Overlays */}
                <div className="absolute bottom-6 left-6 z-[1000] bg-black text-white border-4 border-white p-4 max-w-sm">
                    <div className="flex items-center gap-2 mb-2">
                        <AlertCircle size={16} className="text-neon-orange" />
                        <h4 className="font-black uppercase text-xs tracking-widest italic">Active Incident Zone: D-04</h4>
                    </div>
                    <p className="text-[10px] uppercase font-bold text-gray-400 leading-tight">
                        High density of infrastructure failures reported within 500m of Central Plaza. Auto-dispatching 2 crews.
                    </p>
                </div>

                <div className="absolute bottom-6 right-6 z-[1000] bg-neon-green border-4 border-black p-3 flex gap-6">
                    <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-black rounded-full" />
                        <span className="text-[10px] font-black uppercase italic">Crews</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-neon-orange rounded-full" />
                        <span className="text-[10px] font-black uppercase italic">Alerts</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-white border border-black rounded-full" />
                        <span className="text-[10px] font-black uppercase italic">Sensors</span>
                    </div>
                </div>
            </MapContainer>
        </div>
    );
}

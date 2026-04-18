'use client';
import { MapContainer, TileLayer, Marker } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Use a simplified dynamic icon to bypass the require() static pathing in nextJS
const customIcon = L.divIcon({
    className: 'bg-transparent',
    html: `<div style="color: #ef4444; filter: drop-shadow(0 2px 4px rgba(0,0,0,0.5)); transform: translateY(-32px);">
            <svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" viewBox="0 0 24 24" fill="#ef4444" stroke="#000" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M20 10c0 4.993-5.539 10.193-7.399 11.799a1 1 0 0 1-1.202 0C9.539 20.193 4 14.993 4 10a8 8 0 0 1 16 0"/>
                <circle cx="12" cy="10" r="3" fill="#fff" stroke="#000" stroke-width="2" />
            </svg>
          </div>`,
    iconSize: [36, 36],
    iconAnchor: [18, 0], // Position correctly so the tip of the pin hits the center coordinate
});

export default function MiniMap({ lat, lng }: { lat: number, lng: number }) {
    if (!lat || !lng) return null;
    return (
        <MapContainer
            center={[lat, lng]}
            zoom={15}
            scrollWheelZoom={false}
            className="w-full h-full z-0"
            zoomControl={false}
        >
            <TileLayer
                url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
                attribution="&copy; Esri, Maxar, Earthstar Geographics"
            />
            <Marker position={[lat, lng]} icon={customIcon} />
        </MapContainer>
    );
}

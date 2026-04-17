'use client';

import { MapContainer, TileLayer } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import React from 'react';

interface CityMapProps {
  children?: React.ReactNode;
  center?: [number, number];
  zoom?: number;
}

export default function CityMap({
  children,
  center = [19.076, 72.8777], // Mumbai
  zoom = 12,
}: CityMapProps) {
  return (
    <MapContainer
      center={center}
      zoom={zoom}
      className="h-full w-full"
      zoomControl={false}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org">OSM</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      {children}
    </MapContainer>
  );
}

'use client';

import { Marker, Popup } from 'react-leaflet';
import L from 'leaflet';

interface TruckMarkerProps {
  position: [number, number];
  truckId: string;
  driverName?: string;
}

const truckIcon = L.divIcon({
  className: 'truck-marker',
  html: `
    <div style="
      width: 36px;
      height: 36px;
      border-radius: 50%;
      border: 3px solid #1a1a1a;
      background: #339AF0;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 18px;
      box-shadow: 2px 2px 0 #1a1a1a;
    ">
      🚛
    </div>
  `,
  iconSize: [36, 36],
  iconAnchor: [18, 18],
});

export default function TruckMarker({ position, truckId, driverName }: TruckMarkerProps) {
  return (
    <Marker position={position} icon={truckIcon}>
      <Popup>
        <strong>Truck {truckId}</strong>
        {driverName && <><br />Driver: {driverName}</>}
      </Popup>
    </Marker>
  );
}

'use client';

import { Polyline } from 'react-leaflet';

interface RoutePolylineProps {
  positions?: [number, number][];
  color?: string;
}

export default function RoutePolyline({
  positions = [
    [19.076, 72.877],
    [19.082, 72.890],
    [19.090, 72.870],
    [19.085, 72.865],
  ],
  color = '#1a1a1a',
}: RoutePolylineProps) {
  return (
    <Polyline
      positions={positions}
      pathOptions={{
        color,
        weight: 4,
        dashArray: '10 6',
        opacity: 0.8,
      }}
    />
  );
}

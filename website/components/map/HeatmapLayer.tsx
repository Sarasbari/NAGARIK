'use client';

import { useEffect } from 'react';
import { useMap } from 'react-leaflet';

/**
 * HeatmapLayer — Decay risk overlay for Radar mode.
 * Uses leaflet.heat plugin to render a weighted heatmap.
 */
export default function HeatmapLayer() {
  const map = useMap();

  useEffect(() => {
    // TODO: Fetch heatmap data from AI pipeline's /heatmap endpoint
    // Each point: [lat, lng, intensity]
    const mockData: [number, number, number][] = [
      [19.076, 72.877, 0.8],
      [19.082, 72.890, 0.6],
      [19.065, 72.860, 0.9],
      [19.090, 72.870, 0.4],
      [19.070, 72.850, 0.7],
    ];

    // Dynamic import for leaflet.heat (client-only)
    import('leaflet.heat').then((L: any) => {
      const heat = (L as any).default
        ? (L as any).default.heatLayer(mockData, {
            radius: 30,
            blur: 20,
            maxZoom: 15,
            gradient: {
              0.2: '#00ff88',
              0.4: '#ffff00',
              0.6: '#ff9933',
              0.8: '#ff4444',
              1.0: '#cc0000',
            },
          })
        : null;

      if (heat) {
        heat.addTo(map);
        return () => {
          map.removeLayer(heat);
        };
      }
    });
  }, [map]);

  return null;
}

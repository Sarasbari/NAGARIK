import dynamic from 'next/dynamic';

const CityMap = dynamic(() => import('../../components/map/CityMap'), { ssr: false });
const HeatmapLayer = dynamic(() => import('../../components/map/HeatmapLayer'), { ssr: false });

export default function RadarPage() {
  return (
    <div className="relative h-full">
      <CityMap>
        <HeatmapLayer />
      </CityMap>
      <div className="absolute top-4 left-4 z-[1000]">
        <div className="bg-white border-3 border-brutal-border shadow-brutal px-4 py-2 font-display font-bold">
          🔴 Radar Mode — Predictive Heatmap
        </div>
      </div>
    </div>
  );
}

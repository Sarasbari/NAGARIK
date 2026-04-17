import CityMap from '../../components/map/CityMap';
import RoutePolyline from '../../components/map/RoutePolyline';
import DispatchModal from '../../components/dispatch/DispatchModal';

export default function CommandPage() {
  return (
    <div className="relative h-full flex">
      {/* Map — 70% */}
      <div className="flex-[7] relative">
        <CityMap>
          <RoutePolyline />
        </CityMap>
      </div>

      {/* Dispatch Sidebar — 30% */}
      <div className="flex-[3] border-l-3 border-brutal-border bg-white overflow-y-auto p-6">
        <h2 className="font-display text-2xl font-bold mb-4">
          🚛 Command Center
        </h2>
        <p className="text-sm text-gray-500 mb-6">
          Optimized truck routes • Drag to reorder waypoints
        </p>
        <DispatchModal />
      </div>
    </div>
  );
}

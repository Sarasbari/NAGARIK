import Sidebar from '@/components/Sidebar';
import Header from '@/components/Header';
import StatCard from '@/components/StatCard';
import ControlPanel from '@/components/ControlPanel';
import dynamic from 'next/dynamic';
import {
  AlertTriangle,
  Droplets,
  Trash2
} from 'lucide-react';

// Dynamically import map to avoid SSR issues with Leaflet
const DashboardMap = dynamic(() => import('@/components/DashboardMap'), {
  ssr: false,
  loading: () => <div className="flex-1 bg-gray-100 border-4 border-black animate-pulse flex items-center justify-center font-black uppercase italic">Loading Command Map...</div>
});

export default function Home() {
  return (
    <div className="min-h-screen bg-white">
      <Sidebar />
      <div className="ml-64 flex flex-col min-h-screen">
        <Header />

        <main className="flex-1 p-8 bg-dot-grid">
          <div className="max-w-[1600px] mx-auto space-y-8">
            {/* Stat Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <StatCard
                title="Active Potholes"
                value="1,402"
                trend="+12%"
                trendLabel="Since 00:00"
                icon={AlertTriangle}
                iconColor="text-neon-orange"
                href="/potholes"
              />
              <StatCard
                title="Water Leaks"
                value="42"
                trend="80%"
                trendLabel="Contained"
                icon={Droplets}
                iconColor="text-blue-500"
                href="/water-leaks"
              />
              <StatCard
                title="Overflowing Bins"
                value="284"
                trend="Peak"
                trendLabel="Collection Phase"
                icon={Trash2}
                iconColor="text-neon-orange"
                href="/bins"
              />
            </div>

            {/* Dashboard Content */}
            <div className="flex gap-8">
              <ControlPanel />
              <DashboardMap />
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

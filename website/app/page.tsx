import Sidebar from '@/components/Sidebar';
import Header from '@/components/Header';
import StatCard from '@/components/StatCard';
import ControlPanel from '@/components/ControlPanel';
import dynamic from 'next/dynamic';
import { cookies } from 'next/headers';
import { createClient } from '@/utils/supabase/server';
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

export default async function Home() {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  // Fetch real counts from Supabase
  const [potholeRes, waterRes, garbageRes, totalRes] = await Promise.all([
    supabase
      .from('complaints')
      .select('*', { count: 'exact', head: true })
      .eq('category', 'Road Pothole'),
    supabase
      .from('complaints')
      .select('*', { count: 'exact', head: true })
      .in('category', ['Water Leak', 'Drainage Blocking']),
    supabase
      .from('complaints')
      .select('*', { count: 'exact', head: true })
      .eq('category', 'Overflowing Garbage'),
    supabase
      .from('complaints')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'Pending'),
  ]);

  const potholeCount = potholeRes.count ?? 0;
  const waterCount = waterRes.count ?? 0;
  const garbageCount = garbageRes.count ?? 0;
  const pendingCount = totalRes.count ?? 0;

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
                value={potholeCount}
                trend={`${pendingCount} pending`}
                trendLabel="Total"
                icon={AlertTriangle}
                iconColor="text-neon-orange"
                href="/potholes"
              />
              <StatCard
                title="Water & Drainage"
                value={waterCount}
                trend="Live"
                trendLabel="From Supabase"
                icon={Droplets}
                iconColor="text-blue-500"
                href="/water-leaks"
              />
              <StatCard
                title="Overflowing Bins"
                value={garbageCount}
                trend="Live"
                trendLabel="From Supabase"
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

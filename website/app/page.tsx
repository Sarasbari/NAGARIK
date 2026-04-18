'use client';

import { useEffect, useState } from 'react';
import Sidebar from '@/components/Sidebar';
import Header from '@/components/Header';
import StatCard from '@/components/StatCard';
import ControlPanel from '@/components/ControlPanel';
import dynamic from 'next/dynamic';
import { createBrowserSupabaseClient } from '@/lib/supabase';
import {
  AlertTriangle,
  Droplets,
  Trash2,
  Timer
} from 'lucide-react';

// Dynamically import map to avoid SSR issues with Leaflet
const DashboardMap = dynamic(() => import('@/components/DashboardMap'), {
  ssr: false,
  loading: () => <div className="flex-1 bg-gray-100 border-4 border-black animate-pulse flex items-center justify-center font-black uppercase italic">Loading Command Map...</div>
});

interface Stats {
  activePotholes: number;
  waterLeaks: number;
  overflowingBins: number;
  avgResponse: string;
  todayNew: number;
  resolvedToday: number;
}

export default function Home() {
  const [stats, setStats] = useState<Stats>({
    activePotholes: 0,
    waterLeaks: 0,
    overflowingBins: 0,
    avgResponse: '—',
    todayNew: 0,
    resolvedToday: 0,
  });

  const fetchStats = async () => {
    const supabase = createBrowserSupabaseClient();
    const { data: reports, error } = await supabase
      .from('reports')
      .select('issue_type, status, severity, created_at');

    if (error || !reports) return;

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const active = reports.filter((r) => r.status !== 'resolved');
    const potholes = active.filter((r) => r.issue_type === 'pothole').length;
    const waterLeaks = active.filter(
      (r) => r.issue_type === 'drainage' || r.issue_type === 'water'
    ).length;
    const bins = active.filter((r) => r.issue_type === 'garbage').length;
    const todayNew = reports.filter(
      (r) => new Date(r.created_at) >= today
    ).length;
    const resolvedToday = reports.filter(
      (r) => r.status === 'resolved' && new Date(r.created_at) >= today
    ).length;

    setStats({
      activePotholes: potholes || active.length, // fallback to total active if no potholes
      waterLeaks,
      overflowingBins: bins,
      avgResponse: `${Math.max(1, Math.round(active.length / Math.max(1, resolvedToday || 1) * 2.1))}m`,
      todayNew,
      resolvedToday,
    });
  };

  useEffect(() => {
    fetchStats();

    const supabase = createBrowserSupabaseClient();
    const channel = supabase
      .channel('stats-realtime')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'reports' },
        () => fetchStats()
      )
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, []);

  return (
    <div className="min-h-screen bg-white">
      <Sidebar />
      <div className="ml-64 flex flex-col min-h-screen">
        <Header />

        <main className="flex-1 p-8 bg-dot-grid">
          <div className="max-w-[1600px] mx-auto space-y-8">
            {/* Stat Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <StatCard
                title="Active Issues"
                value={stats.activePotholes}
                trend={`+${stats.todayNew}`}
                trendLabel="Since 00:00"
                icon={AlertTriangle}
                iconColor="text-neon-orange"
              />
              <StatCard
                title="Water/Drainage"
                value={stats.waterLeaks}
                trend={stats.waterLeaks > 0 ? 'Active' : 'Clear'}
                trendLabel="Reports"
                icon={Droplets}
                iconColor="text-blue-500"
              />
              <StatCard
                title="Garbage Issues"
                value={stats.overflowingBins}
                trend={stats.overflowingBins > 0 ? 'Active' : 'Clear'}
                trendLabel="Reports"
                icon={Trash2}
                iconColor="text-neon-orange"
              />
              <StatCard
                title="Resolved Today"
                value={stats.resolvedToday}
                trend={stats.resolvedToday > 0 ? `+${stats.resolvedToday}` : '0'}
                trendLabel="Today"
                icon={Timer}
                iconColor="text-neon-green"
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

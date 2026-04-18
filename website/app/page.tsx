'use client';

import { useEffect, useState, useCallback } from 'react';
import StatCard from '@/components/StatCard';
import ControlPanel from '@/components/ControlPanel';
import dynamic from 'next/dynamic';
import { createBrowserSupabaseClient } from '@/lib/supabase';
import {
  AlertTriangle,
  Droplets,
  Trash2,
  Timer,
  TrendingUp,
  MapPin
} from 'lucide-react';

// Dynamically import map to avoid SSR issues with Leaflet
const DashboardMap = dynamic(() => import('@/components/DashboardMap'), {
  ssr: false,
  loading: () => <div className="flex-1 bg-gray-100 border-4 border-black animate-pulse flex items-center justify-center font-black uppercase italic">Loading Command Map...</div>
});

interface Report {
  id: string;
  category: string;
  status: string;
  severity: number;
  latitude: number;
  longitude: number;
  image_url: string;
  description: string;
  created_at: string;
  ml_reason: string | null;
}

interface Stats {
  totalActive: number;
  potholes: number;
  waterLeaks: number;
  garbageIssues: number;
  todayNew: number;
  resolvedToday: number;
  criticalCount: number;
}

export default function Home() {
  const [stats, setStats] = useState<Stats>({
    totalActive: 0,
    potholes: 0,
    waterLeaks: 0,
    garbageIssues: 0,
    todayNew: 0,
    resolvedToday: 0,
    criticalCount: 0,
  });
  const [reports, setReports] = useState<Report[]>([]);

  const fetchData = useCallback(async () => {
    try {
      const res = await fetch('/api/reports');
      if (!res.ok) throw new Error('Failed to fetch reports');
      const data: Report[] = await res.json();

      setReports(data);

      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const active = data.filter(
        (r) => r.status !== 'resolved' && r.status !== 'rejected'
      );
      const potholes = active.filter(
        (r) => r.category === 'pothole' || r.category === 'road_decay'
      ).length;
      const waterLeaks = active.filter(
        (r) => r.category === 'waterlogging'
      ).length;
      const garbageIssues = active.filter(
        (r) => r.category === 'garbage'
      ).length;
      const todayNew = data.filter(
        (r) => new Date(r.created_at) >= today
      ).length;
      const resolvedToday = data.filter(
        (r) => r.status === 'resolved' && new Date(r.created_at) >= today
      ).length;
      const criticalCount = active.filter((r) => r.severity >= 4).length;

      setStats({
        totalActive: active.length,
        potholes,
        waterLeaks,
        garbageIssues,
        todayNew,
        resolvedToday,
        criticalCount,
      });
    } catch (err) {
      console.error('[Dashboard] fetch error:', err);
    }
  }, []);

  useEffect(() => {
    fetchData();

    // Real-time subscription to trigger re-fetch on any change
    const supabase = createBrowserSupabaseClient();
    const channel = supabase
      .channel('stats-realtime')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'reports' },
        () => fetchData()
      )
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [fetchData]);

  return (
    <main className="flex-1 p-8 bg-dot-grid min-h-screen">
      <div className="max-w-[1600px] mx-auto space-y-8">
        {/* Stat Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard
            title="Active Issues"
            value={stats.totalActive}
            trend={`+${stats.todayNew}`}
            trendLabel="Since 00:00"
            icon={AlertTriangle}
            iconColor="text-neon-orange"
          />
          <StatCard
            title="Road / Pothole"
            value={stats.potholes}
            trend={stats.potholes > 0 ? `${stats.criticalCount} critical` : 'Clear'}
            trendLabel="Reports"
            icon={MapPin}
            iconColor="text-red-500"
          />
          <StatCard
            title="Water / Drainage"
            value={stats.waterLeaks}
            trend={stats.waterLeaks > 0 ? 'Active' : 'Clear'}
            trendLabel="Reports"
            icon={Droplets}
            iconColor="text-blue-500"
          />
          <StatCard
            title="Garbage Issues"
            value={stats.garbageIssues}
            trend={stats.garbageIssues > 0 ? 'Active' : 'Clear'}
            trendLabel="Reports"
            icon={Trash2}
            iconColor="text-neon-orange"
          />
        </div>

        {/* Dashboard Content */}
        <div className="flex gap-8 h-[600px] items-stretch">
          <ControlPanel />
          <DashboardMap reports={reports} />
        </div>
      </div>
    </main>
  );
}

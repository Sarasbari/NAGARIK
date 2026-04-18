'use client';

import { useEffect, useState } from 'react';
import { createBrowserSupabaseClient } from '@/lib/supabase';

interface KPI {
  label: string;
  value: string;
  trend: string;
}

export default function KPIStrip() {
  const [kpis, setKpis] = useState<KPI[]>([
    { label: 'Open Issues', value: '—', trend: 'loading...' },
    { label: 'Severity 5', value: '—', trend: 'critical' },
    { label: 'AI Reviewed', value: '—', trend: 'today' },
    { label: 'Resolved', value: '—', trend: 'total' },
  ]);

  const fetchKPIs = async () => {
    const supabase = createBrowserSupabaseClient();

    // Fetch all reports to compute KPIs
    const { data: reports, error } = await supabase
      .from('reports')
      .select('status, severity, created_at');

    if (error || !reports) return;

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const open = reports.filter((r) => r.status !== 'resolved').length;
    const sev5 = reports.filter((r) => r.severity === 5).length;
    const aiReviewed = reports.filter((r) => r.status === 'ai_reviewed').length;
    const resolved = reports.filter((r) => r.status === 'resolved').length;
    const todayCount = reports.filter(
      (r) => new Date(r.created_at) >= today
    ).length;

    setKpis([
      { label: 'Open Issues', value: String(open), trend: `+${todayCount} today` },
      { label: 'Severity 5', value: String(sev5), trend: 'critical' },
      { label: 'AI Reviewed', value: String(aiReviewed), trend: 'pending review' },
      { label: 'Resolved', value: String(resolved), trend: 'total' },
    ]);
  };

  useEffect(() => {
    fetchKPIs();

    // Realtime subscription for auto-updating counts
    const supabase = createBrowserSupabaseClient();
    const channel = supabase
      .channel('kpi-realtime')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'reports' },
        () => {
          // Re-fetch all KPIs on any change
          fetchKPIs();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return (
    <div className="h-16 bg-brutal-border flex items-center px-4 gap-4">
      <span className="font-display font-bold text-saffron text-lg mr-4">
        🇮🇳 Nagarik
      </span>
      <div className="flex gap-3 overflow-x-auto">
        {kpis.map((kpi) => (
          <div
            key={kpi.label}
            className="flex items-center gap-2 bg-white border-2 border-saffron px-3 py-1 whitespace-nowrap"
          >
            <span className="font-display font-bold text-sm">{kpi.value}</span>
            <span className="text-xs text-gray-500">{kpi.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

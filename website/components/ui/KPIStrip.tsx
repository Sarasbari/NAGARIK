import BrutalCard from './BrutalCard';

// TODO: Real-time data from Supabase subscription
const MOCK_KPIS = [
  { label: 'Open Issues', value: '127', trend: '+12 today' },
  { label: 'SLA Breaches', value: '8', trend: '↓ from 14' },
  { label: 'Trucks Active', value: '5/8', trend: '3 idle' },
  { label: 'Resolved Today', value: '34', trend: '↑ 23%' },
];

export default function KPIStrip() {
  return (
    <div className="h-16 bg-brutal-border flex items-center px-4 gap-4">
      <span className="font-display font-bold text-saffron text-lg mr-4">
        🇮🇳 Nagarik
      </span>
      <div className="flex gap-3 overflow-x-auto">
        {MOCK_KPIS.map((kpi) => (
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

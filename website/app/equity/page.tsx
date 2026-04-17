import BrutalCard from '../../components/ui/BrutalCard';

// TODO: Calculate from Supabase data using equityScorer
const MOCK_WARDS = [
  { name: 'K-East', score: 0.92, issues: 45, resolved: 41 },
  { name: 'H-West', score: 0.78, issues: 38, resolved: 30 },
  { name: 'L-Ward', score: 0.65, issues: 52, resolved: 34 },
  { name: 'P-North', score: 0.45, issues: 61, resolved: 27 },
  { name: 'T-Ward', score: 0.31, issues: 29, resolved: 9 },
];

export default function EquityPage() {
  return (
    <div className="p-6 max-w-5xl mx-auto">
      <h1 className="font-display text-3xl font-bold mb-2">⚖️ Ward Equity</h1>
      <p className="text-sm text-gray-500 mb-8">
        30-day rolling equity score — ensuring fair resource allocation
      </p>

      <div className="space-y-4">
        {MOCK_WARDS.map((ward) => (
          <BrutalCard key={ward.name}>
            <div className="flex items-center justify-between mb-2">
              <span className="font-bold text-lg">{ward.name}</span>
              <span className="font-mono font-bold text-lg">
                {(ward.score * 100).toFixed(0)}%
              </span>
            </div>
            <div className="w-full h-6 bg-gray-100 border-2 border-brutal-border overflow-hidden">
              <div
                className="h-full transition-all duration-500"
                style={{
                  width: `${ward.score * 100}%`,
                  backgroundColor:
                    ward.score >= 0.7 ? '#51CF66' : ward.score >= 0.4 ? '#FCC419' : '#FF6B6B',
                }}
              />
            </div>
            <p className="text-xs text-gray-500 mt-1">
              {ward.resolved}/{ward.issues} issues resolved
            </p>
          </BrutalCard>
        ))}
      </div>
    </div>
  );
}

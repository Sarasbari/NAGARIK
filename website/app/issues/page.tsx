import BrutalCard from '../../components/ui/BrutalCard';
import StatusBadge from '../../components/ui/StatusBadge';

// TODO: Fetch from Supabase, sorted by SLA urgency
const MOCK_ISSUES = [
  { id: '001', type: 'Pothole', ward: 'K-East', status: 'submitted', slaHours: 4, severity: 4 },
  { id: '002', type: 'Garbage Dump', ward: 'H-West', status: 'assigned', slaHours: 12, severity: 3 },
  { id: '003', type: 'Drainage', ward: 'L-Ward', status: 'in_progress', slaHours: 24, severity: 5 },
];

export default function IssuesPage() {
  return (
    <div className="p-6 max-w-5xl mx-auto">
      <h1 className="font-display text-3xl font-bold mb-6">📋 Issue Queue</h1>
      <p className="text-sm text-gray-500 mb-8">Sorted by SLA urgency</p>

      <div className="space-y-4">
        {MOCK_ISSUES.map((issue) => (
          <a key={issue.id} href={`/issues/${issue.id}`}>
            <BrutalCard className="flex items-center justify-between hover:-translate-y-0.5 transition-transform cursor-pointer">
              <div>
                <p className="font-bold text-lg">{issue.type}</p>
                <p className="text-sm text-gray-500">
                  {issue.ward} • Severity {issue.severity}/5
                </p>
              </div>
              <div className="flex items-center gap-4">
                <span className="text-sm font-mono font-bold text-red-600">
                  {issue.slaHours}h SLA
                </span>
                <StatusBadge status={issue.status} />
              </div>
            </BrutalCard>
          </a>
        ))}
      </div>
    </div>
  );
}

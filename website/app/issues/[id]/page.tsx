import SidePanel from '../../../components/ui/SidePanel';
import StatusBadge from '../../../components/ui/StatusBadge';

interface Props {
  params: { id: string };
}

export default function IssueDetailPage({ params }: Props) {
  const { id } = params;
  // TODO: Fetch issue from Supabase by ID

  return (
    <div className="h-full flex">
      {/* Background: issue queue or map */}
      <div className="flex-1 bg-gray-50 flex items-center justify-center">
        <p className="text-gray-400">← Issue queue behind panel</p>
      </div>

      {/* Slide-in Detail Panel */}
      <SidePanel>
        <div className="space-y-6">
          <div>
            <h2 className="font-display text-2xl font-bold">Issue #{id}</h2>
            <StatusBadge status="assigned" />
          </div>

          <div className="space-y-2">
            <p className="font-bold">Type: <span className="font-normal">Pothole</span></p>
            <p className="font-bold">Ward: <span className="font-normal">K-East</span></p>
            <p className="font-bold">Severity: <span className="font-normal">4/5</span></p>
            <p className="font-bold">SLA Remaining: <span className="font-normal text-red-600">4h 23m</span></p>
          </div>

          <div>
            <h3 className="font-bold mb-2">📸 Photo Evidence</h3>
            <div className="w-full h-48 bg-gray-200 border-3 border-brutal-border rounded-lg flex items-center justify-center">
              <span className="text-gray-400">[Issue Photo]</span>
            </div>
          </div>

          <div>
            <h3 className="font-bold mb-2">📍 Location</h3>
            <div className="w-full h-32 bg-gray-200 border-3 border-brutal-border rounded-lg flex items-center justify-center">
              <span className="text-gray-400">[Mini Map]</span>
            </div>
          </div>

          <button className="w-full bg-brutal-border text-saffron font-bold py-3 border-3 border-brutal-border shadow-brutal hover:shadow-brutal-sm transition-shadow">
            🚛 Dispatch Crew
          </button>
        </div>
      </SidePanel>
    </div>
  );
}

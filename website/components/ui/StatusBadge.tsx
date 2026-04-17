interface StatusBadgeProps {
  status: string;
}

const STATUS_MAP: Record<string, { label: string; bg: string; text: string }> = {
  submitted: { label: 'Submitted', bg: 'bg-blue-100', text: 'text-blue-700' },
  classified: { label: 'Classified', bg: 'bg-purple-100', text: 'text-purple-700' },
  assigned: { label: 'Assigned', bg: 'bg-orange-100', text: 'text-orange-700' },
  dispatched: { label: 'Dispatched', bg: 'bg-green-100', text: 'text-green-700' },
  in_progress: { label: 'In Progress', bg: 'bg-yellow-100', text: 'text-yellow-700' },
  resolved: { label: 'Resolved', bg: 'bg-emerald-100', text: 'text-emerald-700' },
};

export default function StatusBadge({ status }: StatusBadgeProps) {
  const config = STATUS_MAP[status] ?? STATUS_MAP.submitted;
  return (
    <span
      className={`inline-block px-3 py-1 text-xs font-bold uppercase tracking-wider border-2 border-brutal-border ${config.bg} ${config.text}`}
    >
      {config.label}
    </span>
  );
}

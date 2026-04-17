// core/constants — Static values used across the app

export const OTP_LENGTH = 6;

export const ISSUE_TYPES = [
  { id: 'pothole', label: '🕳️ Pothole', color: '#FF6B6B' },
  { id: 'garbage', label: '🗑️ Garbage Dump', color: '#51CF66' },
  { id: 'drainage', label: '💧 Drainage/Sewage', color: '#339AF0' },
  { id: 'streetlight', label: '💡 Streetlight', color: '#FCC419' },
  { id: 'encroachment', label: '🚧 Encroachment', color: '#FF922B' },
  { id: 'water', label: '🚰 Water Supply', color: '#22B8CF' },
  { id: 'road', label: '🛣️ Road Damage', color: '#845EF7' },
  { id: 'other', label: '📋 Other', color: '#868E96' },
] as const;

export const TIMELINE_STEPS = [
  { key: 'submitted', label: 'Submitted', icon: '📤' },
  { key: 'classified', label: 'AI Classified', icon: '🤖' },
  { key: 'assigned', label: 'Assigned to Dept', icon: '🏢' },
  { key: 'dispatched', label: 'Crew Dispatched', icon: '🚛' },
  { key: 'in_progress', label: 'In Progress', icon: '🔧' },
  { key: 'resolved', label: 'Resolved', icon: '✅' },
] as const;

export const API_TIMEOUT = 30000;

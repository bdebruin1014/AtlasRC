const STATUS_COLORS = {
  active: 'bg-green-100 text-green-800',
  completed: 'bg-blue-100 text-blue-800',
  'on-hold': 'bg-yellow-100 text-yellow-800',
  cancelled: 'bg-red-100 text-red-800',
  success: 'bg-green-100 text-green-800',
  warning: 'bg-yellow-100 text-yellow-800',
  error: 'bg-red-100 text-red-800',
  info: 'bg-blue-100 text-blue-800',
};

export default function StatusBadge({ status, variant }) {
  const color = STATUS_COLORS[variant || status] || 'bg-gray-100 text-gray-800';
  return (
    <span className={`inline-block px-2 py-1 rounded text-xs font-semibold ${color}`}>{status}</span>
  );
}

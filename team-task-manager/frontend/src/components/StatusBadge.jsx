const statusConfig = {
  TODO: { label: 'To Do', bg: 'bg-gray-100', text: 'text-gray-700', dot: 'bg-gray-400' },
  IN_PROGRESS: { label: 'In Progress', bg: 'bg-blue-100', text: 'text-blue-700', dot: 'bg-blue-500' },
  DONE: { label: 'Done', bg: 'bg-green-100', text: 'text-green-700', dot: 'bg-green-500' },
};

const priorityConfig = {
  LOW: { label: 'Low', bg: 'bg-slate-100', text: 'text-slate-600' },
  MEDIUM: { label: 'Medium', bg: 'bg-yellow-100', text: 'text-yellow-700' },
  HIGH: { label: 'High', bg: 'bg-red-100', text: 'text-red-700' },
};

const StatusBadge = ({ status, type = 'status' }) => {
  const config = type === 'priority' ? priorityConfig[status] : statusConfig[status];

  if (!config) return null;

  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${config.bg} ${config.text}`}>
      {type === 'status' && config.dot && <span className={`w-1.5 h-1.5 rounded-full ${config.dot}`} />}
      {config.label}
    </span>
  );
};

export default StatusBadge;

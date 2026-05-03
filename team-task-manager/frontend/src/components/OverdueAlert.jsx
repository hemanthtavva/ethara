import { AlertTriangle } from 'lucide-react';

const OverdueAlert = ({ dueDate, status }) => {
  if (status === 'DONE' || !dueDate) return null;

  const now = new Date();
  now.setHours(0, 0, 0, 0);
  const due = new Date(dueDate);
  due.setHours(0, 0, 0, 0);

  if (due >= now) return null;

  const diffDays = Math.ceil((now - due) / (1000 * 60 * 60 * 24));

  return (
    <span className="inline-flex items-center gap-1 text-xs font-medium text-red-600 bg-red-50 px-2 py-0.5 rounded-full">
      <AlertTriangle className="h-3 w-3" />
      Overdue by {diffDays} day{diffDays !== 1 ? 's' : ''}
    </span>
  );
};

export default OverdueAlert;

import { Link } from 'react-router-dom';
import { Calendar, User } from 'lucide-react';
import StatusBadge from './StatusBadge';
import OverdueAlert from './OverdueAlert';

const TaskCard = ({ task }) => {
  const isOverdue = task.dueDate && task.status !== 'DONE' && new Date(task.dueDate) < new Date(new Date().setHours(0, 0, 0, 0));

  return (
    <Link
      to={`/tasks/${task.id}`}
      className={`block p-4 rounded-xl border transition-all hover:shadow-md ${
        isOverdue ? 'border-red-200 bg-red-50/50' : 'border-gray-200 bg-white hover:border-indigo-200'
      }`}
    >
      <div className="flex items-start justify-between gap-3 mb-3">
        <h3 className="font-semibold text-gray-900 text-sm leading-tight">{task.title}</h3>
        <StatusBadge status={task.priority} type="priority" />
      </div>

      <div className="flex flex-wrap items-center gap-2 mb-2">
        <StatusBadge status={task.status} />
        <OverdueAlert dueDate={task.dueDate} status={task.status} />
      </div>

      <div className="flex items-center justify-between text-xs text-gray-500 mt-3">
        {task.dueDate && (
          <span className={`flex items-center gap-1 ${isOverdue ? 'text-red-500 font-medium' : ''}`}>
            <Calendar className="h-3 w-3" />
            {new Date(task.dueDate).toLocaleDateString()}
          </span>
        )}
        {task.assignedTo && (
          <span className="flex items-center gap-1">
            <User className="h-3 w-3" />
            {task.assignedTo.name}
          </span>
        )}
      </div>
    </Link>
  );
};

export default TaskCard;

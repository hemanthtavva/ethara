import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import API from '../api/axios';
import StatusBadge from '../components/StatusBadge';
import OverdueAlert from '../components/OverdueAlert';
import { Loader2, ArrowLeft, Calendar, User, FolderKanban, Trash2 } from 'lucide-react';

const TaskDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAdmin } = useAuth();
  const [task, setTask] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  const fetchTask = async () => {
    try {
      const res = await API.get(`/tasks/${id}`);
      setTask(res.data.data);
    } catch (err) {
      console.error('Fetch task error:', err);
      if (err.response?.status === 404 || err.response?.status === 403) {
        navigate('/dashboard');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTask();
  }, [id]);

  const handleStatusChange = async (newStatus) => {
    setUpdating(true);
    try {
      const res = await API.put(`/tasks/${id}`, { status: newStatus });
      setTask(res.data.data);
    } catch (err) {
      console.error('Update status error:', err);
    } finally {
      setUpdating(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this task?')) return;
    try {
      await API.delete(`/tasks/${id}`);
      navigate(-1);
    } catch (err) {
      console.error('Delete task error:', err);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
      </div>
    );
  }

  if (!task) return null;

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <button onClick={() => navigate(-1)} className="flex items-center gap-1 text-sm text-gray-500 hover:text-indigo-600 mb-6">
        <ArrowLeft className="h-4 w-4" /> Back
      </button>

      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
        {/* Header */}
        <div className="p-6 border-b border-gray-100">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h1 className="text-xl font-bold text-gray-900 mb-3">{task.title}</h1>
              <div className="flex flex-wrap items-center gap-2">
                <StatusBadge status={task.status} />
                <StatusBadge status={task.priority} type="priority" />
                <OverdueAlert dueDate={task.dueDate} status={task.status} />
              </div>
            </div>
            {isAdmin && (
              <button onClick={handleDelete} className="p-2.5 rounded-lg border border-red-200 text-red-500 hover:bg-red-50">
                <Trash2 className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>

        {/* Body */}
        <div className="p-6 space-y-6">
          {task.description && (
            <div>
              <h3 className="text-sm font-medium text-gray-500 mb-2">Description</h3>
              <p className="text-gray-900 text-sm leading-relaxed">{task.description}</p>
            </div>
          )}

          {/* Status Update */}
          <div>
            <h3 className="text-sm font-medium text-gray-500 mb-2">Update Status</h3>
            <div className="flex gap-2">
              {['TODO', 'IN_PROGRESS', 'DONE'].map((s) => (
                <button
                  key={s}
                  onClick={() => handleStatusChange(s)}
                  disabled={updating || task.status === s}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                    task.status === s
                      ? 'bg-indigo-600 text-white'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  } disabled:opacity-50`}
                >
                  {s === 'TODO' ? 'To Do' : s === 'IN_PROGRESS' ? 'In Progress' : 'Done'}
                </button>
              ))}
            </div>
          </div>

          {/* Details Grid */}
          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-2 text-gray-500 text-xs mb-1.5">
                <User className="h-3.5 w-3.5" /> Assigned To
              </div>
              <p className="text-sm font-medium text-gray-900">
                {task.assignedTo ? task.assignedTo.name : 'Unassigned'}
              </p>
            </div>

            <div className="p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-2 text-gray-500 text-xs mb-1.5">
                <Calendar className="h-3.5 w-3.5" /> Due Date
              </div>
              <p className={`text-sm font-medium ${
                task.dueDate && task.status !== 'DONE' && new Date(task.dueDate) < new Date(new Date().setHours(0,0,0,0))
                  ? 'text-red-600' : 'text-gray-900'
              }`}>
                {task.dueDate ? new Date(task.dueDate).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) : 'No due date'}
              </p>
            </div>

            <div className="p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-2 text-gray-500 text-xs mb-1.5">
                <FolderKanban className="h-3.5 w-3.5" /> Project
              </div>
              <p className="text-sm font-medium text-gray-900">{task.project?.name}</p>
            </div>

            <div className="p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-2 text-gray-500 text-xs mb-1.5">
                <User className="h-3.5 w-3.5" /> Created By
              </div>
              <p className="text-sm font-medium text-gray-900">{task.createdBy?.name}</p>
            </div>
          </div>

          <div className="text-xs text-gray-400 pt-2 border-t border-gray-100">
            Created: {new Date(task.createdAt).toLocaleString()} &middot; Updated: {new Date(task.updatedAt).toLocaleString()}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TaskDetail;

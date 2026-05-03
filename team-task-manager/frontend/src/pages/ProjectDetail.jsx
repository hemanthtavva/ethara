import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import API from '../api/axios';
import TaskCard from '../components/TaskCard';
import { Loader2, Plus, ArrowLeft, Users, X, Trash2, UserPlus } from 'lucide-react';

const ProjectDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAdmin } = useAuth();
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showCreateTask, setShowCreateTask] = useState(false);
  const [showAddMember, setShowAddMember] = useState(false);
  const [allUsers, setAllUsers] = useState([]);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState('');

  // Filters
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [priorityFilter, setPriorityFilter] = useState('ALL');
  const [assigneeFilter, setAssigneeFilter] = useState('ALL');

  const [taskForm, setTaskForm] = useState({
    title: '', description: '', status: 'TODO', priority: 'MEDIUM', dueDate: '', assignedToId: '',
  });

  const fetchProject = async () => {
    try {
      const res = await API.get(`/projects/${id}`);
      setProject(res.data.data);
    } catch (err) {
      console.error('Fetch project error:', err);
      if (err.response?.status === 404 || err.response?.status === 403) {
        navigate('/projects');
      }
    } finally {
      setLoading(false);
    }
  };

  const fetchUsers = async () => {
    try {
      const res = await API.get('/users');
      setAllUsers(res.data.data);
    } catch (err) {
      console.error('Fetch users error:', err);
    }
  };

  useEffect(() => {
    fetchProject();
    if (isAdmin) fetchUsers();
  }, [id]);

  const handleCreateTask = async (e) => {
    e.preventDefault();
    setError('');

    if (!taskForm.title.trim()) {
      setError('Task title is required');
      return;
    }

    setCreating(true);
    try {
      await API.post('/tasks', { ...taskForm, projectId: id, assignedToId: taskForm.assignedToId || null });
      setTaskForm({ title: '', description: '', status: 'TODO', priority: 'MEDIUM', dueDate: '', assignedToId: '' });
      setShowCreateTask(false);
      fetchProject();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create task');
    } finally {
      setCreating(false);
    }
  };

  const handleAddMember = async (userId) => {
    try {
      await API.post(`/projects/${id}/members`, { userId });
      fetchProject();
    } catch (err) {
      console.error('Add member error:', err);
    }
  };

  const handleRemoveMember = async (userId) => {
    try {
      await API.delete(`/projects/${id}/members/${userId}`);
      fetchProject();
    } catch (err) {
      console.error('Remove member error:', err);
    }
  };

  const handleDeleteProject = async () => {
    if (!window.confirm('Are you sure you want to delete this project? This will also delete all tasks.')) return;
    try {
      await API.delete(`/projects/${id}`);
      navigate('/projects');
    } catch (err) {
      console.error('Delete project error:', err);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
      </div>
    );
  }

  if (!project) return null;

  const filteredTasks = (project.tasks || []).filter((task) => {
    if (statusFilter !== 'ALL' && task.status !== statusFilter) return false;
    if (priorityFilter !== 'ALL' && task.priority !== priorityFilter) return false;
    if (assigneeFilter !== 'ALL' && task.assignedToId !== assigneeFilter) return false;
    return true;
  });

  const memberIds = project.members?.map((m) => m.userId) || [];
  const nonMembers = allUsers.filter((u) => !memberIds.includes(u.id));

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <button onClick={() => navigate('/projects')} className="flex items-center gap-1 text-sm text-gray-500 hover:text-indigo-600 mb-2">
            <ArrowLeft className="h-4 w-4" /> Back to Projects
          </button>
          <h1 className="text-2xl font-bold text-gray-900">{project.name}</h1>
          {project.description && <p className="text-gray-500 mt-1">{project.description}</p>}
        </div>
        {isAdmin && (
          <div className="flex gap-2">
            <button onClick={() => setShowCreateTask(true)} className="flex items-center gap-2 px-4 py-2.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 text-sm font-medium">
              <Plus className="h-4 w-4" /> Add Task
            </button>
            <button onClick={handleDeleteProject} className="p-2.5 rounded-lg border border-red-200 text-red-500 hover:bg-red-50">
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        )}
      </div>

      <div className="grid lg:grid-cols-4 gap-8">
        {/* Main: Tasks */}
        <div className="lg:col-span-3">
          {/* Filters */}
          <div className="flex flex-wrap gap-3 mb-5">
            <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="px-3 py-2 rounded-lg border border-gray-300 text-sm bg-white focus:border-indigo-500 outline-none">
              <option value="ALL">All Status</option>
              <option value="TODO">To Do</option>
              <option value="IN_PROGRESS">In Progress</option>
              <option value="DONE">Done</option>
            </select>
            <select value={priorityFilter} onChange={(e) => setPriorityFilter(e.target.value)} className="px-3 py-2 rounded-lg border border-gray-300 text-sm bg-white focus:border-indigo-500 outline-none">
              <option value="ALL">All Priority</option>
              <option value="LOW">Low</option>
              <option value="MEDIUM">Medium</option>
              <option value="HIGH">High</option>
            </select>
            <select value={assigneeFilter} onChange={(e) => setAssigneeFilter(e.target.value)} className="px-3 py-2 rounded-lg border border-gray-300 text-sm bg-white focus:border-indigo-500 outline-none">
              <option value="ALL">All Assignees</option>
              {project.members?.map((m) => (
                <option key={m.userId} value={m.userId}>{m.user.name}</option>
              ))}
            </select>
          </div>

          {filteredTasks.length === 0 ? (
            <div className="text-center py-16 bg-white rounded-xl border border-gray-200">
              <p className="text-gray-500">No tasks found</p>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 gap-3">
              {filteredTasks.map((task) => (
                <TaskCard key={task.id} task={task} />
              ))}
            </div>
          )}
        </div>

        {/* Sidebar: Members */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <Users className="h-5 w-5 text-gray-400" /> Members
            </h2>
            {isAdmin && (
              <button onClick={() => setShowAddMember(!showAddMember)} className="p-1.5 rounded-lg hover:bg-indigo-50 text-indigo-600">
                <UserPlus className="h-4 w-4" />
              </button>
            )}
          </div>

          {showAddMember && isAdmin && nonMembers.length > 0 && (
            <div className="mb-4 p-3 bg-gray-50 rounded-lg border border-gray-200 space-y-2 max-h-40 overflow-y-auto">
              {nonMembers.map((u) => (
                <button
                  key={u.id}
                  onClick={() => handleAddMember(u.id)}
                  className="w-full text-left px-3 py-2 rounded-lg hover:bg-indigo-50 text-sm flex items-center justify-between"
                >
                  <span>{u.name}</span>
                  <Plus className="h-3.5 w-3.5 text-indigo-600" />
                </button>
              ))}
            </div>
          )}

          <div className="space-y-2">
            {project.members?.map((m) => (
              <div key={m.id} className="flex items-center justify-between p-3 bg-white rounded-lg border border-gray-200">
                <div>
                  <p className="text-sm font-medium text-gray-900">{m.user.name}</p>
                  <p className="text-xs text-gray-500">{m.user.email}</p>
                </div>
                {isAdmin && (
                  <button onClick={() => handleRemoveMember(m.userId)} className="p-1 rounded hover:bg-red-50 text-gray-400 hover:text-red-500">
                    <X className="h-4 w-4" />
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Create Task Modal */}
      {showCreateTask && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 px-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg p-6">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-semibold text-gray-900">Create Task</h2>
              <button onClick={() => setShowCreateTask(false)} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400">
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleCreateTask} className="space-y-4">
              {error && <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-red-600 text-sm">{error}</div>}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Title</label>
                <input
                  type="text"
                  value={taskForm.title}
                  onChange={(e) => setTaskForm({ ...taskForm, title: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none text-sm"
                  placeholder="Task title"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Description</label>
                <textarea
                  value={taskForm.description}
                  onChange={(e) => setTaskForm({ ...taskForm, description: e.target.value })}
                  rows={3}
                  className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none text-sm resize-none"
                  placeholder="Task description (optional)"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Status</label>
                  <select value={taskForm.status} onChange={(e) => setTaskForm({ ...taskForm, status: e.target.value })} className="w-full px-4 py-2.5 rounded-lg border border-gray-300 text-sm bg-white outline-none">
                    <option value="TODO">To Do</option>
                    <option value="IN_PROGRESS">In Progress</option>
                    <option value="DONE">Done</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Priority</label>
                  <select value={taskForm.priority} onChange={(e) => setTaskForm({ ...taskForm, priority: e.target.value })} className="w-full px-4 py-2.5 rounded-lg border border-gray-300 text-sm bg-white outline-none">
                    <option value="LOW">Low</option>
                    <option value="MEDIUM">Medium</option>
                    <option value="HIGH">High</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Due Date</label>
                  <input
                    type="date"
                    value={taskForm.dueDate}
                    onChange={(e) => setTaskForm({ ...taskForm, dueDate: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-lg border border-gray-300 text-sm outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Assign To</label>
                  <select value={taskForm.assignedToId} onChange={(e) => setTaskForm({ ...taskForm, assignedToId: e.target.value })} className="w-full px-4 py-2.5 rounded-lg border border-gray-300 text-sm bg-white outline-none">
                    <option value="">Unassigned</option>
                    {project.members?.map((m) => (
                      <option key={m.userId} value={m.userId}>{m.user.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowCreateTask(false)} className="flex-1 py-2.5 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 text-sm font-medium">
                  Cancel
                </button>
                <button type="submit" disabled={creating} className="flex-1 py-2.5 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 text-sm font-medium disabled:opacity-50 flex items-center justify-center gap-2">
                  {creating && <Loader2 className="h-4 w-4 animate-spin" />}
                  {creating ? 'Creating...' : 'Create Task'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProjectDetail;

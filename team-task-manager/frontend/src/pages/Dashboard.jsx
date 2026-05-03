import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import API from '../api/axios';
import TaskCard from '../components/TaskCard';
import { FolderKanban, ListTodo, Clock, CheckCircle, AlertTriangle, Loader2 } from 'lucide-react';

const Dashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({ projects: 0, total: 0, inProgress: 0, done: 0, overdue: 0 });
  const [recentTasks, setRecentTasks] = useState([]);
  const [overdueTasks, setOverdueTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [projectsRes, tasksRes, overdueRes] = await Promise.all([
          API.get('/projects'),
          API.get('/tasks'),
          API.get('/tasks/overdue'),
        ]);

        const projects = projectsRes.data.data;
        const tasks = tasksRes.data.data;
        const overdue = overdueRes.data.data;

        setStats({
          projects: projects.length,
          total: tasks.length,
          inProgress: tasks.filter((t) => t.status === 'IN_PROGRESS').length,
          done: tasks.filter((t) => t.status === 'DONE').length,
          overdue: overdue.length,
        });

        setRecentTasks(tasks.slice(0, 5));
        setOverdueTasks(overdue);
      } catch (error) {
        console.error('Dashboard fetch error:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
      </div>
    );
  }

  const statCards = [
    { label: 'Total Projects', value: stats.projects, icon: FolderKanban, color: 'text-indigo-600', bg: 'bg-indigo-50' },
    { label: 'Total Tasks', value: stats.total, icon: ListTodo, color: 'text-blue-600', bg: 'bg-blue-50' },
    { label: 'In Progress', value: stats.inProgress, icon: Clock, color: 'text-amber-600', bg: 'bg-amber-50' },
    { label: 'Completed', value: stats.done, icon: CheckCircle, color: 'text-green-600', bg: 'bg-green-50' },
    { label: 'Overdue', value: stats.overdue, icon: AlertTriangle, color: 'text-red-600', bg: 'bg-red-50' },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Welcome back, {user?.name}</h1>
        <p className="text-gray-500 mt-1">Here's what's happening with your projects.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-8">
        {statCards.map((card) => (
          <div
            key={card.label}
            className={`p-5 rounded-xl border ${card.label === 'Overdue' && stats.overdue > 0 ? 'border-red-200 bg-red-50/50' : 'border-gray-200 bg-white'}`}
          >
            <div className={`inline-flex p-2 rounded-lg ${card.bg} mb-3`}>
              <card.icon className={`h-5 w-5 ${card.color}`} />
            </div>
            <p className={`text-2xl font-bold ${card.label === 'Overdue' && stats.overdue > 0 ? 'text-red-600' : 'text-gray-900'}`}>{card.value}</p>
            <p className="text-xs text-gray-500 mt-1">{card.label}</p>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-8">
        {/* Recent Tasks */}
        <div>
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Recent Tasks</h2>
          {recentTasks.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-xl border border-gray-200">
              <ListTodo className="h-10 w-10 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500 text-sm">No tasks yet</p>
            </div>
          ) : (
            <div className="space-y-3">
              {recentTasks.map((task) => (
                <TaskCard key={task.id} task={task} />
              ))}
            </div>
          )}
        </div>

        {/* Overdue Tasks */}
        <div>
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <AlertTriangle className={`h-5 w-5 ${overdueTasks.length > 0 ? 'text-red-500' : 'text-gray-400'}`} />
            Overdue Tasks
            {overdueTasks.length > 0 && (
              <span className="text-xs font-medium text-red-600 bg-red-100 px-2 py-0.5 rounded-full">{overdueTasks.length}</span>
            )}
          </h2>
          {overdueTasks.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-xl border border-gray-200">
              <CheckCircle className="h-10 w-10 text-green-300 mx-auto mb-3" />
              <p className="text-gray-500 text-sm">No overdue tasks!</p>
            </div>
          ) : (
            <div className="space-y-3">
              {overdueTasks.map((task) => (
                <TaskCard key={task.id} task={task} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;

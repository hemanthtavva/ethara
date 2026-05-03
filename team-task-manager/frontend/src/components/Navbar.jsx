import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LogOut, LayoutDashboard, FolderKanban, Users, Menu, X } from 'lucide-react';
import { useState } from 'react';

const Navbar = () => {
  const { user, logout, isAdmin } = useAuth();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="bg-white border-b border-gray-200 shadow-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          <Link to="/dashboard" className="flex items-center gap-2">
            <FolderKanban className="h-7 w-7 text-indigo-600" />
            <span className="text-xl font-bold text-gray-900">TaskManager</span>
          </Link>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-6">
            <Link to="/dashboard" className="flex items-center gap-1 text-gray-600 hover:text-indigo-600 transition-colors text-sm font-medium">
              <LayoutDashboard className="h-4 w-4" /> Dashboard
            </Link>
            <Link to="/projects" className="flex items-center gap-1 text-gray-600 hover:text-indigo-600 transition-colors text-sm font-medium">
              <FolderKanban className="h-4 w-4" /> Projects
            </Link>
            {isAdmin && (
              <Link to="/manage-team" className="flex items-center gap-1 text-gray-600 hover:text-indigo-600 transition-colors text-sm font-medium">
                <Users className="h-4 w-4" /> Manage Team
              </Link>
            )}
            <div className="flex items-center gap-3 ml-4 pl-4 border-l border-gray-200">
              <div className="text-right">
                <p className="text-sm font-medium text-gray-900">{user?.name}</p>
                <p className="text-xs text-gray-500">{user?.role}</p>
              </div>
              <button
                onClick={handleLogout}
                className="p-2 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors"
                title="Logout"
              >
                <LogOut className="h-5 w-5" />
              </button>
            </div>
          </div>

          {/* Mobile menu button */}
          <button onClick={() => setMobileOpen(!mobileOpen)} className="md:hidden p-2 rounded-lg text-gray-400 hover:text-gray-600">
            {mobileOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>

        {/* Mobile nav */}
        {mobileOpen && (
          <div className="md:hidden py-4 space-y-2 border-t border-gray-100">
            <Link to="/dashboard" onClick={() => setMobileOpen(false)} className="flex items-center gap-2 px-3 py-2 rounded-lg text-gray-600 hover:bg-indigo-50 hover:text-indigo-600">
              <LayoutDashboard className="h-4 w-4" /> Dashboard
            </Link>
            <Link to="/projects" onClick={() => setMobileOpen(false)} className="flex items-center gap-2 px-3 py-2 rounded-lg text-gray-600 hover:bg-indigo-50 hover:text-indigo-600">
              <FolderKanban className="h-4 w-4" /> Projects
            </Link>
            {isAdmin && (
              <Link to="/manage-team" onClick={() => setMobileOpen(false)} className="flex items-center gap-2 px-3 py-2 rounded-lg text-gray-600 hover:bg-indigo-50 hover:text-indigo-600">
                <Users className="h-4 w-4" /> Manage Team
              </Link>
            )}
            <div className="px-3 py-2 flex items-center justify-between border-t border-gray-100 mt-2 pt-3">
              <div>
                <p className="text-sm font-medium text-gray-900">{user?.name}</p>
                <p className="text-xs text-gray-500">{user?.role}</p>
              </div>
              <button onClick={handleLogout} className="p-2 rounded-lg text-red-500 hover:bg-red-50">
                <LogOut className="h-5 w-5" />
              </button>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;

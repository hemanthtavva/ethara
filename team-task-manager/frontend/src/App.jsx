import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import Navbar from './components/Navbar';
import PrivateRoute from './components/PrivateRoute';
import RoleRoute from './components/RoleRoute';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Dashboard from './pages/Dashboard';
import Projects from './pages/Projects';
import ProjectDetail from './pages/ProjectDetail';
import TaskDetail from './pages/TaskDetail';
import ManageTeam from './pages/ManageTeam';

const AppLayout = ({ children }) => {
  return (
    <>
      <Navbar />
      <main>{children}</main>
    </>
  );
};

const App = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <Routes>
      <Route path="/login" element={user ? <Navigate to="/dashboard" replace /> : <Login />} />
      <Route path="/signup" element={user ? <Navigate to="/dashboard" replace /> : <Signup />} />

      <Route path="/dashboard" element={
        <PrivateRoute>
          <AppLayout><Dashboard /></AppLayout>
        </PrivateRoute>
      } />

      <Route path="/projects" element={
        <PrivateRoute>
          <AppLayout><Projects /></AppLayout>
        </PrivateRoute>
      } />

      <Route path="/projects/:id" element={
        <PrivateRoute>
          <AppLayout><ProjectDetail /></AppLayout>
        </PrivateRoute>
      } />

      <Route path="/tasks/:id" element={
        <PrivateRoute>
          <AppLayout><TaskDetail /></AppLayout>
        </PrivateRoute>
      } />

      <Route path="/manage-team" element={
        <RoleRoute role="ADMIN">
          <AppLayout><ManageTeam /></AppLayout>
        </RoleRoute>
      } />

      <Route path="*" element={<Navigate to={user ? "/dashboard" : "/login"} replace />} />
    </Routes>
  );
};

export default App;

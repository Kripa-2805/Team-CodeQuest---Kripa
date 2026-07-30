import React, { useContext } from 'react';
import { AuthProvider, AuthContext } from './context/AuthContext';
import AuthPage from './pages/AuthPage';
import StudentDashboard from './pages/StudentDashboard';
import AdminDashboard from './pages/AdminDashboard';
import './index.css';

function MainRouter() {
  const { user, logout } = useContext(AuthContext);

  if (!user) {
    return <AuthPage />;
  }

  return (
    <div className="app-shell">
      <nav className="navbar">
        <div className="nav-brand">Campus Grievance Tracker</div>
        <div className="nav-user">
          <span className="user-role-badge">{user.role}</span>
          <span className="user-name">{user.name || 'User'}</span>
          <button onClick={logout} className="btn-logout">
            Logout
          </button>
        </div>
      </nav>

      <main className="main-content">
        {user.role === 'admin' ? <AdminDashboard /> : <StudentDashboard />}
      </main>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <MainRouter />
    </AuthProvider>
  );
}
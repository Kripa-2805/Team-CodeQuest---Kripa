import React, { useContext } from 'react';
import { AuthProvider, AuthContext } from './context/AuthContext';
import { ThemeProvider, ThemeContext } from './context/ThemeContext';
import DoodleBackground from './components/DoodleBackground';
import AuthPage from './pages/AuthPage';
import StudentDashboard from './pages/StudentDashboard';
import AdminDashboard from './pages/AdminDashboard';
import './index.css';

function MainRouter() {
  const { user, logout } = useContext(AuthContext);
  const { theme, toggleTheme } = useContext(ThemeContext);

  if (!user) {
    return <AuthPage />;
  }

  return (
    <div className="app-shell">
      <nav className="navbar">
        <div className="nav-brand">
          <span className="pin-dot" />
          FixIt Campus
          <span className="tag">— sorted, not ignored</span>
        </div>
        <div className="nav-user">
          <button className="theme-toggle" onClick={toggleTheme} aria-label="Toggle dark mode" />
          <span className="user-role-badge">{user.role}</span>
          <span className="user-name">{user.name || 'User'}</span>
          <button onClick={logout} className="btn-logout">
            Logout
          </button>
        </div>
      </nav>

      <main className="main-content fade-in">
        {user.role === 'admin' ? <AdminDashboard /> : <StudentDashboard />}
      </main>
    </div>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <DoodleBackground />
        <MainRouter />
      </AuthProvider>
    </ThemeProvider>
  );
}

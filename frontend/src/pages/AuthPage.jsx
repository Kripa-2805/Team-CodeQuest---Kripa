import React, { useState, useContext } from 'react';
import API from '../api/axiosInstance';
import { AuthContext } from '../context/AuthContext';
import { ThemeContext } from '../context/ThemeContext';

export default function AuthPage() {
  const [isRegister, setIsRegister] = useState(false);
  const [role, setRole] = useState('student');
  const [formData, setFormData] = useState({ name: '', email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useContext(AuthContext);
  const { theme, toggleTheme } = useContext(ThemeContext);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    const endpoint = isRegister ? '/register' : '/login';
    const payload = isRegister ? { ...formData, role } : { email: formData.email, password: formData.password };

    try {
      const res = await API.post(endpoint, payload);
      // Backend returns access_token + role on login; registration may also auto-return a token.
      if (res.data.access_token) {
        login(res.data);
      } else {
        // Registered but not logged in yet -> switch to login form.
        setIsRegister(false);
        setError('Account created — please sign in.');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-shell fade-in">
      <div className="auth-hero">
        <span className="eyebrow">welcome to</span>
        <h1>FIXora</h1>
        <p>
          Raise it once, track it live. From a leaky pipe in the hostel to a
          flickering lab light — report it, watch staff get assigned, and
          never let an issue go quiet again.
        </p>
        <div className="hero-notes">
          <div className="floating-note" style={{ '--r': '-6deg' }}>🔧 Hostel tap fixed in 4h</div>
          <div className="floating-note" style={{ '--r': '4deg' }}>💡 Lab light — In Progress</div>
          <div className="floating-note" style={{ '--r': '-3deg' }}>⚠️ Escalated: no response 24h</div>
        </div>
      </div>

      <div className="auth-panel">
        <button
          className="theme-toggle auth-theme-toggle"
          onClick={toggleTheme}
          aria-label="Toggle dark mode"
          type="button"
        />
        <div className="auth-card">
          <div className="pin" />
          <h2>{isRegister ? 'Create your account' : 'Welcome back'}</h2>
          <p className="sub">
            {isRegister ? 'Join your campus grievance desk' : 'Sign in to track or manage grievances'}
          </p>

          {isRegister && (
            <div className="role-toggle">
              <button type="button" className={role === 'student' ? 'active' : ''} onClick={() => setRole('student')}>
                🎓 Student
              </button>
              <button type="button" className={role === 'admin' ? 'active' : ''} onClick={() => setRole('admin')}>
                🛠️ Admin / Staff
              </button>
            </div>
          )}

          {error && <div className="auth-error">{error}</div>}

          <form onSubmit={handleSubmit} className="form-stack">
            {isRegister && (
              <div className="input-group">
                <label>Full name</label>
                <input
                  type="text"
                  placeholder="e.g. Ananya Sharma"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>
            )}
            <div className="input-group">
              <label>College email</label>
              <input
                type="email"
                placeholder="you@college.edu"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required
              />
            </div>
            <div className="input-group">
              <label>Password</label>
              <input
                type="password"
                placeholder="••••••••"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                required
              />
            </div>
            <button type="submit" className="btn-primary" disabled={loading}>
              {loading && <span className="spinner" />}
              {loading ? 'Please wait...' : isRegister ? 'Sign Up' : 'Sign In'}
            </button>
          </form>

          <div className="auth-switch">
            {isRegister ? 'Already have an account?' : 'Need an account?'}{' '}
            <button type="button" onClick={() => { setIsRegister(!isRegister); setError(''); }}>
              {isRegister ? 'Log in' : 'Register'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

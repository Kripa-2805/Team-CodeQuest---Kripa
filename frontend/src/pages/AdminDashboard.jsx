import React, { useState, useEffect } from 'react';
import API from '../api/axiosInstance';
import StatusBadge from '../components/StatusBadge';
import SLABadge from '../components/SLABadge';
import StatsChart from '../components/StatsChart';

export default function AdminDashboard() {
  const [issues, setIssues] = useState([]);
  const [stats, setStats] = useState({});

  const fetchData = async () => {
    try {
      const [issuesRes, statsRes] = await Promise.all([
        API.get('/issues'),
        API.get('/stats')
      ]);
      setIssues(issuesRes.data);
      setStats(statsRes.data);
    } catch (err) {
      console.error('Error fetching admin data:', err);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const updateStatus = async (id, status) => {
    try {
      await API.patch(`/issues/${id}/status`, { status });
      fetchData();
    } catch (err) {
      console.error('Failed to update status:', err);
    }
  };

  return (
    <div className="dashboard-container">
      <header className="dashboard-header">
        <h2>Admin Control Center</h2>
        <p>Manage and resolve campus-wide complaints</p>
      </header>

      <div className="card" style={{ marginBottom: '2rem' }}>
        <h3>Overview Statistics</h3>
        <StatsChart stats={stats} />
      </div>

      <div className="card">
        <h3>All Campus Grievances</h3>
        <div style={{ overflowX: 'auto', marginTop: '1rem' }}>
          <table className="admin-table">
            <thead>
              <tr>
                <th>Title</th>
                <th>Category</th>
                <th>Status</th>
                <th>SLA Timer</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {issues.map((issue) => (
                <tr key={issue.id}>
                  <td><strong>{issue.title}</strong></td>
                  <td><span className="category-pill">{issue.category}</span></td>
                  <td><StatusBadge status={issue.status} /></td>
                  <td><SLABadge slaDeadline={issue.sla_deadline} status={issue.status} /></td>
                  <td>
                    <select
                      value={issue.status}
                      onChange={(e) => updateStatus(issue.id, e.target.value)}
                      className="status-select"
                    >
                      <option value="pending">Pending</option>
                      <option value="in_progress">In Progress</option>
                      <option value="resolved">Resolved</option>
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
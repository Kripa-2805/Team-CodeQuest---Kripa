import React, { useState, useEffect, useCallback } from 'react';
import API from '../api/axiosInstance';
import StatusBadge from '../components/StatusBadge';
import SLABadge from '../components/SLABadge';
import StatsChart from '../components/StatsChart';

export default function AdminDashboard() {
  const [issues, setIssues] = useState([]);
  const [stats, setStats] = useState({});
  const [staff, setStaff] = useState([]);
  const [statusFilter, setStatusFilter] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [fetching, setFetching] = useState(true);

  const fetchData = useCallback(async () => {
    try {
      const params = {};
      if (statusFilter) params.status = statusFilter;
      if (categoryFilter) params.category = categoryFilter;

      const [issuesRes, statsRes, staffRes] = await Promise.all([
        API.get('/issues', { params }),
        API.get('/stats'),
        API.get('/staff').catch(() => ({ data: [] })),
      ]);
      const issuesData = issuesRes.data;
      const issuesList = Array.isArray(issuesData)
        ? issuesData
        : Array.isArray(issuesData?.issues)
        ? issuesData.issues
        : Array.isArray(issuesData?.data)
        ? issuesData.data
        : [];
      setIssues(issuesList);
      setStats(statsRes.data);

      const staffData = staffRes.data;
      const staffList = Array.isArray(staffData)
        ? staffData
        : Array.isArray(staffData?.staff)
        ? staffData.staff
        : Array.isArray(staffData?.data)
        ? staffData.data
        : [];
      setStaff(staffList);
    } catch (err) {
      console.error('Error fetching admin data:', err);
    } finally {
      setFetching(false);
    }
  }, [statusFilter, categoryFilter]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const updateStatus = async (id, status) => {
    try {
      await API.put(`/issues/${id}/status`, { status });
      fetchData();
    } catch (err) {
      console.error('Failed to update status:', err);
    }
  };

  const assignStaff = async (id, staffId) => {
    if (!staffId) return;
    try {
      await API.put(`/issues/${id}/assign`, { staff_id: staffId });
      fetchData();
    } catch (err) {
      console.error('Failed to assign staff:', err);
    }
  };

  const categories = ['Maintenance', 'Electrical', 'Plumbing', 'Hostel', 'IT', 'Academic'];

  return (
    <div className="dashboard-container">
      <header className="dashboard-header">
        <h2>Admin Control Center</h2>
        <p>
          Manage and resolve campus-wide complaints.{' '}
          <span className="hand">Nothing slips through.</span>
        </p>
      </header>

      <div className="stat-strip">
        <div className="stat-pill"><div className="num">{stats.pending ?? '–'}</div><div className="lbl">Pending</div></div>
        <div className="stat-pill"><div className="num">{stats.inProgress ?? '–'}</div><div className="lbl">In Progress</div></div>
        <div className="stat-pill"><div className="num">{stats.resolved ?? '–'}</div><div className="lbl">Resolved</div></div>
        <div className="stat-pill"><div className="num">{stats.escalated ?? '–'}</div><div className="lbl">Escalated</div></div>
      </div>

      <div className="card" style={{ marginBottom: '2rem' }}>
        <h3>📊 Overview Statistics</h3>
        <StatsChart stats={stats} />
      </div>

      <div className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.8rem' }}>
          <h3>🗃️ All Campus Grievances</h3>
          <div style={{ display: 'flex', gap: '0.6rem', flexWrap: 'wrap' }}>
            <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
              <option value="">All statuses</option>
              <option value="pending">Pending</option>
              <option value="in_progress">In Progress</option>
              <option value="resolved">Resolved</option>
            </select>
            <select value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)}>
              <option value="">All categories</option>
              {categories.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
        </div>

        <div style={{ overflowX: 'auto', marginTop: '1rem' }}>
          <table className="admin-table">
            <thead>
              <tr>
                <th>Title</th>
                <th>Category</th>
                <th>Status</th>
                <th>SLA Timer</th>
                <th>Assign</th>
                <th>Update</th>
              </tr>
            </thead>
            <tbody>
              {fetching ? (
                <tr><td colSpan={6} className="empty-state">Loading grievances...</td></tr>
              ) : issues.length === 0 ? (
                <tr><td colSpan={6} className="empty-state">No grievances match this filter.</td></tr>
              ) : (
                issues.map((issue) => (
                  <tr key={issue.id}>
                    <td><strong>{issue.title}</strong></td>
                    <td><span className="category-pill">{issue.category}</span></td>
                    <td><StatusBadge status={issue.status} /></td>
                    <td><SLABadge slaDeadline={issue.sla_deadline} status={issue.status} /></td>
                    <td>
                      <select
                        defaultValue=""
                        className="status-select"
                        onChange={(e) => assignStaff(issue.id, e.target.value)}
                      >
                        <option value="" disabled>{issue.assigned_to_name || 'Unassigned'}</option>
                        {staff.map((s) => (
                          <option key={s.id} value={s.id}>{s.name}</option>
                        ))}
                      </select>
                    </td>
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
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}



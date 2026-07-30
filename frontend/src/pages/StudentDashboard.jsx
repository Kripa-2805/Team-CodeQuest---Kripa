import React, { useState, useEffect, useRef } from 'react';
import API from '../api/axiosInstance';
import StatusBadge from '../components/StatusBadge';
import SLABadge from '../components/SLABadge';

export default function StudentDashboard() {
  const [issues, setIssues] = useState([]);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('Maintenance');
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef(null);

  const fetchIssues = async () => {
    try {
      const res = await API.get('/issues/my-issues');
      setIssues(res.data);
    } catch (err) {
      console.error('Error fetching grievances:', err);
    }
  };

  useEffect(() => {
    fetchIssues();
  }, []);

  const handleRaiseIssue = async (e) => {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData();
    formData.append('title', title);
    formData.append('description', description);
    formData.append('category', category);
    if (file) formData.append('attachment', file);

    try {
      await API.post('/issues', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      
      // Clear form inputs
      setTitle('');
      setDescription('');
      setCategory('Maintenance');
      setFile(null);
      if (fileInputRef.current) fileInputRef.current.value = '';

      fetchIssues();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to submit grievance.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="dashboard-container">
      <header className="dashboard-header">
        <h2>Student Grievance Portal</h2>
        <p>Submit and track your campus concerns in real time</p>
      </header>

      <div className="dashboard-grid">
        {/* Issue Submission Card */}
        <section className="card">
          <h3>Submit New Grievance</h3>
          <form onSubmit={handleRaiseIssue} className="form-stack">
            <div className="input-group">
              <label>Title</label>
              <input
                type="text"
                placeholder="e.g. Water leak in Hostel Block B"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
              />
            </div>

            <div className="input-group">
              <label>Category</label>
              <select value={category} onChange={(e) => setCategory(e.target.value)}>
                <option value="Maintenance">Maintenance</option>
                <option value="Electrical">Electrical</option>
                <option value="Plumbing">Plumbing</option>
                <option value="Academic">Academic</option>
              </select>
            </div>

            <div className="input-group">
              <label>Description</label>
              <textarea
                placeholder="Provide details about the issue..."
                value={description}
                rows="4"
                onChange={(e) => setDescription(e.target.value)}
                required
              />
            </div>

            <div className="input-group">
              <label>Attachment (Optional)</label>
              <input
                type="file"
                ref={fileInputRef}
                onChange={(e) => setFile(e.target.files[0])}
              />
            </div>

            <button type="submit" className="btn-primary" disabled={loading}>
              {loading ? 'Submitting...' : 'Submit Grievance'}
            </button>
          </form>
        </section>

        {/* Reported Issues Card */}
        <section className="card">
          <h3>Your Reported Grievances</h3>
          <div className="issue-list">
            {issues.length === 0 ? (
              <p className="empty-state">No grievances submitted yet.</p>
            ) : (
              issues.map((issue) => (
                <div key={issue.id} className="issue-card">
                  <div className="issue-card-header">
                    <h4>{issue.title}</h4>
                    <span className="category-pill">{issue.category}</span>
                  </div>
                  <p>{issue.description}</p>
                  <div className="issue-card-footer">
                    <StatusBadge status={issue.status} />
                    <SLABadge slaDeadline={issue.sla_deadline} status={issue.status} />
                  </div>
                </div>
              ))
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
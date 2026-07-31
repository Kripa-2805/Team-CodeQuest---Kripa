import React, { useState, useEffect, useRef } from 'react';
import API from '../api/axiosInstance';
import StatusBadge from '../components/StatusBadge';
import SLABadge from '../components/SLABadge';

export default function StudentDashboard() {
  const [issues, setIssues] = useState([]);
  const [studentName, setStudentName] = useState('');
  const [regNo, setRegNo] = useState('');
  const [blockNo, setBlockNo] = useState('');
  const [locationType, setLocationType] = useState('Hostel');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('Maintenance');
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const fileInputRef = useRef(null);

  const fetchIssues = async () => {
    try {
      // Backend scopes /issues to the logged-in student automatically.
      const res = await API.get('/issues');
      const data = res.data;
      const list = Array.isArray(data)
        ? data
        : Array.isArray(data?.issues)
        ? data.issues
        : Array.isArray(data?.data)
        ? data.data
        : [];
      setIssues(list);
    } catch (err) {
      console.error('Error fetching grievances:', err);
    } finally {
      setFetching(false);
    }
  };

  useEffect(() => {
    fetchIssues();
  }, []);

  const handleRaiseIssue = async (e) => {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData();
    formData.append('student_name', studentName);
    formData.append('reg_no', regNo);
    formData.append('block_no', blockNo);
    formData.append('location_type', locationType);
    formData.append('title', title);
    formData.append('description', description);
    formData.append('category', category);
    if (file) formData.append('attachment', file);

    try {
      await API.post('/issues', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      setStudentName('');
      setRegNo('');
      setBlockNo('');
      setLocationType('Hostel');
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
        <p>
          Submit and track your campus concerns in real time.{' '}
          <span className="hand">We've got you covered!</span>
        </p>
      </header>

      <div className="dashboard-grid">
        <section className="card">
          <h3>📌 Submit New Grievance</h3>
          <form onSubmit={handleRaiseIssue} className="form-stack">
            <div className="input-group">
              <label>Your Name</label>
              <input
                type="text"
                placeholder="e.g. Rahul Sharma"
                value={studentName}
                onChange={(e) => setStudentName(e.target.value)}
                required
              />
            </div>

            <div className="input-group">
              <label>Registration No.</label>
              <input
                type="text"
                placeholder="e.g. 22BCE1234"
                value={regNo}
                onChange={(e) => setRegNo(e.target.value)}
                required
              />
            </div>

            <div className="input-group">
              <label>Block Type</label>
              <select value={locationType} onChange={(e) => setLocationType(e.target.value)}>
                <option value="Hostel">Hostel</option>
                <option value="Academic Block">Academic Block</option>
              </select>
            </div>

            <div className="input-group">
              <label>Block No.</label>
              <input
                type="text"
                placeholder="e.g. Hostel Block B / Academic Block 3"
                value={blockNo}
                onChange={(e) => setBlockNo(e.target.value)}
                required
              />
            </div>

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
                <option value="Hostel">Hostel</option>
                <option value="IT">IT</option>
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
              {loading && <span className="spinner" />}
              {loading ? 'Submitting...' : 'Submit Grievance'}
            </button>
          </form>
        </section>

        <section className="card">
          <h3>🗂️ Your Reported Grievances</h3>
          <div className="issue-list">
            {fetching ? (
              <p className="empty-state">Loading your grievances...</p>
            ) : issues.length === 0 ? (
              <div className="empty-state">
                Nothing here yet.
                <span className="hand">Raise your first issue on the left →</span>
              </div>
            ) : (
              issues.map((issue) => (
                <div key={issue.id} className="issue-card" data-cat={issue.category}>
                  <div className="issue-card-header">
                    <h4>{issue.title}</h4>
                    <span className="category-pill" data-cat={issue.category}>{issue.category}</span>
                  </div>
                  <p className="issue-meta">
                    {issue.location_type || 'Hostel'} — {issue.block_no || 'N/A'}
                  </p>
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

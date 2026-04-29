import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import api from '../api/axios';

const thStyle = {
  background: '#dde8f5',
  fontFamily: "'Arial Black', Arial",
  fontWeight: 'bold',
  fontSize: 10,
  textTransform: 'uppercase',
  letterSpacing: '0.5px',
  color: 'var(--blue-dark)',
};

const labelStyle = {
  fontFamily: "'Arial Black', Arial, sans-serif",
  fontSize: 10,
  fontWeight: 'bold',
  color: 'var(--blue-dark)',
  textTransform: 'uppercase',
  letterSpacing: '0.5px',
  marginBottom: -4,
  display: 'block',
};

export default function AdminReviewAdvising() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [record, setRecord]         = useState(null);
  const [loading, setLoading]       = useState(true);
  const [error, setError]           = useState('');
  const [decision, setDecision]     = useState('');
  const [adminMessage, setAdminMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess]       = useState('');

  useEffect(() => {
    api.get(`/advising/admin/${id}`)
      .then(({ data }) => setRecord(data))
      .catch(() => setError('Failed to load record.'))
      .finally(() => setLoading(false));
  }, [id]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!decision) { setError('Please select Approve or Reject.'); return; }
    if (!adminMessage.trim()) { setError('Feedback message is required.'); return; }
    setError('');
    setSubmitting(true);
    try {
      await api.put(`/advising/admin/${id}/review`, {
        status: decision,
        adminMessage: adminMessage.trim(),
      });
      setSuccess(`Record ${decision}. Redirecting...`);
      setTimeout(() => navigate('/admin/advising'), 1500);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to submit review.');
      setSubmitting(false);
    }
  };

  if (loading) return <div className="panel"><p>Loading...</p></div>;
  if (!record) return <div className="panel"><div className="msg-error">{error || 'Record not found.'}</div></div>;

  const isAlreadyReviewed = record.status !== 'Pending';

  return (
    <div className="panel" style={{ maxWidth: 780 }}>
      <div className="banner-admin">▲ Admin — Review Advising Record ▲</div>
      <h2 className="glitch-title">Review Record</h2>

      <div className="section-label">Student Information</div>
      <table className="profile-table" style={{ width: '100%', marginBottom: 16 }}>
        <tbody>
          <tr><td>Student</td><td>{record.user?.firstName} {record.user?.lastName}</td></tr>
          <tr><td>Email</td><td>{record.user?.email}</td></tr>
          <tr><td>Term</td><td>{record.term}</td></tr>
          <tr><td>Last Term</td><td>{record.lastTerm || '—'}</td></tr>
          <tr><td>Last GPA</td><td>{record.lastGPA != null ? record.lastGPA : '—'}</td></tr>
          <tr><td>Current Term</td><td>{record.currentTerm || '—'}</td></tr>
          <tr><td>Status</td><td>
            {record.status === 'Approved' ? <span className="badge-ok">{record.status}</span>
              : record.status === 'Rejected' ? <span className="badge-crit">{record.status}</span>
              : <span className="badge-warn">{record.status}</span>}
          </td></tr>
        </tbody>
      </table>

      <div className="section-label">Course Plan</div>
      {record.courses?.length > 0 ? (
        <table className="profile-table" style={{ width: '100%', marginBottom: 16 }}>
          <thead>
            <tr>
              <td style={thStyle}>Level</td>
              <td style={thStyle}>Course</td>
            </tr>
          </thead>
          <tbody>
            {record.courses.map((c, i) => (
              <tr key={i} style={{ background: i % 2 === 0 ? '#fff' : 'var(--offwhite)' }}>
                <td>{c.level}-level</td>
                <td>{c.courseName}</td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <p style={{ color: '#888', fontSize: 13, marginBottom: 16 }}>No courses listed.</p>
      )}

      {isAlreadyReviewed ? (
        <div className="status-strip status-warn">
          This record has already been <strong>{record.status.toUpperCase()}</strong>.
          {record.adminMessage && (
            <div style={{ marginTop: 8, borderTop: '1px solid #cca', paddingTop: 8 }}>
              <strong>Admin Feedback:</strong> {record.adminMessage}
            </div>
          )}
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="form-glitch">
          <div className="section-label">Admin Decision</div>

          <div style={{ display: 'flex', gap: 12, marginBottom: 12 }}>
            <button
              type="button"
              className="btn-glitch"
              style={{
                flex: 1,
                background: decision === 'Approved'
                  ? 'linear-gradient(180deg,#4aaa44 0%,#2a8a22 100%)'
                  : undefined,
                borderColor: decision === 'Approved' ? '#186010' : undefined,
              }}
              onClick={() => setDecision('Approved')}
            >
              ✓ Approve
            </button>
            <button
              type="button"
              className="btn-glitch"
              style={{
                flex: 1,
                background: decision === 'Rejected'
                  ? 'linear-gradient(180deg,#e85555 0%,#c41010 100%)'
                  : undefined,
                borderColor: decision === 'Rejected' ? '#880000' : undefined,
              }}
              onClick={() => setDecision('Rejected')}
            >
              ✗ Reject
            </button>
          </div>

          <label style={labelStyle}>Feedback Message (required)</label>
          <textarea
            className="input-glitch"
            style={{ minHeight: 90, resize: 'vertical', fontFamily: 'inherit' }}
            placeholder="Enter feedback for the student..."
            value={adminMessage}
            onChange={e => setAdminMessage(e.target.value)}
          />

          {error   && <div className="msg-error">{error}</div>}
          {success && <div className="msg-success">{success}</div>}

          <button type="submit" className="btn-glitch" disabled={submitting}>
            {submitting ? 'Submitting...' : 'Submit Decision'}
          </button>
        </form>
      )}

      <div className="spacer" />
      <div className="nav-links">
        <Link to="/admin/advising">▶ Back to All Records</Link>
      </div>
    </div>
  );
}

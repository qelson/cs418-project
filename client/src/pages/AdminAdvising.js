import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
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

export default function AdminAdvising() {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    api.get('/advising/admin/all')
      .then(({ data }) => setRecords(data))
      .catch(() => setError('Failed to load advising records.'))
      .finally(() => setLoading(false));
  }, []);

  const statusBadge = (status) => {
    if (status === 'Approved') return <span className="badge-ok">{status}</span>;
    if (status === 'Rejected') return <span className="badge-crit">{status}</span>;
    return <span className="badge-warn">{status}</span>;
  };

  return (
    <div className="panel" style={{ maxWidth: 900 }}>
      <div className="banner-admin">▲ Admin — Student Advising Records ▲</div>
      <h2 className="glitch-title">All Advising Records</h2>

      {loading && <p>Loading...</p>}
      {error   && <div className="msg-error">{error}</div>}

      {!loading && !error && records.length === 0 && (
        <div className="note-text">No advising records found.</div>
      )}

      {!loading && records.length > 0 && (
        <table className="profile-table" style={{ width: '100%' }}>
          <thead>
            <tr>
              <td style={thStyle}>Student Name</td>
              <td style={thStyle}>Term</td>
              <td style={thStyle}>Status</td>
              <td style={thStyle}>Action</td>
            </tr>
          </thead>
          <tbody>
            {records.map((r, i) => (
              <tr
                key={r._id}
                style={{ background: i % 2 === 0 ? '#fff' : 'var(--offwhite)' }}
              >
                <td>
                  <span
                    style={{ color: 'var(--blue)', textDecoration: 'underline', cursor: 'pointer' }}
                    onClick={() => navigate(`/admin/advising/${r._id}`)}
                  >
                    {r.user?.firstName} {r.user?.lastName}
                  </span>
                </td>
                <td>{r.term}</td>
                <td>{statusBadge(r.status)}</td>
                <td>
                  <button
                    className="btn-glitch"
                    style={{ width: 'auto', padding: '4px 14px', fontSize: 12, letterSpacing: 1 }}
                    onClick={() => navigate(`/admin/advising/${r._id}`)}
                  >
                    Review
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      <div className="spacer" />
      <div className="nav-links">
        <Link to="/admin">▶ Back to Admin Dashboard</Link>
      </div>
    </div>
  );
}

import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../api/axios';

export default function AdvisingHistory() {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    api.get('/advising')
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
    <div className="panel" style={{ maxWidth: 800 }}>
      <div className="banner-user">■ Course Advising ■</div>
      <h2 className="glitch-title">Advising History</h2>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
        <div className="section-label" style={{ margin: 0 }}>Submitted Forms</div>
        <button
          className="btn-glitch"
          style={{ width: 'auto', padding: '8px 18px', fontSize: 13, letterSpacing: 1 }}
          onClick={() => navigate('/advising/new')}
        >
          + New Advising Form
        </button>
      </div>

      {loading && <p>Loading...</p>}
      {error   && <div className="msg-error">{error}</div>}

      {!loading && !error && records.length === 0 && (
        <div className="note-text">No advising records found. Click "New Advising Form" to get started.</div>
      )}

      {!loading && records.length > 0 && (
        <table className="profile-table" style={{ width: '100%' }}>
          <thead>
            <tr>
              <td style={{ background: '#dde8f5', fontFamily: "'Arial Black', Arial", fontWeight: 'bold', fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.5px', color: 'var(--blue-dark)' }}>Date</td>
              <td style={{ background: '#dde8f5', fontFamily: "'Arial Black', Arial", fontWeight: 'bold', fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.5px', color: 'var(--blue-dark)' }}>Term</td>
              <td style={{ background: '#dde8f5', fontFamily: "'Arial Black', Arial", fontWeight: 'bold', fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.5px', color: 'var(--blue-dark)' }}>Status</td>
              <td style={{ background: '#dde8f5', fontFamily: "'Arial Black', Arial", fontWeight: 'bold', fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.5px', color: 'var(--blue-dark)' }}>Action</td>
            </tr>
          </thead>
          <tbody>
            {records.map((r, i) => (
              <tr
                key={r._id}
                style={{ cursor: 'pointer', background: i % 2 === 0 ? '#fff' : 'var(--offwhite)' }}
                onClick={() => navigate(`/advising/${r._id}`)}
              >
                <td>{new Date(r.date).toLocaleDateString()}</td>
                <td>{r.term}</td>
                <td>{statusBadge(r.status)}</td>
                <td>
                  <span style={{ color: 'var(--blue)', textDecoration: 'underline', fontSize: 12 }}>
                    {r.status === 'Pending' ? 'View / Edit' : 'View'}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      <div className="spacer" />
      <div className="nav-links">
        <Link to="/dashboard">▶ Back to Dashboard</Link>
      </div>
    </div>
  );
}

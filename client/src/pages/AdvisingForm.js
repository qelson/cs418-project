import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../api/axios';

const TERMS = [
  'Fall 2024', 'Spring 2025', 'Summer 2025',
  'Fall 2025', 'Spring 2026', 'Summer 2026',
  'Fall 2026', 'Spring 2027',
];

const LEVELS = ['100', '200', '300', '400', '500'];

const emptyRow = () => ({ level: '', courseName: '' });

export default function AdvisingForm() {
  const { id }   = useParams();
  const isNew    = !id || id === 'new';
  const navigate = useNavigate();

  const [courseMap, setCourseMap]     = useState({});
  const [term, setTerm]               = useState('');
  const [lastTerm, setLastTerm]       = useState('');
  const [lastGPA, setLastGPA]         = useState('');
  const [currentTerm, setCurrentTerm] = useState('');
  const [rows, setRows]               = useState([emptyRow()]);
  const [status, setStatus]           = useState('Pending');
  const [adminMessage, setAdminMessage] = useState('');
  const [error, setError]             = useState('');
  const [loading, setLoading]         = useState(!isNew);

  // Load course list
  useEffect(() => {
    api.get('/courses').then(({ data }) => setCourseMap(data)).catch(() => {});
  }, []);

  // Load existing record
  useEffect(() => {
    if (isNew) return;
    api.get(`/advising/${id}`)
      .then(({ data }) => {
        setTerm(data.term || '');
        setLastTerm(data.lastTerm || '');
        setLastGPA(data.lastGPA != null ? data.lastGPA : '');
        setCurrentTerm(data.currentTerm || '');
        setRows(data.courses?.length ? data.courses : [emptyRow()]);
        setStatus(data.status || 'Pending');
        setAdminMessage(data.adminMessage || '');
      })
      .catch(() => setError('Failed to load record.'))
      .finally(() => setLoading(false));
  }, [id]);

  const isLocked = status === 'Approved' || status === 'Rejected';

  // ── Course row helpers ───────────────────────────────────────
  const updateRow = (idx, field, value) => {
    setRows(prev => {
      const next = [...prev];
      next[idx] = { ...next[idx], [field]: value };
      if (field === 'level') next[idx].courseName = '';
      return next;
    });
  };

  const addRow    = () => setRows(prev => [...prev, emptyRow()]);
  const removeRow = (idx) => setRows(prev => prev.filter((_, i) => i !== idx));

  // ── Submit ───────────────────────────────────────────────────
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!term) { setError('Please select a term.'); return; }

    // Guard: no duplicate courses within the plan itself
    const names = rows.map(r => r.courseName).filter(Boolean);
    const unique = new Set(names);
    if (unique.size !== names.length) {
      setError('Duplicate courses in your plan. Each course can only appear once.');
      return;
    }

    const payload = {
      term,
      lastTerm,
      lastGPA: lastGPA === '' ? undefined : parseFloat(lastGPA),
      currentTerm,
      courses: rows.filter(r => r.courseName),
    };

    try {
      if (isNew) {
        await api.post('/advising', payload);
      } else {
        await api.put(`/advising/${id}`, payload);
      }
      navigate('/advising');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save record.');
    }
  };

  if (loading) return <div className="panel"><p>Loading...</p></div>;

  return (
    <div className="panel" style={{ maxWidth: 780 }}>
      <div className="banner-user">■ Course Advising ■</div>
      <h2 className="glitch-title">{isNew ? 'New Advising Form' : 'Advising Form'}</h2>

      {isLocked && (
        <div className="status-strip status-warn" style={{ marginBottom: 16 }}>
          This record has been <strong>{status.toUpperCase()}</strong> and cannot be edited.
          {adminMessage && (
            <div style={{ marginTop: 8, borderTop: '1px solid #cca', paddingTop: 8 }}>
              <strong>Admin Feedback:</strong> {adminMessage}
            </div>
          )}
        </div>
      )}

      {error && <div className="msg-error">{error}</div>}

      <form onSubmit={handleSubmit} className="form-glitch">

        {/* ── Section 1: Header ── */}
        <div className="section-label">Section 1 — Academic History</div>

        <label style={labelStyle}>Advising Term *</label>
        <select
          className="input-glitch"
          value={term}
          onChange={e => setTerm(e.target.value)}
          disabled={isLocked}
          required
        >
          <option value="">-- Select Term --</option>
          {TERMS.map(t => <option key={t} value={t}>{t}</option>)}
        </select>

        <label style={labelStyle}>Last Term Completed</label>
        <select
          className="input-glitch"
          value={lastTerm}
          onChange={e => setLastTerm(e.target.value)}
          disabled={isLocked}
        >
          <option value="">-- Select Last Term --</option>
          {TERMS.map(t => <option key={t} value={t}>{t}</option>)}
        </select>

        <label style={labelStyle}>Last GPA (0.0 – 4.0)</label>
        <input
          type="number"
          className="input-glitch"
          value={lastGPA}
          onChange={e => setLastGPA(e.target.value)}
          min="0" max="4" step="0.01"
          placeholder="e.g. 3.50"
          disabled={isLocked}
        />

        <label style={labelStyle}>Current Term</label>
        <select
          className="input-glitch"
          value={currentTerm}
          onChange={e => setCurrentTerm(e.target.value)}
          disabled={isLocked}
        >
          <option value="">-- Select Current Term --</option>
          {TERMS.map(t => <option key={t} value={t}>{t}</option>)}
        </select>

        {/* ── Section 2: Course Plan ── */}
        <div className="section-label" style={{ marginTop: 8 }}>Section 2 — Course Plan</div>

        {rows.map((row, idx) => (
          <div key={idx} style={rowStyle}>
            <div style={{ flex: '0 0 120px' }}>
              <select
                className="input-glitch"
                value={row.level}
                onChange={e => updateRow(idx, 'level', e.target.value)}
                disabled={isLocked}
                style={{ fontSize: 13 }}
              >
                <option value="">Level</option>
                {LEVELS.map(l => <option key={l} value={l}>{l}-level</option>)}
              </select>
            </div>

            <div style={{ flex: 1 }}>
              <select
                className="input-glitch"
                value={row.courseName}
                onChange={e => updateRow(idx, 'courseName', e.target.value)}
                disabled={isLocked || !row.level}
                style={{ fontSize: 13 }}
              >
                <option value="">-- Select Course --</option>
                {(courseMap[row.level] || []).map(c => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>

            {!isLocked && (
              <button
                type="button"
                onClick={() => removeRow(idx)}
                style={removeBtnStyle}
                title="Remove row"
              >
                ✕
              </button>
            )}
          </div>
        ))}

        {!isLocked && (
          <button
            type="button"
            onClick={addRow}
            style={addBtnStyle}
          >
            + Add Course
          </button>
        )}

        <div className="spacer" />

        <div style={{ display: 'flex', gap: 10 }}>
          {!isLocked && (
            <button type="submit" className="btn-glitch" style={{ flex: 1 }}>
              {isNew ? 'Submit Form' : 'Save Changes'}
            </button>
          )}
          <button
            type="button"
            className="btn-glitch"
            style={{ flex: isLocked ? 2 : 1, background: 'linear-gradient(180deg,#3a8af2 0%,#1a60d8 50%,#0a3a9e 100%)', borderColor: '#08299a #4a92f8 #4a92f8 #08299a' }}
            onClick={() => navigate('/advising')}
          >
            Back to History
          </button>
        </div>
      </form>
    </div>
  );
}

const labelStyle = {
  fontFamily: "'Arial Black', Arial, sans-serif",
  fontSize: 10,
  fontWeight: 'bold',
  color: 'var(--blue-dark)',
  textTransform: 'uppercase',
  letterSpacing: '0.5px',
  marginBottom: -6,
};

const rowStyle = {
  display: 'flex',
  gap: 8,
  alignItems: 'center',
};

const removeBtnStyle = {
  background: 'linear-gradient(180deg,#e85555 0%,#c41010 100%)',
  color: '#fff',
  border: '1px solid #880000',
  padding: '8px 12px',
  cursor: 'pointer',
  fontWeight: 'bold',
  fontSize: 13,
  flexShrink: 0,
};

const addBtnStyle = {
  background: 'linear-gradient(180deg,#4aaa44 0%,#2a8a22 50%,#186010 100%)',
  color: '#fff',
  border: '2px solid #186010',
  borderColor: '#88dd66 #186010 #186010 #88dd66',
  padding: '9px 18px',
  fontFamily: "Impact, 'Arial Black', sans-serif",
  fontSize: 14,
  fontWeight: 900,
  textTransform: 'uppercase',
  letterSpacing: 2,
  cursor: 'pointer',
  width: '100%',
  boxShadow: '3px 3px 0 rgba(0,0,0,0.3)',
};

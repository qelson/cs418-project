import { useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import api from '../api/axios';

export default function ResetPassword() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(''); setMessage('');
    try {
      const { data } = await api.post('/auth/reset-password', { token, password });
      setMessage(data.message);
      setTimeout(() => navigate('/login'), 1500);
    } catch (err) {
      setError(err.response?.data?.message || 'Reset failed');
    }
  };

  if (!token) return (
    <div className="panel">
      <p className="msg-error">Invalid reset link. <a href="/forgot-password">Request a new one.</a></p>
    </div>
  );

  return (
    <div className="panel">
      <div className="xp-titlebar">
        <span>Reset Password — Account Security</span>
        <div className="xp-sysbtns">
          <span>─</span><span>□</span><span className="xp-close">✕</span>
        </div>
      </div>
      <h2 className="glitch-title">Reset Pass</h2>
      <div className="status-strip status-warn">! ENTER YOUR NEW PASSWORD TO RESTORE ACCESS</div>
      <form onSubmit={handleSubmit} className="form-glitch">
        <input className="input-glitch" type="password" placeholder="New password" value={password} onChange={(e) => setPassword(e.target.value)} required />
        <button type="submit" className="btn-glitch">Reset Password</button>
      </form>
      {message && <p className="msg-success" style={{ marginTop: 14 }}>{message}</p>}
      {error   && <p className="msg-error"   style={{ marginTop: 14 }}>{error}</p>}
    </div>
  );
}

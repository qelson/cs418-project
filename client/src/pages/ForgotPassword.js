import { useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(''); setMessage('');
    try {
      const { data } = await api.post('/auth/forgot-password', { email });
      setMessage(data.message);
    } catch (err) {
      setError(err.response?.data?.message || 'Request failed');
    }
  };

  return (
    <div className="panel">
      <div className="xp-titlebar">
        <span>Account Recovery — Password Assistance</span>
        <div className="xp-sysbtns">
          <span>─</span><span>□</span><span className="xp-close">✕</span>
        </div>
      </div>
      <h2 className="glitch-title">Forgot Pass</h2>
      <div className="status-strip status-warn">Enter your registered email address. A reset link will be sent if the account is found.</div>
      <form onSubmit={handleSubmit} className="form-glitch">
        <input className="input-glitch" type="email" placeholder="Your email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        <button type="submit" className="btn-glitch">Send Reset Link</button>
      </form>
      {message && <p className="msg-success" style={{ marginTop: 14 }}>{message}</p>}
      {error   && <p className="msg-error"   style={{ marginTop: 14 }}>{error}</p>}
      <div className="spacer" />
      <p><Link to="/login">Back to Login</Link></p>
    </div>
  );
}

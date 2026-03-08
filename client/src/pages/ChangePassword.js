import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';

export default function ChangePassword() {
  const [form, setForm] = useState({ currentPassword: '', newPassword: '' });
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(''); setMessage('');
    try {
      const { data } = await api.post('/user/change-password', form);
      setMessage(data.message);
      setTimeout(() => navigate(-1), 1500);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to change password');
    }
  };

  return (
    <div className="panel">
      <div className="xp-titlebar">
        <span>Change Password — Account Settings</span>
        <div className="xp-sysbtns">
          <span>─</span><span>□</span><span className="xp-close">✕</span>
        </div>
      </div>
      <h2 className="glitch-title">Change Pass</h2>
      <div className="status-strip status-warn">! UPDATE YOUR PASSWORD TO MAINTAIN ACCOUNT SECURITY</div>
      <form onSubmit={handleSubmit} className="form-glitch">
        <input className="input-glitch" name="currentPassword" placeholder="Current Password" type="password" value={form.currentPassword} onChange={handleChange} required />
        <input className="input-glitch" name="newPassword"     placeholder="New Password"     type="password" value={form.newPassword}     onChange={handleChange} required />
        <button type="submit" className="btn-glitch">Update Password</button>
      </form>
      {message && <p className="msg-success" style={{ marginTop: 14 }}>{message}</p>}
      {error   && <p className="msg-error"   style={{ marginTop: 14 }}>{error}</p>}
    </div>
  );
}

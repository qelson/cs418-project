import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';

export default function EditProfile() {
  const { user, updateUser } = useAuth();
  const [form, setForm] = useState({
    firstName: user?.firstName || '',
    lastName:  user?.lastName  || '',
  });
  const [message, setMessage] = useState('');
  const [error, setError]     = useState('');
  const navigate = useNavigate();

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(''); setMessage('');
    try {
      const { data } = await api.put('/user/profile', form);
      updateUser(data);
      setMessage('Profile updated.');
      setTimeout(() => navigate(data.isAdmin ? '/admin' : '/dashboard'), 1000);
    } catch (err) {
      setError(err.response?.data?.message || 'Update failed');
    }
  };

  return (
    <div className="panel">
      <div className="xp-titlebar">
        <span>Edit Profile — User Settings</span>
        <div className="xp-sysbtns">
          <span>─</span><span>□</span><span className="xp-close">✕</span>
        </div>
      </div>
      <h2 className="glitch-title">Edit Profile</h2>
      <p className="note-text">Email cannot be changed: <strong style={{ color: 'var(--lime)' }}>{user?.email}</strong></p>
      <form onSubmit={handleSubmit} className="form-glitch">
        <input className="input-glitch" name="firstName" placeholder="First Name" value={form.firstName} onChange={handleChange} required />
        <input className="input-glitch" name="lastName"  placeholder="Last Name"  value={form.lastName}  onChange={handleChange} required />
        <button type="submit" className="btn-glitch">Save Changes</button>
      </form>
      {message && <p className="msg-success" style={{ marginTop: 14 }}>{message}</p>}
      {error   && <p className="msg-error"   style={{ marginTop: 14 }}>{error}</p>}
    </div>
  );
}

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
    <div style={styles.container}>
      <h2>Change Password</h2>
      <form onSubmit={handleSubmit} style={styles.form}>
        <input name="currentPassword" placeholder="Current Password" type="password" value={form.currentPassword} onChange={handleChange} required style={styles.input} />
        <input name="newPassword"     placeholder="New Password"     type="password" value={form.newPassword}     onChange={handleChange} required style={styles.input} />
        <button type="submit" style={styles.button}>Update Password</button>
      </form>
      {message && <p style={styles.success}>{message}</p>}
      {error   && <p style={styles.error}>{error}</p>}
    </div>
  );
}

const styles = {
  container: { maxWidth: 400, margin: '60px auto', fontFamily: 'sans-serif' },
  form:      { display: 'flex', flexDirection: 'column', gap: 10 },
  input:     { padding: 8, fontSize: 14 },
  button:    { padding: 10, cursor: 'pointer' },
  success:   { color: 'green' },
  error:     { color: 'red' },
};

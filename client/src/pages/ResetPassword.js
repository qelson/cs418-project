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

  if (!token) return <p style={{ textAlign: 'center' }}>Invalid reset link. <a href="/forgot-password">Request a new one.</a></p>;

  return (
    <div style={styles.container}>
      <h2>Reset Password</h2>
      <form onSubmit={handleSubmit} style={styles.form}>
        <input type="password" placeholder="New password" value={password} onChange={(e) => setPassword(e.target.value)} required style={styles.input} />
        <button type="submit" style={styles.button}>Reset Password</button>
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

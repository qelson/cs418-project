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
    <div style={styles.container}>
      <h2>Forgot Password</h2>
      <form onSubmit={handleSubmit} style={styles.form}>
        <input type="email" placeholder="Your email" value={email} onChange={(e) => setEmail(e.target.value)} required style={styles.input} />
        <button type="submit" style={styles.button}>Send Reset Link</button>
      </form>
      {message && <p style={styles.success}>{message}</p>}
      {error   && <p style={styles.error}>{error}</p>}
      <p><Link to="/login">Back to Login</Link></p>
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

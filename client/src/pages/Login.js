import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../api/axios';

export default function Login() {
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await api.post('/auth/login', form);
      // On success, OTP has been sent — pass email to next step
      navigate('/otp-verify', { state: { email: form.email } });
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed');
    }
  };

  return (
    <div style={styles.container}>
      <h2>Login</h2>
      <form onSubmit={handleSubmit} style={styles.form}>
        <input name="email"    placeholder="Email"    value={form.email}    onChange={handleChange} required type="email"    style={styles.input} />
        <input name="password" placeholder="Password" value={form.password} onChange={handleChange} required type="password" style={styles.input} />
        <button type="submit" style={styles.button}>Login</button>
      </form>
      {error && <p style={styles.error}>{error}</p>}
      <p><Link to="/forgot-password">Forgot password?</Link></p>
      <p>No account? <Link to="/register">Register</Link></p>
    </div>
  );
}

const styles = {
  container: { maxWidth: 400, margin: '60px auto', fontFamily: 'sans-serif' },
  form:      { display: 'flex', flexDirection: 'column', gap: 10 },
  input:     { padding: 8, fontSize: 14 },
  button:    { padding: 10, cursor: 'pointer' },
  error:     { color: 'red' },
};

import { useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios';

export default function Register() {
  const [form, setForm] = useState({ firstName: '', lastName: '', email: '', password: '' });
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(''); setMessage('');
    try {
      const { data } = await api.post('/auth/register', form);
      setMessage(data.message);
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed');
    }
  };

  return (
    <div style={styles.container}>
      <h2>Register</h2>
      <form onSubmit={handleSubmit} style={styles.form}>
        <input name="firstName" placeholder="First Name" value={form.firstName} onChange={handleChange} required style={styles.input} />
        <input name="lastName"  placeholder="Last Name"  value={form.lastName}  onChange={handleChange} required style={styles.input} />
        <input name="email"     placeholder="Email"      value={form.email}     onChange={handleChange} required type="email" style={styles.input} />
        <input name="password"  placeholder="Password"   value={form.password}  onChange={handleChange} required type="password" style={styles.input} />
        <button type="submit" style={styles.button}>Register</button>
      </form>
      {message && <p style={styles.success}>{message}</p>}
      {error   && <p style={styles.error}>{error}</p>}
      <p>Already have an account? <Link to="/login">Login</Link></p>
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

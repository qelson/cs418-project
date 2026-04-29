import { useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios';
import { validatePassword } from '../utils/passwordValidation';

export default function Register() {
  const [form, setForm]       = useState({ firstName: '', lastName: '', email: '', password: '' });
  const [message, setMessage] = useState('');
  const [error, setError]     = useState('');

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(''); setMessage('');

    const pwError = validatePassword(form.password);
    if (pwError) { setError(pwError); return; }

    try {
      const { data } = await api.post('/auth/register', form);
      setMessage(data.message);
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed');
    }
  };

  return (
    <div className="panel">
      <div className="xp-titlebar">
        <span>New User Registration — Account Setup</span>
        <div className="xp-sysbtns">
          <span>─</span><span>□</span><span className="xp-close">✕</span>
        </div>
      </div>
      <h2 className="glitch-title">Register</h2>
      <form onSubmit={handleSubmit} className="form-glitch">
        <input className="input-glitch" name="firstName" placeholder="First Name" value={form.firstName} onChange={handleChange} required />
        <input className="input-glitch" name="lastName"  placeholder="Last Name"  value={form.lastName}  onChange={handleChange} required />
        <input className="input-glitch" name="email"     placeholder="Email"      value={form.email}     onChange={handleChange} required type="email" />
        <input className="input-glitch" name="password"  placeholder="Password"   value={form.password}  onChange={handleChange} required type="password" />
        <div style={{ fontSize: 11, color: '#666', marginTop: -6, marginBottom: 4, lineHeight: 1.5 }}>
          Must be 8+ chars with uppercase, lowercase, number, and special character.
        </div>
        <button type="submit" className="btn-glitch">Register</button>
      </form>
      {message && <p className="msg-success" style={{ marginTop: 14 }}>{message}</p>}
      {error   && <p className="msg-error"   style={{ marginTop: 14 }}>{error}</p>}
      <div className="spacer" />
      <p>Already have an account? <Link to="/login">Login</Link></p>
    </div>
  );
}

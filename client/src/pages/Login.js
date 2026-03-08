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
    <div className="login-screen">
      <div className="panel">
        <div className="xp-titlebar">
          <span>Secure Login — Access Portal</span>
          <div className="xp-sysbtns">
            <span>─</span><span>□</span><span className="xp-close">✕</span>
          </div>
        </div>
        <h2 className="glitch-title">Login</h2>
        <div className="status-strip status-warn">NOTICE: Authorized users only. All access is logged and monitored.</div>
        <form onSubmit={handleSubmit} className="form-glitch">
          <input className="input-glitch" name="email"    placeholder="Email"    value={form.email}    onChange={handleChange} required type="email" />
          <input className="input-glitch" name="password" placeholder="Password" value={form.password} onChange={handleChange} required type="password" />
          <button type="submit" className="btn-glitch">Login</button>
        </form>
        {error && <p className="msg-error" style={{ marginTop: 14 }}>{error}</p>}
        <div className="spacer" />
        <p><Link to="/forgot-password">Forgot password?</Link></p>
        <p>No account? <Link to="/register">Register</Link></p>
      </div>
    </div>
  );
}

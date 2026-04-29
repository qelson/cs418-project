import { useState, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import ReCAPTCHA from 'react-google-recaptcha';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';

const RECAPTCHA_SITE_KEY = '6LeIxAcTAAAAAJcZVRqyHh71UMIEGNQ_MXjiZKhI';

export default function Login() {
  const [form, setForm]               = useState({ email: '', password: '' });
  const [error, setError]             = useState('');
  const [captchaToken, setCaptchaToken] = useState(null);
  const recaptchaRef = useRef(null);
  const navigate     = useNavigate();
  const { login }    = useAuth();

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!captchaToken) {
      setError('Please complete the reCAPTCHA verification.');
      return;
    }

    try {
      const { data } = await api.post('/auth/login', { ...form, captchaToken });
      if (data.token) {
        login(data.token, data.user);
        navigate(data.user?.role === 'admin' ? '/admin' : '/dashboard');
      } else {
        navigate('/otp-verify', { state: { email: form.email } });
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed');
      recaptchaRef.current?.reset();
      setCaptchaToken(null);
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
          <div style={{ margin: '10px 0' }}>
            <ReCAPTCHA
              ref={recaptchaRef}
              sitekey={RECAPTCHA_SITE_KEY}
              onChange={token => setCaptchaToken(token)}
              onExpired={() => setCaptchaToken(null)}
            />
          </div>
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

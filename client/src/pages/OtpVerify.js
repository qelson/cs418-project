import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';

export default function OtpVerify() {
  const { state } = useLocation();
  const email = state?.email || '';
  const [otp, setOtp] = useState('');
  const [error, setError] = useState('');
  const { login, updateUser } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      // Step 1: verify OTP, receive JWT
      const { data } = await api.post('/auth/verify-otp', { email, otp });
      login(data.token, data.user);

      // Step 2: fetch full profile (includes isAdmin)
      const { data: profile } = await api.get('/user/profile');
      updateUser(profile);

      // Step 3: route by role
      navigate(profile.isAdmin ? '/admin' : '/dashboard', { replace: true });
    } catch (err) {
      setError(err.response?.data?.message || 'OTP verification failed');
    }
  };

  if (!email) {
    return (
      <div className="panel">
        <p>No login in progress. <a href="/login">Go to login</a></p>
      </div>
    );
  }

  return (
    <div className="panel">
      <div className="xp-titlebar">
        <span>Two-Factor Authentication — Verification Required</span>
        <div className="xp-sysbtns">
          <span>─</span><span>□</span><span className="xp-close">✕</span>
        </div>
      </div>
      <h2 className="glitch-title">2FA Verify</h2>
      <div className="status-strip status-warn">! VERIFICATION PENDING — DO NOT CLOSE THIS WINDOW</div>
      <p>A 6-digit code was sent to <strong style={{ color: 'var(--lime)' }}>{email}</strong></p>
      <div className="spacer" />
      <form onSubmit={handleSubmit} className="form-glitch">
        <input
          className="input-glitch"
          placeholder="6-digit code"
          value={otp}
          onChange={(e) => setOtp(e.target.value)}
          required
          maxLength={6}
        />
        <button type="submit" className="btn-glitch">Verify &amp; Login</button>
      </form>
      {error && <p className="msg-error" style={{ marginTop: 14 }}>{error}</p>}
    </div>
  );
}

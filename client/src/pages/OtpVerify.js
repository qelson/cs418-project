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
      <div style={styles.container}>
        <p>No login in progress. <a href="/login">Go to login</a></p>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <h2>Two-Factor Verification</h2>
      <p>A 6-digit code was sent to <strong>{email}</strong></p>
      <form onSubmit={handleSubmit} style={styles.form}>
        <input
          placeholder="6-digit code"
          value={otp}
          onChange={(e) => setOtp(e.target.value)}
          required
          maxLength={6}
          style={styles.input}
        />
        <button type="submit" style={styles.button}>Verify & Login</button>
      </form>
      {error && <p style={styles.error}>{error}</p>}
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

import { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import api from '../api/axios';

export default function VerifyEmail() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const [message, setMessage] = useState('Verifying...');
  const [error, setError] = useState('');

  useEffect(() => {
    if (!token) { setError('No token provided.'); return; }

    api.get(`/auth/verify-email?token=${token}`)
      .then(({ data }) => setMessage(data.message))
      .catch((err) => setError(err.response?.data?.message || 'Verification failed'));
  }, [token]);

  return (
    <div className="panel">
      <div className="xp-titlebar">
        <span>Email Verification — Account Activation</span>
        <div className="xp-sysbtns">
          <span>─</span><span>□</span><span className="xp-close">✕</span>
        </div>
      </div>
      <h2 className="glitch-title">Email Verify</h2>
      {!error && <p className="msg-success">{message}</p>}
      {error  && <p className="msg-error">{error}</p>}
      <div className="spacer" />
      <Link to="/login">Go to Login</Link>
    </div>
  );
}

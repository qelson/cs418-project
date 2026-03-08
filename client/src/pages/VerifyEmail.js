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
    <div style={styles.container}>
      <h2>Email Verification</h2>
      {!error && <p style={styles.success}>{message}</p>}
      {error  && <p style={styles.error}>{error}</p>}
      <Link to="/login">Go to Login</Link>
    </div>
  );
}

const styles = {
  container: { maxWidth: 400, margin: '60px auto', fontFamily: 'sans-serif' },
  success:   { color: 'green' },
  error:     { color: 'red' },
};

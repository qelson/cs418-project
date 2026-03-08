import { useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';

export default function Dashboard() {
  const { user, updateUser, logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    api.get('/user/profile')
      .then(({ data }) => updateUser(data))
      .catch(() => { logout(); navigate('/login'); });
  }, []);

  const handleLogout = () => { logout(); navigate('/login'); };

  return (
    <div style={styles.container}>
      <div style={styles.banner}>User Dashboard</div>
      <h2>Welcome, {user?.firstName} {user?.lastName}</h2>
      <table style={styles.table}>
        <tbody>
          <tr><td style={styles.label}>Email</td><td>{user?.email}</td></tr>
          <tr><td style={styles.label}>Name</td><td>{user?.firstName} {user?.lastName}</td></tr>
          <tr><td style={styles.label}>Verified</td><td>{user?.verified ? 'Yes' : 'No'}</td></tr>
          <tr><td style={styles.label}>Role</td><td>User</td></tr>
        </tbody>
      </table>
      <div style={styles.links}>
        <Link to="/edit-profile">Edit Profile</Link>
        <Link to="/change-password">Change Password</Link>
      </div>
      <button onClick={handleLogout} style={styles.button}>Logout</button>
    </div>
  );
}

const styles = {
  container: { maxWidth: 480, margin: '60px auto', fontFamily: 'sans-serif' },
  banner:    { background: '#4a90d9', color: '#fff', padding: '12px 16px', fontWeight: 'bold', fontSize: 16, marginBottom: 16 },
  table:     { width: '100%', borderCollapse: 'collapse', marginBottom: 20 },
  label:     { fontWeight: 'bold', padding: '6px 12px 6px 0', width: 100 },
  links:     { display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 20 },
  button:    { padding: '8px 16px', cursor: 'pointer' },
};

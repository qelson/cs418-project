import { useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';

export default function AdminDashboard() {
  const { user, updateUser, logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    api.get('/user/profile')
      .then(({ data }) => updateUser(data))
      .catch(() => { logout(); navigate('/login'); });
  }, []);

  const handleLogout = () => { logout(); navigate('/login'); };

  return (
    <div className="panel">
      <div className="banner-admin">▲ Admin Control Panel ▲</div>
      <h2 className="glitch-title">Admin View</h2>
      <div className="status-widget">
        <div className="sw-label">System Control Panel</div>
        <div className="meter-wrap"><div className="meter-fill fill-warn"></div></div>
        <div className="sw-row">
          <span>Admin Privileges</span>
          <span className="badge-crit">ELEVATED</span>
        </div>
        <div className="sw-row">
          <span>System Status</span>
          <span className="badge-ok">NOMINAL</span>
        </div>
        <div className="sw-row">
          <span>Access Level</span>
          <span className="badge-warn">RESTRICTED</span>
        </div>
      </div>
      <div className="badge-admin">ADMIN ACCESS</div>
      <table className="profile-table">
        <tbody>
          <tr><td>Name</td><td>{user?.firstName} {user?.lastName}</td></tr>
          <tr><td>Email</td><td>{user?.email}</td></tr>
          <tr><td>Verified</td><td>{user?.verified ? 'Yes' : 'No'}</td></tr>
          <tr><td>Role</td><td><strong style={{ color: 'var(--pink)' }}>Administrator</strong></td></tr>
        </tbody>
      </table>
      <div className="nav-links">
        <Link to="/edit-profile">▶ Edit Profile</Link>
        <Link to="/change-password">▶ Change Password</Link>
      </div>
      <button onClick={handleLogout} className="btn-glitch">Logout</button>
    </div>
  );
}

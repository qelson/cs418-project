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
    <div className="panel">
      <div className="banner-user">■ User Dashboard ■</div>
      <h2 className="glitch-title">Welcome</h2>
      <table className="profile-table">
        <tbody>
          <tr><td>Name</td><td>{user?.firstName} {user?.lastName}</td></tr>
          <tr><td>Email</td><td>{user?.email}</td></tr>
          <tr><td>Verified</td><td>{user?.verified ? 'Yes' : 'No'}</td></tr>
          <tr><td>Role</td><td>User</td></tr>
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

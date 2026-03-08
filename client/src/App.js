import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import PrivateRoute from './components/PrivateRoute';

import Register        from './pages/Register';
import Login           from './pages/Login';
import OtpVerify       from './pages/OtpVerify';
import VerifyEmail     from './pages/VerifyEmail';
import Dashboard       from './pages/Dashboard';
import AdminDashboard  from './pages/AdminDashboard';
import EditProfile     from './pages/EditProfile';
import ChangePassword  from './pages/ChangePassword';
import ForgotPassword  from './pages/ForgotPassword';
import ResetPassword   from './pages/ResetPassword';

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/"                element={<Navigate to="/login" replace />} />
          <Route path="/register"        element={<Register />} />
          <Route path="/login"           element={<Login />} />
          <Route path="/otp-verify"      element={<OtpVerify />} />
          <Route path="/verify-email"    element={<VerifyEmail />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password"  element={<ResetPassword />} />

          <Route path="/dashboard" element={
            <PrivateRoute><Dashboard /></PrivateRoute>
          } />
          <Route path="/admin" element={
            <PrivateRoute adminOnly={true}><AdminDashboard /></PrivateRoute>
          } />
          <Route path="/edit-profile" element={
            <PrivateRoute><EditProfile /></PrivateRoute>
          } />
          <Route path="/change-password" element={
            <PrivateRoute><ChangePassword /></PrivateRoute>
          } />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

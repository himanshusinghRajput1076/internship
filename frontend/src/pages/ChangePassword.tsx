import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import Navbar from '../components/Navbar';
import '../styles/global.css';

const PASSWORD_REGEX = /^(?=.*[A-Z])(?=.*[!@#$%^&*()\-_=+{};:,<.>])/;

const ChangePassword: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [current, setCurrent] = useState('');
  const [next, setNext] = useState('');
  const [confirmNext, setConfirmNext] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (next.length < 8 || next.length > 16) {
      setError('New password must be 8–16 characters');
      return;
    }
    if (!PASSWORD_REGEX.test(next)) {
      setError('New password must contain an uppercase letter and a special character');
      return;
    }
    if (next !== confirmNext) {
      setError('Passwords do not match');
      return;
    }

    setLoading(true);
    try {
      await api.patch('/auth/change-password', {
        currentPassword: current,
        newPassword: next,
      });
      setSuccess('Password updated successfully!');
      setCurrent('');
      setNext('');
      setConfirmNext('');
    } catch (err: any) {
      setError(err.response?.data?.message ?? 'Failed to update password');
    } finally {
      setLoading(false);
    }
  };

  // Determine back link based on role
  const backPath =
    user?.role === 'admin'
      ? '/admin/dashboard'
      : user?.role === 'store_owner'
      ? '/owner/dashboard'
      : '/stores';

  return (
    <div className="layout">
      <Navbar />
      <main className="main-content">
        <div className="page-header">
          <div>
            <h1 className="page-title">Change Password</h1>
            <p className="page-subtitle">Keep your account secure</p>
          </div>
          <button className="btn-secondary" onClick={() => navigate(backPath)}>
            ← Back
          </button>
        </div>

        <div className="auth-card" style={{ maxWidth: 440 }}>
          <form onSubmit={handleSubmit} className="auth-form">
            {error && <div className="alert alert-error">{error}</div>}
            {success && <div className="alert alert-success">{success}</div>}

            <div className="form-group">
              <label htmlFor="current">Current Password</label>
              <input
                id="current"
                type="password"
                className="form-input"
                value={current}
                onChange={(e) => setCurrent(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="next">New Password</label>
              <input
                id="next"
                type="password"
                className="form-input"
                placeholder="8–16 chars, 1 uppercase, 1 special"
                value={next}
                onChange={(e) => setNext(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="confirmNext">Confirm New Password</label>
              <input
                id="confirmNext"
                type="password"
                className="form-input"
                value={confirmNext}
                onChange={(e) => setConfirmNext(e.target.value)}
                required
              />
            </div>

            <button type="submit" className="btn-primary" disabled={loading}>
              {loading ? <span className="spinner" /> : 'Update Password'}
            </button>
          </form>
        </div>
      </main>
    </div>
  );
};

export default ChangePassword;

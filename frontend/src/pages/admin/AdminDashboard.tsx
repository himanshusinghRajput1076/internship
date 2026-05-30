import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import Navbar from '../../components/Navbar';

interface Stats {
  totalUsers: number;
  totalStores: number;
  totalRatings: number;
}

const AdminDashboard: React.FC = () => {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/dashboard/admin')
      .then((res) => setStats(res.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="layout">
      <Navbar />
      <main className="main-content">
        <div className="page-header">
          <div>
            <h1 className="page-title">Admin Dashboard</h1>
            <p className="page-subtitle">Platform overview at a glance</p>
          </div>
        </div>

        {loading ? (
          <div className="loading-state">
            <span className="spinner" style={{ borderTopColor: 'var(--primary)' }} />
            Loading stats…
          </div>
        ) : (
          <div className="stats-grid">
            <div className="stat-card">
              <span className="stat-icon">👥</span>
              <div className="stat-label">Total Users</div>
              <div className="stat-value">{stats?.totalUsers ?? '—'}</div>
            </div>
            <div className="stat-card">
              <span className="stat-icon">🏪</span>
              <div className="stat-label">Total Stores</div>
              <div className="stat-value">{stats?.totalStores ?? '—'}</div>
            </div>
            <div className="stat-card">
              <span className="stat-icon">⭐</span>
              <div className="stat-label">Ratings Submitted</div>
              <div className="stat-value">{stats?.totalRatings ?? '—'}</div>
            </div>
          </div>
        )}

        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
          <Link to="/admin/users" className="btn-primary" style={{ width: 'auto', textDecoration: 'none' }}>
            → Manage Users
          </Link>
          <Link to="/admin/stores" className="btn-secondary" style={{ textDecoration: 'none' }}>
            → Manage Stores
          </Link>
        </div>
      </main>
    </div>
  );
};

export default AdminDashboard;

import React, { useEffect, useState } from 'react';
import api from '../../services/api';
import Navbar from '../../components/Navbar';

interface RaterEntry {
  id: string;
  value: number;
  created_at: string;
  user: { id: string; name: string; email: string };
}

interface DashboardData {
  avgRating: number | null;
  totalRatings: number;
  ratings: RaterEntry[];
}

const Stars: React.FC<{ value: number }> = ({ value }) => (
  <span className="stars">
    {[1, 2, 3, 4, 5].map((n) => (
      <span key={n} className={`star ${n <= Math.round(value) ? 'filled' : ''}`}>★</span>
    ))}
  </span>
);

const OwnerDashboard: React.FC = () => {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [sort, setSort] = useState<{ field: 'name' | 'value' | 'created_at'; order: 'ASC' | 'DESC' }>({
    field: 'created_at',
    order: 'DESC',
  });

  useEffect(() => {
    api.get('/ratings/owner/dashboard')
      .then((res) => setData(res.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const toggleSort = (field: typeof sort.field) => {
    setSort((prev) =>
      prev.field === field ? { field, order: prev.order === 'ASC' ? 'DESC' : 'ASC' } : { field, order: 'ASC' }
    );
  };

  const sortIcon = (field: typeof sort.field) =>
    sort.field === field ? (sort.order === 'ASC' ? '↑' : '↓') : '⇅';

  const sortedRatings = data
    ? [...data.ratings].sort((a, b) => {
        let aVal: any, bVal: any;
        if (sort.field === 'name') { aVal = a.user.name; bVal = b.user.name; }
        else if (sort.field === 'value') { aVal = a.value; bVal = b.value; }
        else { aVal = new Date(a.created_at).getTime(); bVal = new Date(b.created_at).getTime(); }
        return sort.order === 'ASC' ? (aVal > bVal ? 1 : -1) : (aVal < bVal ? 1 : -1);
      })
    : [];

  return (
    <div className="layout">
      <Navbar />
      <main className="main-content">
        <div className="page-header">
          <div>
            <h1 className="page-title">My Store Dashboard</h1>
            <p className="page-subtitle">See who's rating your store</p>
          </div>
        </div>

        {loading ? (
          <div className="loading-state"><span className="spinner" style={{ borderTopColor: 'var(--primary)' }} /> Loading…</div>
        ) : !data ? (
          <div className="empty-state"><span className="empty-icon">⚠️</span><p>Could not load dashboard</p></div>
        ) : (
          <>
            <div className="owner-avg">
              {data.avgRating != null ? (
                <>
                  <div className="big-rating">{data.avgRating}</div>
                  <Stars value={data.avgRating} />
                  <div className="rating-label">Average rating · {data.totalRatings} review{data.totalRatings !== 1 ? 's' : ''}</div>
                </>
              ) : (
                <>
                  <div className="big-rating" style={{ color: 'var(--text-muted)', fontSize: '2rem' }}>No ratings yet</div>
                  <div className="rating-label">Be patient — ratings will appear here</div>
                </>
              )}
            </div>

            {sortedRatings.length === 0 ? (
              <div className="empty-state"><span className="empty-icon">👥</span><p>No users have rated your store yet</p></div>
            ) : (
              <div className="table-wrapper">
                <table>
                  <thead>
                    <tr>
                      <th onClick={() => toggleSort('name')}>Customer Name <i className="sort-icon">{sortIcon('name')}</i></th>
                      <th>Email</th>
                      <th onClick={() => toggleSort('value')}>Rating <i className="sort-icon">{sortIcon('value')}</i></th>
                      <th onClick={() => toggleSort('created_at')}>Rated On <i className="sort-icon">{sortIcon('created_at')}</i></th>
                    </tr>
                  </thead>
                  <tbody>
                    {sortedRatings.map((r) => (
                      <tr key={r.id}>
                        <td>{r.user.name}</td>
                        <td className="text-muted">{r.user.email}</td>
                        <td>
                          <span style={{ color: 'var(--star-filled)', fontWeight: 700 }}>{'★'.repeat(r.value)}</span>
                          <span style={{ color: 'var(--star-empty)' }}>{'★'.repeat(5 - r.value)}</span>
                          <span className="text-muted" style={{ marginLeft: '0.4rem', fontSize: '0.8rem' }}>({r.value}/5)</span>
                        </td>
                        <td className="text-muted">{new Date(r.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
};

export default OwnerDashboard;

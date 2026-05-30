import React, { useCallback, useEffect, useState } from 'react';
import api from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';
import Navbar from '../../components/Navbar';

interface Store {
  id: string;
  name: string;
  address: string;
  avgRating: number | null;
  ratingCount: number;
}

interface MyRatingMap {
  [storeId: string]: { id: string; value: number } | null;
}

/** Star picker used in the rating modal */
const StarPicker: React.FC<{ value: number; onChange: (v: number) => void }> = ({ value, onChange }) => {
  const [hovered, setHovered] = useState(0);
  return (
    <div className="stars" style={{ gap: '0.5rem', margin: '0.5rem 0' }}>
      {[1, 2, 3, 4, 5].map((n) => (
        <span
          key={n}
          className={`star interactive ${n <= (hovered || value) ? 'filled' : ''}`}
          onMouseEnter={() => setHovered(n)}
          onMouseLeave={() => setHovered(0)}
          onClick={() => onChange(n)}
        >
          ★
        </span>
      ))}
    </div>
  );
};

const Stars: React.FC<{ value: number }> = ({ value }) => (
  <span className="stars">
    {[1, 2, 3, 4, 5].map((n) => (
      <span key={n} className={`star ${n <= Math.round(value) ? 'filled' : ''}`}>★</span>
    ))}
  </span>
);

const UserStores: React.FC = () => {
  const { user } = useAuth();
  const [stores, setStores] = useState<Store[]>([]);
  const [myRatings, setMyRatings] = useState<MyRatingMap>({});
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState({ name: '', address: '' });
  const [ratingModal, setRatingModal] = useState<{ store: Store; existing: { id: string; value: number } | null } | null>(null);
  const [ratingValue, setRatingValue] = useState(0);
  const [ratingLoading, setRatingLoading] = useState(false);
  const [ratingError, setRatingError] = useState('');

  const fetchStores = useCallback(() => {
    setLoading(true);
    const params = new URLSearchParams();
    if (search.name) params.set('name', search.name);
    if (search.address) params.set('address', search.address);
    api.get(`/stores?${params.toString()}`).then((res) => {
      setStores(res.data);
      // For each store, fetch the logged-in user's own rating
      return Promise.all(
        res.data.map((s: Store) =>
          api.get(`/ratings/store/${s.id}`).then((r) => {
            const mine = (r.data as any[]).find((rating) => rating.user_id === user?.id);
            return { storeId: s.id, rating: mine ? { id: mine.id, value: mine.value } : null };
          }).catch(() => ({ storeId: s.id, rating: null }))
        )
      );
    }).then((results) => {
      const map: MyRatingMap = {};
      results.forEach(({ storeId, rating }: any) => { map[storeId] = rating; });
      setMyRatings(map);
    }).catch(console.error).finally(() => setLoading(false));
  }, [search, user?.id]);

  useEffect(() => { fetchStores(); }, [fetchStores]);

  const openRatingModal = (store: Store) => {
    const existing = myRatings[store.id] ?? null;
    setRatingModal({ store, existing });
    setRatingValue(existing?.value ?? 0);
    setRatingError('');
  };

  const submitRating = async () => {
    if (ratingValue === 0) { setRatingError('Please select a star rating'); return; }
    setRatingLoading(true);
    setRatingError('');
    try {
      if (ratingModal?.existing) {
        await api.patch(`/ratings/${ratingModal.existing.id}`, { value: ratingValue });
      } else {
        await api.post('/ratings', { store_id: ratingModal?.store.id, value: ratingValue });
      }
      setRatingModal(null);
      fetchStores();
    } catch (err: any) {
      setRatingError(err.response?.data?.message ?? 'Failed to submit rating');
    } finally {
      setRatingLoading(false);
    }
  };

  return (
    <div className="layout">
      <Navbar />
      <main className="main-content">
        <div className="page-header">
          <div>
            <h1 className="page-title">Stores</h1>
            <p className="page-subtitle">Browse and rate stores on the platform</p>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1.5rem' }}>
          <input
            className="filter-input"
            style={{ width: 220 }}
            placeholder="Search by name…"
            value={search.name}
            onChange={(e) => setSearch(p => ({ ...p, name: e.target.value }))}
          />
          <input
            className="filter-input"
            style={{ width: 220 }}
            placeholder="Search by address…"
            value={search.address}
            onChange={(e) => setSearch(p => ({ ...p, address: e.target.value }))}
          />
        </div>

        {loading ? (
          <div className="loading-state"><span className="spinner" style={{ borderTopColor: 'var(--primary)' }} /> Loading stores…</div>
        ) : stores.length === 0 ? (
          <div className="empty-state"><span className="empty-icon">🏪</span><p>No stores found</p></div>
        ) : (
          <div className="stores-grid">
            {stores.map((s) => {
              const myR = myRatings[s.id];
              return (
                <div key={s.id} className="store-row">
                  <div className="store-info">
                    <div className="store-name">{s.name}</div>
                    <div className="store-address">📍 {s.address}</div>
                  </div>

                  <div className="store-actions">
                    <div className="rating-display">
                      <span className="label">Overall</span>
                      {s.avgRating != null
                        ? <><div className="value">⭐ {s.avgRating}</div><Stars value={s.avgRating} /></>
                        : <div className="value none">No ratings</div>}
                    </div>

                    <div className="rating-display">
                      <span className="label">My Rating</span>
                      {myR
                        ? <><div className="value">⭐ {myR.value}</div><Stars value={myR.value} /></>
                        : <div className="value none">—</div>}
                    </div>

                    <button
                      className={`btn-primary btn-sm ${myR ? 'btn-secondary' : ''}`}
                      style={{ width: 'auto' }}
                      onClick={() => openRatingModal(s)}
                    >
                      {myR ? 'Edit Rating' : 'Rate Store'}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {ratingModal && (
          <div className="modal-overlay" onClick={() => setRatingModal(null)}>
            <div className="modal" style={{ maxWidth: 360 }} onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <span className="modal-title">{ratingModal.existing ? 'Update Rating' : 'Rate Store'}</span>
                <button className="modal-close" onClick={() => setRatingModal(null)}>×</button>
              </div>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '0.5rem' }}>
                {ratingModal.store.name}
              </p>
              {ratingError && <div className="alert alert-error" style={{ marginBottom: '0.75rem' }}>{ratingError}</div>}
              <StarPicker value={ratingValue} onChange={setRatingValue} />
              <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem', marginTop: '0.5rem' }}>
                {ratingValue > 0 ? `You selected ${ratingValue} star${ratingValue > 1 ? 's' : ''}` : 'Click a star to rate'}
              </p>
              <div className="modal-footer">
                <button className="btn-secondary" onClick={() => setRatingModal(null)}>Cancel</button>
                <button className="btn-primary btn-sm" style={{ width: 'auto' }} onClick={submitRating} disabled={ratingLoading}>
                  {ratingLoading ? <span className="spinner" /> : ratingModal.existing ? 'Update' : 'Submit'}
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default UserStores;

import React, { useCallback, useEffect, useState } from 'react';
import api from '../../services/api';
import Navbar from '../../components/Navbar';

interface Store {
  id: string;
  name: string;
  email: string;
  address: string;
  avgRating: number | null;
  ratingCount: number;
}

type SortField = 'name' | 'email' | 'address';

const AdminStores: React.FC = () => {
  const [stores, setStores] = useState<Store[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ name: '', address: '' });
  const [sort, setSort] = useState<{ field: SortField; order: 'ASC' | 'DESC' }>({ field: 'name', order: 'ASC' });
  const [showAddModal, setShowAddModal] = useState(false);
  const [addForm, setAddForm] = useState({ name: '', email: '', address: '', owner_id: '' });
  const [addError, setAddError] = useState('');
  const [addLoading, setAddLoading] = useState(false);

  const fetchStores = useCallback(() => {
    setLoading(true);
    const params = new URLSearchParams();
    if (filters.name) params.set('name', filters.name);
    if (filters.address) params.set('address', filters.address);
    params.set('sortBy', sort.field);
    params.set('sortOrder', sort.order);
    api.get(`/stores?${params.toString()}`)
      .then((res) => setStores(res.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [filters, sort]);

  useEffect(() => { fetchStores(); }, [fetchStores]);

  const toggleSort = (field: SortField) => {
    setSort((prev) =>
      prev.field === field ? { field, order: prev.order === 'ASC' ? 'DESC' : 'ASC' } : { field, order: 'ASC' }
    );
  };

  const sortIcon = (field: SortField) => sort.field === field ? (sort.order === 'ASC' ? '↑' : '↓') : '⇅';

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    setAddError('');
    setAddLoading(true);
    try {
      const payload: any = { name: addForm.name, email: addForm.email, address: addForm.address };
      if (addForm.owner_id) payload.owner_id = addForm.owner_id;
      await api.post('/stores', payload);
      setShowAddModal(false);
      setAddForm({ name: '', email: '', address: '', owner_id: '' });
      fetchStores();
    } catch (err: any) {
      setAddError(err.response?.data?.message ?? 'Failed to create store');
    } finally {
      setAddLoading(false);
    }
  };

  return (
    <div className="layout">
      <Navbar />
      <main className="main-content">
        <div className="page-header">
          <div>
            <h1 className="page-title">Stores</h1>
            <p className="page-subtitle">{stores.length} store{stores.length !== 1 ? 's' : ''}</p>
          </div>
          <button className="btn-primary btn-sm" style={{ width: 'auto' }} onClick={() => setShowAddModal(true)}>
            + Add Store
          </button>
        </div>

        <div className="table-wrapper">
          <div className="table-toolbar">
            <div className="table-filters">
              <input className="filter-input" placeholder="Filter by name" value={filters.name} onChange={(e) => setFilters(p => ({ ...p, name: e.target.value }))} />
              <input className="filter-input" placeholder="Filter by address" value={filters.address} onChange={(e) => setFilters(p => ({ ...p, address: e.target.value }))} />
            </div>
          </div>

          {loading ? (
            <div className="loading-state"><span className="spinner" style={{ borderTopColor: 'var(--primary)' }} /> Loading…</div>
          ) : stores.length === 0 ? (
            <div className="empty-state"><span className="empty-icon">🏪</span><p>No stores yet</p></div>
          ) : (
            <table>
              <thead>
                <tr>
                  <th onClick={() => toggleSort('name')}>Name <i className="sort-icon">{sortIcon('name')}</i></th>
                  <th onClick={() => toggleSort('email')}>Email <i className="sort-icon">{sortIcon('email')}</i></th>
                  <th onClick={() => toggleSort('address')}>Address <i className="sort-icon">{sortIcon('address')}</i></th>
                  <th>Avg Rating</th>
                  <th># Ratings</th>
                </tr>
              </thead>
              <tbody>
                {stores.map((s) => (
                  <tr key={s.id}>
                    <td>{s.name}</td>
                    <td className="text-muted">{s.email}</td>
                    <td className="text-muted">{s.address.substring(0, 40)}{s.address.length > 40 ? '…' : ''}</td>
                    <td>
                      {s.avgRating != null
                        ? <span style={{ color: 'var(--star-filled)', fontWeight: 600 }}>⭐ {s.avgRating}</span>
                        : <span className="text-muted">—</span>}
                    </td>
                    <td>{s.ratingCount}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {showAddModal && (
          <div className="modal-overlay" onClick={() => setShowAddModal(false)}>
            <div className="modal" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <span className="modal-title">Add New Store</span>
                <button className="modal-close" onClick={() => setShowAddModal(false)}>×</button>
              </div>
              <form onSubmit={handleAdd} className="auth-form">
                {addError && <div className="alert alert-error">{addError}</div>}
                <div className="form-group">
                  <label>Store Name</label>
                  <input type="text" className="form-input" placeholder="Min 20 characters" value={addForm.name} onChange={(e) => setAddForm(p => ({ ...p, name: e.target.value }))} required />
                </div>
                <div className="form-group">
                  <label>Email</label>
                  <input type="email" className="form-input" value={addForm.email} onChange={(e) => setAddForm(p => ({ ...p, email: e.target.value }))} required />
                </div>
                <div className="form-group">
                  <label>Address</label>
                  <textarea className="form-input form-textarea" rows={2} value={addForm.address} onChange={(e) => setAddForm(p => ({ ...p, address: e.target.value }))} required />
                </div>
                <div className="form-group">
                  <label>Owner ID <span className="text-muted">(optional)</span></label>
                  <input type="text" className="form-input" placeholder="UUID of a store_owner user" value={addForm.owner_id} onChange={(e) => setAddForm(p => ({ ...p, owner_id: e.target.value }))} />
                </div>
                <div className="modal-footer">
                  <button type="button" className="btn-secondary" onClick={() => setShowAddModal(false)}>Cancel</button>
                  <button type="submit" className="btn-primary btn-sm" disabled={addLoading} style={{ width: 'auto' }}>
                    {addLoading ? <span className="spinner" /> : 'Create Store'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default AdminStores;

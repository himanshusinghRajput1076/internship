import React, { useCallback, useEffect, useState } from 'react';
import api from '../../services/api';
import Navbar from '../../components/Navbar';

interface Store {
  id: string;
  name: string;
  email: string;
  address: string;
  owner_id: string | null;
  owner: { id: string; name: string } | null;
  avgRating: number | null;
  ratingCount: number;
}

type SortField = 'name' | 'email' | 'address';

const AdminStores: React.FC = () => {
  const [stores, setStores] = useState<Store[]>([]);
  const [owners, setOwners] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ name: '', address: '' });
  const [sort, setSort] = useState<{ field: SortField; order: 'ASC' | 'DESC' }>({ field: 'name', order: 'ASC' });
  
  const [showAddModal, setShowAddModal] = useState(false);
  const [addForm, setAddForm] = useState({ name: '', email: '', address: '', owner_id: '' });
  const [addError, setAddError] = useState('');
  const [addLoading, setAddLoading] = useState(false);

  const [assignModal, setAssignModal] = useState<Store | null>(null);
  const [selectedOwnerId, setSelectedOwnerId] = useState('');
  const [assignLoading, setAssignLoading] = useState(false);
  const [assignError, setAssignError] = useState('');

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

  const fetchOwners = useCallback(() => {
    api.get('/users?role=store_owner')
      .then((res) => setOwners(res.data))
      .catch(console.error);
  }, []);

  useEffect(() => {
    fetchStores();
    fetchOwners();
  }, [fetchStores, fetchOwners]);

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
      fetchOwners();
    } catch (err: any) {
      setAddError(err.response?.data?.message ?? 'Failed to create store');
    } finally {
      setAddLoading(false);
    }
  };

  const handleAssignOwner = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!assignModal) return;
    setAssignError('');
    setAssignLoading(true);
    try {
      await api.patch(`/stores/${assignModal.id}`, { owner_id: selectedOwnerId || null });
      setAssignModal(null);
      setSelectedOwnerId('');
      fetchStores();
      fetchOwners();
    } catch (err: any) {
      setAssignError(err.response?.data?.message ?? 'Failed to assign owner');
    } finally {
      setAssignLoading(false);
    }
  };

  const openAssignModal = (store: Store) => {
    setAssignModal(store);
    setSelectedOwnerId('');
    setAssignError('');
  };

  // Filter owners who are NOT already assigned to any store
  const unassignedOwners = owners.filter(
    (owner) => !stores.some((store) => store.owner_id === owner.id)
  );

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
                  <th>Owner</th>
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
                      {s.owner ? (
                        <span className="badge badge-store_owner" style={{ fontSize: '0.8rem', padding: '0.2rem 0.6rem' }}>
                          👤 {s.owner.name}
                        </span>
                      ) : (
                        <button
                          className="btn-primary btn-sm"
                          style={{ width: 'auto', padding: '0.15rem 0.5rem', fontSize: '0.75rem', borderRadius: '4px' }}
                          onClick={() => openAssignModal(s)}
                        >
                          Assign Owner
                        </button>
                      )}
                    </td>
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

        {/* Add New Store Modal */}
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
                  <input type="text" className="form-input" placeholder="Enter store name" value={addForm.name} onChange={(e) => setAddForm(p => ({ ...p, name: e.target.value }))} required />
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
                  <label>Owner <span className="text-muted">(optional - unique selection)</span></label>
                  <select
                    className="form-input"
                    value={addForm.owner_id}
                    onChange={(e) => setAddForm(p => ({ ...p, owner_id: e.target.value }))}
                  >
                    <option value="">No Owner Assigned</option>
                    {unassignedOwners.map((owner) => (
                      <option key={owner.id} value={owner.id}>
                        {owner.name} ({owner.email})
                      </option>
                    ))}
                  </select>
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

        {/* Assign Owner Modal */}
        {assignModal && (
          <div className="modal-overlay" onClick={() => setAssignModal(null)}>
            <div className="modal" style={{ maxWidth: 400 }} onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <span className="modal-title">Assign Store Owner</span>
                <button className="modal-close" onClick={() => setAssignModal(null)}>×</button>
              </div>
              <form onSubmit={handleAssignOwner} className="auth-form">
                {assignError && <div className="alert alert-error">{assignError}</div>}
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '1rem' }}>
                  Assign an owner to <strong>{assignModal.name}</strong>. Only unassigned store owners are available for selection.
                </p>
                <div className="form-group">
                  <label>Select Owner</label>
                  <select
                    className="form-input"
                    value={selectedOwnerId}
                    onChange={(e) => setSelectedOwnerId(e.target.value)}
                    required
                  >
                    <option value="">-- Choose Owner --</option>
                    {unassignedOwners.map((owner) => (
                      <option key={owner.id} value={owner.id}>
                        {owner.name} ({owner.email})
                      </option>
                    ))}
                  </select>
                </div>
                <div className="modal-footer">
                  <button type="button" className="btn-secondary" onClick={() => setAssignModal(null)}>Cancel</button>
                  <button type="submit" className="btn-primary btn-sm" disabled={assignLoading} style={{ width: 'auto' }}>
                    {assignLoading ? <span className="spinner" /> : 'Assign'}
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

import React, { useCallback, useEffect, useState } from 'react';
import api from '../../services/api';
import Navbar from '../../components/Navbar';

interface User {
  id: string;
  name: string;
  email: string;
  address: string;
  role: string;
  created_at: string;
}

interface UserDetail extends User {
  avgRating: number | null;
  store?: { name: string };
}

const SORT_FIELDS = ['name', 'email', 'address', 'role'] as const;
type SortField = typeof SORT_FIELDS[number];

const AdminUsers: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ name: '', email: '', address: '', role: '' });
  const [sort, setSort] = useState<{ field: SortField; order: 'ASC' | 'DESC' }>({ field: 'name', order: 'ASC' });
  const [detailUser, setDetailUser] = useState<UserDetail | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [addForm, setAddForm] = useState({ name: '', email: '', password: '', address: '', role: 'user' });
  const [addError, setAddError] = useState('');
  const [addLoading, setAddLoading] = useState(false);

  const fetchUsers = useCallback(() => {
    setLoading(true);
    const params = new URLSearchParams();
    if (filters.name) params.set('name', filters.name);
    if (filters.email) params.set('email', filters.email);
    if (filters.address) params.set('address', filters.address);
    if (filters.role) params.set('role', filters.role);
    params.set('sortBy', sort.field);
    params.set('sortOrder', sort.order);
    api.get(`/users?${params.toString()}`)
      .then((res) => setUsers(res.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [filters, sort]);

  useEffect(() => { fetchUsers(); }, [fetchUsers]);

  const toggleSort = (field: SortField) => {
    setSort((prev) =>
      prev.field === field
        ? { field, order: prev.order === 'ASC' ? 'DESC' : 'ASC' }
        : { field, order: 'ASC' }
    );
  };

  const sortIcon = (field: SortField) => {
    if (sort.field !== field) return '⇅';
    return sort.order === 'ASC' ? '↑' : '↓';
  };

  const openDetail = async (id: string) => {
    const res = await api.get(`/users/${id}`);
    setDetailUser(res.data);
  };

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    setAddError('');
    setAddLoading(true);
    try {
      await api.post('/users', addForm);
      setShowAddModal(false);
      setAddForm({ name: '', email: '', password: '', address: '', role: 'user' });
      fetchUsers();
    } catch (err: any) {
      setAddError(err.response?.data?.message ?? 'Failed to create user');
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
            <h1 className="page-title">Users</h1>
            <p className="page-subtitle">{users.length} user{users.length !== 1 ? 's' : ''} found</p>
          </div>
          <button className="btn-primary btn-sm" style={{ width: 'auto' }} onClick={() => setShowAddModal(true)}>
            + Add User
          </button>
        </div>

        <div className="table-wrapper">
          <div className="table-toolbar">
            <div className="table-filters">
              {(['name', 'email', 'address'] as const).map((f) => (
                <input
                  key={f}
                  className="filter-input"
                  placeholder={`Filter by ${f}`}
                  value={filters[f]}
                  onChange={(e) => setFilters((p) => ({ ...p, [f]: e.target.value }))}
                />
              ))}
              <select
                className="filter-input"
                value={filters.role}
                onChange={(e) => setFilters((p) => ({ ...p, role: e.target.value }))}
              >
                <option value="">All Roles</option>
                <option value="admin">Admin</option>
                <option value="user">User</option>
                <option value="store_owner">Store Owner</option>
              </select>
            </div>
          </div>

          {loading ? (
            <div className="loading-state"><span className="spinner" style={{ borderTopColor: 'var(--primary)' }} /> Loading…</div>
          ) : users.length === 0 ? (
            <div className="empty-state"><span className="empty-icon">👤</span><p>No users found</p></div>
          ) : (
            <table>
              <thead>
                <tr>
                  {SORT_FIELDS.map((f) => (
                    <th key={f} onClick={() => toggleSort(f)}>
                      {f.charAt(0).toUpperCase() + f.slice(1)}
                      <i className="sort-icon">{sortIcon(f)}</i>
                    </th>
                  ))}
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr key={u.id}>
                    <td>{u.name}</td>
                    <td>{u.email}</td>
                    <td className="text-muted">{u.address.substring(0, 40)}{u.address.length > 40 ? '…' : ''}</td>
                    <td><span className={`badge badge-${u.role}`}>{u.role.replace('_', ' ')}</span></td>
                    <td>
                      <button className="btn-secondary btn-sm" onClick={() => openDetail(u.id)}>View</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* User Detail Modal */}
        {detailUser && (
          <div className="modal-overlay" onClick={() => setDetailUser(null)}>
            <div className="modal" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <span className="modal-title">User Details</span>
                <button className="modal-close" onClick={() => setDetailUser(null)}>×</button>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                <div><strong>Name:</strong> {detailUser.name}</div>
                <div><strong>Email:</strong> {detailUser.email}</div>
                <div><strong>Address:</strong> {detailUser.address}</div>
                <div><strong>Role:</strong> <span className={`badge badge-${detailUser.role}`}>{detailUser.role.replace('_', ' ')}</span></div>
                {detailUser.role === 'store_owner' && (
                  <div><strong>Store Avg Rating:</strong> {detailUser.avgRating != null ? `⭐ ${detailUser.avgRating}` : 'No ratings yet'}</div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Add User Modal */}
        {showAddModal && (
          <div className="modal-overlay" onClick={() => setShowAddModal(false)}>
            <div className="modal" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <span className="modal-title">Add New User</span>
                <button className="modal-close" onClick={() => setShowAddModal(false)}>×</button>
              </div>
              <form onSubmit={handleAdd} className="auth-form">
                {addError && <div className="alert alert-error">{addError}</div>}
                <div className="form-group">
                  <label>Full Name</label>
                  <input type="text" className="form-input" placeholder="Enter full name" value={addForm.name} onChange={(e) => setAddForm(p => ({ ...p, name: e.target.value }))} required />
                </div>
                <div className="form-group">
                  <label>Email</label>
                  <input type="email" className="form-input" value={addForm.email} onChange={(e) => setAddForm(p => ({ ...p, email: e.target.value }))} required />
                </div>
                <div className="form-group">
                  <label>Password</label>
                  <input type="password" className="form-input" placeholder="Min 8 chars, uppercase + special" value={addForm.password} onChange={(e) => setAddForm(p => ({ ...p, password: e.target.value }))} required />
                </div>
                <div className="form-group">
                  <label>Address</label>
                  <textarea className="form-input form-textarea" rows={2} value={addForm.address} onChange={(e) => setAddForm(p => ({ ...p, address: e.target.value }))} required />
                </div>
                <div className="form-group">
                  <label>Role</label>
                  <select className="form-input" value={addForm.role} onChange={(e) => setAddForm(p => ({ ...p, role: e.target.value }))}>
                    <option value="user">Normal User</option>
                    <option value="admin">Admin</option>
                    <option value="store_owner">Store Owner</option>
                  </select>
                </div>
                <div className="modal-footer">
                  <button type="button" className="btn-secondary" onClick={() => setShowAddModal(false)}>Cancel</button>
                  <button type="submit" className="btn-primary btn-sm" disabled={addLoading} style={{ width: 'auto' }}>
                    {addLoading ? <span className="spinner" /> : 'Create User'}
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

export default AdminUsers;

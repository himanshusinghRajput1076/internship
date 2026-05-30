import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

/**
 * Shared navigation bar. Shows different links per role,
 * and a logout button that clears auth state.
 */
const Navbar: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const adminLinks = [
    { to: '/admin/dashboard', label: 'Dashboard' },
    { to: '/admin/users', label: 'Users' },
    { to: '/admin/stores', label: 'Stores' },
    { to: '/admin/change-password', label: 'Password' },
  ];

  const userLinks = [
    { to: '/stores', label: 'Stores' },
    { to: '/change-password', label: 'Password' },
  ];

  const ownerLinks = [
    { to: '/owner/dashboard', label: 'Dashboard' },
    { to: '/owner/change-password', label: 'Password' },
  ];

  const links =
    user?.role === 'admin'
      ? adminLinks
      : user?.role === 'store_owner'
      ? ownerLinks
      : userLinks;

  return (
    <nav className="navbar">
      <div className="navbar-brand">
        <span className="logo-icon">⭐</span>
        StoreRate
      </div>

      <ul className="navbar-nav">
        {links.map((l) => (
          <li key={l.to}>
            <NavLink to={l.to} className={({ isActive }) => (isActive ? 'active' : '')}>
              {l.label}
            </NavLink>
          </li>
        ))}
      </ul>

      <div className="navbar-right">
        <span className="user-badge">
          {user?.name.split(' ')[0]} · {user?.role.replace('_', ' ')}
        </span>
        <button onClick={handleLogout} className="btn-secondary btn-sm">
          Logout
        </button>
      </div>
    </nav>
  );
};

export default Navbar;

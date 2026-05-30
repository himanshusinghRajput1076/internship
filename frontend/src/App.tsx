import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminUsers from './pages/admin/AdminUsers';
import AdminStores from './pages/admin/AdminStores';
import UserStores from './pages/user/UserStores';
import OwnerDashboard from './pages/owner/OwnerDashboard';
import ChangePassword from './pages/ChangePassword';
import Unauthorized from './pages/Unauthorized';

/** Redirect already-logged-in users away from login/register */
const PublicRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, user } = useAuth();
  if (!isAuthenticated) return <>{children}</>;
  if (user?.role === 'admin') return <Navigate to="/admin/dashboard" replace />;
  if (user?.role === 'store_owner') return <Navigate to="/owner/dashboard" replace />;
  return <Navigate to="/stores" replace />;
};

const AppRoutes: React.FC = () => (
  <Routes>
    <Route path="/login" element={<PublicRoute><LoginPage /></PublicRoute>} />
    <Route path="/register" element={<PublicRoute><RegisterPage /></PublicRoute>} />
    <Route path="/unauthorized" element={<Unauthorized />} />

    <Route element={<ProtectedRoute allowedRoles={['admin']} />}>
      <Route path="/admin/dashboard" element={<AdminDashboard />} />
      <Route path="/admin/users" element={<AdminUsers />} />
      <Route path="/admin/stores" element={<AdminStores />} />
      <Route path="/admin/change-password" element={<ChangePassword />} />
    </Route>

    <Route element={<ProtectedRoute allowedRoles={['user']} />}>
      <Route path="/stores" element={<UserStores />} />
      <Route path="/change-password" element={<ChangePassword />} />
    </Route>

    <Route element={<ProtectedRoute allowedRoles={['store_owner']} />}>
      <Route path="/owner/dashboard" element={<OwnerDashboard />} />
      <Route path="/owner/change-password" element={<ChangePassword />} />
    </Route>

    <Route path="/" element={<Navigate to="/login" replace />} />
    <Route path="*" element={<Navigate to="/login" replace />} />
  </Routes>
);

const App: React.FC = () => (
  <AuthProvider>
    <BrowserRouter>
      <AppRoutes />
    </BrowserRouter>
  </AuthProvider>
);

export default App;

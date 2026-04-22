import React from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { isLoggedIn } from './hooks/useAuth';

// Admin pages
import AdminLogin    from './pages/admin/Login';
import AdminDashboard from './pages/admin/Dashboard';
import DishesPage   from './pages/admin/Dishes';
import DishForm     from './pages/admin/DishForm';
import CategoriesPage from './pages/admin/Categories';
import QRPage       from './pages/admin/QRCode';
import SettingsPage from './pages/admin/Settings';

// Customer
import MenuPage from './pages/menu/MenuPage';

// Simple protected route — just checks localStorage
function ProtectedRoute({ children }) {
  if (!isLoggedIn()) return <Navigate to="/admin/login" replace />;
  return children;
}

export default function App() {
  return (
    <HashRouter>
      <Toaster position="top-right" toastOptions={{ duration: 3000 }} />
      <Routes>
        {/* Customer menu */}
        <Route path="/menu" element={<MenuPage />} />

        {/* Admin auth */}
        <Route path="/admin/login" element={<AdminLogin />} />

        {/* Protected admin routes */}
        <Route path="/admin"              element={<ProtectedRoute><AdminDashboard /></ProtectedRoute>} />
        <Route path="/admin/dishes"       element={<ProtectedRoute><DishesPage /></ProtectedRoute>} />
        <Route path="/admin/dishes/new"   element={<ProtectedRoute><DishForm /></ProtectedRoute>} />
        <Route path="/admin/dishes/edit/:id" element={<ProtectedRoute><DishForm /></ProtectedRoute>} />
        <Route path="/admin/categories"   element={<ProtectedRoute><CategoriesPage /></ProtectedRoute>} />
        <Route path="/admin/qr"           element={<ProtectedRoute><QRPage /></ProtectedRoute>} />
        <Route path="/admin/settings"     element={<ProtectedRoute><SettingsPage /></ProtectedRoute>} />

        {/* Root → customer menu */}
        <Route path="/"  element={<Navigate to="/menu" replace />} />
        <Route path="*"  element={<Navigate to="/menu" replace />} />
      </Routes>
    </HashRouter>
  );
}

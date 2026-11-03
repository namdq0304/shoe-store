import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import AuthLogin   from './components/AuthLogin';
import AdminLogin  from './components/AdminLogin';
import OnlineStore from './components/OnlineStore';
import AdminPos    from './components/AdminPos';
import ProtectedRoute from './components/ProtectedRoute';
import OnlineStore2   from './components/customer/index.jsx';
import ProductPage    from './components/customer/ProductPage.jsx';
import CartPage       from './components/customer/CartPage.jsx';

const STAFF_ROLES = ['ADMIN', 'NHAN_VIEN'];

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* ── Khách hàng ───────────────────────────── */}
        <Route path="/"                element={<OnlineStore2 />} />
        <Route path="/login"           element={<AuthLogin />} />
        <Route path="/online"          element={<Navigate to="/" replace />} />
        <Route path="/san-pham/:id"    element={<ProductPage />} />
        <Route path="/gio-hang"        element={<CartPage />} />
        <Route path="/cart"            element={<Navigate to="/gio-hang" replace />} />

        {/* ── Nhân viên / Quản trị ─────────────────── */}
        <Route path="/admin/login"     element={<AdminLogin />} />
        <Route
          path="/admin"
          element={
            <ProtectedRoute allowedRoles={STAFF_ROLES}>
              <AdminPos />
            </ProtectedRoute>
          }
        />

        {/* ── Fallback ──────────────────────────────── */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

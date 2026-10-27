import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import AuthLogin  from './components/AuthLogin';
import AdminLogin from './components/AdminLogin';
import OnlineStore from './components/OnlineStore';
import AdminPos   from './components/AdminPos';
import ProtectedRoute from './components/ProtectedRoute';
import AdminLayout from './components/admin/AdminLayout';
import KhachHangPage from './pages/admin/KhachHangPage';
import NhanVienPage from './pages/admin/NhanVienPage';
import { useAuthStore } from './store';

// maVaiTro từ DB — dùng cho ProtectedRoute
const STAFF_ROLES = ['ADMIN', 'NHAN_VIEN'];
const ADMIN_ONLY  = ['ADMIN'];

// /admin → trang mặc định theo vai trò
function AdminIndex() {
  const role = (useAuthStore((s) => s.session?.role) || '').toUpperCase();
  return <Navigate to={role === 'ADMIN' ? '/admin/dashboard' : '/admin/pos'} replace />;
}

/**
 * Route map (ADR-001, .f5/specs/basic-design/v1.0.0/screens/screen-list.md §1):
 *   FE /admin/<slug>  ↔  API /api/admin/<slug>. Màn chỉ ADMIN bọc thêm ProtectedRoute ADMIN_ONLY (BE cũng hasRole).
 */
export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* ── Khách hàng ───────────────────────────── */}
        <Route path="/"       element={<OnlineStore />} />
        <Route path="/login"  element={<AuthLogin />} />
        <Route path="/online" element={<Navigate to="/" replace />} />

        {/* ── Nhân viên / Quản trị ─────────────────── */}
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route
          path="/admin"
          element={
            <ProtectedRoute allowedRoles={STAFF_ROLES}>
              <AdminLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<AdminIndex />} />
          <Route path="dashboard" element={<ProtectedRoute allowedRoles={ADMIN_ONLY}><AdminPos tab="dashboard" /></ProtectedRoute>} />
          <Route path="pos"      element={<AdminPos tab="pos" />} />
          <Route path="san-pham" element={<AdminPos tab="products" />} />
          <Route path="hoa-don"  element={<AdminPos tab="orders" />} />
          <Route path="giao-ca"  element={<AdminPos tab="shift" />} />
          <Route path="doi-tra"  element={<AdminPos tab="returns" />} />
          <Route path="chat"     element={<AdminPos tab="chat" />} />

          {/* Quản lý */}
          <Route path="khach-hang" element={<KhachHangPage />} />
          <Route path="nhan-vien"  element={<ProtectedRoute allowedRoles={ADMIN_ONLY}><NhanVienPage /></ProtectedRoute>} />

          <Route path="*" element={<AdminIndex />} />
        </Route>

        {/* ── Fallback ──────────────────────────────── */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

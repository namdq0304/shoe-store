import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import AuthLogin from './components/AuthLogin';
import OnlineStore from './components/OnlineStore';
import AdminPos from './components/AdminPos';
import ProtectedRoute from './components/ProtectedRoute';

// maVaiTro trong DB: ADMIN, NHAN_VIEN, KHACH_HANG
const STAFF_ROLES = ['ADMIN', 'NHAN_VIEN'];

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Trang đăng nhập */}
        <Route path="/login" element={<AuthLogin />} />

        {/* Trang khách hàng — online store */}
        <Route path="/" element={<OnlineStore />} />
        <Route path="/online" element={<Navigate to="/" replace />} />

        {/* Trang nhân viên / quản trị — yêu cầu role nhân viên */}
        <Route
          path="/admin"
          element={
            <ProtectedRoute allowedRoles={STAFF_ROLES}>
              <AdminPos />
            </ProtectedRoute>
          }
        />

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

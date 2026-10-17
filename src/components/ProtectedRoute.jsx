import React from 'react';
import { Link } from 'react-router-dom';
import { useAuthStore } from '../store';

/**
 * Bảo vệ các route yêu cầu đăng nhập.
 * - Nếu chưa đăng nhập → hiển thị trang yêu cầu đăng nhập
 * - Nếu không đủ quyền → hiển thị trang 403
 * - allowedRoles: mảng role cho phép, so sánh case-insensitive
 *   Ví dụ: ['ADMIN', 'NHANVIEN'] khớp với bất kỳ maVaiTro nào từ backend
 */
export default function ProtectedRoute({ children, allowedRoles }) {
  const session = useAuthStore((s) => s.session);
  const loading = useAuthStore((s) => s.loading);
  const isAuthenticated = !!session;

  if (loading) {
    return (
      <div className="min-h-screen bg-[#09090b] flex items-center justify-center text-white">
        <div className="flex items-center space-x-3">
          <div className="w-5 h-5 border-2 border-[#c6f500] border-t-transparent rounded-full animate-spin" />
          <span className="text-xs text-zinc-400 font-semibold">Đang kiểm tra quyền truy cập...</span>
        </div>
      </div>
    );
  }

  // Chưa đăng nhập
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-[#09090b] text-white flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-zinc-950 border border-zinc-800/80 rounded-3xl p-8 shadow-2xl text-center space-y-5">
          <div className="w-16 h-16 mx-auto rounded-2xl bg-[#c6f500]/10 border border-[#c6f500]/30 flex items-center justify-center text-3xl">
            🛡️
          </div>
          <div>
            <h2 className="text-xl font-black uppercase tracking-tight text-white">Yêu Cầu Đăng Nhập</h2>
            <p className="text-xs text-zinc-400 mt-2 leading-relaxed">
              Khu vực này dành riêng cho <b>Quản lý cửa hàng</b> và <b>Nhân viên</b>.
              Vui lòng đăng nhập bằng tài khoản nhân viên được cấp.
            </p>
          </div>
          <Link
            to="/login"
            className="w-full py-3 bg-[#c6f500] hover:bg-[#b0dc00] text-black font-black uppercase text-xs rounded-xl transition shadow flex items-center justify-center space-x-2"
          >
            <span>🔑 Đến Trang Đăng Nhập ➔</span>
          </Link>
        </div>
      </div>
    );
  }

  // Kiểm tra quyền — so sánh case-insensitive
  const userRole = (session?.role || '').toUpperCase();
  const hasPermission = !allowedRoles
    || allowedRoles.length === 0
    || allowedRoles.some((r) => r.toUpperCase() === userRole);

  if (!hasPermission) {
    return (
      <div className="min-h-screen bg-[#09090b] text-white flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-zinc-950 border border-zinc-800 rounded-3xl p-8 shadow-2xl text-center space-y-4">
          <div className="text-4xl">🚫</div>
          <h2 className="text-lg font-black uppercase text-red-400">Không Đủ Quyền Truy Cập</h2>
          <p className="text-xs text-zinc-400">
            Tài khoản <b>{session?.name}</b> có role <b>{session?.role}</b>,
            không có quyền truy cập vào khu vực này.
          </p>
          <div className="pt-3 flex gap-3">
            <Link to="/" className="flex-1 py-2.5 bg-zinc-900 border border-zinc-800 hover:bg-zinc-800 text-xs font-bold rounded-xl">
              Về Trang Mua Sắm
            </Link>
            <Link to="/login" className="flex-1 py-2.5 bg-[#c6f500] text-black text-xs font-bold rounded-xl">
              Đổi Tài Khoản
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return children;
}

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authApi } from '../api';
import { useAuthStore } from '../store';

// maVaiTro trong DB: ADMIN, NHAN_VIEN, KHACH_HANG
const STAFF_ROLES = ['ADMIN', 'NHAN_VIEN'];

function isStaffRole(role) {
  if (!role) return false;
  return STAFF_ROLES.includes(role.toUpperCase());
}

export default function AuthLogin({ onLoginSuccess }) {
  const navigate = useNavigate();
  const login = useAuthStore((s) => s.login);

  // Tab chính: 'customer' | 'admin'
  const [roleTab, setRoleTab] = useState('customer');

  // Customer sub-tab: 'login' | 'register'
  const [customerMode, setCustomerMode] = useState('login');

  // Form khách hàng - đăng nhập
  const [custEmail, setCustEmail] = useState('');
  const [custPassword, setCustPassword] = useState('');
  const [showCustPassword, setShowCustPassword] = useState(false);

  // Form khách hàng - đăng ký
  const [regHoTen, setRegHoTen] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPhone, setRegPhone] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regConfirmPassword, setRegConfirmPassword] = useState('');
  const [showRegPassword, setShowRegPassword] = useState(false);

  // Form nhân viên / quản trị
  const [adminUsername, setAdminUsername] = useState('');
  const [adminPassword, setAdminPassword] = useState('');
  const [showAdminPassword, setShowAdminPassword] = useState(false);

  // Trạng thái
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const clearMessages = () => {
    setErrorMessage('');
    setSuccessMessage('');
  };

  /**
   * Sau khi login thành công: lưu session vào Zustand + điều hướng theo role
   * - STAFF (ADMIN, NHANVIEN, ...) → /admin
   * - KHACH_HANG / CUSTOMER → /
   */
  const dispatchLoginSuccess = (sessionData) => {
    login(sessionData);
    if (typeof onLoginSuccess === 'function') {
      onLoginSuccess(sessionData);
    }
    if (isStaffRole(sessionData.role)) {
      navigate('/admin');
    } else {
      navigate('/');
    }
  };

  // =========================================================================
  // KHÁCH HÀNG: ĐĂNG NHẬP
  // =========================================================================
  const handleCustomerLogin = async (e) => {
    e.preventDefault();
    clearMessages();
    if (!custEmail.trim() || !custPassword) {
      setErrorMessage('Vui lòng nhập đầy đủ email và mật khẩu!');
      return;
    }
    setLoading(true);
    try {
      const res = await authApi.loginCustomer({
        username: custEmail.trim(),
        password: custPassword,
      });
      // Backend trả role = "KHACH_HANG"
      const session = {
        role: res.role || 'KHACH_HANG',
        name: res.hoTen || res.email || 'Khách Hàng',
        phone: res.sdt || '',
        email: res.email || custEmail.trim(),
        accessToken: res.accessToken,
        refreshToken: res.refreshToken,
        id: res.id,
        maKhachHang: res.maKhachHang,
      };
      setSuccessMessage('Đăng nhập thành công! Đang chuyển hướng...');
      setTimeout(() => dispatchLoginSuccess(session), 400);
    } catch (err) {
      setErrorMessage(err.message || 'Sai thông tin đăng nhập hoặc tài khoản đã bị khóa!');
    } finally {
      setLoading(false);
    }
  };

  // =========================================================================
  // KHÁCH HÀNG: ĐĂNG KÝ
  // =========================================================================
  const handleCustomerRegister = async (e) => {
    e.preventDefault();
    clearMessages();
    if (!regHoTen.trim() || !regEmail.trim() || !regPassword) {
      setErrorMessage('Vui lòng điền đầy đủ họ tên, email và mật khẩu!');
      return;
    }
    if (regPassword.length < 6) {
      setErrorMessage('Mật khẩu phải có ít nhất 6 ký tự!');
      return;
    }
    if (regPassword !== regConfirmPassword) {
      setErrorMessage('Mật khẩu xác nhận không khớp!');
      return;
    }
    setLoading(true);
    try {
      const res = await authApi.registerCustomer({
        hoTen: regHoTen.trim(),
        email: regEmail.trim(),
        sdt: regPhone.trim(),
        password: regPassword,
      });
      setSuccessMessage(res.message || 'Đăng ký thành công! Hãy đăng nhập ngay.');
      setCustEmail(regEmail.trim());
      setCustPassword(regPassword);
      setCustomerMode('login');
      setRegHoTen(''); setRegEmail(''); setRegPhone('');
      setRegPassword(''); setRegConfirmPassword('');
    } catch (err) {
      setErrorMessage(err.message || 'Đăng ký thất bại. Email có thể đã được sử dụng!');
    } finally {
      setLoading(false);
    }
  };

  // =========================================================================
  // NHÂN VIÊN / QUẢN TRỊ: ĐĂNG NHẬP
  // Backend: POST /api/auth/admin/login?username=...&password=...
  // Trả về: { role: "ADMIN" | "NHANVIEN" | maVaiTro, hoTen, email, accessToken, ... }
  // =========================================================================
  const handleAdminLogin = async (e) => {
    e.preventDefault();
    clearMessages();
    if (!adminUsername.trim() || !adminPassword) {
      setErrorMessage('Vui lòng nhập email và mật khẩu!');
      return;
    }
    setLoading(true);
    try {
      const res = await authApi.loginAdmin({
        username: adminUsername.trim(),
        password: adminPassword,
      });

      // role từ backend = maVaiTro.toUpperCase() (ADMIN, NHANVIEN, ...)
      const roleCode = (res.role || 'NHANVIEN').toUpperCase();

      if (!isStaffRole(roleCode)) {
        // Tài khoản tồn tại nhưng không có quyền nhân viên
        setErrorMessage(`Tài khoản này (role: ${roleCode}) không có quyền truy cập hệ thống quản trị!`);
        setLoading(false);
        return;
      }

      const session = {
        role: roleCode,
        name: res.hoTen || res.email || 'Nhân viên',
        email: res.email,
        maNhanVien: res.maNhanVien,
        accessToken: res.accessToken,
        refreshToken: res.refreshToken,
        id: res.id,
        idVaiTro: res.idVaiTro,
        tenVaiTro: res.tenVaiTro,
      };

      setSuccessMessage(`Chào ${session.name}! Đang vào hệ thống (${res.tenVaiTro || roleCode})...`);
      setTimeout(() => dispatchLoginSuccess(session), 400);
    } catch (err) {
      setErrorMessage(err.message || 'Đăng nhập thất bại! Kiểm tra email/mật khẩu hoặc quyền truy cập.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#09090b] text-slate-100 flex flex-col justify-between selection:bg-[#c6f500] selection:text-black relative overflow-hidden font-sans">
      {/* Background glow */}
      <div className="absolute -top-32 -left-32 w-96 h-96 bg-[#c6f500]/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute -bottom-32 -right-32 w-96 h-96 bg-[#c6f500]/10 rounded-full blur-[120px] pointer-events-none" />

      {/* Header */}
      <header className="border-b border-zinc-800/80 bg-zinc-950/70 backdrop-blur-xl px-6 py-4 flex items-center justify-between z-10 sticky top-0">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-zinc-800 to-black border border-zinc-700/80 flex items-center justify-center shadow-lg">
            <svg className="w-6 h-6" viewBox="0 0 40 40" fill="none">
              <path d="M8 12L15 28L22 12" stroke="#FFFFFF" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M14 26C18 31 24 32 30 14" stroke="#c6f500" strokeWidth="4" strokeLinecap="round" />
            </svg>
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-xl font-black italic tracking-tight">
                <span className="text-white">Vibe</span>
                <span className="text-[#c6f500]">Flow</span>
              </span>
              <span className="text-[10px] font-extrabold uppercase tracking-widest px-2 py-0.5 rounded-full bg-[#c6f500]/15 text-[#c6f500] border border-[#c6f500]/30">
                Sneakers OS
              </span>
            </div>
            <p className="text-[11px] text-zinc-400">Hệ Thống Bán Giày & POS Đa Kênh</p>
          </div>
        </div>
        <div className="hidden sm:flex items-center space-x-2 text-xs font-semibold px-3 py-1.5 rounded-full bg-zinc-900/90 border border-zinc-800 text-zinc-300">
          <span className="w-2 h-2 rounded-full bg-[#c6f500] animate-ping absolute" />
          <span className="w-2 h-2 rounded-full bg-[#c6f500] relative" />
          <span className="text-zinc-400 ml-1">Spring Boot API:</span>
          <code className="text-[#c6f500] font-mono text-[11px]">/api/auth/*</code>
        </div>
      </header>

      {/* Main Card */}
      <main className="flex-1 flex items-center justify-center p-4 sm:p-6 z-10 my-4">
        <div className="w-full max-w-lg bg-zinc-950/90 border border-zinc-800/90 rounded-3xl p-6 sm:p-8 shadow-2xl backdrop-blur-2xl">

          {/* Title */}
          <div className="text-center space-y-1.5 mb-6">
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-zinc-900 border border-zinc-800 text-[#c6f500] text-xs font-bold uppercase tracking-wider mb-2">
              <span>⚡ Xác Thực & Phân Quyền</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black uppercase tracking-tight text-white">
              Đăng Nhập <span className="text-[#c6f500]">Hệ Thống</span>
            </h1>
            <p className="text-xs text-zinc-400">
              {roleTab === 'customer'
                ? 'Mua sắm trực tuyến, tích điểm đổi quà và theo dõi đơn hàng'
                : 'Cổng xác thực dành cho nhân viên và quản trị viên'}
            </p>
          </div>

          {/* Role Switcher */}
          <div className="grid grid-cols-2 p-1 bg-black rounded-2xl border border-zinc-800/80 mb-6 text-xs font-bold">
            <button
              type="button"
              onClick={() => { setRoleTab('customer'); clearMessages(); }}
              className={`py-3 rounded-xl transition-all flex items-center justify-center space-x-2 ${
                roleTab === 'customer'
                  ? 'bg-[#c6f500] text-black shadow-lg font-black'
                  : 'text-zinc-400 hover:text-white hover:bg-zinc-900/50'
              }`}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
              </svg>
              <span>Khách Hàng</span>
            </button>
            <button
              type="button"
              onClick={() => { setRoleTab('admin'); clearMessages(); }}
              className={`py-3 rounded-xl transition-all flex items-center justify-center space-x-2 ${
                roleTab === 'admin'
                  ? 'bg-white text-black shadow-lg font-black'
                  : 'text-zinc-400 hover:text-white hover:bg-zinc-900/50'
              }`}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
              <span>Nhân Viên / Quản Trị</span>
            </button>
          </div>

          {/* Alert Messages */}
          {errorMessage && (
            <div className="mb-5 p-3.5 rounded-2xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs flex items-start space-x-2.5">
              <svg className="w-4 h-4 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <span className="flex-1 font-medium leading-relaxed">{errorMessage}</span>
              <button type="button" onClick={() => setErrorMessage('')} className="text-red-400 hover:text-white font-bold text-sm">✕</button>
            </div>
          )}
          {successMessage && (
            <div className="mb-5 p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs flex items-center space-x-2.5">
              <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
              </svg>
              <span className="flex-1 font-medium">{successMessage}</span>
            </div>
          )}

          {/* ================================================================= */}
          {/* TAB: KHÁCH HÀNG                                                   */}
          {/* ================================================================= */}
          {roleTab === 'customer' && (
            <div>
              {/* Sub-tabs đăng nhập / đăng ký */}
              <div className="flex items-center justify-center space-x-6 border-b border-zinc-800/80 mb-5 pb-2 text-xs font-bold">
                {['login', 'register'].map((mode) => (
                  <button
                    key={mode}
                    type="button"
                    onClick={() => { setCustomerMode(mode); clearMessages(); }}
                    className={`relative pb-2 transition ${customerMode === mode ? 'text-[#c6f500]' : 'text-zinc-400 hover:text-white'}`}
                  >
                    {mode === 'login' ? 'Đăng Nhập Tài Khoản' : 'Đăng Ký Thành Viên Mới'}
                    {customerMode === mode && (
                      <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#c6f500] rounded-full" />
                    )}
                  </button>
                ))}
              </div>

              {/* Form Đăng Nhập Khách Hàng */}
              {customerMode === 'login' ? (
                <form onSubmit={handleCustomerLogin} className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-zinc-300 uppercase mb-1.5">Email hoặc Số Điện Thoại</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-zinc-500">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
                        </svg>
                      </div>
                      <input
                        type="text"
                        value={custEmail}
                        onChange={(e) => setCustEmail(e.target.value)}
                        placeholder="email@example.com"
                        required
                        className="w-full bg-black/80 border border-zinc-800 rounded-xl pl-10 pr-4 py-3 text-xs text-white placeholder-zinc-600 focus:outline-none focus:border-[#c6f500] focus:ring-1 focus:ring-[#c6f500] transition"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-zinc-300 uppercase mb-1.5">Mật Khẩu</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-zinc-500">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                        </svg>
                      </div>
                      <input
                        type={showCustPassword ? 'text' : 'password'}
                        value={custPassword}
                        onChange={(e) => setCustPassword(e.target.value)}
                        placeholder="••••••"
                        required
                        className="w-full bg-black/80 border border-zinc-800 rounded-xl pl-10 pr-10 py-3 text-xs text-white placeholder-zinc-600 focus:outline-none focus:border-[#c6f500] focus:ring-1 focus:ring-[#c6f500] transition"
                      />
                      <button type="button" onClick={() => setShowCustPassword(!showCustPassword)} className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-zinc-500 hover:text-zinc-300">
                        {showCustPassword
                          ? <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l18 18" /></svg>
                          : <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                        }
                      </button>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-3.5 bg-[#c6f500] hover:bg-[#b0dc00] text-black font-black uppercase text-xs tracking-wider rounded-xl transition shadow-lg flex items-center justify-center space-x-2 disabled:opacity-50"
                  >
                    {loading ? (
                      <><svg className="animate-spin w-4 h-4 text-black" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" /></svg><span>Đang xác thực...</span></>
                    ) : (
                      <span>Đăng Nhập ➔</span>
                    )}
                  </button>
                </form>
              ) : (
                /* Form Đăng Ký */
                <form onSubmit={handleCustomerRegister} className="space-y-3.5">
                  <div>
                    <label className="block text-xs font-bold text-zinc-300 uppercase mb-1">Họ Và Tên</label>
                    <input type="text" value={regHoTen} onChange={(e) => setRegHoTen(e.target.value)} placeholder="Nguyễn Văn An" required className="w-full bg-black/80 border border-zinc-800 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-zinc-600 focus:outline-none focus:border-[#c6f500] transition" />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-zinc-300 uppercase mb-1">Email</label>
                      <input type="email" value={regEmail} onChange={(e) => setRegEmail(e.target.value)} placeholder="email@example.com" required className="w-full bg-black/80 border border-zinc-800 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-zinc-600 focus:outline-none focus:border-[#c6f500] transition" />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-zinc-300 uppercase mb-1">Số Điện Thoại</label>
                      <input type="tel" value={regPhone} onChange={(e) => setRegPhone(e.target.value)} placeholder="0987654321" className="w-full bg-black/80 border border-zinc-800 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-zinc-600 focus:outline-none focus:border-[#c6f500] transition" />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-zinc-300 uppercase mb-1">Mật Khẩu</label>
                      <input type={showRegPassword ? 'text' : 'password'} value={regPassword} onChange={(e) => setRegPassword(e.target.value)} placeholder="••••••" required className="w-full bg-black/80 border border-zinc-800 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-zinc-600 focus:outline-none focus:border-[#c6f500] transition" />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-zinc-300 uppercase mb-1">Xác Nhận Mật Khẩu</label>
                      <input type={showRegPassword ? 'text' : 'password'} value={regConfirmPassword} onChange={(e) => setRegConfirmPassword(e.target.value)} placeholder="••••••" required className="w-full bg-black/80 border border-zinc-800 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-zinc-600 focus:outline-none focus:border-[#c6f500] transition" />
                    </div>
                  </div>
                  <label className="flex items-center cursor-pointer text-xs text-zinc-400">
                    <input type="checkbox" checked={showRegPassword} onChange={(e) => setShowRegPassword(e.target.checked)} className="w-3.5 h-3.5 rounded bg-black border-zinc-700 text-[#c6f500] mr-2" />
                    Hiện mật khẩu
                  </label>
                  <button type="submit" disabled={loading} className="w-full py-3.5 bg-[#c6f500] hover:bg-[#b0dc00] text-black font-black uppercase text-xs tracking-wider rounded-xl transition shadow-lg flex items-center justify-center disabled:opacity-50 mt-2">
                    {loading ? 'Đang tạo tài khoản...' : 'Đăng Ký Tài Khoản ➔'}
                  </button>
                </form>
              )}
            </div>
          )}

          {/* ================================================================= */}
          {/* TAB: NHÂN VIÊN / QUẢN TRỊ                                         */}
          {/* ================================================================= */}
          {roleTab === 'admin' && (
            <form onSubmit={handleAdminLogin} className="space-y-4">
              <div className="p-3 bg-zinc-900/60 border border-zinc-800 rounded-xl text-[11px] text-zinc-400 flex items-start space-x-2">
                <span className="text-amber-400 mt-0.5">ℹ️</span>
                <span>Đăng nhập bằng tài khoản nhân viên được cấp bởi quản trị hệ thống. Quyền truy cập được phân theo vai trò trong DB.</span>
              </div>

              <div>
                <label className="block text-xs font-bold text-zinc-300 uppercase mb-1.5">Email Nhân Viên</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-zinc-500">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5.121 17.804A13.937 13.937 0 0112 16c2.5 0 4.847.655 6.879 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0zm6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <input
                    type="text"
                    value={adminUsername}
                    onChange={(e) => setAdminUsername(e.target.value)}
                    placeholder="nhanvien@vibeflow.vn"
                    required
                    autoComplete="username"
                    className="w-full bg-black/80 border border-zinc-800 rounded-xl pl-10 pr-4 py-3 text-xs text-white placeholder-zinc-600 focus:outline-none focus:border-white focus:ring-1 focus:ring-white transition"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-zinc-300 uppercase mb-1.5">Mật Khẩu</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-zinc-500">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                  </div>
                  <input
                    type={showAdminPassword ? 'text' : 'password'}
                    value={adminPassword}
                    onChange={(e) => setAdminPassword(e.target.value)}
                    placeholder="••••••"
                    required
                    autoComplete="current-password"
                    className="w-full bg-black/80 border border-zinc-800 rounded-xl pl-10 pr-10 py-3 text-xs text-white placeholder-zinc-600 focus:outline-none focus:border-white focus:ring-1 focus:ring-white transition"
                  />
                  <button type="button" onClick={() => setShowAdminPassword(!showAdminPassword)} className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-zinc-500 hover:text-zinc-300">
                    {showAdminPassword
                      ? <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l18 18" /></svg>
                      : <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                    }
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 bg-white hover:bg-zinc-100 text-black font-black uppercase text-xs tracking-wider rounded-xl transition shadow-lg flex items-center justify-center space-x-2 disabled:opacity-50"
              >
                {loading ? (
                  <><svg className="animate-spin w-4 h-4 text-black" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" /></svg><span>Đang xác thực Backend...</span></>
                ) : (
                  <><span>🔐</span><span>Đăng Nhập Hệ Thống ➔</span></>
                )}
              </button>
            </form>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-zinc-800/50 py-4 px-6 z-10 flex justify-center">
        <p className="text-[11px] text-zinc-600">© 2026 VibeFlow Sneakers. Powered by Spring Boot + React + Zustand.</p>
      </footer>
    </div>
  );
}

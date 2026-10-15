import React, { useState } from 'react';

export default function AuthLogin({ onLoginSuccess }) {
  const [roleTab, setRoleTab] = useState('customer');
  const [custEmail, setCustEmail] = useState('an.nguyen@vibeflow.vn');
  const [branch, setBranch] = useState('Hà Nội - 160 Phố Huế, Hoàn Kiếm');

  const handleCustomerLogin = () => {
    const session = {
      role: 'CUSTOMER',
      name: 'Nguyễn Văn An',
      phone: '0987.654.321',
      email: custEmail,
      tier: 'Vàng (Gold)',
      points: 850
    };
    localStorage.setItem('vibeflow_session', JSON.stringify(session));
    onLoginSuccess(session);
  };

  const handleAdminLogin = (roleType) => {
    const session = {
      role: roleType,
      name: roleType === 'ADMIN' ? 'Vũ Minh Đức (Quản Lý)' : 'Lê Thị Thanh (Thu Ngân)',
      branch: branch,
      shift: 'Ca Sáng #04'
    };
    localStorage.setItem('vibeflow_session', JSON.stringify(session));
    onLoginSuccess(session);
  };

  return (
    <div className="min-h-screen bg-black text-slate-100 flex flex-col justify-between selection:bg-[#c6f500] selection:text-black">
      {/* Header */}
      <header className="border-b border-zinc-800 bg-zinc-950/80 backdrop-blur px-6 py-4 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <svg className="w-8 h-8" viewBox="0 0 40 40" fill="none">
            <path d="M8 12L15 28L22 12" stroke="#FFFFFF" strokeWidth="4.5" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M14 26C18 31 24 32 30 14" stroke="#c6f500" strokeWidth="4.5" strokeLinecap="round"/>
          </svg>
          <span className="text-2xl font-black italic tracking-tight">
            <span className="text-white">Vibe</span><span className="text-[#c6f500]">Flow</span>
          </span>
          <span className="text-[11px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-zinc-800 text-[#c6f500] border border-zinc-700 ml-2">
            React Auth
          </span>
        </div>
      </header>

      {/* Login Card */}
      <main className="flex-1 flex items-center justify-center p-4">
        <div className="w-full max-w-lg bg-zinc-900 border border-zinc-800 rounded-3xl p-6 sm:p-10 shadow-2xl relative overflow-hidden">
          <div className="absolute -top-24 -right-24 w-64 h-64 bg-[#c6f500]/15 rounded-full blur-3xl pointer-events-none"></div>

          <div className="text-center space-y-2 mb-8">
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-[#c6f500]/10 border border-[#c6f500]/30 text-[#c6f500] text-xs font-bold uppercase tracking-wider">
              <span className="w-2 h-2 rounded-full bg-[#c6f500] animate-pulse"></span>
              <span>Hệ Thống Bán Giày React v18</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black uppercase tracking-tight text-white">
              Đăng Nhập <span className="text-[#c6f500]">VibeFlow</span>
            </h1>
            <p className="text-xs text-zinc-400">
              Chọn vai trò để React tự động điều hướng sang <b>Kênh Mua Sắm Online</b> hoặc <b>Kênh Quản Trị POS</b>.
            </p>
          </div>

          {/* Role Tabs */}
          <div className="grid grid-cols-2 p-1.5 bg-black rounded-2xl border border-zinc-800 mb-6 text-xs font-bold">
            <button
              onClick={() => setRoleTab('customer')}
              className={`py-3 rounded-xl transition flex items-center justify-center space-x-2 ${
                roleTab === 'customer' ? 'bg-[#c6f500] text-black shadow' : 'text-zinc-400 hover:text-white'
              }`}
            >
              <span>Khách Hàng Mua Sắm</span>
            </button>
            <button
              onClick={() => setRoleTab('admin')}
              className={`py-3 rounded-xl transition flex items-center justify-center space-x-2 ${
                roleTab === 'admin' ? 'bg-white text-black shadow' : 'text-zinc-400 hover:text-white'
              }`}
            >
              <span>Quản Trị & POS</span>
            </button>
          </div>

          {/* Form Customer */}
          {roleTab === 'customer' ? (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-zinc-300 uppercase mb-1.5">Email / SĐT Khách Hàng</label>
                <input
                  type="text"
                  value={custEmail}
                  onChange={(e) => setCustEmail(e.target.value)}
                  className="w-full bg-black border border-zinc-700 rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:border-[#c6f500]"
                />
              </div>
              <button
                onClick={handleCustomerLogin}
                className="w-full py-3.5 bg-[#c6f500] hover:bg-[#b0dc00] text-black font-black uppercase text-xs tracking-wider rounded-xl transition shadow-lg"
              >
                Vào Mua Sắm Ngay (Trang Online) ➔
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-zinc-300 uppercase mb-1.5">Chi Nhánh Bán Hàng</label>
                <select
                  value={branch}
                  onChange={(e) => setBranch(e.target.value)}
                  className="w-full bg-black border border-zinc-700 rounded-xl px-3 py-3 text-xs text-white focus:outline-none focus:border-[#c6f500]"
                >
                  <option>Hà Nội - 160 Phố Huế, Hoàn Kiếm</option>
                  <option>Hà Nội - 298 Cầu Giấy</option>
                  <option>TP.HCM - 391 Quang Trung, Gò Vấp</option>
                </select>
              </div>
              <div className="grid grid-cols-2 gap-3 pt-2">
                <button
                  onClick={() => handleAdminLogin('ADMIN')}
                  className="py-3 bg-white hover:bg-zinc-200 text-black font-black uppercase text-xs rounded-xl transition"
                >
                  🛡️ Admin Toàn Quyền
                </button>
                <button
                  onClick={() => handleAdminLogin('CASHIER')}
                  className="py-3 bg-[#c6f500] hover:bg-[#b0dc00] text-black font-black uppercase text-xs rounded-xl transition"
                >
                  💵 Mở Thu Ngân POS
                </button>
              </div>
            </div>
          )}
        </div>
      </main>

      <footer className="border-t border-zinc-900 py-4 text-center text-xs text-zinc-500">
        © 2026 VibeFlow Sneakers Vietnam • React Component System
      </footer>
    </div>
  );
}

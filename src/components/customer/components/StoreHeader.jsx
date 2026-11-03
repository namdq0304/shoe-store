import { useState } from 'react';
import { Link } from 'react-router-dom';
import CategoryNav from './CategoryNav';
import MobileMenu from './MobileMenu';

export default function StoreHeader({
                                      activeTab, onChangeTab, menu, onNavigate,
                                      searchQuery, onSearch,
                                      session, isStaff, onLogout,
                                      cartCount, onOpenCart,
                                    }) {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur border-b border-slate-200 shadow-sm">
        <div className="px-4 sm:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <button
                onClick={() => setMobileOpen((v) => !v)}
                className="md:hidden w-9 h-9 rounded-xl bg-slate-100 text-slate-700 font-bold"
                aria-label="Mở menu"
                aria-expanded={mobileOpen}
            >
              {mobileOpen ? '✕' : '☰'}
            </button>

            <div onClick={() => onChangeTab('home')} className="flex items-center space-x-2.5 cursor-pointer">
              <div className="w-8 h-8 rounded-xl bg-indigo-600 flex items-center justify-center">
                <svg className="w-5 h-5" viewBox="0 0 40 40" fill="none">
                  <path d="M8 12L15 28L22 12" stroke="#FFFFFF" strokeWidth="4.5" strokeLinecap="round" strokeLinejoin="round" />
                  <path d="M14 26C18 31 24 32 30 14" stroke="#c7d2fe" strokeWidth="4.5" strokeLinecap="round" />
                </svg>
              </div>
              <span className="text-2xl font-black italic tracking-tight">
              <span className="text-slate-800">Vibe</span><span className="text-indigo-600">Flow</span>
            </span>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <input
                type="text"
                placeholder="Tìm Jordan, Nike, size..."
                value={searchQuery}
                onChange={(e) => onSearch(e.target.value)}
                className="hidden sm:block w-48 lg:w-64 bg-slate-100 border border-slate-300 text-xs px-3.5 py-1.5 rounded-full text-slate-800 placeholder-slate-400 focus:outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 transition"
            />

            {isStaff && (
                <Link
                    to="/admin"
                    className="flex items-center space-x-1 px-3 py-1.5 rounded-xl bg-violet-50 border border-violet-200 hover:border-violet-400 text-xs font-bold text-violet-600 transition"
                    title="Mở Bàn Làm Việc Quản Trị & Thu Ngân POS"
                >
                  <span>🛡️</span>
                  <span className="hidden md:inline">Quản Trị POS</span>
                </Link>
            )}

            {session ? (
                <div className="flex items-center space-x-2">
                  <button onClick={() => onChangeTab('customer')} className="flex items-center space-x-1.5 p-1.5 rounded-xl hover:bg-slate-100 text-xs font-bold text-slate-700 transition">
                    <div className="w-7 h-7 rounded-full bg-indigo-600 text-white font-black text-xs flex items-center justify-center">
                      {session?.name ? session.name.charAt(0) : 'U'}
                    </div>
                    <span className="hidden lg:inline">{session?.name || 'Tài Khoản'}</span>
                  </button>
                  <button onClick={onLogout} className="hidden sm:block text-slate-400 hover:text-red-500 text-xs font-bold px-2 py-1 transition" title="Đăng xuất khỏi tài khoản">
                    Đăng Xuất
                  </button>
                </div>
            ) : (
                <Link to="/login" className="px-3.5 py-1.5 rounded-xl bg-indigo-600 text-white text-xs font-extrabold uppercase tracking-wide hover:bg-indigo-700 transition shadow-indigo">
                  Đăng Nhập
                </Link>
            )}

            <button onClick={onOpenCart} aria-label="Mở giỏ hàng" className="relative p-2.5 rounded-full bg-slate-100 border border-slate-300 hover:border-indigo-400 text-slate-600 hover:text-indigo-600 transition">
              🛒
              {cartCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-indigo-600 text-white font-black text-[10px] w-5 h-5 rounded-full flex items-center justify-center">
                {cartCount}
              </span>
              )}
            </button>
          </div>
        </div>

        <CategoryNav menu={menu} activeTab={activeTab} onNavigate={onNavigate} />

        {mobileOpen && (
            <MobileMenu
                menu={menu}
                searchQuery={searchQuery}
                onSearch={(v) => { onSearch(v); }}
                onNavigate={onNavigate}
                onClose={() => setMobileOpen(false)}
            />
        )}
      </header>
  );
}
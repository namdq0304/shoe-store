import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuthStore } from '../store';
import axiosClient from '../api/axiosClient';
import AdminProduct from "./AdminProduct.jsx";
import AdminAttribute from "./AdminAttribute.jsx";
import KhachHangPage from "./KhachHangPage.jsx";
import NhanVienPage from "./NhanVienPage.jsx";
import BanHangTaiKho from "./BanHangTaiKho.jsx";
import BillK80Modal from "./BillK80Modal.jsx";

const fmtMoney = (v) => Number(v ?? 0).toLocaleString('vi-VN') + '₫';

export default function AdminPos({ session: propSession, onLogout: propLogout }) {
  const navigate = useNavigate();
  const storeSession = useAuthStore((s) => s.session);
  const storeLogout = useAuthStore((s) => s.logout);
  const session = propSession || storeSession;

  // Phân quyền hiển thị theo role
const role = String(session?.role || '').trim().toUpperCase();

const STAFF_ROLES = ['ADMIN', 'NHAN_VIEN'];
const isStaff = STAFF_ROLES.includes(role);

const handleLogout = () => {
  const loginPath = isStaff ? '/admin/login' : '/login';

  if (typeof propLogout === 'function') {
    propLogout();
  } else {
    storeLogout();
  }

  navigate(loginPath, { replace: true });
};
const [activeTab, setActiveTab] = useState(isStaff ? 'dashboard' : 'pos');

  // Dashboard Metrics & Filter State
  const [statsPeriod, setStatsPeriod] = useState('7days'); // 'today' | '7days' | 'month' | 'year'

  // ── Dashboard: thống kê thật từ /ban-hang/thong-ke ──────────────────────
  const [stats, setStats] = useState(null);
  const [statsLoading, setStatsLoading] = useState(false);
  useEffect(() => {
    if (!isStaff || activeTab !== 'dashboard') return;
    let alive = true;
    setStatsLoading(true);
    axiosClient.get('/ban-hang/thong-ke', { params: { period: statsPeriod } })
      .then((res) => { if (alive) setStats(res); })
      .catch(() => {})
      .finally(() => { if (alive) setStatsLoading(false); });
    return () => { alive = false; };
  }, [isStaff, activeTab, statsPeriod]);

  // Chiều cao cột biểu đồ theo doanh thu (peak = 100%)
  const weeklyRevenue = (stats?.bieuDo7Ngay || []).map((d) => {
    const peak = Number(stats?.bieuDo7NgayPeak || 0);
    const v = Number(d.doanhThu || 0);
    return {
      day: d.thu,
      value: v,
      height: peak > 0 ? `${Math.max(4, Math.round((v / peak) * 100))}%` : '4%',
      isPeak: peak > 0 && v === peak,
    };
  });

  // ── Orders: hóa đơn thật từ /ban-hang/hoa-don (tab Quản Lý Hóa Đơn) ──────
  const [orders, setOrders] = useState([]);
  useEffect(() => {
    if (activeTab !== 'orders') return;
    axiosClient.get('/ban-hang/hoa-don')
      .then((res) => setOrders(Array.isArray(res) ? res : res.content || []))
      .catch(() => setOrders([]));
  }, [activeTab]);
  const [orderFilter, setOrderFilter] = useState('all');
  const [bill, setBill] = useState(null); // bill đang in lại (modal K80)
  const filteredOrders = orders.filter((o) => {
    if (orderFilter === 'all') return true;
    if (orderFilter === 'pos') return o.trangThai === 3;
    if (orderFilter === 'completed') return o.trangThai === 3 || o.trangThai === 2;
    return o.trangThai !== 3; // đơn online
  });

  // ── Shift state (chốt két — dữ liệu local, chưa có bảng ca làm việc) ────
  const [openingCash, setOpeningCash] = useState(0);
  const [actualCash, setActualCash] = useState(0);
  const [shiftNote, setShiftNote] = useState('');

  return (
    <div className="bg-slate-50 text-slate-900 min-h-screen flex flex-col selection:bg-[#c6f500] selection:text-black">
      {/* Top Header */}
      <header className="bg-white border-b border-slate-200 h-14 flex items-center justify-between px-4 sm:px-6 z-30">
        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-2">
            <svg className="w-7 h-7" viewBox="0 0 40 40" fill="none">
              <path d="M8 12L15 28L22 12" stroke="#FFFFFF" strokeWidth="4.5" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M14 26C18 31 24 32 30 14" stroke="#c6f500" strokeWidth="4.5" strokeLinecap="round"/>
            </svg>
            <span className="text-xl font-black italic tracking-tight">
              <span className="text-slate-900">Vibe</span><span className="text-lime-700">Flow</span>
            </span>
          </div>
          <span className="px-2 py-0.5 rounded bg-slate-50 border border-slate-300 text-lime-700 text-[10px] font-black uppercase">
            {isStaff ? 'Quản Trị & POS' : 'Nhân Viên POS'}
          </span>
        </div>

        <div className="flex items-center space-x-3 text-xs">
          <Link
            to="/"
            className="hidden sm:flex items-center space-x-1 px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200 hover:border-[#c6f500] text-slate-700 hover:text-slate-900 font-bold transition"
            title="Xem giao diện Cửa Hàng Online của Khách Hàng"
          >
            <span>🛍️</span>
            <span>Cửa Hàng Online</span>
          </Link>

          <div className="hidden sm:flex items-center space-x-2 text-slate-700">
            <span className="w-2 h-2 rounded-full bg-[#c6f500] animate-pulse"></span>
            <span>{session?.branch || 'Chi nhánh: 298 Cầu Giấy'}</span>
          </div>

          <div className="flex items-center space-x-1.5 bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 font-bold">
            <span className="text-lime-700">●</span>
            <span className="text-slate-900">{session?.hoTen || session?.name || 'Thu ngân'}</span>
          </div>

          <button onClick={handleLogout} className="text-slate-500 hover:text-red-600 font-bold px-2 py-1 transition">
            Đăng Xuất
          </button>
        </div>
      </header>

      {/* Main Body */}
      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar Nav */}
        <aside className="w-56 bg-white border-r border-slate-200 p-3 space-y-1.5 shrink-0 hidden md:flex flex-col justify-between">
          <div className="space-y-1">
            {/* Dashboard / Thống kê — chỉ ADMIN */}
            {isStaff && (
            <button
              onClick={() => setActiveTab('dashboard')}
              className={`w-full flex items-center space-x-2.5 px-3 py-2.5 rounded-xl text-xs font-bold transition ${
                activeTab === 'dashboard' ? 'bg-[#c6f500] text-black shadow' : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <span>📊</span>
              <span>Dashboard / Thống Kê</span>
            </button>
            )}
            <button
              onClick={() => setActiveTab('pos')}
              className={`w-full flex items-center space-x-2.5 px-3 py-2.5 rounded-xl text-xs font-bold transition ${
                activeTab === 'pos' ? 'bg-[#c6f500] text-black shadow' : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <span>💵</span>
              <span>Bán Hàng POS (F2)</span>
            </button>
            <button
              onClick={() => setActiveTab('products')}
              className={`w-full flex items-center space-x-2.5 px-3 py-2.5 rounded-xl text-xs font-bold transition ${
                activeTab === 'products' ? 'bg-[#c6f500] text-black shadow' : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <span>👟</span>
              <span>Quản Lý Sản Phẩm</span>
            </button>
            <button
              onClick={() => setActiveTab('orders')}
              className={`w-full flex items-center space-x-2.5 px-3 py-2.5 rounded-xl text-xs font-bold transition ${
                activeTab === 'orders' ? 'bg-[#c6f500] text-black shadow' : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <span>📋</span>
              <span>Quản Lý Hóa Đơn</span>
            </button>
            <button
                onClick={() => setActiveTab('attribute')}
                className={`w-full flex items-center space-x-2.5 px-3 py-2.5 rounded-xl text-xs font-bold transition ${
                    activeTab === 'attribute' ? 'bg-[#c6f500] text-black shadow' : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50'
                }`}
            >
              <span>🏷️</span>
              <span>Quản Lý Thuộc tính</span>
            </button>
            <button
                onClick={() => setActiveTab('customer')}
                className={`w-full flex items-center space-x-2.5 px-3 py-2.5 rounded-xl text-xs font-bold transition ${
                    activeTab === 'customer' ? 'bg-[#c6f500] text-black shadow' : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50'
                }`}
            >
              <span>👥</span>
              <span>Quản Lý Khách Hàng</span>
            </button>

            <button
                onClick={() => setActiveTab('employee')}
                className={`w-full flex items-center space-x-2.5 px-3 py-2.5 rounded-xl text-xs font-bold transition ${
                    activeTab === 'employee' ? 'bg-[#c6f500] text-black shadow' : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50'
                }`}
            >
              <span>🧑‍💼</span>
              <span>Quản Lý Nhân Viên</span>
            </button>
            <button
              onClick={() => setActiveTab('shift')}
              className={`w-full flex items-center space-x-2.5 px-3 py-2.5 rounded-xl text-xs font-bold transition ${
                activeTab === 'shift' ? 'bg-[#c6f500] text-black shadow' : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <span>🔒</span>
              <span>Giao Ca & Chốt Két</span>
            </button>
            <button
              onClick={() => setActiveTab('returns')}
              className={`w-full flex items-center space-x-2.5 px-3 py-2.5 rounded-xl text-xs font-bold transition ${
                activeTab === 'returns' ? 'bg-[#c6f500] text-black shadow' : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <span>🔄</span>
              <span>Đổi Trả Hàng (7 ngày)</span>
            </button>
            <button
              onClick={() => setActiveTab('chat')}
              className={`w-full flex items-center space-x-2.5 px-3 py-2.5 rounded-xl text-xs font-bold transition ${
                activeTab === 'chat' ? 'bg-[#c6f500] text-black shadow' : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <span>💬</span>
              <span>Live Chat CSKH</span>
            </button>
          </div>

          <div className="space-y-2">
            {/* Báo cáo chuyên sâu — chỉ ADMIN */}
            {isStaff && (
              <>
                <div className="text-[10px] font-bold uppercase text-slate-500 px-2">Báo Cáo Chuyên Sâu</div>
                <a href="admin-statistics.html" className="w-full flex items-center space-x-2.5 px-3 py-2 rounded-xl text-xs font-bold text-slate-500 hover:text-slate-900 hover:bg-slate-50 transition">
                  <span>💵</span>
                  <span>Thống Kê POS Nâng Cao</span>
                </a>
              </>
            )}

            <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200 text-[11px] text-slate-500 space-y-1 mt-2">
              <div className="font-bold text-slate-900">Hotkeys POS:</div>
              <div>[F2] Mở tìm kiếm</div>
              <div>[F3] Quét Barcode</div>
              <div>[F9] Thanh toán nhanh</div>
            </div>
          </div>
        </aside>

        {/* Content Area */}
        <main className="flex-1 overflow-y-auto bg-white p-4 sm:p-6">
          {/* TAB 0: DASHBOARD — chỉ ADMIN */}
          {activeTab === 'dashboard' && isStaff && (
            <div className="space-y-6">
              {/* Header Dashboard & Time Filter */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200">
                <div>
                  <h2 className="text-xl font-black uppercase text-slate-900 flex items-center space-x-2">
                    <span className="text-lime-700">📊</span>
                    <span>Dashboard Thống Kê & Báo Cáo Doanh Thu</span>
                  </h2>
                  <p className="text-xs text-slate-500 mt-0.5">Số liệu thật từ hóa đơn đã thanh toán (POS + Online).</p>
                </div>

                {/* Period Selector Pills */}
                <div className="flex items-center gap-2">
                  {[
                    { id: 'today', label: 'Hôm nay' },
                    { id: '7days', label: '7 ngày qua' },
                    { id: 'month', label: 'Tháng này' },
                    { id: 'year', label: 'Năm ' + new Date().getFullYear() }
                  ].map((p) => (
                    <button
                      key={p.id}
                      onClick={() => setStatsPeriod(p.id)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
                        statsPeriod === p.id ? 'bg-[#c6f500] text-black shadow' : 'bg-slate-50 text-slate-500 hover:text-slate-900'
                      }`}
                    >
                      {p.label}
                    </button>
                  ))}
                  <button onClick={() => alert("Đang xuất báo cáo tài chính ra file Excel...")} className="px-3 py-1.5 bg-slate-50 hover:bg-slate-100 border border-slate-300 text-xs font-bold text-slate-700 rounded-xl transition">
                    📥 Xuất Excel
                  </button>
                </div>
              </div>

              {/* 4 KPI SUMMARY CARDS */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-white border border-slate-200 rounded-2xl p-4 space-y-2">
                  <div className="flex justify-between items-center text-xs text-slate-500">
                    <span>Tổng Doanh Thu</span>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      (stats?.kpi?.tangTruongDoanhThu ?? 0) >= 0 ? 'bg-[#c6f500]/15 text-lime-700' : 'bg-red-400/15 text-red-600'
                    }`}>
                      {stats ? `${stats.kpi.tangTruongDoanhThu >= 0 ? '+' : ''}${stats.kpi.tangTruongDoanhThu}%` : '—'}
                    </span>
                  </div>
                  <div className="text-2xl font-black text-slate-900">{stats ? fmtMoney(stats.kpi.tongDoanhThu) : '...'}</div>
                  <div className="text-[11px] text-slate-500">So với kỳ trước ({stats ? fmtMoney(stats.kpi.doanhThuKyTruoc) : '...'})</div>
                </div>

                <div className="bg-white border border-slate-200 rounded-2xl p-4 space-y-2">
                  <div className="flex justify-between items-center text-xs text-slate-500">
                    <span>Tổng Đơn Hàng</span>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      (stats?.kpi?.tangTruongDonHang ?? 0) >= 0 ? 'bg-[#c6f500]/15 text-lime-700' : 'bg-red-400/15 text-red-600'
                    }`}>
                      {stats ? `${stats.kpi.tangTruongDonHang >= 0 ? '+' : ''}${stats.kpi.tangTruongDonHang}%` : '—'}
                    </span>
                  </div>
                  <div className="text-2xl font-black text-slate-900">{stats ? `${stats.kpi.tongDonHang} đơn` : '...'}</div>
                  <div className="text-[11px] text-slate-500">POS: <b>{stats ? fmtMoney(stats.kenhBanHang.posDoanhThu) : '...'}</b> • Online: <b>{stats ? fmtMoney(stats.kenhBanHang.onlineDoanhThu) : '...'}</b></div>
                </div>

                <div className="bg-white border border-slate-200 rounded-2xl p-4 space-y-2">
                  <div className="flex justify-between items-center text-xs text-slate-500">
                    <span>Giá Trị Trung Bình Đơn (AOV)</span>
                  </div>
                  <div className="text-2xl font-black text-lime-700">{stats ? fmtMoney(stats.kpi.aov) : '...'}</div>
                  <div className="text-[11px] text-slate-500">Kỳ: {stats?.period || '—'}</div>
                </div>

                <div className="bg-white border border-slate-200 rounded-2xl p-4 space-y-2">
                  <div className="flex justify-between items-center text-xs text-slate-500">
                    <span>Số Đôi Giày Xuất Kho</span>
                  </div>
                  <div className="text-2xl font-black text-slate-900">{stats ? `${stats.kpi.soDoiXuatKho} đôi` : '...'}</div>
                  <div className="text-[11px] text-slate-500">Sản phẩm tồn thấp: <b>{stats ? stats.tonKhoThap.length : 0}</b></div>
                </div>
              </div>

              {/* CHARTS ROW */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* 7-DAY REVENUE BAR CHART (2 COLS) */}
                <div className="lg:col-span-2 bg-white border border-slate-200 rounded-3xl p-5 sm:p-6 space-y-4">
                  <div className="flex justify-between items-center">
                    <div>
                      <h3 className="font-black text-sm uppercase text-slate-900">Biểu Đồ Doanh Thu 7 Ngày Gần Nhất</h3>
                      <p className="text-[11px] text-slate-500">Tổng doanh thu cả POS lẫn Online theo ngày.</p>
                    </div>
                    <span className="text-xs font-bold text-lime-700">
                      {stats ? `Đỉnh điểm: ${(Number(stats.bieuDo7NgayPeak || 0) / 1000000).toFixed(1)}M` : '—'}
                    </span>
                  </div>

                  {/* Visual Bar Chart */}
                  <div className="h-48 flex items-end justify-between gap-3 pt-6 border-b border-slate-200 pb-2">
                    {weeklyRevenue.length === 0 && (
                      <div className="w-full text-center text-slate-500 text-xs pb-4">Chưa có dữ liệu doanh thu</div>
                    )}
                    {weeklyRevenue.map((item, idx) => (
                      <div key={idx} className="flex-1 flex flex-col items-center h-full justify-end group">
                        <div className="text-[10px] text-slate-500 opacity-0 group-hover:opacity-100 transition font-mono mb-1">
                          {(item.value / 1000000).toFixed(1)}M
                        </div>
                        <div
                          style={{ height: item.height }}
                          className={`w-full rounded-t-lg transition duration-300 ${
                            item.isPeak
                              ? 'bg-[#c6f500] shadow-[0_0_15px_rgba(198,245,0,0.5)]'
                              : 'bg-slate-100 hover:bg-[#c6f500]/70'
                          }`}
                        ></div>
                        <span className="text-[10px] font-bold text-slate-500 mt-2">{item.day}</span>
                      </div>
                    ))}
                  </div>

                  {/* Sub breakdown info */}
                  <div className="grid grid-cols-2 gap-2 text-center text-xs pt-1">
                    <div className="bg-slate-50/60 p-2 rounded-xl">
                      <span className="text-slate-500 text-[10px] block">Doanh Thu TB / Ngày</span>
                      <b className="text-slate-900">{stats ? fmtMoney(stats.doanhThuTB7Ngay) : '...'}</b>
                    </div>
                    <div className="bg-slate-50/60 p-2 rounded-xl">
                      <span className="text-slate-500 text-[10px] block">Số Đôi Xuất Kho Trong Kỳ</span>
                      <b className="text-lime-700">{stats ? `${stats.kpi.soDoiXuatKho} đôi` : '...'}</b>
                    </div>
                  </div>
                </div>

                {/* CHANNEL BREAKDOWN & PAYMENT METHODS (1 COL) */}
                <div className="bg-white border border-slate-200 rounded-3xl p-5 sm:p-6 space-y-5 flex flex-col justify-between">
                  <div>
                    <h3 className="font-black text-sm uppercase text-slate-900 mb-1">Tỷ Trọng Kênh Bán Hàng</h3>
                    <p className="text-[11px] text-slate-500 mb-4">Phân bổ doanh thu giữa Online và Quầy POS.</p>

                    {/* Progress Channels */}
                    <div className="space-y-3">
                      <div>
                        <div className="flex justify-between text-xs font-bold mb-1">
                          <span className="text-slate-700">🌐 Online Website</span>
                          <span className="text-lime-700">
                            {stats ? `${stats.kenhBanHang.onlinePhanTram}% (${(Number(stats.kenhBanHang.onlineDoanhThu) / 1000000).toFixed(1)}M)` : '—'}
                          </span>
                        </div>
                        <div className="w-full h-2.5 bg-slate-50 rounded-full overflow-hidden">
                          <div className="h-full bg-[#c6f500] rounded-full" style={{ width: `${stats?.kenhBanHang.onlinePhanTram || 0}%` }}></div>
                        </div>
                      </div>

                      <div>
                        <div className="flex justify-between text-xs font-bold mb-1">
                          <span className="text-slate-700">💵 Bán Lẻ Tại Quầy POS</span>
                          <span className="text-slate-900">
                            {stats ? `${stats.kenhBanHang.posPhanTram}% (${(Number(stats.kenhBanHang.posDoanhThu) / 1000000).toFixed(1)}M)` : '—'}
                          </span>
                        </div>
                        <div className="w-full h-2.5 bg-slate-50 rounded-full overflow-hidden">
                          <div className="h-full bg-slate-800 rounded-full" style={{ width: `${stats?.kenhBanHang.posPhanTram || 0}%` }}></div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="border-t border-slate-200 pt-4 space-y-2">
                    <h4 className="font-bold text-xs text-slate-900">Phương Thức Thanh Toán</h4>
                    <div className="space-y-1.5 text-xs text-slate-500">
                      {(stats?.phuongThucThanhToan || []).length === 0 && (
                        <div className="text-slate-500">Chưa có thanh toán nào trong kỳ</div>
                      )}
                      {(stats?.phuongThucThanhToan || []).map((pt) => (
                        <div key={pt.maHinhThuc} className="flex justify-between">
                          <span>{pt.maHinhThuc === 'TIEN_MAT' ? '💵' : '🏦'} {pt.tenHinhThuc}:</span>
                          <b className="text-slate-900">{pt.phanTram}% ({(Number(pt.soTien) / 1000).toFixed(0)}K)</b>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* BEST SELLERS & LOW STOCK ALERTS */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Top 5 Best Sellers */}
                <div className="bg-white border border-slate-200 rounded-3xl p-5 space-y-4">
                  <div className="flex justify-between items-center">
                    <h3 className="font-black text-sm uppercase text-slate-900">Top Giày Bán Chạy Nhất</h3>
                    <span className="text-[10px] text-lime-700 font-bold">Xếp theo số lượng</span>
                  </div>

                  <div className="divide-y divide-slate-200 space-y-2 text-xs">
                    {(stats?.topBanChay || []).length === 0 && (
                      <div className="py-6 text-center text-slate-500">Chưa có đơn hàng nào trong kỳ này</div>
                    )}
                    {(stats?.topBanChay || []).map((p, idx) => (
                      <div key={p.sanPhamId} className="pt-2 flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <span className={`w-5 h-5 rounded-full flex items-center justify-center font-black text-[10px] ${
                            idx === 0 ? 'bg-[#c6f500] text-black' : 'bg-slate-100 text-slate-700'
                          }`}>
                            {idx + 1}
                          </span>
                          <div>
                            <div className="font-bold text-slate-900 line-clamp-1">{p.tenSanPham}</div>
                            <div className="text-[10px] text-slate-500">Đã bán {p.daBan} đôi</div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-black text-lime-700">{fmtMoney(p.doanhThu)}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Low Stock Warnings */}
                <div className="bg-white border border-slate-200 rounded-3xl p-5 space-y-4">
                  <div className="flex justify-between items-center">
                    <h3 className="font-black text-sm uppercase text-slate-900 flex items-center space-x-1.5">
                      <span className="text-amber-600">⚠️</span>
                      <span>Cảnh Báo Tồn Kho Sắp Hết</span>
                    </h3>
                    <span className="text-[10px] text-red-600 font-bold">&lt; {stats?.nguongTonThap || 10} đôi</span>
                  </div>

                  <div className="space-y-2.5 text-xs">
                    {(stats?.tonKhoThap || []).length === 0 && (
                      <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-500">
                        Tồn kho ổn định — không có sản phẩm dưới ngưỡng.
                      </div>
                    )}
                    {(stats?.tonKhoThap || []).map((sp) => (
                      <div key={sp.sanPhamId} className={`p-3 rounded-xl flex items-center justify-between ${
                        sp.tonKho === 0 ? 'bg-red-500/10 border border-red-500/30' : 'bg-amber-500/10 border border-amber-500/30'
                      }`}>
                        <div>
                          <div className="font-bold text-slate-900 line-clamp-1">{sp.tenSanPham}</div>
                          <div className={`text-[10px] ${sp.tonKho === 0 ? 'text-red-600' : 'text-amber-600'}`}>
                            {sp.tonKho === 0
                              ? `Hết hàng toàn bộ (${sp.sizeHetHang} size)`
                              : `Chỉ còn ${sp.tonKho} đôi trong kho${sp.sizeHetHang > 0 ? ` (${sp.sizeHetHang} size hết)` : ''}`}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 1: POS SCREEN — Bán hàng tại kho */}
          {activeTab === 'pos' && <BanHangTaiKho session={session} />}

          {/* TAB 2: PRODUCTS */}
          {activeTab === 'products' && (<AdminProduct activeTab={activeTab} isStaff={isStaff}/>

          )}
          {activeTab === 'attribute' && (<AdminAttribute activeTab={activeTab} isStaff={isStaff}/>
          )}
          {activeTab === 'customer' && <KhachHangPage isStaff={isStaff} />}
          {activeTab === 'employee' && <NhanVienPage isStaff={isStaff} />}

          {/* TAB 3: ORDERS MANAGEMENT */}
          {activeTab === 'orders' && (
            <div className="space-y-4">
              <div className="flex flex-wrap gap-2">
                {[
                  { id: 'all', label: 'Tất cả hóa đơn' },
                  { id: 'pos', label: 'Hóa Đơn Tại Quầy POS' },
                  { id: 'online', label: 'Đơn Online' },
                  { id: 'completed', label: 'Đã hoàn thành' }
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setOrderFilter(tab.id)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
                      orderFilter === tab.id ? 'bg-[#c6f500] text-black' : 'bg-slate-50 text-slate-500'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden">
                <table className="w-full text-xs text-left">
                  <thead className="bg-slate-50 text-slate-500 border-b border-slate-200">
                    <tr>
                      <th className="p-3">Mã Hóa Đơn</th>
                      <th className="p-3">Kênh</th>
                      <th className="p-3">Thanh Toán</th>
                      <th className="p-3">Sản Phẩm</th>
                      <th className="p-3 text-right">Tổng Tiền</th>
                      <th className="p-3 text-center">Trạng Thái</th>
                      <th className="p-3 text-center">Bill</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200/60">
                    {orders.length === 0 && (
                      <tr><td colSpan={7} className="p-8 text-center text-slate-500">Chưa có hóa đơn nào</td></tr>
                    )}
                    {filteredOrders.map((ord) => (
                      <tr key={ord.id} className="hover:bg-slate-50/40">
                        <td className="p-3">
                          <div className="font-mono font-bold text-lime-700">#{ord.maHoaDon}</div>
                          <div className="text-[10px] text-slate-500">{ord.ngayTao ? new Date(ord.ngayTao).toLocaleString('vi-VN') : ''}</div>
                        </td>
                        <td className="p-3 text-slate-700">{ord.trangThai === 3 ? 'Tại quầy POS' : 'Online'}</td>
                        <td className="p-3">
                          {ord.maPhuongThuc
                            ? <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${ord.maPhuongThuc === 'TIEN_MAT' ? 'bg-amber-400/15 text-amber-600' : 'bg-blue-400/15 text-blue-600'}`}>
                                {ord.phuongThuc}
                              </span>
                            : <span className="text-slate-500">—</span>}
                        </td>
                        <td className="p-3 text-slate-700">{ord.itemsSummary}</td>
                        <td className="p-3 text-right font-black text-slate-900">{Number(ord.thanhTien || 0).toLocaleString('vi-VN')}₫</td>
                        <td className="p-3 text-center">
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#c6f500]/15 text-lime-700">
                            Đã Thanh Toán
                          </span>
                        </td>
                        <td className="p-3 text-center">
                          <button
                            onClick={() => axiosClient.get(`/ban-hang/hoa-don/${ord.id}/bill`).then(setBill).catch((e) => alert(e.message || 'Không tải được bill!'))}
                            className="px-2 py-1 bg-slate-50 hover:bg-slate-100 border border-slate-300 rounded-lg text-[10px] font-bold text-slate-700 hover:text-slate-900 transition"
                          >
                            🖨️ In lại
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 4: SHIFT CLOSING */}
          {activeTab === 'shift' && (
            <div className="max-w-xl mx-auto bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 space-y-6">
              <div className="border-b border-slate-200 pb-4">
                <span className="text-xs font-black uppercase text-lime-700">Bàn Giao Ca Trực</span>
                <h3 className="text-xl font-black text-slate-900 mt-1">Chốt Két & Đối Soát Tiền Mặt</h3>
                <p className="text-xs text-slate-500">Thu ngân kiểm đếm tiền thực tế trong két để bàn giao cho ca tiếp theo.</p>
              </div>

              <div className="space-y-3 text-xs">
                <div className="flex justify-between py-2 border-b border-slate-200 text-slate-500">
                  <span>Tiền mặt đầu ca:</span>
                  <span className="font-bold text-slate-900">{openingCash.toLocaleString('vi-VN')}₫</span>
                </div>
                <div className="flex justify-between py-2 border-b border-slate-200 text-slate-500">
                  <span>Doanh thu tiền mặt trong ca:</span>
                  <span className="font-bold text-lime-700">+3.350.000₫</span>
                </div>
                <div className="flex justify-between py-2 border-b border-slate-200 font-bold text-slate-900 text-sm">
                  <span>Tiền mặt lý thuyết trong két:</span>
                  <span className="text-lime-700">5.350.000₫</span>
                </div>

                <div className="pt-2">
                  <label className="block text-slate-700 font-bold mb-1">Tiền mặt thực đếm khi bàn giao:</label>
                  <input
                    type="number"
                    value={actualCash}
                    onChange={(e) => setActualCash(Number(e.target.value))}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-2.5 text-slate-900 font-bold"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-bold mb-1">Ghi chú bàn giao:</label>
                  <textarea
                    rows={2}
                    value={shiftNote}
                    onChange={(e) => setShiftNote(e.target.value)}
                    placeholder="Đầy đủ tiền lẻ, két niêm phong bình thường..."
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl p-3 text-slate-900 text-xs"
                  />
                </div>

                <button
                  onClick={() => alert("🎉 ĐÃ CHỐT CA TRỰC THÀNH CÔNG!\nBiên bản bàn giao két đã được gửi lên hệ thống.")}
                  className="w-full py-3.5 bg-[#c6f500] hover:bg-[#b0dc00] text-black font-black uppercase rounded-xl transition mt-2"
                >
                  Xác Nhận Chốt Két & In Biên Bản Bàn Giao
                </button>
              </div>
            </div>
          )}

          {/* TAB 5: RETURNS */}
          {activeTab === 'returns' && (
            <div className="bg-white border border-slate-200 rounded-3xl p-6 text-xs space-y-4">
              <h3 className="font-black text-sm uppercase text-slate-900">Quy Trình Đổi Size / Đổi Trả Hàng (7 Ngày)</h3>
              <p className="text-slate-500">Nhập mã hóa đơn cũ để kiểm tra điều kiện đổi size hoặc đổi mẫu mới:</p>
              <div className="flex gap-2 max-w-md">
                <input type="text" placeholder="Nhập mã đơn: #POS260103..." className="flex-1 bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-900" />
                <button onClick={() => alert("Đơn hàng hợp lệ! Đã mua cách đây 2 ngày. Đủ điều kiện đổi size miễn phí.")} className="px-4 py-2 bg-[#c6f500] text-black font-bold rounded-xl">
                  Kiểm Tra
                </button>
              </div>
            </div>
          )}

          {/* TAB 6: CHAT */}
          {activeTab === 'chat' && (
            <div className="bg-white border border-slate-200 rounded-3xl p-6 text-xs space-y-4">
              <h3 className="font-black text-sm uppercase text-slate-900">Live Chat CSKH Omnichannel</h3>
              <div className="h-48 bg-slate-50 rounded-2xl p-4 overflow-y-auto space-y-2">
                <div className="text-slate-500 text-[10px]">Hôm nay 14:10</div>
                <div className="bg-slate-100 p-2.5 rounded-xl max-w-xs text-slate-900">
                  <b>Khách:</b> Shop còn Nike size 42 không ạ?
                </div>
                <div className="bg-[#c6f500] text-black p-2.5 rounded-xl max-w-xs ml-auto font-medium">
                  <b>Thu ngân:</b> Dạ chào bạn, size 42 hiện còn sẵn 3 đôi bạn nhé!
                </div>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* ── MODAL: BILL K80 — in lại hóa đơn ── */}
      <BillK80Modal bill={bill} session={session} onClose={() => setBill(null)} />
    </div>
  );
}

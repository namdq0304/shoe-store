import React, { useState } from 'react';

export default function Footer({ onSelectTab, onSelectBrand, onOpenSizeChart }) {
  const [emailInput, setEmailInput] = useState('');
  const [subscribed, setSubscribed] = useState(false);
  const [copiedVoucher, setCopiedVoucher] = useState(false);

  const handleSubscribe = (e) => {
    e.preventDefault();
    if (!emailInput.trim() || !emailInput.includes('@')) {
      alert('Vui lòng nhập địa chỉ email hợp lệ!');
      return;
    }
    setSubscribed(true);
    setEmailInput('');
  };

  const copyVoucher = () => {
    navigator.clipboard?.writeText('KICKS100K');
    setCopiedVoucher(true);
    setTimeout(() => setCopiedVoucher(false), 2000);
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="mt-20 relative bg-gradient-to-b from-slate-900 via-slate-950 to-black text-slate-300 selection:bg-indigo-500 selection:text-white">
      {/* Top Accent Gradient Border */}
      <div className="h-[2px] w-full bg-gradient-to-r from-transparent via-indigo-500 via-violet-500 to-transparent opacity-80" />

      {/* ── VALUE PROPOSITIONS BAR ── */}
      <div className="border-b border-slate-800/60 bg-slate-900/30 backdrop-blur-md relative overflow-hidden">
        <div className="absolute inset-0 bg-radial-gradient pointer-events-none opacity-20" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 relative z-10">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {/* 1 */}
            <div className="flex items-start space-x-4 p-4 rounded-2xl bg-slate-900/60 border border-slate-800/80 hover:border-indigo-500/50 hover:bg-slate-900/90 transition-all duration-300 group shadow-lg hover:shadow-indigo-500/10">
              <div className="w-12 h-12 rounded-2xl bg-indigo-500/15 border border-indigo-500/30 text-indigo-400 flex items-center justify-center shrink-0 group-hover:scale-110 group-hover:bg-indigo-600 group-hover:text-white transition duration-300 shadow-sm">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <h4 className="text-sm font-black text-white uppercase tracking-tight">100% Chính Hãng</h4>
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                </div>
                <p className="text-xs text-slate-400 mt-1 leading-relaxed">Kiểm định chuẩn Authentic 100%, đền bù gấp đôi nếu phát hiện hàng giả.</p>
              </div>
            </div>

            {/* 2 */}
            <div className="flex items-start space-x-4 p-4 rounded-2xl bg-slate-900/60 border border-slate-800/80 hover:border-violet-500/50 hover:bg-slate-900/90 transition-all duration-300 group shadow-lg hover:shadow-violet-500/10">
              <div className="w-12 h-12 rounded-2xl bg-violet-500/15 border border-violet-500/30 text-violet-400 flex items-center justify-center shrink-0 group-hover:scale-110 group-hover:bg-violet-600 group-hover:text-white transition duration-300 shadow-sm">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <div>
                <h4 className="text-sm font-black text-white uppercase tracking-tight">Giao Siêu Tốc 2H</h4>
                <p className="text-xs text-slate-400 mt-1 leading-relaxed">Freeship đơn từ 1.5M toàn quốc • Ship hỏa tốc nhận giày trong 2 giờ tại nội thành.</p>
              </div>
            </div>

            {/* 3 */}
            <div className="flex items-start space-x-4 p-4 rounded-2xl bg-slate-900/60 border border-slate-800/80 hover:border-amber-500/50 hover:bg-slate-900/90 transition-all duration-300 group shadow-lg hover:shadow-amber-500/10">
              <div className="w-12 h-12 rounded-2xl bg-amber-500/15 border border-amber-500/30 text-amber-400 flex items-center justify-center shrink-0 group-hover:scale-110 group-hover:bg-amber-500 group-hover:text-slate-950 transition duration-300 shadow-sm">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
              </div>
              <div>
                <h4 className="text-sm font-black text-white uppercase tracking-tight">Đổi Size 7 Ngày</h4>
                <p className="text-xs text-slate-400 mt-1 leading-relaxed">Đổi size tận nơi nếu không vừa vặn. Thủ tục nhanh gọn, không lo bất tiện.</p>
              </div>
            </div>

            {/* 4 */}
            <div className="flex items-start space-x-4 p-4 rounded-2xl bg-slate-900/60 border border-slate-800/80 hover:border-emerald-500/50 hover:bg-slate-900/90 transition-all duration-300 group shadow-lg hover:shadow-emerald-500/10">
              <div className="w-12 h-12 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 flex items-center justify-center shrink-0 group-hover:scale-110 group-hover:bg-emerald-500 group-hover:text-white transition duration-300 shadow-sm">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              </div>
              <div>
                <h4 className="text-sm font-black text-white uppercase tracking-tight">CSKH Chuyên Nghiệp</h4>
                <p className="text-xs text-slate-400 mt-1 leading-relaxed">Hotline <span className="text-white font-bold">1900 6868</span> hỗ trợ tận tâm từ 8h30 đến 22h00 mỗi ngày.</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── NEWSLETTER STRIP (VIP CLUB) ── */}
      <div className="border-b border-slate-800/80 bg-gradient-to-r from-indigo-950/50 via-slate-950 to-violet-950/40 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10">
          <div className="flex flex-col lg:flex-row items-center justify-between gap-8">
            <div className="space-y-2 text-center lg:text-left max-w-xl">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-400/10 border border-amber-400/20 text-amber-400 text-[11px] font-bold uppercase tracking-wider">
                <span>🔥</span> VIBEFLOW SNEAKER PASS
              </div>
              <h3 className="text-2xl sm:text-3xl font-black text-white tracking-tight uppercase">
                Nhận Ngay <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-500">Voucher 100.000₫</span>
              </h3>
              <p className="text-xs sm:text-sm text-slate-400">
                Đăng ký thành viên để nhận thông báo sớm nhất các đợt mở bán giày hiếm (Drop Alerts), mã bí mật và đặc quyền tích điểm.
              </p>
            </div>

            <div className="w-full lg:w-auto">
              {subscribed ? (
                <div className="flex flex-col sm:flex-row items-center gap-3 p-4 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs sm:text-sm">
                  <div className="flex items-center gap-2 font-bold">
                    <span>🎉</span>
                    <span>Bạn đã đăng ký VIP Club! Mã giảm giá:</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono bg-slate-900 border border-emerald-400/40 px-3 py-1.5 rounded-xl text-amber-300 font-extrabold tracking-wider">
                      KICKS100K
                    </span>
                    <button
                      onClick={copyVoucher}
                      className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition"
                    >
                      {copiedVoucher ? '✓ Đã chép' : 'Sao chép'}
                    </button>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleSubscribe} className="flex flex-col sm:flex-row gap-2.5 max-w-md w-full">
                  <div className="relative flex-1">
                    <input
                      type="email"
                      value={emailInput}
                      onChange={(e) => setEmailInput(e.target.value)}
                      placeholder="Nhập email của bạn (vd: ban@gmail.com)..."
                      className="w-full bg-slate-900/90 border border-slate-700/80 rounded-xl px-4 py-3 text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/30 transition shadow-inner"
                      required
                    />
                  </div>
                  <button
                    type="submit"
                    className="px-6 py-3 bg-gradient-to-r from-indigo-600 via-indigo-500 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-black uppercase text-xs rounded-xl transition shadow-indigo hover:shadow-xl active:scale-95 whitespace-nowrap cursor-pointer flex items-center justify-center gap-2"
                  >
                    <span>Đăng Ký Ngay</span>
                    <span>➔</span>
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ── MAIN FOOTER COLUMNS ── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-14">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10">
          {/* Cột 1: Thương hiệu */}
          <div className="lg:col-span-2 space-y-5">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-indigo-600 to-violet-600 flex items-center justify-center shadow-lg shadow-indigo-600/30 text-white">
                <svg className="w-6 h-6" viewBox="0 0 40 40" fill="none">
                  <path d="M8 12L15 28L22 12" stroke="#FFFFFF" strokeWidth="4.5" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M14 26C18 31 24 32 30 14" stroke="#c7d2fe" strokeWidth="4.5" strokeLinecap="round"/>
                </svg>
              </div>
              <div>
                <span className="text-2xl font-black italic tracking-tight">
                  <span className="text-white">Vibe</span><span className="text-indigo-400">Flow</span>
                </span>
                <span className="block text-[10px] uppercase font-bold text-slate-500 tracking-wider">Premium Sneaker Destination</span>
              </div>
            </div>

            <p className="text-xs sm:text-sm text-slate-400 leading-relaxed max-w-sm">
              Hệ thống bán lẻ Sneaker & Streetwear chính hãng hàng đầu Việt Nam. Nơi khẳng định cá tính với các dòng Air Jordan, Dunk Low, Samba cùng trải nghiệm mua sắm chuẩn quốc tế.
            </p>

            {/* Thông tin liên hệ */}
            <div className="space-y-2 text-xs text-slate-400">
              <div className="flex items-center gap-2.5">
                <span className="w-5 h-5 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-center text-indigo-400 text-xs shrink-0">📍</span>
                <span><strong>Hà Nội:</strong> 128 Phố Huế, Q. Hoàn Kiếm</span>
              </div>
              <div className="flex items-center gap-2.5">
                <span className="w-5 h-5 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-center text-indigo-400 text-xs shrink-0">📍</span>
                <span><strong>TP. HCM:</strong> 256 Lê Văn Sỹ, P.14, Quận 3</span>
              </div>
              <div className="flex items-center gap-2.5">
                <span className="w-5 h-5 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-center text-indigo-400 text-xs shrink-0">📞</span>
                <span>Hotline: <strong className="text-white">1900 6868</strong> (08:30 - 22:00)</span>
              </div>
              <div className="flex items-center gap-2.5">
                <span className="w-5 h-5 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-center text-indigo-400 text-xs shrink-0">✉️</span>
                <span>Email hỗ trợ: <strong className="text-white">cskh@vibeflow.vn</strong></span>
              </div>
            </div>

            {/* Social Icons */}
            <div className="flex items-center space-x-2.5 pt-1">
              {[
                { name: 'Facebook', label: 'FB', color: 'hover:bg-blue-600' },
                { name: 'Instagram', label: 'IG', color: 'hover:bg-pink-600' },
                { name: 'TikTok', label: 'TT', color: 'hover:bg-slate-800' },
                { name: 'YouTube', label: 'YT', color: 'hover:bg-red-600' },
              ].map((s) => (
                <button
                  key={s.name}
                  onClick={() => alert(`Kết nối với VibeFlow qua ${s.name}!`)}
                  className={`w-9 h-9 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 font-bold text-xs flex items-center justify-center transition ${s.color} hover:text-white hover:border-transparent`}
                  title={s.name}
                >
                  {s.label}
                </button>
              ))}
            </div>
          </div>

          {/* Cột 2: Danh Mục Nổi Bật */}
          <div className="space-y-4">
            <h4 className="text-xs font-black uppercase tracking-wider text-white flex items-center gap-2">
              <span className="w-1.5 h-3 bg-indigo-500 rounded-full"></span>
              Dòng Sneaker Hot
            </h4>
            <ul className="space-y-2 text-xs text-slate-400">
              <li>
                <button
                  onClick={() => { onSelectBrand?.(['Jordan']); onSelectTab?.('catalog'); }}
                  className="hover:text-indigo-400 transition flex items-center gap-1.5 group text-left"
                >
                  <span className="text-amber-400 group-hover:translate-x-0.5 transition-transform">⚡</span>
                  <span className="font-bold text-slate-200">Air Jordan Retro</span>
                </button>
              </li>
              <li>
                <button
                  onClick={() => { onSelectBrand?.(['Nike']); onSelectTab?.('catalog'); }}
                  className="hover:text-indigo-400 transition flex items-center gap-1 text-left"
                >
                  <span>Nike Dunk & Air Force 1</span>
                </button>
              </li>
              <li>
                <button
                  onClick={() => { onSelectBrand?.(['Adidas']); onSelectTab?.('catalog'); }}
                  className="hover:text-indigo-400 transition flex items-center gap-1 text-left"
                >
                  <span>Adidas Samba & Gazelle</span>
                </button>
              </li>
              <li>
                <button
                  onClick={() => { onSelectBrand?.(['New Balance']); onSelectTab?.('catalog'); }}
                  className="hover:text-indigo-400 transition flex items-center gap-1 text-left"
                >
                  <span>New Balance 550 / 2002R</span>
                </button>
              </li>
              <li>
                <button
                  onClick={() => { onSelectBrand?.(['Puma']); onSelectTab?.('catalog'); }}
                  className="hover:text-indigo-400 transition flex items-center gap-1 text-left"
                >
                  <span>Puma Suede & Palermo</span>
                </button>
              </li>
              <li className="pt-1.5">
                <button
                  onClick={() => { onSelectBrand?.([]); onSelectTab?.('catalog'); }}
                  className="inline-flex items-center gap-1 text-indigo-400 hover:text-indigo-300 font-bold underline transition"
                >
                  Khám phá toàn bộ bộ sưu tập ➔
                </button>
              </li>
            </ul>
          </div>

          {/* Cột 3: Hỗ Trợ Khách Hàng */}
          <div className="space-y-4">
            <h4 className="text-xs font-black uppercase tracking-wider text-white flex items-center gap-2">
              <span className="w-1.5 h-3 bg-violet-500 rounded-full"></span>
              Chăm Sóc Khách Hàng
            </h4>
            <ul className="space-y-2 text-xs text-slate-400">
              <li>
                <button
                  onClick={() => onOpenSizeChart?.()}
                  className="hover:text-indigo-400 transition flex items-center gap-1.5 text-left text-amber-300/90 font-medium"
                >
                  <span>📐</span>
                  <span className="underline">Bảng quy đổi size chuẩn</span>
                </button>
              </li>
              <li>
                <button
                  onClick={() => onSelectTab?.('customer')}
                  className="hover:text-indigo-400 transition text-left"
                >
                  Tra cứu & Quản lý đơn hàng
                </button>
              </li>
              <li>
                <span className="hover:text-indigo-400 transition cursor-pointer">
                  Chính sách bảo hành 6 tháng
                </span>
              </li>
              <li>
                <span className="hover:text-indigo-400 transition cursor-pointer">
                  Quy trình đổi trả hàng 7 ngày
                </span>
              </li>
              <li>
                <span className="hover:text-indigo-400 transition cursor-pointer">
                  Phương thức thanh toán & COD
                </span>
              </li>
              <li>
                <span className="hover:text-indigo-400 transition cursor-pointer">
                  Chính sách bảo mật thông tin
                </span>
              </li>
            </ul>
          </div>

          {/* Cột 4: Thanh Toán & Chứng Nhận */}
          <div className="space-y-4">
            <h4 className="text-xs font-black uppercase tracking-wider text-white flex items-center gap-2">
              <span className="w-1.5 h-3 bg-emerald-500 rounded-full"></span>
              Thanh Toán & Xác Thực
            </h4>
            <p className="text-xs text-slate-400">Hỗ trợ đa dạng phương thức bảo mật 100%:</p>
            
            <div className="grid grid-cols-3 gap-2">
              {[
                { name: 'VietQR', badge: 'QR' },
                { name: 'MoMo', badge: 'Ví' },
                { name: 'VNPay', badge: 'QR' },
                { name: 'Visa', badge: 'Thẻ' },
                { name: 'Master', badge: 'Thẻ' },
                { name: 'COD', badge: 'Tiền mặt' },
              ].map((m) => (
                <div
                  key={m.name}
                  className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-center hover:border-indigo-500/40 transition"
                >
                  <div className="text-[11px] font-black text-slate-200">{m.name}</div>
                  <div className="text-[9px] text-slate-500">{m.badge}</div>
                </div>
              ))}
            </div>

            <div className="pt-2">
              <div className="flex items-center gap-2.5 px-3 py-2 rounded-xl bg-slate-900/80 border border-emerald-500/30 text-emerald-400 text-xs font-bold">
                <div className="w-5 h-5 rounded-full bg-emerald-500/20 flex items-center justify-center text-emerald-400 text-xs">
                  ✓
                </div>
                <span>Đã thông báo Bộ Công Thương</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── BOTTOM COPYRIGHT & BACK TO TOP ── */}
      <div className="border-t border-slate-900 bg-black/60 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-5 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <div className="flex flex-wrap items-center gap-2 text-center sm:text-left">
            <span>© 2026 <strong className="text-slate-300 font-semibold">VibeFlow Sneaker Inc.</strong> Tất cả quyền được bảo lưu.</span>
            <span className="hidden md:inline text-slate-700">•</span>
            <span className="hidden md:inline">Giấy phép ĐKKD: 0108928374 do Sở KH&ĐT Hà Nội cấp.</span>
          </div>

          <div className="flex items-center space-x-6">
            <button
              onClick={scrollToTop}
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 hover:border-slate-700 text-indigo-400 hover:text-indigo-300 font-bold transition group shadow-sm"
            >
              <span>Về đầu trang</span>
              <span className="group-hover:-translate-y-1 transition-transform duration-200">↑</span>
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
}

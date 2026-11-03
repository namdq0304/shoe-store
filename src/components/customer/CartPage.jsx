import { useState ,useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useCartStore, useOrderStore, useAuthStore } from '../../store';
import { formatVND, toSrc } from './utils';
import Footer from '../Footer';
import StoreHeader from './components/StoreHeader';
import useMenuData from './hooks/useMenuData';
import CheckoutModal from './components/modals/CheckoutModal';

export default function CartPage() {
  const navigate = useNavigate();
  const { menu } = useMenuData();

  // Auth Store
  const session = useAuthStore((s) => s.session);
  const logout  = useAuthStore((s) => s.logout);

  // Cart Store
  const cart            = useCartStore((s) => s.cart);
  const itemCount       = useCartStore((s) => s.itemCount);
  const subtotal        = useCartStore((s) => s.subtotal);
  const discountAmount  = useCartStore((s) => s.discountAmount);
  const total           = useCartStore((s) => s.total);
  const voucherCode     = useCartStore((s) => s.voucherCode);
  const appliedVoucher  = useCartStore((s) => s.appliedVoucher);
  const setVoucherCode  = useCartStore((s) => s.setVoucherCode);
  const applyVoucher    = useCartStore((s) => s.applyVoucher);
  const updateQty       = useCartStore((s) => s.updateQty);
  const removeFromCart  = useCartStore((s) => s.removeFromCart);
  const clearCart       = useCartStore((s) => s.clearCart);
  const fetchCart = useCartStore((s) => s.fetchCart);
  // Order Store
  const placeOrder = useOrderStore((s) => s.placeOrder);

  // Modal checkout
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [voucherFeedback, setVoucherFeedback] = useState(null);
  useEffect(() => {
    if (session) fetchCart();
  }, [session]);
  // Header navigation
  const handleNavigate = (item) => {
    if (item.tab) {
      navigate('/', { state: { activeTab: item.tab } });
    } else {
      navigate('/', { state: { filter: item.filter } });
    }
  };

  const handleApplyVoucher = (e) => {
    e.preventDefault();
    const result = applyVoucher();
    setVoucherFeedback(result);
    setTimeout(() => setVoucherFeedback(null), 4000);
  };

  const handleCheckoutClick = () => {
    if (!session) {
      alert('⚠️ Vui lòng đăng nhập để tiến hành đặt hàng!');
      navigate('/login', { state: { from: '/gio-hang' } });
      return;
    }
    if (cart.length === 0) {
      alert('Giỏ hàng của bạn đang trống!');
      return;
    }
    setIsCheckoutOpen(true);
  };

  const handlePlaceOrder = (form) => {
    const order = placeOrder({ cart, total, form });
    clearCart();
    setIsCheckoutOpen(false);
    alert(
      `🎉 ĐẶT HÀNG THÀNH CÔNG!\nMã đơn hàng: #${order.id}\nTổng thanh toán: ${formatVND(order.total)}\n` +
      'Cảm ơn bạn đã mua sắm tại VibeFlow! Bạn có thể xem lịch sử đơn hàng tại mục "Tài Khoản".'
    );
    navigate('/', { state: { activeTab: 'customer' } });
  };

  return (
    <div className="bg-slate-50 min-h-screen flex flex-col text-slate-900">
      {/* ── Header ── */}
      <StoreHeader
        activeTab=""
        onChangeTab={(tab) => navigate('/', { state: { activeTab: tab } })}
        menu={menu}
        onNavigate={handleNavigate}
        searchQuery=""
        onSearch={(q) => navigate('/', { state: { filter: { q } } })}
        session={session}
        isStaff={['ADMIN', 'NHAN_VIEN'].includes((session?.role || '').toUpperCase())}
        onLogout={() => { logout(); navigate('/'); }}
        cartCount={itemCount}
        onOpenCart={() => {}}
      />

      {/* ── Main Content ── */}
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8 sm:py-10">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-xs text-slate-400 mb-6">
          <Link to="/" className="hover:text-indigo-600 transition">Trang chủ</Link>
          <span>/</span>
          <span className="text-slate-700 font-bold">Giỏ hàng ({itemCount})</span>
        </nav>

        {/* Tiêu đề trang */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 mb-8 border-b border-slate-200/80 gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight flex items-center gap-3">
              <span>🛒 GIỎ HÀNG CỦA BẠN</span>
              <span className="text-xs font-bold px-3 py-1 bg-indigo-50 text-indigo-600 rounded-full border border-indigo-100">
                {itemCount} sản phẩm
              </span>
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Kiểm tra danh sách sản phẩm, chọn voucher giảm giá và thanh toán nhanh chóng.
            </p>
          </div>

          {cart.length > 0 && (
            <button
              onClick={() => {
                if (window.confirm('Bạn có chắc chắn muốn xóa toàn bộ sản phẩm khỏi giỏ hàng?')) {
                  clearCart();
                }
              }}
              className="text-xs font-bold text-red-500 hover:text-red-700 hover:underline flex items-center gap-1 self-start sm:self-auto"
            >
              <span>🗑️</span>
              <span>Xóa toàn bộ giỏ hàng</span>
            </button>
          )}
        </div>

        {/* ── TH1: Giỏ hàng trống ── */}
        {cart.length === 0 ? (
          <div className="bg-white rounded-3xl border border-slate-200/80 p-10 sm:p-16 text-center shadow-sm max-w-2xl mx-auto my-6">
            <div className="w-24 h-24 mx-auto mb-5 rounded-full bg-indigo-50 border border-indigo-100 flex items-center justify-center text-4xl shadow-inner">
              👟
            </div>
            <h2 className="text-xl font-black text-slate-800">Giỏ hàng của bạn đang trống</h2>
            <p className="text-slate-500 text-xs sm:text-sm mt-2 max-w-md mx-auto leading-relaxed">
              Bạn chưa thêm đôi giày nào vào giỏ. Hãy khám phá bộ sưu tập mới nhất với ưu đãi cực tốt ngay hôm nay!
            </p>
            <div className="mt-8">
              <Link
                to="/"
                className="inline-flex items-center gap-2 px-8 py-4 bg-indigo-600 hover:bg-indigo-700 text-white font-black text-xs uppercase tracking-wider rounded-2xl transition shadow-indigo hover:shadow-lg hover:-translate-y-0.5"
              >
                <span>🔥 Khám Phá Sản Phẩm Ngay</span>
              </Link>
            </div>
          </div>
        ) : (
          /* ── TH2: Giỏ hàng có sản phẩm ── */
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-start">
            {/* Cột trái: Danh sách sản phẩm (lg:col-span-8) */}
            <div className="lg:col-span-8 space-y-4">
              <div className="bg-white rounded-3xl border border-slate-200/80 overflow-hidden shadow-sm">
                <div className="hidden sm:grid grid-cols-12 gap-4 px-6 py-4 bg-slate-50/80 border-b border-slate-200 text-xs font-bold text-slate-500 uppercase tracking-wider">
                  <div className="col-span-6">Sản phẩm</div>
                  <div className="col-span-2 text-center">Đơn giá</div>
                  <div className="col-span-2 text-center">Số lượng</div>
                  <div className="col-span-2 text-right">Tạm tính</div>
                </div>

                <div className="divide-y divide-slate-100">

                  {cart.map((item, idx) => {
                    const prod = item.product || {};
                    const imgUrl = toSrc(prod.image || prod.urlAnhChinh || '');
                    const itemTotal = (Number(prod.price) || 0) * (Number(item.qty) || 1);

                    return (
                        <div
                            key={`${prod.id}-${item.size}-${item.color}-${idx}`}
                            className="
        grid grid-cols-1
        sm:grid-cols-[minmax(0,1fr)_auto]
        lg:grid-cols-12
        gap-4 lg:gap-3
        p-4 sm:p-5 lg:p-6
        border-b border-slate-100
        hover:bg-slate-50/60
        transition-colors
      "
                        >
                          {/* Thông tin sản phẩm */}
                          <div className="lg:col-span-6 flex items-start gap-3 sm:gap-4 min-w-0">
                            <Link
                                to={prod.id ? `/san-pham/${prod.id}` : '#'}
                                className="
            w-20 h-20 sm:w-24 sm:h-24
            shrink-0 overflow-hidden
            rounded-xl sm:rounded-2xl
            bg-slate-100 border border-slate-200
            group
          "
                            >
                              {imgUrl ? (
                                  <img
                                      src={imgUrl}
                                      alt={prod.name || prod.tenSanPham || 'Sản phẩm'}
                                      className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                                  />
                              ) : (
                                  <div className="w-full h-full flex items-center justify-center text-slate-300 text-3xl">
                                    👟
                                  </div>
                              )}
                            </Link>

                            <div className="flex-1 min-w-0">
                              {prod.brand && (
                                  <span className="text-[10px] font-bold text-violet-600 uppercase tracking-widest block mb-1">
              {prod.brand}
            </span>
                              )}

                              <Link
                                  to={prod.id ? `/san-pham/${prod.id}` : '#'}
                                  className="font-bold text-sm sm:text-base text-slate-900 hover:text-indigo-600 line-clamp-2 break-words leading-snug"
                              >
                                {prod.name || prod.tenSanPham || 'Giày Sneaker'}
                              </Link>

                              <div className="flex flex-wrap items-center gap-2 mt-2 text-xs text-slate-500">
            <span className="px-2 py-1 rounded-lg bg-slate-100 text-slate-700 font-bold border border-slate-200">
              Size: {item.size}
            </span>

                                {item.color && (
                                    <span className="px-2 py-1 rounded-lg bg-slate-100 text-slate-700 font-medium border border-slate-200 max-w-full truncate">
                Màu: {item.color}
              </span>
                                )}
                              </div>

                              {/* Xóa trên mobile */}
                              <button
                                  onClick={() => removeFromCart(idx)}
                                  className="lg:hidden text-xs font-semibold text-red-500 hover:text-red-700 mt-3"
                              >
                                ✕ Xóa sản phẩm
                              </button>
                            </div>
                          </div>

                          {/* Khu vực giá, số lượng và thành tiền */}
                          <div className="
        grid grid-cols-2 gap-3
        sm:grid-cols-2
        lg:col-span-6 lg:grid-cols-6
        items-center
        min-w-0
      ">
                            {/* Đơn giá */}
                            <div className="lg:col-span-2 flex lg:flex-col justify-between lg:justify-center lg:items-center gap-1 min-w-0">
          <span className="text-xs text-slate-500 font-medium lg:hidden">
            Đơn giá
          </span>
                              <span className="font-bold text-sm text-slate-700 whitespace-nowrap">
            {formatVND(prod.price)}
          </span>
                            </div>

                            {/* Số lượng */}
                            <div className="lg:col-span-2 flex flex-col items-end lg:items-center gap-1">
          <span className="text-xs text-slate-500 font-medium lg:hidden">
            Số lượng
          </span>

                              <div className="inline-flex items-center border border-slate-200 rounded-xl bg-slate-50 p-0.5 shrink-0">
                                <button
                                    onClick={() => updateQty(idx, -1)}
                                    className="w-8 h-8 rounded-lg bg-white hover:bg-slate-100 text-slate-700 font-bold flex items-center justify-center shadow-sm"
                                    title="Giảm số lượng"
                                >
                                  -
                                </button>

                                <span className="w-9 text-center font-bold text-xs text-slate-900 tabular-nums">
              {item.qty}
            </span>

                                <button
                                    onClick={() => updateQty(idx, 1)}
                                    className="w-8 h-8 rounded-lg bg-white hover:bg-slate-100 text-slate-700 font-bold flex items-center justify-center shadow-sm"
                                    title="Tăng số lượng"
                                >
                                  +
                                </button>
                              </div>
                            </div>

                            {/* Thành tiền */}
                            <div className="col-span-2 lg:col-span-2 flex justify-between lg:justify-end items-center gap-2 min-w-0">
          <span className="text-xs text-slate-500 font-medium lg:hidden">
            Thành tiền
          </span>

                              <div className="flex items-center gap-2 min-w-0">
            <span className="font-black text-sm sm:text-base text-amber-600 whitespace-nowrap">
              {formatVND(itemTotal)}
            </span>

                                {/* Xóa trên desktop */}
                                <button
                                    onClick={() => removeFromCart(idx)}
                                    className="hidden lg:flex shrink-0 w-8 h-8 rounded-xl bg-slate-100 hover:bg-red-50 hover:text-red-600 text-slate-400 items-center justify-center font-bold transition text-xs"
                                    title="Xóa khỏi giỏ"
                                >
                                  ✕
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                    );
                  })}

                </div>
              </div>

              {/* Nút quay lại mua sắm */}
              <div className="flex justify-between items-center pt-2">
                <Link
                  to="/"
                  className="inline-flex items-center gap-2 text-xs font-bold text-indigo-600 hover:text-indigo-800 transition py-2"
                >
                  <span>←</span>
                  <span>Tiếp tục khám phá sản phẩm khác</span>
                </Link>
              </div>
            </div>

            {/* Cột phải: Tóm tắt đơn hàng (lg:col-span-4) */}
            <div className="lg:col-span-4 space-y-6 lg:sticky lg:top-24">
              <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-sm space-y-5">
                <h2 className="text-base font-black text-slate-900 uppercase tracking-wide border-b border-slate-100 pb-3 flex items-center gap-2">
                  <span>🧾 TÓM TẮT ĐƠN HÀNG</span>
                </h2>

                {/* Form Voucher */}
                <form onSubmit={handleApplyVoucher} className="space-y-2">
                  <label className="block text-xs font-bold text-slate-700">Mã giảm giá / Voucher</label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Nhập mã (KICKS100K, VIBEFLOW50K)"
                      value={voucherCode}
                      onChange={(e) => setVoucherCode(e.target.value)}
                      className="flex-1 bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-indigo-500 focus:bg-white transition uppercase font-semibold"
                    />
                    <button
                      type="submit"
                      className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-black text-xs rounded-xl transition shadow-sm"
                    >
                      Áp dụng
                    </button>
                  </div>

                  {voucherFeedback && (
                    <div
                      className={`text-xs p-2.5 rounded-xl font-bold ${
                        voucherFeedback.success
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : 'bg-red-50 text-red-600 border border-red-200'
                      }`}
                    >
                      {voucherFeedback.message}
                    </div>
                  )}

                  <div className="text-[11px] text-slate-400 bg-slate-50 p-2.5 rounded-xl border border-slate-200/60 leading-relaxed">
                    💡 <b>Gợi ý:</b> Nhập mã <code className="text-indigo-600 font-bold">KICKS100K</code> giảm 100.000₫ cho đơn từ 2 triệu.
                  </div>
                </form>

                <hr className="border-slate-100" />

                {/* Bảng tính chi phí */}
                <div className="space-y-3 text-xs">
                  <div className="flex justify-between text-slate-600">
                    <span>Tạm tính ({itemCount} món):</span>
                    <span className="font-bold text-slate-800">{formatVND(subtotal)}</span>
                  </div>

                  {discountAmount > 0 && (
                    <div className="flex justify-between text-emerald-600 font-bold">
                      <span>Giảm giá voucher:</span>
                      <span>−{formatVND(discountAmount)}</span>
                    </div>
                  )}

                  <div className="flex justify-between text-slate-600">
                    <span>Phí vận chuyển:</span>
                    <span className="font-bold text-emerald-600">Miễn phí (Freeship)</span>
                  </div>

                  <hr className="border-slate-100" />

                  <div className="flex justify-between items-baseline pt-1">
                    <div>
                      <span className="text-sm font-black text-slate-900 block">Tổng thanh toán:</span>
                      <span className="text-[11px] text-slate-400">Đã bao gồm thuế VAT</span>
                    </div>
                    <span className="text-2xl font-black text-amber-600 tracking-tight">
                      {formatVND(total)}
                    </span>
                  </div>
                </div>

                {/* CTA Đặt Hàng */}
                <button
                  type="button"
                  onClick={handleCheckoutClick}
                  className="w-full py-4 bg-indigo-600 hover:bg-indigo-700 text-white font-black uppercase text-xs rounded-2xl transition shadow-indigo hover:shadow-lg flex items-center justify-center gap-2 group cursor-pointer"
                >
                  <span>Tiến Hành Đặt Hàng</span>
                  <span className="group-hover:translate-x-1 transition-transform">➔</span>
                </button>

                {/* Cam kết chất lượng */}
                <div className="pt-2 border-t border-slate-100 space-y-2">
                  <div className="flex items-center gap-2 text-[11px] text-slate-500">
                    <span>🛡️</span>
                    <span>100% Giày chính hãng, fullbox tem tag</span>
                  </div>
                  <div className="flex items-center gap-2 text-[11px] text-slate-500">
                    <span>🔄</span>
                    <span>Đổi size miễn phí trong vòng 7 ngày</span>
                  </div>
                  <div className="flex items-center gap-2 text-[11px] text-slate-500">
                    <span>📦</span>
                    <span>Được kiểm tra hàng trước khi thanh toán</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* ── Footer ── */}
      <Footer
        onSelectTab={() => navigate('/')}
        onSelectBrand={() => navigate('/')}
        onOpenSizeChart={() => {}}
      />

      {/* ── Modal Thanh Toán ── */}
      {isCheckoutOpen && (
        <CheckoutModal
          session={session}
          total={total}
          onClose={() => setIsCheckoutOpen(false)}
          onSubmit={handlePlaceOrder}
        />
      )}
    </div>
  );
}


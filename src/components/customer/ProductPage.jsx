import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { useCartStore, useAuthStore } from '../../store';
import { formatVND, toSrc } from './utils';
import Footer from '../Footer';
import StoreHeader from './components/StoreHeader';
import useMenuData from './hooks/useMenuData';
import SizeChartModal from './components/modals/SizeChartModal';
import ImageSlider from './components/ImageSlider';

const BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';

// ── Skeleton ──────────────────────────────────────────────────────────────────
function Skeleton({ cls }) {
  return <div className={`animate-pulse bg-slate-100 rounded-xl ${cls}`} />;
}

export default function ProductPage() {
  const { id }   = useParams();
  const navigate = useNavigate();
  const { menu } = useMenuData();

  // Auth Store
  const session = useAuthStore((s) => s.session);
  const logout  = useAuthStore((s) => s.logout);

  // Cart Store
  const itemCount = useCartStore((s) => s.itemCount);
  const addToCart = useCartStore((s) => s.addToCart);

  const [showSizeChart, setShowSizeChart] = useState(false);

  // Product data
  const [product,  setProduct]  = useState(null);
  const [images,   setImages]   = useState([]);
  const [variants, setVariants] = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [error,    setError]    = useState('');

  // Image slider
  const [activeImg, setActiveImg] = useState(0);

  // Selection
  const [selectedColor, setSelectedColor] = useState(null);
  const [selectedSize,  setSelectedSize]  = useState(null);

  // Add-to-cart feedback
  const [added, setAdded] = useState(false);

  // ── Fetch ─────────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!id) return;
    setLoading(true);
    setError('');
    setActiveImg(0);
    setSelectedColor(null);
    setSelectedSize(null);

    Promise.all([
      axios.get(`${BASE_URL}/san-pham/${id}`).then((r) => r.data),
      axios.get(`${BASE_URL}/chi-tiet-san-pham/san-pham/${id}`).then((r) => r.data).catch(() => []),
      axios.get(`${BASE_URL}/hinh-anh/san-pham/${id}`).then((r) => r.data).catch(() => []),
    ])
      .then(([prod, vars, imgs]) => {
        setProduct(prod);

        const varList = Array.isArray(vars) ? vars : [];
        const imgList = Array.isArray(imgs) ? imgs : [];

        setVariants(varList);

        // Ảnh: ưu tiên từ bảng HINH_ANH, fallback về urlAnhChinh
        if (imgList.length > 0) {
          setImages(imgList);
        } else if (prod.urlAnhChinh || prod.image) {
          setImages([{ id: 0, urlAnh: prod.urlAnhChinh ?? prod.image, tenAnh: prod.tenSanPham }]);
        }

        // Auto-select màu + size đầu tiên còn hàng
        const firstAvail = varList.find((v) => v.soLuong > 0) ?? varList[0];
        if (firstAvail) {
          setSelectedColor(firstAvail.mauSacId);
          setSelectedSize(firstAvail.kichThuocId);
        }
      })
      .catch(() => setError('Không thể tải thông tin sản phẩm. Vui lòng thử lại.'))
      .finally(() => setLoading(false));
  }, [id]);

  // ── Computed ──────────────────────────────────────────────────────────────
  const colorGroups = variants.reduce((acc, v) => {
    if (!acc[v.mauSacId]) {
      acc[v.mauSacId] = { mauSacId: v.mauSacId, tenMau: v.tenMau, maHex: v.maHex, sizes: [] };
    }
    acc[v.mauSacId].sizes.push(v);
    return acc;
  }, {});
  const colors = Object.values(colorGroups);
  const sizesOfColor = selectedColor ? (colorGroups[selectedColor]?.sizes ?? []) : [];

  const chosenVariant = variants.find(
    (v) => v.mauSacId === selectedColor && v.kichThuocId === selectedSize
  ) ?? null;

  const displayPrice    = chosenVariant?.giaBanHieuLuc ?? chosenVariant?.giaBan ?? product?.giaBan ?? product?.price ?? 0;
  const displayOriginal = chosenVariant?.giaGocHieuLuc ?? chosenVariant?.giaGoc ?? product?.giaGoc ?? product?.originalPrice ?? 0;
  const displayStock    = chosenVariant?.soLuong ?? null;
  const totalStock      = variants.reduce((s, v) => s + (v.soLuong || 0), 0);
  const canAdd          = !!chosenVariant && (displayStock === null || displayStock > 0);

  const mainSrc = images.length > 0
    ? toSrc(images[activeImg]?.urlAnh)
    : toSrc(product?.urlAnhChinh || product?.image || '');

  const discountPct = Number(displayOriginal) > Number(displayPrice) && Number(displayOriginal) > 0
    ? Math.round((1 - Number(displayPrice) / Number(displayOriginal)) * 100)
    : 0;

  // ── Handlers ─────────────────────────────────────────────────────────────
  const handleAdd = () => {
    // Bắt buộc phải đăng nhập mới thêm được vào giỏ hàng
    if (!session) {
      alert('⚠️ Vui lòng đăng nhập để thêm sản phẩm vào giỏ hàng!');
      navigate('/login', { state: { from: `/san-pham/${id}` } });
      return;
    }
    if (!canAdd || !product) return;
      console.log(chosenVariant)
    addToCart(
      {
        ...product,
        id:            product.id,
        name:          product.tenSanPham ?? product.name,
        price:         displayPrice,
        image:         mainSrc,
        brand:         product.brand ?? '',
        variantId:     chosenVariant.id,
        maChiTiet:     chosenVariant.maChiTiet,
        selectedColor: colorGroups[selectedColor]?.tenMau,
      },
      chosenVariant.tenKichThuoc
    );
    setAdded(true);
    setTimeout(() => setAdded(false), 3000);
  };

  const handleBuyNow = () => {
    // Bắt buộc phải đăng nhập mới mua hàng
      console.log("150")
    if (!session) {
      alert('⚠️ Vui lòng đăng nhập để mua hàng!');
      navigate('/login', { state: { from: `/san-pham/${id}` } });
      return;
    }

    if (!canAdd || !product) return;
      console.log("157")
    addToCart(
      {
        ...product,
        id:            product.id,
        name:          product.tenSanPham ?? product.name,
        price:         displayPrice,
        image:         mainSrc,
        brand:         product.brand ?? '',
        variantId:     chosenVariant.id,
        maChiTiet:     chosenVariant.maChiTiet,
        selectedColor: colorGroups[selectedColor]?.tenMau,
      },
      chosenVariant.tenKichThuoc
    );
    navigate('/gio-hang');
  };

  const handleNavigate = (item) => {
    if (item.tab) {
      navigate('/', { state: { activeTab: item.tab } });
    } else {
      navigate('/', { state: { filter: item.filter } });
    }
  };

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div className="bg-slate-50 min-h-screen flex flex-col text-slate-900">
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
        onOpenCart={() => navigate('/gio-hang')}
      />

      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 py-8">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-xs text-slate-400 mb-6">
          <Link to="/" className="hover:text-indigo-600 transition">Trang chủ</Link>
          <span>/</span>
          <Link to="/" className="hover:text-indigo-600 transition">Sản phẩm</Link>
          {product && (
            <>
              <span>/</span>
              <span className="text-slate-700 font-medium line-clamp-1 max-w-xs">
                {product.tenSanPham ?? product.name}
              </span>
            </>
          )}
        </nav>

        {/* Error */}
        {error && (
          <div className="p-6 rounded-2xl bg-red-50 border border-red-200 text-red-600 text-sm text-center">
            ⚠️ {error}
            <button onClick={() => navigate(-1)} className="ml-4 underline hover:text-red-800">Quay lại</button>
          </div>
        )}

        {/* Main grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16">

          {/* ════════ CỘT ẢNH (SLIDER VÀ LIGHTBOX) ════════ */}
          <div>
            <ImageSlider
              images={images}
              loading={loading}
              altText={product?.tenSanPham ?? product?.name ?? 'Sản phẩm'}
              active={activeImg}
              onChange={setActiveImg}
              badges={
                <>
                  {(product?.flashSale || product?.isFlashSale) && (
                    <span className="bg-red-500 text-white text-xs font-black px-3 py-1 rounded-full shadow">
                      🔥 FLASH SALE {discountPct > 0 ? `−${discountPct}%` : ''}
                    </span>
                  )}
                  {discountPct > 0 && !product?.flashSale && !product?.isFlashSale && (
                    <span className="bg-indigo-600 text-white text-xs font-black px-3 py-1 rounded-full shadow">
                      −{discountPct}%
                    </span>
                  )}
                </>
              }
            />
          </div>

          {/* ════════ CỘT THÔNG TIN ════════ */}
          <div className="space-y-6">

            {loading ? (
              <div className="space-y-4">
                <Skeleton cls="h-5 w-1/4" />
                <Skeleton cls="h-8 w-3/4" />
                <Skeleton cls="h-10 w-1/3" />
                <Skeleton cls="h-4 w-full" />
                <Skeleton cls="h-4 w-full" />
              </div>
            ) : product ? (
              <>
                {/* Brand + tên */}
                <div>
                  <span className="text-xs font-bold text-violet-600 uppercase tracking-widest">
                    {product.brand ?? ''}
                  </span>
                  <h1 className="mt-1 text-2xl sm:text-3xl font-black text-slate-900 leading-snug">
                    {product.tenSanPham ?? product.name}
                  </h1>
                </div>

                {/* Giá */}
                <div className="flex items-baseline gap-3">
                  <span className="text-3xl font-black text-amber-600">{formatVND(displayPrice)}</span>
                  {Number(displayOriginal) > Number(displayPrice) && (
                    <span className="text-lg text-slate-400 line-through">{formatVND(displayOriginal)}</span>
                  )}
                  {discountPct > 0 && (
                    <span className="px-2 py-0.5 rounded-full bg-red-50 text-red-500 text-xs font-black border border-red-200">
                      −{discountPct}%
                    </span>
                  )}
                </div>

                {/* Tồn kho tổng */}
                <div>
                  <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${
                    totalStock === 0
                      ? 'bg-red-50 text-red-500 border-red-200'
                      : totalStock <= 10
                      ? 'bg-amber-50 text-amber-600 border-amber-200'
                      : 'bg-emerald-50 text-emerald-600 border-emerald-200'
                  }`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${
                      totalStock === 0 ? 'bg-red-400' : totalStock <= 10 ? 'bg-amber-400' : 'bg-emerald-400'
                    }`} />
                    {totalStock === 0 ? 'Hết hàng' : `Còn ${totalStock} đôi trong kho`}
                  </span>
                </div>

                <hr className="border-slate-100" />

                {/* Chọn màu */}
                {colors.length > 0 && (
                  <div>
                    <p className="text-sm font-bold text-slate-700 mb-3">
                      Màu sắc:{' '}
                      <span className="font-black text-slate-900">
                        {colorGroups[selectedColor]?.tenMau ?? '—'}
                      </span>
                    </p>
                    <div className="flex flex-wrap gap-3">
                      {colors.map((c) => {
                        const hasStock = c.sizes.some((s) => s.soLuong > 0);
                        return (
                          <button
                            key={c.mauSacId}
                            onClick={() => {
                              setSelectedColor(c.mauSacId);
                              const first = c.sizes.find((s) => s.soLuong > 0) ?? c.sizes[0];
                              setSelectedSize(first?.kichThuocId ?? null);
                            }}
                            title={c.tenMau}
                            className={`relative w-10 h-10 rounded-full border-[3px] transition ${
                              !hasStock ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer'
                            } ${
                              selectedColor === c.mauSacId
                                ? 'border-indigo-600 scale-110 shadow-lg shadow-indigo-200'
                                : 'border-white shadow hover:scale-105'
                            }`}
                            style={{ backgroundColor: c.maHex ?? '#e2e8f0' }}
                          >
                            {!hasStock && (
                              <span className="absolute inset-0 flex items-center justify-center">
                                <span className="w-0.5 h-8 bg-slate-400 rotate-45 absolute rounded-full" />
                              </span>
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Chọn size */}
                {sizesOfColor.length > 0 && (
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <p className="text-sm font-bold text-slate-700">
                        Kích cỡ:{' '}
                        <span className="font-black text-slate-900">
                          {variants.find((v) => v.kichThuocId === selectedSize)?.tenKichThuoc ?? '—'}
                        </span>
                      </p>
                      <button
                        onClick={() => setShowSizeChart(true)}
                        className="text-xs text-indigo-600 hover:text-indigo-800 font-semibold underline underline-offset-2"
                      >
                        📐 Bảng size chuẩn
                      </button>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {sizesOfColor.map((v) => {
                        const out = v.soLuong === 0;
                        return (
                          <button
                            key={v.kichThuocId}
                            onClick={() => !out && setSelectedSize(v.kichThuocId)}
                            disabled={out}
                            title={out ? 'Hết hàng' : `Còn ${v.soLuong} đôi`}
                            className={`w-13 h-12 px-3 rounded-xl text-sm font-bold border-2 transition ${
                              selectedSize === v.kichThuocId
                                ? 'bg-indigo-600 text-white border-indigo-600 shadow-md shadow-indigo-100'
                                : out
                                ? 'bg-slate-50 text-slate-300 border-slate-100 cursor-not-allowed line-through'
                                : 'bg-white text-slate-700 border-slate-200 hover:border-indigo-400 hover:text-indigo-700'
                            }`}
                          >
                            {v.tenKichThuoc}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Tồn kho variant đang chọn */}
                {chosenVariant && displayStock !== null && (
                  <p className="text-xs text-slate-400">
                    Size này còn:{' '}
                    <span className={`font-bold ${displayStock === 0 ? 'text-red-500' : 'text-emerald-600'}`}>
                      {displayStock === 0 ? 'Hết hàng' : `${displayStock} đôi`}
                    </span>
                  </p>
                )}

                {/* Thông báo thêm vào giỏ thành công */}
                {added && (
                  <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center justify-between text-xs text-emerald-900 animate-in fade-in">
                    <span className="font-bold flex items-center gap-1.5">
                      <span className="text-emerald-600 font-black">✓</span> Đã thêm sản phẩm vào giỏ hàng!
                    </span>
                    <Link
                      to="/gio-hang"
                      className="font-black text-indigo-600 hover:text-indigo-800 underline underline-offset-2 flex items-center gap-1"
                    >
                      <span>Xem giỏ hàng</span>
                      <span>➔</span>
                    </Link>
                  </div>
                )}

                {/* Nút hành động */}
                <div className="flex flex-col sm:flex-row gap-3 pt-2">
                  <button
                    onClick={handleAdd}
                    disabled={!canAdd}
                    className={`flex-1 py-4 rounded-2xl text-sm font-black uppercase tracking-wide transition shadow-sm ${
                      added
                        ? 'bg-emerald-500 text-white shadow-emerald-200'
                        : canAdd
                        ? 'bg-white border-2 border-indigo-600 text-indigo-600 hover:bg-indigo-50 cursor-pointer'
                        : 'bg-slate-100 text-slate-400 cursor-not-allowed border-2 border-slate-200'
                    }`}
                  >
                    {added ? '✓ Đã thêm vào giỏ' : '🛒 Thêm vào giỏ hàng'}
                  </button>
                  <button
                    onClick={handleBuyNow}
                    disabled={!canAdd}
                    className="flex-1 py-4 rounded-2xl text-sm font-black uppercase tracking-wide bg-indigo-600 hover:bg-indigo-700 text-white transition shadow-indigo disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                  >
                    Mua Ngay ➔
                  </button>
                </div>

                {/* Cam kết */}
                <div className="grid grid-cols-2 gap-2 pt-2">
                  {[
                    { icon: '✅', text: '100% chính hãng' },
                    { icon: '🔄', text: 'Đổi size 7 ngày' },
                    { icon: '📦', text: 'Kiểm tra trước khi nhận' },
                    { icon: '🛡️', text: 'Bảo hành 6 tháng' },
                  ].map((u) => (
                    <div key={u.text} className="flex items-center gap-2 text-xs text-slate-500">
                      <span>{u.icon}</span>
                      <span>{u.text}</span>
                    </div>
                  ))}
                </div>

                {/* Mô tả */}
                {product.moTa && (
                  <div className="pt-2 border-t border-slate-100">
                    <h3 className="text-sm font-bold text-slate-700 mb-2">Mô tả sản phẩm</h3>
                    <p className="text-sm text-slate-600 leading-relaxed whitespace-pre-line">
                      {product.moTa}
                    </p>
                  </div>
                )}

                {/* Thông tin thêm */}
                <div className="pt-2 border-t border-slate-100 grid grid-cols-2 gap-3 text-xs text-slate-500">
                  <div>
                    <span className="font-bold text-slate-600 block mb-0.5">Mã sản phẩm</span>
                    <span className="font-mono text-slate-700">{product.maSanPham ?? '—'}</span>
                  </div>
                  {product.brand && (
                    <div>
                      <span className="font-bold text-slate-600 block mb-0.5">Thương hiệu</span>
                      <span className="text-slate-700">{product.brand}</span>
                    </div>
                  )}
                </div>
              </>
            ) : null}
          </div>
        </div>
      </main>

      <Footer
        onSelectTab={() => navigate('/')}
        onSelectBrand={() => navigate('/')}
        onOpenSizeChart={() => setShowSizeChart(true)}
      />

      {/* Size Chart */}
      {showSizeChart && <SizeChartModal onClose={() => setShowSizeChart(false)} />}
    </div>
  );
}

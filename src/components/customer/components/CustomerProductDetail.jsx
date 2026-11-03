import { useState, useEffect } from 'react';
import axios from 'axios';
import { formatVND, toSrc } from '../utils';
import ImageSlider from './ImageSlider';

const BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';

/**
 * Chi tiết sản phẩm dành cho khách hàng — chỉ xem, không cần đăng nhập.
 *
 * Hiển thị: ảnh, tên, thương hiệu, mô tả, giá, toàn bộ màu sắc & size còn hàng.
 * Không có: upload ảnh, giá nhập/vốn, thao tác quản trị.
 *
 * Props:
 *   product   — object sản phẩm (từ API /san-pham/hot hoặc /san-pham/public)
 *   onClose   — đóng modal
 *   onAddToCart(product, size) — thêm vào giỏ (tuỳ chọn)
 *   onOpenSizeChart — mở bảng size (tuỳ chọn)
 */
export default function CustomerProductDetail({ product, onClose, onAddToCart, onOpenSizeChart }) {
  const [variants, setVariants]         = useState([]);
  const [images, setImages]             = useState([]);
  const [activeImg, setActiveImg]       = useState(0);
  const [loading, setLoading]           = useState(true);
  const [error, setError]               = useState('');
  const [selectedColor, setSelectedColor] = useState(null);
  const [selectedSize, setSelectedSize]   = useState(null);

  // ── Fetch chi tiết biến thể & ảnh khi mở ──────────────────────────────────
  useEffect(() => {
    if (!product?.id) return;
    setLoading(true);
    setError('');

    Promise.all([
      axios.get(`${BASE_URL}/chi-tiet-san-pham/san-pham/${product.id}`).then((r) => r.data),
      axios.get(`${BASE_URL}/hinh-anh/san-pham/${product.id}`).then((r) => r.data).catch(() => []),
    ])
      .then(([varData, imgData]) => {
        const vars = Array.isArray(varData) ? varData : [];
        const imgs = Array.isArray(imgData) ? imgData : [];

        setVariants(vars);
        setImages(imgs);
        setActiveImg(0);

        if (vars.length > 0) {
          setSelectedColor(vars[0].mauSacId);
          setSelectedSize(vars[0].kichThuocId);
        }
      })
      .catch(() => setError('Không thể tải thông tin sản phẩm. Vui lòng thử lại.'))
      .finally(() => setLoading(false));
  }, [product?.id]);

  if (!product) return null;

  // ── Computed values ───────────────────────────────────────────────────────
  const displayName  = product.tenSanPham ?? product.name  ?? '';
  const displayBrand = product.brand       ?? '';
  const displayDesc  = product.moTa        ?? '';

  // Nhóm variant theo màu
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

  const displayPrice = chosenVariant?.giaBanHieuLuc
    ?? chosenVariant?.giaBan
    ?? product?.giaBan
    ?? product?.price
    ?? 0;

  const displayOriginal = chosenVariant?.giaGocHieuLuc
    ?? chosenVariant?.giaGoc
    ?? product?.giaGoc
    ?? product?.originalPrice
    ?? 0;

  const displayStock = chosenVariant?.soLuong ?? null;

  // Ảnh hiển thị: ưu tiên từ bảng HINH_ANH, fallback về urlAnhChinh/image của sản phẩm
  const allImages = images.length > 0
    ? images
    : (product?.urlAnhChinh || product?.image
        ? [{ id: 0, urlAnh: product.urlAnhChinh || product.image, tenAnh: displayName }]
        : []);
  const mainSrc = allImages.length > 0
    ? toSrc(allImages[activeImg]?.urlAnh || allImages[0]?.urlAnh)
    : '';

  const canAdd = !!onAddToCart && chosenVariant && (displayStock === null || displayStock > 0);

  const handleAdd = () => {
    if (!canAdd) return;
    onAddToCart(
      {
        ...product,
        id:            product.id,
        name:          displayName,
        price:         displayPrice,
        image:         mainSrc,
        brand:         displayBrand,
        variantId:     chosenVariant.id,
        maChiTiet:     chosenVariant.maChiTiet,
        selectedColor: colorGroups[selectedColor]?.tenMau,
      },
      chosenVariant.tenKichThuoc
    );
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
      <div
        className="bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start justify-between px-6 py-4 border-b border-slate-100 sticky top-0 bg-white z-10">
          <div>
            <span className="text-[10px] font-bold uppercase text-violet-500 tracking-widest">{displayBrand}</span>
            <h3 className="font-black text-sm text-slate-900 mt-0.5 leading-snug max-w-sm">{displayName}</h3>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-800 flex items-center justify-center font-bold transition flex-shrink-0 ml-4"
          >
            ✕
          </button>
        </div>

        <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">

          {/* ── Cột ảnh (Slider) ── */}
          <div>
            <ImageSlider
              images={allImages}
              loading={loading}
              altText={displayName}
              active={activeImg}
              onChange={setActiveImg}
              badges={
                (product.flashSale || product.isFlashSale) ? (
                  <span className="bg-red-500 text-white text-[10px] font-black px-2.5 py-1 rounded-full shadow">
                    🔥 FLASH SALE
                  </span>
                ) : null
              }
            />

            {/* Tổng tồn kho */}
            {!loading && (
              <div className="flex flex-wrap gap-2 mt-3">
                {(() => {
                  const total = variants.reduce((s, v) => s + (v.soLuong || 0), 0);
                  return (
                    <span className={`px-3 py-1 rounded-full font-bold text-xs ${
                      total === 0 ? 'bg-red-50 text-red-500 border border-red-200'
                        : total <= 10 ? 'bg-amber-50 text-amber-600 border border-amber-200'
                        : 'bg-emerald-50 text-emerald-600 border border-emerald-200'
                    }`}>
                      {total === 0 ? 'Hết hàng' : `Còn ${total} đôi`}
                    </span>
                  );
                })()}
              </div>
            )}
          </div>

          {/* ── Cột thông tin ── */}
          <div className="space-y-4 text-sm">

            {/* Giá */}
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-black text-amber-600">{formatVND(displayPrice)}</span>
              {Number(displayOriginal) > Number(displayPrice) && (
                <span className="text-base text-slate-400 line-through">{formatVND(displayOriginal)}</span>
              )}
            </div>

            {/* Loading skeleton */}
            {loading && (
              <div className="space-y-3 animate-pulse">
                <div className="h-3 bg-slate-100 rounded w-1/3" />
                <div className="flex gap-2">
                  {[1,2,3].map((i) => <div key={i} className="w-8 h-8 rounded-full bg-slate-100" />)}
                </div>
                <div className="h-3 bg-slate-100 rounded w-1/4 mt-2" />
                <div className="flex gap-2">
                  {[1,2,3,4].map((i) => <div key={i} className="w-11 h-11 rounded-xl bg-slate-100" />)}
                </div>
              </div>
            )}

            {/* Error */}
            {error && (
              <div className="p-3 rounded-xl bg-red-50 border border-red-100 text-red-500 text-xs flex items-center gap-2">
                <span>⚠️</span><span>{error}</span>
              </div>
            )}

            {/* Chọn màu */}
            {!loading && colors.length > 0 && (
              <div>
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-2">
                  Màu sắc
                  {selectedColor && (
                    <span className="ml-2 text-slate-800 normal-case">
                      — {colorGroups[selectedColor]?.tenMau}
                    </span>
                  )}
                </p>
                <div className="flex flex-wrap gap-2">
                  {colors.map((c) => (
                    <button
                      key={c.mauSacId}
                      onClick={() => {
                        setSelectedColor(c.mauSacId);
                        setSelectedSize(c.sizes[0]?.kichThuocId ?? null);
                      }}
                      title={c.tenMau}
                      className={`w-9 h-9 rounded-full border-[3px] transition ${
                        selectedColor === c.mauSacId
                          ? 'border-indigo-500 scale-110 shadow-md'
                          : 'border-slate-200 hover:border-slate-400'
                      }`}
                      style={{ backgroundColor: c.maHex ?? '#e2e8f0' }}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Chọn size */}
            {!loading && sizesOfColor.length > 0 && (
              <div>
                <div className="flex justify-between items-center mb-2">
                  <p className="text-xs font-bold text-slate-500 uppercase tracking-wide">
                    Kích cỡ
                    {selectedSize && (
                      <span className="ml-2 text-slate-800 normal-case">
                        — {variants.find((v) => v.kichThuocId === selectedSize)?.tenKichThuoc}
                      </span>
                    )}
                  </p>
                  {onOpenSizeChart && (
                    <button
                      onClick={onOpenSizeChart}
                      className="text-indigo-500 hover:text-indigo-700 text-[11px] font-semibold underline"
                    >
                      Bảng size
                    </button>
                  )}
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {sizesOfColor.map((v) => {
                    const out = v.soLuong === 0;
                    return (
                      <button
                        key={v.kichThuocId}
                        onClick={() => !out && setSelectedSize(v.kichThuocId)}
                        disabled={out}
                        title={out ? 'Hết hàng' : `Còn ${v.soLuong} đôi`}
                        className={`w-11 h-11 rounded-xl text-xs font-bold border transition ${
                          selectedSize === v.kichThuocId
                            ? 'bg-indigo-600 text-white border-indigo-600 shadow'
                            : out
                            ? 'bg-slate-50 text-slate-300 border-slate-100 cursor-not-allowed line-through'
                            : 'bg-slate-50 border-slate-200 text-slate-700 hover:border-indigo-400'
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
              <p className="text-xs text-slate-500">
                Còn:{' '}
                <span className={`font-bold ${displayStock === 0 ? 'text-red-500' : 'text-emerald-600'}`}>
                  {displayStock === 0 ? 'Hết hàng' : `${displayStock} đôi`}
                </span>
              </p>
            )}

            {/* Mô tả */}
            {displayDesc && (
              <div>
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-1">Mô tả</p>
                <p className="text-slate-600 text-xs leading-relaxed">{displayDesc}</p>
              </div>
            )}

            {/* Nút thêm giỏ */}
            {onAddToCart && (
              <button
                onClick={handleAdd}
                disabled={!canAdd}
                className="w-full py-3.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-40 disabled:cursor-not-allowed text-white font-black uppercase text-xs rounded-xl transition"
              >
                {loading
                  ? 'Đang tải...'
                  : !chosenVariant
                  ? 'Chọn màu & size'
                  : displayStock === 0
                  ? 'Hết hàng'
                  : 'Thêm Vào Giỏ Hàng 🛒'}
              </button>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 pb-5 flex justify-end border-t border-slate-100 pt-4">
          <button
            onClick={onClose}
            className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition"
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
}

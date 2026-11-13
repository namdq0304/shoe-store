import { useState, useEffect } from 'react';
import axios from 'axios';
import ModalShell from './ModalShell';
import { formatVND, toSrc } from '../../utils';

const BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';

/**
 * Modal chi tiết sản phẩm — tự fetch chi tiết (size/màu/tồn kho) từ backend.
 * Không yêu cầu token (public endpoint).
 */
export default function ProductDetailModal({ product, onClose, onAddToCart, onOpenSizeChart }) {
  const [variants, setVariants]   = useState([]);   // chi tiết từ backend
  const [loading, setLoading]     = useState(true);
  const [error, setError]         = useState('');

  // Nhóm variants theo màu → size
  const [selectedColor, setSelectedColor] = useState(null);
  const [selectedSize, setSelectedSize]   = useState(null);

  // Fetch chi tiết sản phẩm (size, màu, tồn kho) khi mở modal
  useEffect(() => {
    if (!product?.id) return;
    setLoading(true);
    setError('');
    axios
      .get(`${BASE_URL}/chi-tiet-san-pham/san-pham/${product.id}`)
      .then((res) => {
        const data = Array.isArray(res.data) ? res.data : [];
        setVariants(data);

        // Tự động chọn màu và size đầu tiên
        if (data.length > 0) {
          setSelectedColor(data[0].mauSacId);
          setSelectedSize(data[0].kichThuocId);
        }
      })
      .catch((err) => {
        console.error('ProductDetailModal fetch variants:', err);
        setError('Không thể tải thông tin size/màu. Vui lòng thử lại.');
      })
      .finally(() => setLoading(false));
  }, [product?.id]);

  // Nhóm theo màu
  const colorGroups = variants.reduce((acc, v) => {
    if (!acc[v.mauSacId]) {
      acc[v.mauSacId] = { mauSacId: v.mauSacId, tenMau: v.tenMau, maHex: v.maHex, sizes: [] };
    }
    acc[v.mauSacId].sizes.push(v);
    return acc;
  }, {});
  const colors = Object.values(colorGroups);

  // Sizes của màu đang chọn
  const sizesOfColor = selectedColor ? (colorGroups[selectedColor]?.sizes ?? []) : [];

  // Variant đang chọn (để lấy giá, tồn kho)
  const chosenVariant = variants.find(
    (v) => v.mauSacId === selectedColor && v.kichThuocId === selectedSize
  ) ?? null;

  const displayPrice = chosenVariant?.giaBanHieuLuc
    ?? chosenVariant?.giaBan
    ?? product?.price
    ?? product?.giaBan
    ?? 0;

  const displayOriginalPrice = chosenVariant?.giaGocHieuLuc
    ?? chosenVariant?.giaGoc
    ?? product?.originalPrice
    ?? product?.giaGoc
    ?? 0;

  const displayImage = product?.urlAnhChinh ?? product?.image ?? '';
  const displayName  = product?.tenSanPham  ?? product?.name  ?? '';
  const displayBrand = product?.brand       ?? '';
  const displayStock = chosenVariant?.soLuong ?? null;

  const canAddCart = chosenVariant && (displayStock === null || displayStock > 0);

  const handleAddToCart = () => {
    if (!canAddCart) return;
    // Trả product đã chuẩn hoá để CartDrawer và useCart hoạt động đúng
    onAddToCart(
      {
        ...product,
        id:    product.id,
        name:  displayName,
        price: displayPrice,
        image: displayImage,
        brand: displayBrand,
        // Lưu thêm variantId để sau này gọi API
        variantId:    chosenVariant.id,
        maChiTiet:    chosenVariant.maChiTiet,
        selectedColor: colorGroups[selectedColor]?.tenMau,
      },
      chosenVariant.tenKichThuoc   // size label (vd "42")
    );
  };

  return (
    <ModalShell onClose={onClose} maxWidth="max-w-2xl" className="p-6 relative overflow-hidden">
      <button
        onClick={onClose}
        className="absolute top-4 right-4 text-slate-400 hover:text-slate-700 font-bold text-lg z-10"
      >
        ✕
      </button>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
        {/* Ảnh */}
        <div className="relative">
          <img
            src={toSrc(displayImage)}
            alt={displayName}
            className="rounded-2xl object-cover w-full aspect-square bg-slate-100"
          />
          {product?.isFlashSale && (
            <span className="absolute top-3 left-3 bg-red-500 text-white text-[10px] font-black px-2 py-1 rounded-lg">
              🔥 FLASH SALE
            </span>
          )}
        </div>

        {/* Thông tin */}
        <div className="space-y-4">
          <div>
            <span className="text-xs font-bold text-violet-600 uppercase tracking-wider">{displayBrand}</span>
            <h3 className="text-lg font-black text-slate-900 mt-1 leading-snug">{displayName}</h3>
          </div>

          {/* Giá */}
          <div className="flex items-baseline gap-2">
            <span className="text-xl font-black text-amber-600">{formatVND(displayPrice)}</span>
            {displayOriginalPrice > displayPrice && (
              <span className="text-sm text-slate-400 line-through">{formatVND(displayOriginalPrice)}</span>
            )}
          </div>

          {/* Loading / Error variants */}
          {loading && (
            <div className="space-y-2 animate-pulse">
              <div className="h-3 bg-slate-100 rounded w-1/3" />
              <div className="flex gap-2">
                {[1,2,3].map((i) => <div key={i} className="w-10 h-10 rounded-xl bg-slate-100" />)}
              </div>
            </div>
          )}

          {error && (
            <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-600 text-xs">
              ⚠️ {error}
            </div>
          )}

          {/* Chọn màu */}
          {!loading && colors.length > 0 && (
            <div>
              <div className="text-xs text-slate-600 font-bold mb-2">
                Màu sắc: <span className="text-slate-900">{colorGroups[selectedColor]?.tenMau ?? ''}</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {colors.map((c) => (
                  <button
                    key={c.mauSacId}
                    onClick={() => {
                      setSelectedColor(c.mauSacId);
                      // Tự động chọn size đầu tiên của màu mới
                      setSelectedSize(c.sizes[0]?.kichThuocId ?? null);
                    }}
                    title={c.tenMau}
                    className={`w-8 h-8 rounded-full border-2 transition ${
                      selectedColor === c.mauSacId
                        ? 'border-indigo-600 scale-110 shadow'
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
              <div className="flex justify-between items-center text-xs text-slate-600 mb-2">
                <span className="font-bold">
                  Kích cỡ: <span className="text-slate-900">
                    {variants.find((v) => v.kichThuocId === selectedSize)?.tenKichThuoc ?? ''}
                  </span>
                </span>
                <button onClick={onOpenSizeChart} className="text-indigo-600 underline text-[11px]">
                  Bảng size chuẩn
                </button>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {sizesOfColor.map((v) => {
                  const outOfStock = v.soLuong === 0;
                  return (
                    <button
                      key={v.kichThuocId}
                      onClick={() => !outOfStock && setSelectedSize(v.kichThuocId)}
                      disabled={outOfStock}
                      className={`w-11 h-11 rounded-xl text-xs font-bold border transition relative ${
                        selectedSize === v.kichThuocId
                          ? 'bg-indigo-600 text-white border-indigo-600'
                          : outOfStock
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

          {/* Tồn kho */}
          {chosenVariant && displayStock !== null && (
            <p className="text-xs text-slate-500">
              Còn lại:{' '}
              <span className={`font-bold ${displayStock === 0 ? 'text-red-500' : 'text-emerald-600'}`}>
                {displayStock === 0 ? 'Hết hàng' : `${displayStock} đôi`}
              </span>
            </p>
          )}

          {/* Nút thêm vào giỏ */}
          <button
            onClick={handleAddToCart}
            disabled={!canAddCart}
            className="w-full py-3.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-40 disabled:cursor-not-allowed text-white font-black uppercase text-xs rounded-xl transition shadow-indigo"
          >
            {loading
              ? 'Đang tải...'
              : !chosenVariant
              ? 'Chọn màu & size'
              : displayStock === 0
              ? 'Hết hàng'
              : 'Thêm Vào Giỏ Hàng 🛒'}
          </button>
        </div>
      </div>
    </ModalShell>
  );
}

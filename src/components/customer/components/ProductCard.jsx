import { useNavigate } from 'react-router-dom';
import { formatVND, toSrc } from '../utils';
import { useAuthStore } from '../../../store';

export default function ProductCard({ product, onSelect, showSaleBadge = false, onAddToCart }) {
  const navigate = useNavigate();
  const session = useAuthStore((s) => s.session);

  const handleClick = () => {
    // Nếu có id thật từ backend → navigate đến trang chi tiết
    if (product?.id) {
      navigate(`/san-pham/${product.id}`);
    } else if (onSelect) {
      // Fallback cho mock data không có id chuẩn
      onSelect(product);
    }
  };

  const handleAddToCart = (e) => {
    e.stopPropagation();
    // Bắt buộc phải đăng nhập mới thêm được vào giỏ hàng
    if (!session) {
      alert('⚠️ Vui lòng đăng nhập để thêm sản phẩm vào giỏ hàng!');
      navigate('/login', { state: { from: window.location.pathname } });
      return;
    }

    if (onAddToCart) {
      onAddToCart(product);
      return;
    }

    // Với sản phẩm giày cần chọn size & màu sắc trước khi thêm,
    // điều hướng vào trang chi tiết để khách chọn size
    if (product?.id) {
      navigate(`/san-pham/${product.id}`);
    } else if (onSelect) {
      onSelect(product);
    }
  };

  const imgSrc = product?.urlAnhChinh ?? product?.image ?? '';
  const name   = product?.tenSanPham  ?? product?.name  ?? '';
  const brand  = product?.brand       ?? '';
  const price  = product?.giaBan      ?? product?.price ?? 0;
  const orig   = product?.giaGoc      ?? product?.originalPrice ?? 0;
  const isSale = product?.flashSale   ?? product?.isFlashSale   ?? false;

  const discountPct = Number(orig) > Number(price) && Number(orig) > 0
    ? Math.round((1 - Number(price) / Number(orig)) * 100)
    : 0;

  return (
    <div
      className="bg-white border border-slate-200 rounded-2xl overflow-hidden hover:border-indigo-300 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 flex flex-col cursor-pointer group"
      onClick={handleClick}
    >
      {/* Ảnh */}
      <div className="relative aspect-square bg-slate-100 overflow-hidden">
        {imgSrc ? (
          <img
            src={toSrc(imgSrc)}
            alt={name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-slate-200 text-4xl">👟</div>
        )}

        {showSaleBadge && isSale && (
          <span className="absolute top-2 left-2 bg-red-500 text-white text-[10px] font-black px-2 py-0.5 rounded-full">
            🔥 SALE
          </span>
        )}
        {discountPct > 0 && !isSale && (
          <span className="absolute top-2 left-2 bg-indigo-600 text-white text-[10px] font-black px-2 py-0.5 rounded-full">
            −{discountPct}%
          </span>
        )}
      </div>

      {/* Thông tin */}
      <div className="p-3.5 flex flex-col flex-1">
        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{brand}</span>
        <h3 className="font-bold text-xs text-slate-800 line-clamp-2 mt-0.5 flex-1 group-hover:text-indigo-600 transition-colors">
          {name}
        </h3>
        <div className="flex items-center justify-between mt-3 pt-2.5 border-t border-slate-100 gap-1.5">
          <div className="min-w-0 flex-1">
            <span className="font-black text-sm text-amber-600">{formatVND(price)}</span>
            {Number(orig) > Number(price) && (
              <span className="block text-[10px] text-slate-400 line-through">{formatVND(orig)}</span>
            )}
          </div>

          <div className="flex items-center gap-1.5 flex-shrink-0">
            {/* Nút thêm vào giỏ hàng ngay trên card */}
            <button
              type="button"
              onClick={handleAddToCart}
              title="Thêm vào giỏ hàng"
              className="px-2.5 py-1.5 rounded-xl bg-indigo-50 hover:bg-indigo-600 text-indigo-600 hover:text-white text-xs font-bold transition flex items-center gap-1 shadow-sm"
            >
              <span>🛒</span>
              <span className="hidden sm:inline">Thêm</span>
            </button>

            <span className="px-2.5 py-1.5 rounded-xl bg-slate-100 group-hover:bg-slate-200 text-xs font-bold transition text-slate-700">
              Xem
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

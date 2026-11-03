import { BRANDS, HERO_SLIDES, USP_ITEMS } from '../constants';
import { INITIAL_PRODUCTS } from '../../../data/mockData';
import HeroSlider from './HeroSlider';
import ProductCard from './ProductCard';

const QUICK_CATEGORIES = [
  { label: 'Giày Nam',  emoji: '👟', filter: { gender: 'nam'    }, cls: 'from-sky-500 to-indigo-600' },
  { label: 'Giày Nữ',  emoji: '👠', filter: { gender: 'nu'     }, cls: 'from-pink-500 to-rose-500'  },
  { label: 'Trẻ Em',   emoji: '🧒', filter: { gender: 'tre-em' }, cls: 'from-amber-400 to-orange-500' },
  { label: 'Sale Sốc', emoji: '🔥', filter: { sale: true        }, cls: 'from-red-500 to-rose-600'  },
];

function SectionHeader({ title, onViewAll, count }) {
  return (
    <div className="flex justify-between items-center mb-6">
      <h2 className="text-xl font-black uppercase text-slate-900 flex items-center space-x-2">
        <span className="text-violet-500">⚡</span>
        <span>{title}</span>
      </h2>
      <button onClick={onViewAll} className="text-xs text-indigo-600 hover:underline font-bold">
        Xem tất cả{count ? ` (${count} mẫu)` : ''} ➔
      </button>
    </div>
  );
}

/**
 * Chuẩn hoá sản phẩm từ backend (field tiếng Việt) sang format
 * mà ProductCard đang dùng (field tiếng Anh của mock data).
 * Khi backend đã trả đúng field ProductCard cần, hàm này có thể bỏ đi.
 */
export function normalizeProduct(p) {
  if (!p) return p;
  return {
    ...p,
    // ProductCard dùng p.name, p.price, p.image, p.brand, p.isFlashSale
    name:       p.tenSanPham   ?? p.name,
    price:      Number(p.giaBan ?? p.price ?? 0),
    image:      p.urlAnhChinh  ?? p.image  ?? '',
    brand:      p.tenThuongHieu ?? p.brand ?? '',
    isFlashSale: p.flashSale   ?? p.isFlashSale ?? false,
    originalPrice: Number(p.giaGoc ?? p.originalPrice ?? 0),
    // Thêm tongBan để hiển thị số lượng bán nếu muốn
    tongBan:    p.tongBan      ?? 0,
  };
}

export default function HomeView({ onNavigate, onSelectProduct, hotProducts = [], hotLoading = false ,
                                     products,
                                     loading
                                 }) {
  // Fallback về mock data nếu backend chưa trả về
  const hot    = hotProducts.map(normalizeProduct);
  // Flash sale: ưu tiên từ hot (đã sắp xếp bán chạy), lọc những cái có isFlashSale
  const flashSale = hot.filter((p) => p.isFlashSale).slice(0, 4);

  const goAll = () => onNavigate({ filter: {} });

  return (
    <div className="space-y-12">
      <HeroSlider slides={HERO_SLIDES} onNavigate={onNavigate} />

      {/* Cam kết */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {USP_ITEMS.map((u) => (
          <div key={u.title} className="bg-white border border-slate-200 rounded-2xl p-4 flex items-start space-x-3">
            <span className="text-xl">{u.icon}</span>
            <div>
              <div className="text-xs font-black text-slate-800">{u.title}</div>
              <div className="text-[11px] text-slate-500 mt-0.5">{u.desc}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Danh mục nhanh */}
      <div>
        <h2 className="text-xl font-black uppercase text-slate-900 mb-4">Mua Theo Danh Mục</h2>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {QUICK_CATEGORIES.map((c) => (
            <button
              key={c.label}
              onClick={() => onNavigate({ filter: c.filter })}
              className={`bg-gradient-to-br ${c.cls} text-white rounded-2xl p-5 text-left hover:shadow-lg hover:-translate-y-0.5 transition`}
            >
              <div className="text-3xl">{c.emoji}</div>
              <div className="mt-3 font-black uppercase text-sm">{c.label}</div>
              <div className="text-[11px] text-white/80">Xem ngay ➔</div>
            </button>
          ))}
        </div>
      </div>

      {/* Thương hiệu */}
      <div>
        <h2 className="text-xl font-black uppercase text-slate-900 mb-4">Thương Hiệu</h2>
        <div className="flex flex-wrap gap-3">
          {BRANDS.map((b) => (
            <button
              key={b}
              onClick={() => onNavigate({ filter: { brand: b } })}
              className="px-6 py-3 bg-white border border-slate-200 rounded-2xl text-sm font-black italic text-slate-700 hover:border-indigo-400 hover:text-indigo-600 transition"
            >
              {b}
            </button>
          ))}
        </div>
      </div>

      {/* Flash Sale */}
      {/*{flashSale.length > 0 && (*/}
      {/*  <div>*/}
      {/*    <SectionHeader title="Flash Sale 🔥" onViewAll={() => onNavigate({ filter: { sale: true } })} />*/}
      {/*    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">*/}
      {/*      {flashSale.map((p) => (*/}
      {/*        <ProductCard key={p.id} product={p} onSelect={onSelectProduct} showSaleBadge />*/}
      {/*      ))}*/}
      {/*    </div>*/}
      {/*  </div>*/}
      {/*)}*/}

      {/* Sản phẩm hot — xếp theo lượt bán */}
      <div>
        <SectionHeader title="Sản Phẩm Đang Hot" onViewAll={goAll} count={hot.length} />

        {hotLoading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="bg-white border border-slate-200 rounded-2xl overflow-hidden animate-pulse">
                <div className="aspect-square bg-slate-100" />
                <div className="p-3 space-y-2">
                  <div className="h-3 bg-slate-100 rounded w-3/4" />
                  <div className="h-3 bg-slate-100 rounded w-1/2" />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
            {hot.map((p) => (
              <ProductCard key={p.id} product={p} onSelect={onSelectProduct} showSaleBadge />
            ))}
          </div>
        )}
      </div>

        {/* Sản phẩm mới nhất */}
        <div>
            <SectionHeader title="Sản Phẩm Mới Nhất" onViewAll={goAll} count={products?.length} />

            {loading ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
                    {Array.from({ length: 8 }).map((_, i) => (
                        <div key={i} className="bg-white border border-slate-200 rounded-2xl overflow-hidden animate-pulse">
                            <div className="aspect-square bg-slate-100" />
                            <div className="p-3 space-y-2">
                                <div className="h-3 bg-slate-100 rounded w-3/4" />
                                <div className="h-3 bg-slate-100 rounded w-1/2" />
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
                    {(products ?? []).slice(0, 12).map(normalizeProduct).map((p) => (
                        <ProductCard key={p.id} product={p} onSelect={onSelectProduct} />
                    ))}
                </div>
            )}
        </div>
    </div>
  );
}

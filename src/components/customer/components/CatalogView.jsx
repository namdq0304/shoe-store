import { useState, useEffect } from 'react';
import FilterSidebar from './FilterSidebar';
import ProductCard from './ProductCard';
import useProducts from '../hooks/useProducts';
import useMenuData from '../hooks/useMenuData';
import { GENDERS, SORT_OPTIONS } from '../constants';
import {normalizeProduct} from "./HomeView.jsx";

// Điều chỉnh các map này cho khớp constants/DB của bạn
const GENDER_TO_API = { nam: 0, nu: 1 };          // 'tre-em' backend chưa hỗ trợ
const SORT_TO_API = {
    newest:       'newest',
    'price-asc':  'price_asc',
    'price-desc': 'price_desc',
};

const getName = (item) =>
    item?.tenDanhMuc ?? item?.tenThuongHieu ?? item?.tenChatLieu ?? item?.ten ?? item?.name ?? '';

const toBrandIds = (selectedBrands = [], brands = []) => {
    const ids = (selectedBrands || [])
        .map((b) => {
            if (typeof b === 'number' && Number.isFinite(b)) return b;
            const n = Number(b);
            if (Number.isInteger(n) && n > 0) return n;
            const name = String(b ?? '').trim().toLowerCase();
            const found = brands.find((x) => getName(x).toLowerCase() === name);
            return found?.id != null ? Number(found.id) : null;
        })
        .filter((id) => Number.isInteger(id) && id > 0);
    return [...new Set(ids)];
};

export function buildProductParams({
                                       selectedGender, selectedCategory, selectedBrands = [], selectedMaterial,
                                       onlySale, searchQuery, sortBy, brands = [],
                                   }) {
    const brandIds = toBrandIds(selectedBrands, brands);
    return {
        q:            searchQuery?.trim() || '',
        gioiTinh:     GENDER_TO_API[selectedGender] ?? null,
        danhMucId:    selectedCategory   ?? null,
        // Gửi toàn bộ mảng id — serialize thành ?thuongHieuId=1&thuongHieuId=2
        thuongHieuId: brandIds.length > 0 ? brandIds : null,
        chatLieuId:   selectedMaterial   ?? null,
        onSale:       !!onlySale,
        sort:         SORT_TO_API[sortBy] ?? 'newest',
    };
}

const nameById = (list, id, fallback) => {
    const found = list.find((x) => Number(x.id) === Number(id));
    return found ? getName(found) : fallback;
};

function useDebounce(value, delay = 400) {
    const [v, setV] = useState(value);
    useEffect(() => {
        const t = setTimeout(() => setV(value), delay);
        return () => clearTimeout(t);
    }, [value, delay]);
    return v;
}

export default function CatalogView({ filters, menuData, onSelectProduct }) {
    const {
        selectedGender, setSelectedGender,
        selectedCategory, setSelectedCategory,
        selectedBrands, setSelectedBrands,
        selectedMaterial, setSelectedMaterial,
        onlySale, setOnlySale,
        searchQuery, setSearchQuery,
        sortBy, setSortBy,
    } = filters;

    // Ưu tiên menuData do cha truyền xuống (tránh gọi API trùng); không có thì tự tải
    const own = useMenuData();
    const { categories = [], brands = [], materials = [] } = menuData ?? own;

    const debouncedQuery = useDebounce(searchQuery);
    const { products, loading, error, pagination, loadPage } = useProducts(
        buildProductParams({ ...filters, searchQuery: debouncedQuery, brands }),
        { withHot: false }
    );
    const list = products.map(normalizeProduct);

    const currentGender = selectedGender || 'all';
    const genderLabel = GENDERS.find((g) => g.id === currentGender)?.label;
    const title = selectedGender ? `Giày ${genderLabel}` : 'Tất cả giày';

    // Chip bộ lọc đang bật (tên lấy từ menu theo id)
    const chips = [];
    if (selectedCategory) {
        chips.push({
            key: 'category',
            label: nameById(categories, selectedCategory, `Danh mục #${selectedCategory}`),
            onRemove: () => setSelectedCategory(null),
        });
    }
    selectedBrands.forEach((id) =>
        chips.push({
            key: `brand-${id}`,
            label: nameById(brands, id, `Thương hiệu #${id}`),
            onRemove: () => setSelectedBrands(selectedBrands.filter((x) => Number(x) !== Number(id))),
        })
    );
    if (selectedMaterial) {
        chips.push({
            key: 'material',
            label: `Chất liệu: ${nameById(materials, selectedMaterial, `#${selectedMaterial}`)}`,
            onRemove: () => setSelectedMaterial(null),
        });
    }
    if (onlySale) chips.push({ key: 'sale', label: 'Đang sale', onRemove: () => setOnlySale(false) });
    if (searchQuery.trim()) chips.push({ key: 'q', label: `“${searchQuery}”`, onRemove: () => setSearchQuery('') });

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-black uppercase text-slate-900">{title}</h1>
                    <p className="text-xs text-slate-500 mt-1">
                        Tìm thấy <b className="text-slate-900">{pagination.totalElements}</b> sản phẩm
                    </p>
                </div>

                <div className="flex flex-wrap items-center gap-3">
                    <div className="flex bg-white border border-slate-200 rounded-xl p-1">
                        {GENDERS.map((g) => (
                            <button
                                key={g.id}
                                onClick={() => setSelectedGender(g.id === 'all' ? null : g.id)}
                                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                                    currentGender === g.id ? 'bg-indigo-600 text-white' : 'text-slate-500 hover:text-slate-800'
                                }`}
                            >
                                {g.label}
                            </button>
                        ))}
                    </div>

                    <select
                        value={sortBy}
                        onChange={(e) => setSortBy(e.target.value)}
                        aria-label="Sắp xếp sản phẩm"
                        className="bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-700 focus:outline-none focus:border-indigo-400"
                    >
                        {SORT_OPTIONS.map((o) => (
                            <option key={o.id} value={o.id}>{o.label}</option>
                        ))}
                    </select>
                </div>
            </div>

            {chips.length > 0 && (
                <div className="flex flex-wrap items-center gap-2">
                    {chips.map((c) => (
                        <span key={c.key} className="inline-flex items-center space-x-1.5 pl-3 pr-2 py-1 rounded-full bg-indigo-50 border border-indigo-200 text-indigo-700 text-[11px] font-bold">
              <span>{c.label}</span>
              <button onClick={c.onRemove} aria-label={`Bỏ lọc ${c.label}`} className="hover:text-red-500">✕</button>
            </span>
                    ))}
                </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                <FilterSidebar
                    filters={filters}
                    categories={categories}
                    brands={brands}
                    materials={materials}
                />

                <div className="lg:col-span-3">
                    {error ? (
                        <div className="py-16 text-center text-red-500 text-xs bg-white rounded-2xl border border-slate-200">{error}</div>
                    ) : loading ? (
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 sm:gap-6">
                            {Array.from({ length: 6 }).map((_, i) => (
                                <div key={i} className="bg-white border border-slate-200 rounded-2xl overflow-hidden animate-pulse">
                                    <div className="aspect-square bg-slate-100" />
                                    <div className="p-3 space-y-2">
                                        <div className="h-3 bg-slate-100 rounded w-3/4" />
                                        <div className="h-3 bg-slate-100 rounded w-1/2" />
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : list.length === 0 ? (
                        <div className="py-16 text-center text-slate-400 text-xs bg-white rounded-2xl border border-slate-200">
                            Không tìm thấy sản phẩm phù hợp. Hãy thử gỡ bớt bộ lọc.
                        </div>
                    ) : (
                        <>
                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 sm:gap-6">
                                {list.map((p) => (
                                    <ProductCard key={p.id} product={p} onSelect={onSelectProduct} showSaleBadge />
                                ))}
                            </div>

                            {pagination.totalPages > 1 && (
                                <div className="flex justify-center items-center gap-3 mt-8">
                                    <button
                                        disabled={pagination.page === 0}
                                        onClick={() => loadPage(pagination.page - 1)}
                                        className="px-4 py-2 text-xs font-bold bg-white border border-slate-200 rounded-xl disabled:opacity-40"
                                    >← Trước</button>
                                    <span className="text-xs font-bold text-slate-600">
                    Trang {pagination.page + 1} / {pagination.totalPages}
                  </span>
                                    <button
                                        disabled={pagination.page + 1 >= pagination.totalPages}
                                        onClick={() => loadPage(pagination.page + 1)}
                                        className="px-4 py-2 text-xs font-bold bg-white border border-slate-200 rounded-xl disabled:opacity-40"
                                    >Sau →</button>
                                </div>
                            )}
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}
import { BRANDS, SIZES, PRICE_RANGES, CATEGORIES } from '../constants';

export default function FilterSidebar({ filters ,categories ,brands}) {
    const {
        selectedBrands, setSelectedBrands,
        selectedSize, setSelectedSize,
        priceRange, setPriceRange,
        selectedCategory, setSelectedCategory,
        onlySale, setOnlySale,
        resetFilters,
    } = filters;

    const toggleBrand = (b, checked) => {
        setSelectedBrands(checked ? [...selectedBrands, b] : selectedBrands.filter((x) => x !== b));
    }

    const labelCls = 'flex items-center space-x-2 text-xs text-slate-500 mb-1.5 cursor-pointer hover:text-slate-800 transition';
     const getName = (item) =>
        item?.tenDanhMuc ?? item?.tenThuongHieu ?? item?.tenChatLieu ?? item?.ten ?? item?.name ?? '';
    return (
        <div className="bg-white border border-slate-200 rounded-3xl p-5 space-y-6 h-fit shadow-sm">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
                <span className="font-black text-sm text-slate-900 uppercase">Bộ Lọc Tìm Kiếm</span>
                <button onClick={resetFilters} className="text-[11px] text-indigo-600 hover:underline font-bold">Xóa lọc</button>
            </div>

            <label className={labelCls}>
                <input type="checkbox" checked={onlySale} onChange={(e) => setOnlySale(e.target.checked)} className="accent-indigo-600" />
                <span className="font-bold text-red-500">🔥 Chỉ hiện hàng đang sale</span>
            </label>

            <div>
                <label className="text-xs font-bold text-slate-600 block mb-2">Loại Giày</label>
                <label className={labelCls}>
                    <input type="radio" name="store-category" checked={!selectedCategory} onChange={() => setSelectedCategory(null)} className="accent-indigo-600" />
                    <span>Tất cả loại</span>
                </label>
                {categories.map((c) => (
                    <label key={c.id} className={labelCls}>
                        <input type="radio" name="store-category" checked={selectedCategory === c.id} onChange={() => setSelectedCategory(c.id)} className="accent-indigo-600" />
                        <span>{c.tenDanhMuc}</span>
                    </label>
                ))}
            </div>

            <div>
                <label className="text-xs font-bold text-slate-600 block mb-2">Thương Hiệu</label>
                {brands.map((b) => {
                    const id = Number(b.id);
                    const checked = selectedBrands.some((x) => Number(x) === id);
                    return (
                        <label key={b.id} className="flex items-center gap-2 text-xs">
                            <input
                                type="checkbox"
                                checked={checked}
                                onChange={() => {
                                    setSelectedBrands(
                                        checked
                                            ? selectedBrands.filter((x) => Number(x) !== id)
                                            : [...selectedBrands, id]
                                    );
                                }}
                            />
                            {getName(b)}
                        </label>
                    );
                })}
            </div>

            <div>
                <label className="text-xs font-bold text-slate-600 block mb-2">Kích Cỡ Giày (EU)</label>
                <div className="grid grid-cols-3 gap-1.5">
                    {SIZES.map((s) => (
                        <button
                            key={s}
                            onClick={() => setSelectedSize(selectedSize === s ? null : s)}
                            className={`py-1.5 rounded-lg text-xs font-bold border transition ${
                                selectedSize === s ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-slate-50 border-slate-200 text-slate-600 hover:border-indigo-400'
                            }`}
                        >
                            {s}
                        </button>
                    ))}
                </div>
            </div>

            <div>
                <label className="text-xs font-bold text-slate-600 block mb-2">Khoảng Giá</label>
                {PRICE_RANGES.map((item) => (
                    <label key={item.id} className={labelCls}>
                        <input type="radio" name="store-price-opt" checked={priceRange === item.id} onChange={() => setPriceRange(item.id)} className="accent-indigo-600" />
                        <span>{item.label}</span>
                    </label>
                ))}
            </div>
        </div>
    );
}
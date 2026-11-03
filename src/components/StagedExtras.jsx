import React, { useEffect, useRef, useState } from 'react';
import mauSacApi from '../api/mauSacApi';
import kichThuocApi from '../api/kichThuocApi';

const MAX_SIZE = 5 * 1024 * 1024;
const ALLOWED = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
const fmt = (v) => (v != null ? Number(v).toLocaleString('vi-VN') + '₫' : '—');
const errMsg = (e, fb) => e?.response?.data?.message || e?.message || fb;
const toNum = (s) => (s === '' || s == null ? null : Number(s));
const badNum = (n) => n !== null && (isNaN(n) || n < 0);
const inputCls = 'bg-zinc-950 border border-zinc-700 rounded-lg px-2 py-1 text-white focus:outline-none focus:border-[#c6f500]';

let seq = 0;
const nextId = () => `tmp-${Date.now()}-${seq++}`;

/* ════════════════ Ảnh chờ upload ════════════════ */
/**
 * Props:
 *   images    — [{ id, file, url }]   (url là blob preview)
 *   setImages — setter
 *   mainId    — id ảnh sẽ được đặt làm ảnh chính
 *   setMainId — setter
 */
export function StagedImages({ images, setImages, mainId, setMainId }) {
    const fileRef = useRef(null);
    const [error, setError] = useState('');

    // Giải phóng blob URL khi đóng modal
    const imagesRef = useRef(images);
    imagesRef.current = images;
    useEffect(() => () => imagesRef.current.forEach((i) => URL.revokeObjectURL(i.url)), []);

    const handleFiles = (e) => {
        const files = Array.from(e.target.files || []);
        e.target.value = '';
        if (files.length === 0) return;
        for (const f of files) {
            if (!ALLOWED.includes(f.type)) return setError(`"${f.name}" không phải ảnh JPG, PNG, WEBP, GIF`);
            if (f.size > MAX_SIZE) return setError(`"${f.name}" lớn hơn 5MB`);
        }
        setError('');
        const added = files.map((file) => ({ id: nextId(), file, url: URL.createObjectURL(file) }));
        setImages([...images, ...added]);
        if (!mainId) setMainId(added[0].id);
    };

    const remove = (img) => {
        URL.revokeObjectURL(img.url);
        const rest = images.filter((i) => i.id !== img.id);
        setImages(rest);
        if (mainId === img.id) setMainId(rest[0]?.id ?? null);
    };

    return (
        <div className="px-6 pb-6">
            <h4 className="text-xs font-black uppercase text-zinc-300 mb-2">Ảnh sản phẩm ({images.length})</h4>
            <div className="flex flex-wrap gap-3">
                {images.map((img) => (
                    <div key={img.id} className="relative group">
                        <div className={`w-20 h-20 rounded-xl overflow-hidden border-2 ${mainId === img.id ? 'border-[#c6f500]' : 'border-zinc-700'}`}>
                            <img src={img.url} alt={img.file.name} className="w-full h-full object-cover" />
                        </div>
                        {mainId === img.id
                            ? <span className="absolute bottom-1 left-1 px-1.5 py-0.5 rounded bg-[#c6f500] text-black font-black text-[9px]">⭐ Chính</span>
                            : <button type="button" onClick={() => setMainId(img.id)}
                                      className="absolute bottom-1 left-1 px-1.5 py-0.5 rounded bg-black/70 text-[#c6f500] font-bold text-[9px] opacity-0 group-hover:opacity-100 transition">
                                Đặt chính
                            </button>}
                        <button type="button" onClick={() => remove(img)}
                                className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-red-600 hover:bg-red-500 text-white text-[10px] font-bold flex items-center justify-center">✕</button>
                    </div>
                ))}
                <button type="button" onClick={() => fileRef.current?.click()}
                        className="w-20 h-20 rounded-xl border-2 border-dashed border-zinc-600 hover:border-[#c6f500] text-zinc-400 hover:text-[#c6f500] text-2xl font-bold flex items-center justify-center transition"
                        title="Thêm ảnh">＋</button>
                <input ref={fileRef} type="file" accept="image/*" multiple hidden onChange={handleFiles} />
            </div>
            <p className="text-[11px] text-zinc-500 mt-2">Ảnh sẽ được tải lên sau khi sản phẩm được tạo.</p>
            {error && (
                <div className="mt-2 p-2 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-[11px] flex items-center gap-2">
                    <span className="flex-1">{error}</span>
                    <button onClick={() => setError('')} className="font-bold hover:text-white">✕</button>
                </div>
            )}
        </div>
    );
}

/* ════════════════ Biến thể chờ lưu ════════════════ */
/**
 * Mỗi phần tử: { key, mauSacId, tenMau, maHex, giaNhap, giaBan, giaGoc,
 *               items: [{ kichThuocId, tenKichThuoc, soLuong }] }
 * (một màu + nhiều size, khớp với chiTietSanPhamApi.createBulk)
 */
export function StagedVariants({ variants, setVariants, defaultGiaBan, defaultGiaGoc }) {
    const [showAdd, setShowAdd] = useState(false);

    return (
        <div className="px-6 pb-6">
            <div className="flex items-center justify-between mb-2">
                <h4 className="text-xs font-black uppercase text-zinc-300">
                    Biến thể ({variants.reduce((n, v) => n + v.items.length, 0)})
                </h4>
                {!showAdd && (
                    <button type="button" onClick={() => setShowAdd(true)}
                            className="px-3 py-1.5 bg-[#c6f500] hover:bg-[#b0dc00] text-black text-[11px] font-black rounded-lg transition">
                        ＋ Thêm chi tiết
                    </button>
                )}
            </div>

            {showAdd && (
                <StagedVariantForm
                    existing={variants}
                    defaultGiaBan={defaultGiaBan}
                    defaultGiaGoc={defaultGiaGoc}
                    onCancel={() => setShowAdd(false)}
                    onAdd={(v) => { setVariants([...variants, v]); setShowAdd(false); }}
                />
            )}

            <div className="border border-zinc-800 rounded-xl overflow-x-auto">
                <table className="w-full text-xs text-left">
                    <thead className="bg-zinc-950 text-zinc-400 uppercase">
                    <tr>
                        <th className="px-3 py-2">Màu</th>
                        <th className="px-3 py-2">Size × SL</th>
                        <th className="px-3 py-2 text-right">Giá bán</th>
                        <th className="px-3 py-2 text-right">Giá gốc</th>
                        <th className="px-3 py-2 text-right">Giá nhập</th>
                        <th className="px-3 py-2 text-center">Xóa</th>
                    </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-800">
                    {variants.length === 0 && (
                        <tr><td colSpan={6} className="px-3 py-4 text-center text-zinc-500">Chưa có biến thể nào (có thể thêm sau).</td></tr>
                    )}
                    {variants.map((v) => (
                        <tr key={v.key}>
                            <td className="px-3 py-2">
                                <span className="inline-block w-2.5 h-2.5 rounded-full mr-1.5 align-middle border border-zinc-600"
                                      style={{ background: v.maHex || '#888' }} />
                                {v.tenMau}
                            </td>
                            <td className="px-3 py-2">
                                <div className="flex flex-wrap gap-1">
                                    {v.items.map((it) => (
                                        <span key={it.kichThuocId} className="px-2 py-0.5 rounded-lg bg-zinc-800 text-zinc-300 font-bold">
                                            {it.tenKichThuoc} × {it.soLuong}
                                        </span>
                                    ))}
                                </div>
                            </td>
                            <td className="px-3 py-2 text-right text-zinc-300">{v.giaBan != null ? fmt(v.giaBan) : <span className="text-zinc-600">theo SP</span>}</td>
                            <td className="px-3 py-2 text-right text-zinc-300">{v.giaGoc != null ? fmt(v.giaGoc) : <span className="text-zinc-600">theo SP</span>}</td>
                            <td className="px-3 py-2 text-right text-zinc-300">{fmt(v.giaNhap)}</td>
                            <td className="px-3 py-2 text-center">
                                <button type="button" onClick={() => setVariants(variants.filter((x) => x.key !== v.key))}
                                        className="px-2.5 py-1 bg-zinc-900 hover:bg-red-500/10 border border-zinc-700 text-zinc-500 hover:text-red-400 text-[10px] font-bold rounded-lg">🗑️</button>
                            </td>
                        </tr>
                    ))}
                    </tbody>
                </table>
            </div>
            <p className="text-[11px] text-zinc-500 mt-2">Biến thể sẽ được lưu sau khi sản phẩm được tạo.</p>
        </div>
    );
}

function StagedVariantForm({ existing, defaultGiaBan, defaultGiaGoc, onCancel, onAdd }) {
    const [colors, setColors] = useState([]);
    const [sizes, setSizes] = useState([]);
    const [mauId, setMauId] = useState('');
    const [price, setPrice] = useState({ giaBan: '', giaGoc: '', giaNhap: '' });
    const [qtyBySize, setQtyBySize] = useState({});
    const [error, setError] = useState('');

    useEffect(() => {
        Promise.all([mauSacApi.getAll(), kichThuocApi.getAll()])
            .then(([c, s]) => {
                setColors(Array.isArray(c) ? c : []);
                setSizes(Array.isArray(s) ? [...s].sort((a, b) => Number(a.tenKichThuoc) - Number(b.tenKichThuoc)) : []);
            })
            .catch((e) => setError(errMsg(e, 'Không thể tải màu/size!')));
    }, []);

    const toggleSize = (id) => setQtyBySize((q) => {
        const n = { ...q }; if (id in n) delete n[id]; else n[id] = ''; return n;
    });
    const selectedIds = Object.keys(qtyBySize);

    const submit = () => {
        if (!mauId) return setError('Vui lòng chọn màu!');
        if (existing.some((v) => String(v.mauSacId) === String(mauId)))
            return setError('Màu này đã được thêm, hãy xóa dòng cũ rồi thêm lại.');
        if (selectedIds.length === 0) return setError('Vui lòng chọn ít nhất 1 size!');

        const items = [];
        for (const id of selectedIds) {
            const qty = Number(qtyBySize[id]);
            if (qtyBySize[id] === '' || !Number.isInteger(qty) || qty < 0)
                return setError('Số lượng mỗi size phải là số nguyên ≥ 0');
            items.push({
                kichThuocId: Number(id),
                tenKichThuoc: sizes.find((x) => String(x.id) === id)?.tenKichThuoc,
                soLuong: qty,
            });
        }
        const giaBan = toNum(price.giaBan), giaGoc = toNum(price.giaGoc), giaNhap = toNum(price.giaNhap);
        if ([giaBan, giaGoc, giaNhap].some(badNum)) return setError('Giá không hợp lệ!');
        if (giaNhap === null) return setError('Vui lòng nhập giá nhập!');

        const color = colors.find((c) => String(c.id) === String(mauId));
        onAdd({
            key: nextId(),
            mauSacId: Number(mauId),
            tenMau: color?.tenMau,
            maHex: color?.maHex,
            giaNhap, giaBan, giaGoc, items,
        });
    };

    const cls = `w-full ${inputCls} py-1.5`;
    const priceField = (key, label, placeholder) => (
        <div>
            <label className="block font-bold text-zinc-400 mb-1">{label}</label>
            <input type="number" min="0" value={price[key]} placeholder={placeholder}
                   onChange={(e) => setPrice({ ...price, [key]: e.target.value })} className={cls} />
        </div>
    );

    return (
        <div className="mb-3 p-4 rounded-xl border border-zinc-700 bg-zinc-950/60 space-y-3 text-xs">
            <div className="font-black uppercase text-zinc-300">Thêm chi tiết mới</div>
            {error && <div className="p-2 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400">{error}</div>}

            <div>
                <label className="block font-bold text-zinc-400 mb-1">Màu *</label>
                <select value={mauId} onChange={(e) => setMauId(e.target.value)} className={cls}>
                    <option value="">-- Chọn màu --</option>
                    {colors.map((c) => <option key={c.id} value={c.id}>{c.tenMau}</option>)}
                </select>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {priceField('giaNhap', 'Giá nhập (₫) *', '2000000')}
                {priceField('giaBan', 'Giá bán (trống = theo SP)', String(defaultGiaBan ?? ''))}
                {priceField('giaGoc', 'Giá gốc (trống = theo SP)', String(defaultGiaGoc ?? ''))}
            </div>

            <div>
                <label className="block font-bold text-zinc-400 mb-1.5">Size * (bấm để chọn nhiều)</label>
                <div className="flex flex-wrap gap-2">
                    {sizes.map((s) => (
                        <button key={s.id} type="button" onClick={() => toggleSize(String(s.id))}
                                className={`w-10 h-10 rounded-xl font-bold border transition ${
                                    String(s.id) in qtyBySize
                                        ? 'bg-[#c6f500] text-black border-[#c6f500]'
                                        : 'bg-zinc-950 border-zinc-700 text-zinc-400 hover:border-zinc-500'}`}>
                            {s.tenKichThuoc}
                        </button>
                    ))}
                </div>
            </div>

            {selectedIds.length > 0 && (
                <div>
                    <label className="block font-bold text-zinc-400 mb-1.5">Số lượng từng size</label>
                    <div className="flex flex-wrap gap-2">
                        {selectedIds.map((id) => (
                            <div key={id} className="flex items-center gap-1.5 bg-zinc-900 border border-zinc-800 rounded-lg px-2 py-1">
                                <span className="font-bold text-white w-6 text-center">{sizes.find((x) => String(x.id) === id)?.tenKichThuoc}</span>
                                <input type="number" min="0" value={qtyBySize[id]} placeholder="SL"
                                       onChange={(e) => setQtyBySize({ ...qtyBySize, [id]: e.target.value })}
                                       className={`w-16 text-center ${inputCls}`} />
                            </div>
                        ))}
                    </div>
                </div>
            )}

            <div className="flex justify-end gap-2 pt-1">
                <button type="button" onClick={onCancel} className="px-4 py-2 bg-zinc-800 text-zinc-300 font-bold rounded-lg hover:bg-zinc-700">Hủy</button>
                <button type="button" onClick={submit} className="px-4 py-2 bg-[#c6f500] hover:bg-[#b0dc00] text-black font-black rounded-lg">
                    Thêm vào danh sách
                </button>
            </div>
        </div>
    );
}
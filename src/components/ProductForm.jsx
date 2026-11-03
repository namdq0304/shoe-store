import React, { useEffect, useState } from 'react';
import { sanPhamApi } from '../api';
import chiTietSanPhamApi from '../api/chiTietSanPhamApi.js';
import ProductImages from './ProductImages.jsx';
import ProductVariants from './ProductVariants.jsx';
import hinhAnhApi from '../api/hinhAnhApi';
import { StagedImages, StagedVariants } from './StagedExtras.jsx';

const emptyForm = {
    maSanPham: '', tenSanPham: '',
    danhMucId: '', thuongHieuId: '', xuatXuId: '', chatLieuId: '',
    giaBan: '', giaGoc: '', moTa: '',
};

// Chuyển sản phẩm từ API sang state của form
const toForm = (p) => ({
    maSanPham:    p.maSanPham ?? '',
    tenSanPham:   p.tenSanPham ?? '',
    danhMucId:    p.danhMucId ?? '',
    thuongHieuId: p.thuongHieuId ?? '',
    xuatXuId:     p.xuatXuId ?? '',
    chatLieuId:   p.chatLieuId ?? '',
    giaBan:       p.giaBan ?? '',
    giaGoc:       p.giaGoc ?? '',
    moTa:         p.moTa ?? '',
});

const inputCls =
    'w-full bg-zinc-950 border border-zinc-700 rounded-xl px-3 py-2 text-white placeholder-zinc-600 focus:outline-none focus:border-[#c6f500] transition';

function Field({ label, children, className = '' }) {
    return (
        <div className={className}>
            <label className="block font-bold text-zinc-300 uppercase mb-1">{label}</label>
            {children}
        </div>
    );
}

function SelectField({ label, value, onChange, options, labelKey, placeholder }) {
    return (
        <Field label={label}>
            <select value={value} onChange={onChange} className={inputCls}>
                <option value="">{placeholder}</option>
                {options.map((o) => (
                    <option key={o.id} value={o.id}>{o[labelKey]}</option>
                ))}
            </select>
        </Field>
    );
}

/**
 * Modal Thêm / Sửa sản phẩm.
 *
 * Props:
 *   mode      — 'add' | 'edit'
 *   product   — sản phẩm đang sửa (chỉ dùng khi mode = 'edit')
 *   brands, danhMucs, xuatXus, chatLieus — dữ liệu cho các select
 *   onClose   — đóng modal
 *   onSaved   — (sanPham, mode) => void, gọi sau khi lưu thông tin thành công (để tải lại danh sách)
 *   onChanged — () => void, gọi khi ảnh / biến thể thay đổi (để tải lại danh sách)
 *
 * Thêm mới: nhập thông tin + chọn ảnh + thêm biến thể (chưa gửi lên server).
 * Bấm "Thêm Sản Phẩm" → gọi API tạo sản phẩm → có id → upload ảnh → tạo biến thể.
 * Nếu bước ảnh/biến thể lỗi, modal chuyển sang chế độ sửa để làm lại phần lỗi.
 */
export default function ProductForm({
                                        mode, product, brands, danhMucs, xuatXus, chatLieus, onClose, onSaved, onChanged,
                                    }) {
    // Sản phẩm đã lưu (null khi đang thêm mới và chưa bấm lưu)
    const [current, setCurrent] = useState(mode === 'add' ? null : product);
    const isAdd = !current;
    const [form, setForm] = useState(mode === 'add' ? emptyForm : toForm(product));
    const [error, setError] = useState('');
    const [notice, setNotice] = useState('');
    const [saving, setSaving] = useState(false);

    // ── Ảnh + biến thể nhập trước khi sản phẩm có id (chỉ dùng khi thêm mới) ──
    const [stagedImages, setStagedImages] = useState([]);
    const [stagedMainId, setStagedMainId] = useState(null);
    const [stagedVariants, setStagedVariants] = useState([]);

    // ── Biến thể ──
    const [variants, setVariants] = useState([]);
    const [varLoading, setVarLoading] = useState(false);
    const productId = current?.id;

    const loadVariants = async () => {
        setVarLoading(true);
        try {
            const data = await chiTietSanPhamApi.getBySanPham(productId);
            setVariants(Array.isArray(data) ? data : []);
        } catch (err) {
            console.error('Không thể tải biến thể:', err);
        } finally {
            setVarLoading(false);
        }
    };

    useEffect(() => {
        if (productId) loadVariants();
    }, [productId]);

    const setField = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));

    const validate = () => {
        if (!form.maSanPham.trim())  return 'Vui lòng nhập mã sản phẩm!';
        if (!form.tenSanPham.trim()) return 'Vui lòng nhập tên sản phẩm!';
        if (!form.danhMucId)         return 'Vui lòng chọn danh mục!';
        if (!form.thuongHieuId)      return 'Vui lòng chọn thương hiệu!';
        if (!form.xuatXuId)          return 'Vui lòng chọn xuất xứ!';
        if (form.giaBan === '' || isNaN(+form.giaBan) || +form.giaBan <= 0)
            return 'Giá bán không hợp lệ!';
        if (form.giaGoc !== '' && (isNaN(+form.giaGoc) || +form.giaGoc < +form.giaBan))
            return 'Giá gốc phải lớn hơn hoặc bằng giá bán!';
        return '';
    };

    const handleSave = async () => {
        const err = validate();
        if (err) return setError(err);

        setSaving(true);
        setError('');
        try {
            const payload = {
                maSanPham:    form.maSanPham.trim(),
                tenSanPham:   form.tenSanPham.trim(),
                danhMucId:    Number(form.danhMucId),
                thuongHieuId: Number(form.thuongHieuId),
                xuatXuId:     Number(form.xuatXuId),
                chatLieuId:   form.chatLieuId ? Number(form.chatLieuId) : null,
                giaBan:       Number(form.giaBan),
                giaGoc:       form.giaGoc !== '' ? Number(form.giaGoc) : null,
                moTa:         form.moTa.trim(),
            };
            if (!isAdd) {
                // ── SỬA: chỉ cập nhật thông tin, ảnh/biến thể đã lưu riêng ──
                const saved = await sanPhamApi.update(current.id, payload);
                await onSaved?.(saved, 'edit');
                onClose();
                return;
            }

            // ── THÊM: 1) tạo sản phẩm → lấy id ──
            const saved = await sanPhamApi.create(payload);
            const newId = saved?.data?.data?.id;
            console.log(149,saved.data , newId)
            if (!newId) throw new Error('Server không trả về id sản phẩm!');

            const problems = [];

            // 2) upload ảnh (mọi ảnh một lượt), rồi đặt ảnh chính
            if (stagedImages.length > 0) {
                try {
                    const added = await hinhAnhApi.upload(newId, stagedImages.map((i) => i.file));
                    const mainIdx = Math.max(0, stagedImages.findIndex((i) => i.id === stagedMainId));
                    if (Array.isArray(added) && added[mainIdx]) {
                        await hinhAnhApi.setAnhChinh(added[mainIdx].id);
                    }
                } catch (e) {
                    problems.push(`Ảnh: ${e.response?.data?.message || e.message || 'upload thất bại'}`);
                }
            }

            // 3) tạo biến thể: mỗi màu một lần createBulk
            for (const v of stagedVariants) {
                try {
                    await chiTietSanPhamApi.createBulk({
                        sanPhamId: newId,
                        mauSacId: v.mauSacId,
                        giaBan: v.giaBan,
                        giaGoc: v.giaGoc,
                        giaNhap: v.giaNhap,
                        items: v.items.map(({ kichThuocId, soLuong }) => ({ kichThuocId, soLuong })),
                    });
                } catch (e) {
                    problems.push(`Màu ${v.tenMau}: ${e.response?.data?.message || e.message || 'thêm thất bại'}`);
                }
            }

            await onSaved?.(saved, 'add');

            if (problems.length === 0) {
                onClose();
            } else {
                // Sản phẩm đã tạo: chuyển sang chế độ sửa để làm lại phần lỗi
                // (ảnh/biến thể đã lưu thành công sẽ hiện ra từ server)
                stagedImages.forEach((i) => URL.revokeObjectURL(i.url));
                setStagedImages([]); setStagedVariants([]); setStagedMainId(null);
                setCurrent(saved);
                setForm(toForm(saved));
                setError(
                    'Đã tạo sản phẩm nhưng một số mục chưa lưu được, vui lòng thêm lại bên dưới:\n• ' +
                    problems.join('\n• ')
                );
            }
        } catch (e) {
            setError(e.response?.data?.message || e.message || 'Lưu sản phẩm thất bại!');
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-zinc-900 border border-zinc-700 rounded-3xl max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">

                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-800 sticky top-0 bg-zinc-900 z-10">
                    <h3 className="font-black text-sm uppercase text-white">
                        {isAdd ? '➕ Thêm Sản Phẩm Mới' : '✏️ Sửa Sản Phẩm'}
                    </h3>
                    <button onClick={onClose} className="text-zinc-400 hover:text-white font-bold text-lg">✕</button>
                </div>

                {/* Body */}
                <div className="p-6 space-y-4 text-xs">
                    {notice && (
                        <div className="p-3 rounded-xl bg-[#c6f500]/10 border border-[#c6f500]/30 text-[#c6f500] flex items-center gap-2">
                            <span className="flex-1">{notice}</span>
                            <button onClick={() => setNotice('')} className="font-bold hover:text-white">✕</button>
                        </div>
                    )}
                    {error && (
                        <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 flex items-center gap-2">
                            <span>⚠️</span><span className="whitespace-pre-line">{error}</span>
                        </div>
                    )}

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <Field label="Mã sản phẩm *">
                            <input value={form.maSanPham} onChange={setField('maSanPham')}
                                   disabled={!isAdd} maxLength={20} placeholder="SP013"
                                   className={`${inputCls} font-mono disabled:opacity-50`} />
                        </Field>
                        <Field label="Tên sản phẩm *" className="sm:col-span-2">
                            <input value={form.tenSanPham} onChange={setField('tenSanPham')}
                                   maxLength={150} placeholder="Nike Air Jordan 1..." className={inputCls} />
                        </Field>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <SelectField label="Danh mục *" value={form.danhMucId} onChange={setField('danhMucId')}
                                     options={danhMucs} labelKey="tenDanhMuc" placeholder="-- Chọn danh mục --" />
                        <SelectField label="Thương hiệu *" value={form.thuongHieuId} onChange={setField('thuongHieuId')}
                                     options={brands} labelKey="tenThuongHieu" placeholder="-- Chọn thương hiệu --" />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <SelectField label="Xuất xứ *" value={form.xuatXuId} onChange={setField('xuatXuId')}
                                     options={xuatXus} labelKey="tenXuatXu" placeholder="-- Chọn xuất xứ --" />
                        <SelectField label="Chất liệu" value={form.chatLieuId} onChange={setField('chatLieuId')}
                                     options={chatLieus} labelKey="tenChatLieu" placeholder="-- Chọn chất liệu --" />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <Field label="Giá bán mặc định (₫) *">
                            <input type="number" min="0" value={form.giaBan} onChange={setField('giaBan')}
                                   placeholder="2890000" className={`${inputCls} !text-[#c6f500]`} />
                        </Field>
                        <Field label="Giá gốc mặc định (₫)">
                            <input type="number" min="0" value={form.giaGoc} onChange={setField('giaGoc')}
                                   placeholder="3400000" className={inputCls} />
                        </Field>
                    </div>
                    <p className="text-[10px] text-zinc-500 -mt-2">
                        Biến thể để trống giá sẽ dùng hai giá này. Giá nhập nhập ở từng biến thể.
                    </p>

                    <Field label={`Mô tả (${form.moTa.length}/500)`}>
                        <textarea rows={3} maxLength={500} value={form.moTa} onChange={setField('moTa')}
                                  placeholder="Mô tả ngắn về sản phẩm..." className={`${inputCls} resize-none`} />
                    </Field>

                </div>

                {/* Ảnh + biến thể */}
                {isAdd ? (
                    <div className="border-t border-zinc-800 pt-5">
                        <StagedImages
                            images={stagedImages} setImages={setStagedImages}
                            mainId={stagedMainId} setMainId={setStagedMainId}
                        />
                        <StagedVariants
                            variants={stagedVariants} setVariants={setStagedVariants}
                            defaultGiaBan={form.giaBan} defaultGiaGoc={form.giaGoc}
                        />
                    </div>
                ) : (
                    <div className="border-t border-zinc-800 pt-5">
                        <ProductImages
                            productId={productId}
                            fallbackSrc={current.urlAnh || ''}
                            onChanged={onChanged}
                        />
                        <ProductVariants
                            product={current}
                            isAdmin
                            variants={variants}
                            loading={varLoading}
                            onChanged={async () => {
                                await loadVariants();
                                onChanged?.();
                            }}
                        />
                    </div>
                )}

                {/* Footer */}
                <div className="px-6 pb-6 flex gap-3 justify-end border-t border-zinc-800 pt-4">
                    <button onClick={onClose} disabled={saving}
                            className="px-5 py-2.5 bg-zinc-800 text-zinc-300 font-bold text-xs rounded-xl hover:bg-zinc-700 transition">
                        {isAdd ? 'Hủy' : 'Đóng'}
                    </button>
                    <button onClick={handleSave} disabled={saving}
                            className="px-6 py-2.5 bg-[#c6f500] hover:bg-[#b0dc00] text-black font-black text-xs rounded-xl transition shadow disabled:opacity-50">
                        {saving ? 'Đang lưu...' : isAdd ? '➕ Thêm Sản Phẩm' : '💾 Lưu Thông Tin'}
                    </button>
                </div>
            </div>
        </div>
    );
}
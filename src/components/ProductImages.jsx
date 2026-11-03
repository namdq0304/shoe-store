import React, { useEffect, useRef, useState } from 'react';
import hinhAnhApi from '../api/hinhAnhApi';

// urlAnh trả về dạng "/api/hinh-anh/file/xxx.jpg"
const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080';
const toSrc = (url) => (!url ? '' : url.startsWith('http') ? url : BASE_URL + url);

const MAX_SIZE = 5 * 1024 * 1024; // khớp giới hạn 5MB ở backend
const ALLOWED = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];

/**
 * Quản lý ảnh sản phẩm (xem, thêm, xóa, đặt ảnh chính).
 * Tách từ ProductDetail cũ.
 *
 * Props:
 *   productId  — id sản phẩm
 *   fallbackSrc — ảnh cũ trong sản phẩm (nếu bảng HINH_ANH chưa có ảnh)
 *   onChanged  — gọi sau khi thêm / xóa / đổi ảnh chính
 */
export default function ProductImages({ productId, fallbackSrc = '', onChanged }) {
    const [images, setImages] = useState([]);
    const [activeIdx, setActiveIdx] = useState(0);
    const [imgLoading, setImgLoading] = useState(false);
    const [busy, setBusy] = useState(false);
    const [imgError, setImgError] = useState('');
    const fileRef = useRef(null);

    const loadImages = async (keepId) => {
        setImgLoading(true);
        try {
            const data = await hinhAnhApi.getBySanPham(productId);
            const list = Array.isArray(data) ? data : [];
            setImages(list);
            const idx = keepId ? list.findIndex((i) => i.id === keepId) : 0;
            setActiveIdx(idx >= 0 ? idx : 0);
        } catch (err) {
            setImgError(err.message || 'Không thể tải ảnh sản phẩm!');
        } finally {
            setImgLoading(false);
        }
    };

    useEffect(() => {
        if (productId) loadImages();
    }, [productId]);

    const current = images[activeIdx];
    const mainSrc = current ? toSrc(current.urlAnh) : fallbackSrc;

    const handleFiles = async (e) => {
        const files = Array.from(e.target.files || []);
        e.target.value = '';
        if (files.length === 0) return;

        for (const f of files) {
            if (!ALLOWED.includes(f.type)) return setImgError(`"${f.name}" không phải ảnh JPG, PNG, WEBP, GIF`);
            if (f.size > MAX_SIZE) return setImgError(`"${f.name}" lớn hơn 5MB`);
        }

        setBusy(true); setImgError('');
        try {
            const added = await hinhAnhApi.upload(productId, files);
            await loadImages(Array.isArray(added) && added[0] ? added[0].id : undefined);
            onChanged?.();
        } catch (err) {
            setImgError(err.response?.data?.message || err.message || 'Upload ảnh thất bại!');
        } finally {
            setBusy(false);
        }
    };

    const handleSetMain = async (img) => {
        setBusy(true); setImgError('');
        try {
            await hinhAnhApi.setAnhChinh(img.id);
            await loadImages();
            onChanged?.();
        } catch (err) {
            setImgError(err.message || 'Không thể đặt ảnh chính!');
        } finally {
            setBusy(false);
        }
    };

    const handleDelete = async (img) => {
        if (!window.confirm('Xóa ảnh này?')) return;
        setBusy(true); setImgError('');
        try {
            await hinhAnhApi.delete(img.id);
            await loadImages();
            onChanged?.();
        } catch (err) {
            setImgError(err.message || 'Xóa ảnh thất bại!');
        } finally {
            setBusy(false);
        }
    };

    return (
        <div className="px-6 pb-6">
            <h4 className="text-xs font-black uppercase text-zinc-300 mb-2">Ảnh sản phẩm ({images.length})</h4>

            <div className="flex flex-col sm:flex-row gap-4">
                {/* Ảnh lớn */}
                <div className="relative rounded-2xl overflow-hidden bg-zinc-950 w-full sm:w-48 aspect-square shrink-0">
                    {mainSrc
                        ? <img src={mainSrc} alt="" className="w-full h-full object-cover" />
                        : <div className="w-full h-full flex items-center justify-center text-zinc-600 text-4xl">👟</div>}
                    {imgLoading && (
                        <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                            <div className="w-5 h-5 border-2 border-[#c6f500] border-t-transparent rounded-full animate-spin" />
                        </div>
                    )}
                    {current?.anhChinh && (
                        <span className="absolute top-2 left-2 px-2 py-0.5 rounded-lg bg-[#c6f500] text-black font-black text-[10px]">⭐ Ảnh chính</span>
                    )}
                </div>

                <div className="flex-1">
                    {/* Thumbnails */}
                    <div className="flex flex-wrap gap-2">
                        {images.map((img, i) => (
                            <div key={img.id} className="relative group">
                                <button type="button" onClick={() => setActiveIdx(i)}
                                        className={`block w-14 h-14 rounded-xl overflow-hidden border-2 transition ${
                                            i === activeIdx ? 'border-[#c6f500]' : 'border-zinc-700 hover:border-zinc-500'}`}>
                                    <img src={toSrc(img.urlAnh)} alt={img.tenAnh} className="w-full h-full object-cover" />
                                </button>
                                {img.anhChinh && <span className="absolute -top-1 -left-1 text-[10px]">⭐</span>}
                                <button type="button" disabled={busy} onClick={() => handleDelete(img)}
                                        className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-red-600 hover:bg-red-500 text-white text-[10px] font-bold flex items-center justify-center opacity-0 group-hover:opacity-100 transition disabled:opacity-40"
                                        title="Xóa ảnh">✕</button>
                            </div>
                        ))}

                        <button type="button" disabled={busy} onClick={() => fileRef.current?.click()}
                                className="w-14 h-14 rounded-xl border-2 border-dashed border-zinc-600 hover:border-[#c6f500] text-zinc-400 hover:text-[#c6f500] text-xl font-bold flex items-center justify-center transition disabled:opacity-40"
                                title="Thêm ảnh">
                            {busy ? <div className="w-4 h-4 border-2 border-[#c6f500] border-t-transparent rounded-full animate-spin" /> : '＋'}
                        </button>
                        <input ref={fileRef} type="file" accept="image/*" multiple hidden onChange={handleFiles} />
                    </div>

                    {!imgLoading && images.length === 0 && (
                        <p className="text-[11px] text-zinc-500 mt-2">Chưa có ảnh nào, bấm ＋ để thêm.</p>
                    )}

                    {current && !current.anhChinh && (
                        <button type="button" disabled={busy} onClick={() => handleSetMain(current)}
                                className="mt-3 px-3 py-1.5 bg-zinc-800 hover:bg-[#c6f500]/10 border border-zinc-700 hover:border-[#c6f500]/50 text-[#c6f500] text-[11px] font-bold rounded-lg transition disabled:opacity-40">
                            ⭐ Đặt làm ảnh chính
                        </button>
                    )}

                    {imgError && (
                        <div className="mt-2 p-2 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-[11px] flex items-center gap-2">
                            <span className="flex-1">{imgError}</span>
                            <button onClick={() => setImgError('')} className="font-bold hover:text-white">✕</button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
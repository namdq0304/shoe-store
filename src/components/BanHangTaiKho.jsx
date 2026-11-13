import React, { useState, useEffect } from 'react';
import axiosClient from '../api/axiosClient';
import BillK80Modal from './BillK80Modal.jsx';

// Địa chỉ backend để hiển thị ảnh (urlAnh dạng "/api/hinh-anh/file/xxx.jpg")
const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080';
const toSrc = (url) => (!url ? '' : url.startsWith('http') ? url : BASE_URL + url);
const fmtMoney = (v) => Number(v ?? 0).toLocaleString('vi-VN') + '₫';

/**
 * Màn hình Bán hàng tại kho / tại quầy (POS).
 * Props:
 *   session — phiên đăng nhập hiện tại (dùng in tên thu ngân trên bill)
 */
export default function BanHangTaiKho({ session }) {
  // ── POS State (kết nối API thật) ─────────────────────────────────────────
  const [activeBillTab, setActiveBillTab] = useState(1);
  // item: { chiTietId, tenSanPham, tenMau, tenKichThuoc, donGia, qty, tonKho }
  const [bill1, setBill1] = useState([]);
  const [bill2, setBill2] = useState([]);
  const [posSearch, setPosSearch] = useState('');
  const [billDiscount, setBillDiscount] = useState(0);
  const [posProducts, setPosProducts] = useState([]);
  const [posLoading, setPosLoading] = useState(false);
  const [posError, setPosError] = useState('');
  const [bienTheModal, setBienTheModal] = useState(null); // sản phẩm đang chọn biến thể
  const [bienTheList, setBienTheList] = useState([]);
  const [bill, setBill] = useState(null);                 // dữ liệu bill sau thanh toán (modal in)

  // ── Thanh toán state ──
  const [phuongThuc, setPhuongThuc] = useState('TIEN_MAT'); // TIEN_MAT | CHUYEN_KHOAN
  const [tienKhachDua, setTienKhachDua] = useState('');     // chuỗi để nhập tự do
  const [maGiaoDich, setMaGiaoDich] = useState('');
  const [dangXuLy, setDangXuLy] = useState(false);

  const currentBill = activeBillTab === 1 ? bill1 : bill2;
  const setCurrentBill = activeBillTab === 1 ? setBill1 : setBill2;

  const billSubtotal = currentBill.reduce((sum, item) => sum + item.donGia * item.qty, 0);
  const billTotal = Math.max(0, billSubtotal - billDiscount);
  const tienThoi = phuongThuc === 'TIEN_MAT' && Number(tienKhachDua) >= billTotal
    ? Number(tienKhachDua) - billTotal : null;

  // Tải danh sách sản phẩm cho POS
  useEffect(() => {
    let alive = true;
    setPosLoading(true);
    axiosClient.get('/ban-hang/san-pham', { params: { page: 0, size: 100 } })
      .then((res) => { if (alive) setPosProducts(Array.isArray(res.content) ? res.content : []); })
      .catch((err) => { if (alive) setPosError(err.message || 'Không tải được sản phẩm!'); })
      .finally(() => { if (alive) setPosLoading(false); });
    return () => { alive = false; };
  }, []);

  // Load biến thể khi mở modal chọn màu/size
  const openBienThe = (sp) => {
    setBienTheModal(sp);
    setBienTheList([]);
    axiosClient.get(`/ban-hang/san-pham/${sp.id}/bien-the`)
      .then((list) => setBienTheList(Array.isArray(list) ? list : []))
      .catch((err) => alert(err.message || 'Không tải được biến thể!'));
  };

  // Thêm 1 biến thể vào hóa đơn đang mở
  const addToBill = (bt) => {
    if (bt.soLuong <= 0) { alert('Biến thể này đã hết hàng!'); return; }
    setCurrentBill((prev) => {
      const idx = prev.findIndex((x) => x.chiTietId === bt.id);
      if (idx >= 0) {
        const next = [...prev];
        if (next[idx].qty + 1 > bt.soLuong) { alert('Vượt quá tồn kho!'); return prev; }
        next[idx] = { ...next[idx], qty: next[idx].qty + 1 };
        return next;
      }
      return [...prev, {
        chiTietId: bt.id,
        tenSanPham: bienTheModal?.tenSanPham || '',
        tenMau: bt.tenMau,
        tenKichThuoc: bt.tenKichThuoc,
        donGia: Number(bt.giaBan ?? 0),
        qty: 1,
        tonKho: bt.soLuong,
      }];
    });
  };

  const handleRemovePosItem = (idx) => {
    setCurrentBill((prev) => prev.filter((_, i) => i !== idx));
  };

  const handleUpdatePosQty = (idx, delta) => {
    setCurrentBill((prev) => {
      const updated = [...prev];
      const newQty = updated[idx].qty + delta;
      if (newQty <= 0) updated.splice(idx, 1);
      else if (newQty > updated[idx].tonKho) { alert('Vượt quá tồn kho!'); return prev; }
      else updated[idx].qty = newQty;
      return updated;
    });
  };

  // ── Thanh toán: lưu hóa đơn + mở modal in bill K80 ──────────────────────
  const handlePosCheckout = async () => {
    if (currentBill.length === 0) { alert('Hóa đơn trống!'); return; }
    if (phuongThuc === 'TIEN_MAT' && (tienKhachDua === '' || Number(tienKhachDua) < billTotal)) {
      alert('Khách đưa chưa đủ tiền!'); return;
    }
    setDangXuLy(true);
    try {
      const res = await axiosClient.post('/ban-hang/thanh-toan', {
        items: currentBill.map((x) => ({ chiTietId: x.chiTietId, soLuong: x.qty })),
        phuongThuc,
        tienGiam: billDiscount || 0,
        tienKhachDua: phuongThuc === 'TIEN_MAT' ? Number(tienKhachDua) : null,
        maGiaoDich: phuongThuc === 'CHUYEN_KHOAN' ? (maGiaoDich || null) : null,
      });
      setBill(res); // axiosClient đã unwrap response.data
      setCurrentBill([]);
      setBillDiscount(0);
      setTienKhachDua('');
      setMaGiaoDich('');
    } catch (err) {
      alert(err.message || 'Thanh toán thất bại!');
    } finally {
      setDangXuLy(false);
    }
  };

  return (
    <>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-full">
        <div className="lg:col-span-2 space-y-4">
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="[F2/F3] Tìm tên giày, mã SP..."
              value={posSearch}
              onChange={(e) => setPosSearch(e.target.value)}
              className="flex-1 bg-white border border-slate-200 rounded-2xl px-4 py-3 text-xs text-slate-900 focus:outline-none focus:border-[#c6f500]"
            />
          </div>

          {posError && <div className="text-red-600 text-xs">{posError}</div>}
          {posLoading && <div className="text-slate-500 text-xs">Đang tải sản phẩm...</div>}

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {posProducts.filter((p) => !posSearch || p.tenSanPham.toLowerCase().includes(posSearch.toLowerCase()) || (p.maSanPham || '').toLowerCase().includes(posSearch.toLowerCase())).map((p) => (
              <div
                key={p.id}
                onClick={() => openBienThe(p)}
                className="bg-white border border-slate-200 hover:border-[#c6f500] rounded-2xl p-2.5 cursor-pointer transition flex flex-col justify-between"
              >
                {/* Chưa có ảnh → placeholder, tránh ô img vỡ */}
                {p.urlAnhChinh
                  ? <img src={toSrc(p.urlAnhChinh)} className="w-full aspect-square rounded-xl object-cover bg-slate-50 mb-2" />
                  : <div className="w-full aspect-square rounded-xl bg-slate-50 mb-2 flex items-center justify-center text-4xl">👟</div>}
                <div>
                  <div className="text-[10px] text-slate-500 font-mono">{p.maSanPham}</div>
                  <h4 className="font-bold text-xs text-slate-900 line-clamp-1">{p.tenSanPham}</h4>
                  <div className="flex justify-between items-center mt-1">
                    <span className="font-black text-xs text-lime-700">{fmtMoney(p.giaBan)}</span>
                    <span className="text-[10px] text-slate-500">Tồn: {p.tongTonKho ?? 0}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* POS Bill Panel */}
        <div className="bg-white border border-slate-200 rounded-3xl p-5 flex flex-col justify-between h-fit lg:h-full print:hidden">
          <div>
            <div className="flex gap-2 border-b border-slate-200 pb-3 mb-3">
              <button
                onClick={() => setActiveBillTab(1)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${activeBillTab === 1 ? 'bg-[#c6f500] text-black' : 'bg-slate-50 text-slate-500'}`}
              >
                Hóa Đơn 1 ({bill1.length})
              </button>
              <button
                onClick={() => setActiveBillTab(2)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${activeBillTab === 2 ? 'bg-[#c6f500] text-black' : 'bg-slate-50 text-slate-500'}`}
              >
                Hóa Đơn 2 ({bill2.length})
              </button>
            </div>

            <div className="space-y-2 max-h-[40vh] overflow-y-auto">
              {currentBill.length === 0 ? (
                <div className="py-8 text-center text-slate-500 text-xs">Hóa đơn đang trống. Click giày bên trái để thêm!</div>
              ) : (
                currentBill.map((item, idx) => (
                  <div key={idx} className="p-2.5 bg-slate-50 rounded-xl border border-slate-200 text-xs space-y-1">
                    <div className="flex justify-between">
                      <span className="font-bold text-slate-900 line-clamp-1">{item.tenSanPham}</span>
                      <button onClick={() => handleRemovePosItem(idx)} className="text-slate-500 hover:text-red-600 font-bold ml-2">✕</button>
                    </div>
                    <div className="flex justify-between text-slate-500 text-[11px]">
                      <span>Size: {item.tenKichThuoc} • {item.tenMau}</span>
                      <span className="font-bold text-lime-700">{(item.donGia * item.qty).toLocaleString('vi-VN')}₫</span>
                    </div>
                    <div className="flex items-center space-x-2 pt-1">
                      <button onClick={() => handleUpdatePosQty(idx, -1)} className="w-5 h-5 bg-white rounded text-slate-900">-</button>
                      <span className="font-bold">{item.qty}</span>
                      <button onClick={() => handleUpdatePosQty(idx, 1)} className="w-5 h-5 bg-white rounded text-slate-900">+</button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="border-t border-slate-200 pt-4 space-y-3 mt-4">
            <div className="text-xs space-y-1.5">
              <div className="flex justify-between text-slate-500">
                <span>Tạm tính hàng:</span>
                <span>{billSubtotal.toLocaleString('vi-VN')}₫</span>
              </div>
              <div className="flex justify-between items-center text-slate-500">
                <span>Giảm giá / Voucher:</span>
                <input
                  type="number"
                  placeholder="0₫"
                  value={billDiscount || ''}
                  onChange={(e) => setBillDiscount(Number(e.target.value))}
                  className="w-24 bg-white border border-slate-200 rounded px-2 py-0.5 text-right text-xs text-lime-700"
                />
              </div>

              {/* ── Phương thức thanh toán ── */}
              <div className="pt-2">
                <label className="block text-slate-700 font-bold mb-1.5">Phương thức thanh toán:</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => setPhuongThuc('TIEN_MAT')}
                    className={`py-2 rounded-xl text-xs font-bold border transition ${
                      phuongThuc === 'TIEN_MAT'
                        ? 'bg-[#c6f500] text-black border-[#c6f500]'
                        : 'bg-slate-50 text-slate-500 border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    💵 Tiền mặt
                  </button>
                  <button
                    onClick={() => setPhuongThuc('CHUYEN_KHOAN')}
                    className={`py-2 rounded-xl text-xs font-bold border transition ${
                      phuongThuc === 'CHUYEN_KHOAN'
                        ? 'bg-[#c6f500] text-black border-[#c6f500]'
                        : 'bg-slate-50 text-slate-500 border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    🏦 Chuyển khoản
                  </button>
                </div>
              </div>

              {phuongThuc === 'TIEN_MAT' ? (
                <div className="space-y-1.5 pt-1">
                  <div className="flex justify-between items-center text-slate-500">
                    <span>Khách đưa:</span>
                    <input
                      type="number"
                      placeholder="0₫"
                      value={tienKhachDua}
                      onChange={(e) => setTienKhachDua(e.target.value)}
                      className="w-28 bg-white border border-slate-200 rounded px-2 py-0.5 text-right text-xs text-slate-900"
                    />
                  </div>
                  <div className="flex justify-between text-slate-500">
                    <span>Tiền thối lại:</span>
                    <span className={`font-bold ${tienThoi !== null ? 'text-lime-700' : 'text-slate-400'}`}>
                      {tienThoi !== null ? tienThoi.toLocaleString('vi-VN') + '₫' : '—'}
                    </span>
                  </div>
                </div>
              ) : (
                <div className="flex justify-between items-center text-slate-500 pt-1">
                  <span>Mã giao dịch (tùy chọn):</span>
                  <input
                    type="text"
                    placeholder="FT123456..."
                    value={maGiaoDich}
                    onChange={(e) => setMaGiaoDich(e.target.value)}
                    className="w-28 bg-white border border-slate-200 rounded px-2 py-0.5 text-right text-xs text-slate-900"
                  />
                </div>
              )}

              <div className="flex justify-between text-base font-black text-slate-900 pt-2 border-t border-slate-200">
                <span>Khách Cần Trả:</span>
                <span className="text-lime-700">{billTotal.toLocaleString('vi-VN')}₫</span>
              </div>
            </div>

            <button
              onClick={handlePosCheckout}
              disabled={dangXuLy}
              className="w-full py-3.5 bg-[#c6f500] hover:bg-[#b0dc00] disabled:opacity-50 text-black font-black uppercase text-xs rounded-xl shadow-lg transition"
            >
              {dangXuLy ? 'Đang xử lý...' : '[F9] Thanh Toán & In Bill K80'}
            </button>
          </div>
        </div>
      </div>

      {/* ── MODAL: BIẾN THỂ (chọn màu/size khi bán) ── */}
      {bienTheModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4 print:hidden" onClick={() => setBienTheModal(null)}>
          <div className="bg-white border border-slate-200 rounded-3xl p-6 w-full max-w-lg space-y-4" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-center">
              <h3 className="font-black text-sm uppercase text-slate-900">{bienTheModal.tenSanPham}</h3>
              <button onClick={() => setBienTheModal(null)} className="text-slate-500 hover:text-red-600 font-bold">✕</button>
            </div>
            {bienTheList.length === 0 ? (
              <div className="text-slate-500 text-xs py-6 text-center">Đang tải biến thể...</div>
            ) : (
              <div className="grid grid-cols-2 gap-2">
                {bienTheList.map((bt) => (
                  <button
                    key={bt.id}
                    onClick={() => { addToBill(bt); setBienTheModal(null); }}
                    disabled={bt.soLuong <= 0}
                    className={`p-3 rounded-xl border text-left text-xs transition ${
                      bt.soLuong <= 0
                        ? 'border-slate-200 bg-slate-50 text-slate-400 cursor-not-allowed'
                        : 'border-slate-200 bg-slate-50 hover:border-[#c6f500] text-slate-900'
                    }`}
                  >
                    <div className="flex items-center gap-1.5 font-bold">
                      <span className="w-3 h-3 rounded-full inline-block border border-slate-300" style={{ background: bt.maHex || '#555' }}></span>
                      {bt.tenMau} • Size {bt.tenKichThuoc}
                    </div>
                    <div className="flex justify-between mt-1 text-[11px]">
                      <span className="text-lime-700 font-black">{fmtMoney(bt.giaBan)}</span>
                      <span className={bt.soLuong <= 0 ? 'text-red-600' : 'text-slate-500'}>Tồn: {bt.soLuong}</span>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── MODAL: BILL K80 — in hóa đơn sau thanh toán ── */}
      <BillK80Modal bill={bill} session={session} onClose={() => setBill(null)} />
    </>
  );
}

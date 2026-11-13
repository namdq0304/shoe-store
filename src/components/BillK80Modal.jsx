import React, { useEffect, useRef } from 'react';

/**
 * Modal in hóa đơn nhiệt K80 — dùng chung cho màn bán hàng tại kho (sau thanh toán)
 * và tab Quản lý hóa đơn (in lại).
 * Props:
 *   bill    — dữ liệu bill từ API (/ban-hang/thanh-toan hoặc /ban-hang/hoa-don/{id}/bill); null → không hiển thị
 *   session — phiên đăng nhập (in tên thu ngân)
 *   onClose — đóng modal
 */
export default function BillK80Modal({ bill, session, onClose }) {
  const billRef = useRef(null);

  // Mở hộp thoại in sau khi modal bill render xong
  useEffect(() => {
    if (bill && billRef.current) {
      window.print();
    }
  }, [bill]);

  if (!bill) return null;

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4 print:static print:bg-white print:block print:p-0">
      <div className="bg-white text-black rounded-2xl p-6 w-full max-w-sm font-mono text-[11px] leading-relaxed shadow-2xl print:shadow-none print:rounded-none print:max-w-full print:p-0"
           ref={billRef}>
        <div className="text-center space-y-0.5">
          <div className="text-base font-black tracking-tight italic">Vibe<span className="text-lime-600">Flow</span> Sneaker</div>
          <div>298 Cầu Giấy, Hà Nội</div>
          <div>Hotline: 0550000888</div>
          <div className="border-t border-dashed border-black my-2"></div>
          <div className="font-black uppercase text-xs">Hóa đơn bán hàng</div>
          <div>#{bill.maHoaDon}</div>
          <div>{new Date(bill.ngayTao).toLocaleString('vi-VN')}</div>
          <div>Thu ngân: {session?.hoTen || session?.name || '—'}</div>
        </div>
        <div className="border-t border-dashed border-black my-2"></div>
        {bill.danhSach.map((l, i) => (
          <div key={i} className="mb-1.5">
            <div className="font-bold">{l.tenSanPham}</div>
            <div className="flex justify-between">
              <span>{l.kichThuoc} • {l.mauSac} × {l.soLuong}</span>
              <span>{Number(l.thanhTien).toLocaleString('vi-VN')}₫</span>
            </div>
          </div>
        ))}
        <div className="border-t border-dashed border-black my-2"></div>
        <div className="flex justify-between"><span>Tạm tính:</span><span>{Number(bill.tongTien).toLocaleString('vi-VN')}₫</span></div>
        <div className="flex justify-between"><span>Giảm giá:</span><span>-{Number(bill.tienGiam || 0).toLocaleString('vi-VN')}₫</span></div>
        <div className="flex justify-between font-black text-sm mt-1"><span>TỔNG CỘNG:</span><span>{Number(bill.thanhTien).toLocaleString('vi-VN')}₫</span></div>
        <div className="flex justify-between mt-1">
          <span>Thanh toán:</span><span className="font-bold">{bill.phuongThuc || '—'}</span>
        </div>
        {bill.tienKhachDua != null && (
          <div className="flex justify-between"><span>Khách đưa:</span><span>{Number(bill.tienKhachDua).toLocaleString('vi-VN')}₫</span></div>
        )}
        {bill.tienThoi != null && (
          <div className="flex justify-between"><span>Tiền thối:</span><span>{Number(bill.tienThoi).toLocaleString('vi-VN')}₫</span></div>
        )}
        {bill.maGiaoDich && (
          <div className="flex justify-between"><span>Mã GD:</span><span>{bill.maGiaoDich}</span></div>
        )}
        <div className="border-t border-dashed border-black my-2"></div>
        <div className="text-center space-y-0.5">
          <div>Cảm ơn quý khách — Hẹn gặp lại!</div>
          <div>Đổi trả trong 7 ngày với hóa đơn này</div>
          <div className="text-[9px] mt-1">--- VibeFlow POS System ---</div>
        </div>
      </div>
      <div className="absolute bottom-6 flex gap-3 print:hidden">
        <button onClick={() => window.print()} className="px-5 py-2.5 bg-[#c6f500] text-black font-black text-xs rounded-xl">🖨️ In Bill K80</button>
        <button onClick={onClose} className="px-5 py-2.5 bg-slate-100 text-slate-900 font-bold text-xs rounded-xl">Đóng</button>
      </div>
    </div>
  );
}

import ModalShell from './ModalShell';
import { formatVND } from '../../utils';

export default function OrderDetailModal({ order, onClose }) {
  return (
    <ModalShell onClose={onClose} maxWidth="max-w-lg">
      <div className="flex justify-between items-center border-b border-slate-100 pb-3">
        <div>
          <span className="text-[10px] text-slate-400 uppercase font-bold">Chi Tiết Đơn Hàng</span>
          <h3 className="font-mono font-black text-sm text-indigo-600">#{order.id}</h3>
        </div>
        <button onClick={onClose} className="text-slate-400 hover:text-slate-700 font-bold text-base">✕</button>
      </div>

      <div className="space-y-3">
        <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
          <div className="font-bold text-slate-800">Sản phẩm đặt mua:</div>
          {order.items.map((it, idx) => (
            <div key={idx} className="flex justify-between text-slate-600">
              <span>{it.qty}x {it.name} (Size {it.size} - {it.color})</span>
              <span className="font-bold text-amber-600">{formatVND(it.price)}</span>
            </div>
          ))}
        </div>

        <div className="space-y-1.5 text-slate-500">
          <div className="flex justify-between"><span>Trạng thái đơn:</span><b className="text-slate-800">{order.status}</b></div>
          <div className="flex justify-between"><span>Người nhận:</span><b className="text-slate-800">{order.recipientName} ({order.phone})</b></div>
          <div className="flex justify-between"><span>Địa chỉ giao hàng:</span><b className="text-slate-800 text-right max-w-xs">{order.address}</b></div>
          <div className="flex justify-between"><span>Ghi chú đơn hàng:</span><span className="text-slate-800">{order.note || 'Không có'}</span></div>
          <div className="flex justify-between"><span>Phương thức thanh toán:</span><b className="text-slate-800">{order.paymentMethod}</b></div>
          <div className="flex justify-between text-sm font-black text-slate-900 pt-2 border-t border-slate-100">
            <span>Tổng thanh toán:</span><span className="text-amber-600">{formatVND(order.total)}</span>
          </div>
        </div>
      </div>

      <div className="pt-2">
        <button onClick={onClose} className="w-full py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl transition">Đóng</button>
      </div>
    </ModalShell>
  );
}

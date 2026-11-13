import { useState } from 'react';
import ModalShell from './ModalShell';
import { CANCEL_REASONS, INPUT_CLS } from '../../constants';
import { formatVND } from '../../utils';

export default function CancelOrderModal({ order, onClose, onConfirm }) {
  const [reason, setReason] = useState(CANCEL_REASONS[0]);

  return (
    <ModalShell onClose={onClose}>
      <div className="flex justify-between items-center border-b border-slate-100 pb-3">
        <h3 className="font-black text-sm uppercase text-red-600">Xác Nhận Hủy Đơn #{order.id}</h3>
        <button onClick={onClose} className="text-slate-400 hover:text-slate-700 font-bold">✕</button>
      </div>

      <p className="text-slate-600">
        Bạn có chắc chắn muốn hủy đơn hàng <b className="text-slate-900">#{order.id}</b> trị giá <b className="text-amber-600">{formatVND(order.total)}</b> không?
      </p>

      <div>
        <label className="block text-slate-500 mb-1 font-bold">Vui lòng chọn lý do hủy:</label>
        <select value={reason} onChange={(e) => setReason(e.target.value)} className={INPUT_CLS}>
          {CANCEL_REASONS.map((r) => <option key={r}>{r}</option>)}
        </select>
      </div>

      <div className="flex gap-2 pt-2">
        <button onClick={onClose} className="flex-1 py-2.5 bg-slate-100 text-slate-600 font-bold rounded-xl hover:bg-slate-200 transition">Giữ Đơn Hàng</button>
        <button onClick={() => onConfirm(reason)} className="flex-1 py-2.5 bg-red-600 hover:bg-red-700 text-white font-black uppercase rounded-xl transition">Xác Nhận Hủy Đơn</button>
      </div>
    </ModalShell>
  );
}

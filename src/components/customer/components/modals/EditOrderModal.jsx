import { useState } from 'react';
import ModalShell from './ModalShell';
import { INPUT_CLS } from '../../constants';

export default function EditOrderModal({ order, onClose, onSave }) {
  const [draft, setDraft] = useState({ ...order });
  const set = (field) => (e) => setDraft({ ...draft, [field]: e.target.value });

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(draft);
  };

  return (
    <ModalShell onClose={onClose}>
      <div className="flex justify-between items-center border-b border-slate-100 pb-3">
        <h3 className="font-black text-sm uppercase text-slate-900">Sửa Thông Tin Nhận Hàng (#{order.id})</h3>
        <button onClick={onClose} className="text-slate-400 hover:text-slate-700 font-bold">✕</button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-3">
        <div>
          <label className="block text-slate-600 font-bold mb-1">Họ Tên Người Nhận</label>
          <input required value={draft.recipientName} onChange={set('recipientName')} className={INPUT_CLS} />
        </div>
        <div>
          <label className="block text-slate-600 font-bold mb-1">Số Điện Thoại</label>
          <input required value={draft.phone} onChange={set('phone')} className={INPUT_CLS} />
        </div>
        <div>
          <label className="block text-slate-600 font-bold mb-1">Địa Chỉ Nhận Hàng</label>
          <textarea required rows={2} value={draft.address} onChange={set('address')} className={INPUT_CLS} />
        </div>
        <div>
          <label className="block text-slate-600 font-bold mb-1">Ghi Chú Giao Hàng</label>
          <input value={draft.note || ''} onChange={set('note')} placeholder="Ví dụ: Gọi trước khi giao, giao sau 18h..." className={INPUT_CLS} />
        </div>
        <div className="flex gap-2 pt-2">
          <button type="button" onClick={onClose} className="flex-1 py-2.5 bg-slate-100 text-slate-600 font-bold rounded-xl hover:bg-slate-200 transition">Hủy</button>
          <button type="submit" className="flex-1 py-2.5 bg-indigo-600 text-white font-black uppercase rounded-xl hover:bg-indigo-700 transition">Lưu Thay Đổi</button>
        </div>
      </form>
    </ModalShell>
  );
}

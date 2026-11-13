import { useState } from 'react';
import ModalShell from './ModalShell';
import { INPUT_CLS, PAYMENT_METHODS } from '../../constants';
import { formatVND } from '../../utils';

export default function CheckoutModal({ session, total, onClose, onSubmit }) {
  const [form, setForm] = useState({
    name: session?.name || '',
    phone: session?.phone || '',
    address: session?.address || '',
    note: '',
    payment: PAYMENT_METHODS[0],
  });
  const set = (field) => (e) => setForm({ ...form, [field]: e.target.value });

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(form);
  };

  return (
    <ModalShell onClose={onClose} maxWidth="max-w-lg">
      <div className="flex justify-between items-center border-b border-slate-100 pb-3">
        <h3 className="font-black text-sm uppercase text-slate-900">Thanh Toán Đặt Hàng VibeFlow</h3>
        <button onClick={onClose} className="text-slate-400 hover:text-slate-700 font-bold">✕</button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-3">
        <div>
          <label className="block text-slate-600 font-bold mb-1">Họ Tên Người Nhận</label>
          <input required value={form.name} onChange={set('name')} className={INPUT_CLS} />
        </div>
        <div>
          <label className="block text-slate-600 font-bold mb-1">Số Điện Thoại</label>
          <input required value={form.phone} onChange={set('phone')} className={INPUT_CLS} />
        </div>
        <div>
          <label className="block text-slate-600 font-bold mb-1">Địa Chỉ Nhận Hàng</label>
          <input required value={form.address} onChange={set('address')} className={INPUT_CLS} />
        </div>
        <div>
          <label className="block text-slate-600 font-bold mb-1">Ghi Chú Đơn Hàng (tùy chọn)</label>
          <input value={form.note} onChange={set('note')} placeholder="Giao giờ hành chính, gọi trước khi đến..." className={INPUT_CLS} />
        </div>
        <div>
          <label className="block text-slate-600 font-bold mb-1">Phương Thức Thanh Toán</label>
          <select value={form.payment} onChange={set('payment')} className={INPUT_CLS}>
            {PAYMENT_METHODS.map((m) => <option key={m}>{m}</option>)}
          </select>
        </div>
        <div className="pt-2">
          <button type="submit" className="w-full py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white font-black uppercase rounded-xl transition shadow-indigo">
            Xác Nhận Đặt Hàng ({formatVND(total)}) ➔
          </button>
        </div>
      </form>
    </ModalShell>
  );
}

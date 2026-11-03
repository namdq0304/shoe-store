import { formatVND } from '../../utils';

const statusCls = (status) =>
  status === 'Chờ xác nhận'
    ? 'bg-amber-50 text-amber-600 border border-amber-200'
    : status === 'Đã hủy'
      ? 'bg-red-50 text-red-600 border border-red-200'
      : 'bg-emerald-50 text-emerald-600 border border-emerald-200';

export default function OrderCard({ order, onView, onEdit, onCancel }) {
  const canModify = order.status === 'Chờ xác nhận';
  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-4 sm:p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 text-xs hover:border-indigo-300 hover:shadow-sm transition">
      <div className="flex items-start space-x-3.5">
        <img src={order.image} alt="" className="w-14 h-14 rounded-xl object-cover bg-slate-100 shrink-0" />
        <div className="space-y-1">
          <div className="flex items-center space-x-2">
            <span className="font-mono font-bold text-indigo-600">#{order.id}</span>
            <span className="text-slate-300">•</span>
            <span className="text-slate-400 text-[11px]">{order.date}</span>
          </div>
          <div className="font-bold text-slate-800 leading-tight">
            {order.items.map((i) => `${i.qty}x ${i.name} (Sz ${i.size})`).join(', ')}
          </div>
          <div className="text-[11px] text-slate-500">
            Người nhận: <b className="text-slate-700">{order.recipientName}</b> ({order.phone}) • {order.address}
          </div>
          {order.cancelReason && <div className="text-[11px] text-red-500 italic">Lý do hủy: {order.cancelReason}</div>}
        </div>
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between md:justify-end gap-3 shrink-0 pt-2 md:pt-0 border-t md:border-t-0 border-slate-100">
        <div className="text-left md:text-right">
          <div className="font-black text-sm text-amber-600">{formatVND(order.total)}</div>
          <span className={`inline-block px-2.5 py-0.5 rounded text-[10px] font-bold mt-1 ${statusCls(order.status)}`}>{order.status}</span>
        </div>

        <div className="flex items-center space-x-2">
          <button onClick={() => onView(order)} className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-700 text-xs font-bold rounded-xl transition">
            Xem Chi Tiết
          </button>
          {canModify && (
            <>
              <button onClick={() => onEdit(order)} className="px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 text-indigo-600 text-xs font-bold rounded-xl transition" title="Sửa tên, SĐT hoặc địa chỉ nhận hàng">
                Sửa Địa Chỉ
              </button>
              <button onClick={() => onCancel(order)} className="px-3 py-1.5 bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 text-xs font-bold rounded-xl transition" title="Hủy đơn hàng nếu đổi ý">
                Hủy Đơn
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

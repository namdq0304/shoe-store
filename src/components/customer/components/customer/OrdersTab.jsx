import { ORDER_FILTERS } from '../../constants';
import OrderCard from './OrderCard';

export default function OrdersTab({ orders, orderFilter, onChangeFilter, onView, onEdit, onCancel }) {
  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        {ORDER_FILTERS.map((f) => (
          <button
            key={f.id}
            onClick={() => onChangeFilter(f.id)}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
              orderFilter === f.id ? 'bg-indigo-600 text-white shadow-indigo' : 'bg-white text-slate-500 border border-slate-200 hover:text-slate-800'
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {orders.length === 0 ? (
        <div className="py-12 text-center text-slate-400 text-xs bg-white rounded-2xl border border-slate-200">
          Không có đơn hàng nào trong mục này.
        </div>
      ) : (
        orders.map((o) => <OrderCard key={o.id} order={o} onView={onView} onEdit={onEdit} onCancel={onCancel} />)
      )}
    </div>
  );
}

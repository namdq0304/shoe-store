import { useState } from 'react';
import OrdersTab from './OrdersTab';
import ProfileTab from './ProfileTab';
import PasswordTab from './PasswordTab';

const tabCls = (active) =>
  `py-3 border-b-2 transition ${active ? 'border-indigo-500 text-indigo-600' : 'border-transparent text-slate-400 hover:text-slate-700'}`;

export default function CustomerPortal({
  session, onLogout,
  orders, totalOrders, orderFilter, onChangeFilter,
  onViewOrder, onEditOrder, onCancelOrder,
}) {
  const [subTab, setSubTab] = useState('orders'); // 'orders' | 'profile' | 'password'

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-sm">
        <div className="flex items-center space-x-4">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-600 text-white font-black text-2xl flex items-center justify-center shadow-indigo">
            {session?.name ? session.name.charAt(0) : 'U'}
          </div>
          <div>
            <h2 className="text-xl font-black text-slate-900">{session?.name || 'Nguyễn Văn An'}</h2>
            <div className="text-xs text-slate-500">{session?.phone || '0987.654.321'} • {session?.email || 'an.nguyen@vibeflow.vn'}</div>
            <div className="mt-1 inline-flex items-center space-x-1.5 px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-600 border border-amber-200 text-[11px] font-bold">
              <span>👑 Thẻ VIP Vàng (Gold) • Tích lũy: 850 Điểm</span>
            </div>
          </div>
        </div>
        <button onClick={onLogout} className="px-4 py-2 bg-slate-100 hover:bg-red-50 hover:text-red-600 border border-slate-200 hover:border-red-200 text-xs font-bold rounded-xl transition text-slate-600">
          Đăng Xuất
        </button>
      </div>

      <div className="flex space-x-6 border-b border-slate-200 text-xs font-bold">
        <button onClick={() => setSubTab('orders')} className={tabCls(subTab === 'orders')}>Đơn Hàng Của Tôi ({totalOrders})</button>
        <button onClick={() => setSubTab('profile')} className={tabCls(subTab === 'profile')}>Thông Tin Cá Nhân</button>
        <button onClick={() => setSubTab('password')} className={tabCls(subTab === 'password')}>Đổi Mật Khẩu</button>
      </div>

      {subTab === 'orders' && (
        <OrdersTab orders={orders} orderFilter={orderFilter} onChangeFilter={onChangeFilter}
          onView={onViewOrder} onEdit={onEditOrder} onCancel={onCancelOrder} />
      )}
      {subTab === 'profile' && <ProfileTab session={session} />}
      {subTab === 'password' && <PasswordTab />}
    </div>
  );
}

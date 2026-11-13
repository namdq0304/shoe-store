import { formatVND } from '../../utils';

export default function CartDrawer({
  cart, subtotal, discountAmount, total,
  voucherCode, onVoucherChange, onApplyVoucher,
  onUpdateQty, onCheckout, onClose,
}) {
  return (
    <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm flex justify-end" onMouseDown={onClose}>
      <div className="w-full max-w-md bg-white border-l border-slate-200 p-6 flex flex-col justify-between h-full shadow-2xl" onMouseDown={(e) => e.stopPropagation()}>
        <div>
          <div className="flex justify-between items-center pb-4 border-b border-slate-200">
            <h3 className="font-black uppercase text-sm text-slate-900">Giỏ Hàng ({cart.length})</h3>
            <button onClick={onClose} className="text-slate-400 hover:text-slate-700 font-bold">✕</button>
          </div>

          {cart.length === 0 ? (
            <div className="py-16 text-center text-slate-400 text-xs">Giỏ hàng đang trống!</div>
          ) : (
            <div className="divide-y divide-slate-100 my-4 max-h-[50vh] overflow-y-auto">
              {cart.map((item, idx) => (
                <div key={`${item.product.id}-${item.size}`} className="py-3 flex items-center space-x-3 text-xs">
                  <img src={item.product.image} alt="" className="w-14 h-14 rounded-xl object-cover bg-slate-100" />
                  <div className="flex-1">
                    <h4 className="font-bold text-slate-800 line-clamp-1">{item.product.name}</h4>
                    <div className="text-slate-500 text-[11px]">Size: <b>{item.size}</b></div>
                    <div className="text-amber-600 font-bold mt-1">{formatVND(item.product.price)}</div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button onClick={() => onUpdateQty(idx, -1)} className="w-6 h-6 rounded bg-slate-100 text-slate-700 font-bold hover:bg-slate-200 transition">-</button>
                    <span className="text-slate-800 font-bold">{item.qty}</span>
                    <button onClick={() => onUpdateQty(idx, 1)} className="w-6 h-6 rounded bg-slate-100 text-slate-700 font-bold hover:bg-slate-200 transition">+</button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="border-t border-slate-200 pt-4 space-y-3">
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="Mã voucher (KICKS100K)"
              value={voucherCode}
              onChange={(e) => onVoucherChange(e.target.value)}
              className="flex-1 bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-800 focus:outline-none focus:border-indigo-400 transition"
            />
            <button onClick={onApplyVoucher} className="px-3 py-2 bg-indigo-600 text-white font-bold text-xs rounded-xl hover:bg-indigo-700 transition">Áp Dụng</button>
          </div>

          <div className="text-xs space-y-1.5 pt-2">
            <div className="flex justify-between text-slate-500"><span>Tạm tính:</span><span>{formatVND(subtotal)}</span></div>
            {discountAmount > 0 && (
              <div className="flex justify-between text-emerald-600"><span>Giảm voucher:</span><span>-{formatVND(discountAmount)}</span></div>
            )}
            <div className="flex justify-between text-sm font-black text-slate-900 pt-2 border-t border-slate-100">
              <span>Tổng tiền:</span><span className="text-amber-600">{formatVND(total)}</span>
            </div>
          </div>

          <button
            disabled={cart.length === 0}
            onClick={onCheckout}
            className="w-full py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white font-black uppercase text-xs rounded-xl transition shadow-indigo disabled:opacity-50"
          >
            Tiến Hành Đặt Hàng ➔
          </button>
        </div>
      </div>
    </div>
  );
}

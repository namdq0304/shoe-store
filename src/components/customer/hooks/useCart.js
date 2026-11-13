import { useCartStore } from '../../../store';

/**
 * Hook useCart kết nối trực tiếp với Zustand store useCartStore.
 * Giữ nguyên interface trả về để các component đang dùng không bị gãy vỡ,
 * đồng thời trạng thái giỏ hàng giờ đây là Toàn Cục (Global) & được lưu trong localStorage.
 */
export default function useCart() {
  const cart = useCartStore((s) => s.cart);
  const subtotal = useCartStore((s) => s.subtotal);
  const discountAmount = useCartStore((s) => s.discountAmount);
  const total = useCartStore((s) => s.total);
  const itemCount = useCartStore((s) => s.itemCount);
  const voucherCode = useCartStore((s) => s.voucherCode);
  const setVoucherCode = useCartStore((s) => s.setVoucherCode);
  const applyVoucher = useCartStore((s) => s.applyVoucher);
  const addToCart = useCartStore((s) => s.addToCart);
  const updateQty = useCartStore((s) => s.updateQty);
  const removeFromCart = useCartStore((s) => s.removeFromCart);
  const clearCart = useCartStore((s) => s.clearCart);

  return {
    cart,
    subtotal,
    discountAmount,
    total,
    itemCount,
    voucherCode,
    setVoucherCode,
    applyVoucher,
    addToCart,
    updateQty,
    removeFromCart,
    clearCart,
  };
}

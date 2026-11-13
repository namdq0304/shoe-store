import { useMemo } from 'react';
import { useOrderStore } from '../../../store';

/**
 * Hook useOrders kết nối trực tiếp với Zustand store useOrderStore.
 * Trạng thái đơn hàng giờ đây là Toàn Cục & tự động lưu vào localStorage khi đặt/hủy/sửa.
 */
export default function useOrders() {
  const orders = useOrderStore((s) => s.orders);
  const orderFilter = useOrderStore((s) => s.orderFilter);
  const setOrderFilter = useOrderStore((s) => s.setOrderFilter);
  const placeOrder = useOrderStore((s) => s.placeOrder);
  const cancelOrder = useOrderStore((s) => s.cancelOrder);
  const updateOrder = useOrderStore((s) => s.updateOrder);

  const filteredOrders = useMemo(() => {
    return orders.filter((o) => {
      if (orderFilter === 'all') return true;
      if (orderFilter === 'Đã giao') return (o.status || '').includes('Đã giao');
      return o.status === orderFilter;
    });
  }, [orders, orderFilter]);

  return {
    orders,
    filteredOrders,
    orderFilter,
    setOrderFilter,
    placeOrder,
    cancelOrder,
    updateOrder,
  };
}

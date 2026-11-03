import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { MOCK_MY_ORDERS } from '../components/customer/constants';

/**
 * Zustand Store quản lý Đơn hàng của khách hàng — có persist vào localStorage.
 * Giúp bảo toàn đơn vừa đặt khi tải lại trang (F5).
 */
export const useOrderStore = create(
  persist(
    (set, get) => ({
      orders: MOCK_MY_ORDERS,
      orderFilter: 'all',

      setOrderFilter: (filter) => set({ orderFilter: filter }),

      placeOrder: ({ cart, total, form }) => {
        const id = 'ORD-' + Math.floor(1000 + Math.random() * 9000);
        const order = {
          id,
          items: cart.map((i) => ({
            name: i.product?.name || 'Sản phẩm',
            size: i.size,
            color: i.color,
            qty: i.qty,
            price: i.product?.price || 0,
          })),
          image: cart[0]?.product?.image,
          date: 'Vừa xong',
          total,
          recipientName: form.name,
          phone: form.phone,
          address: form.address,
          note: form.note,
          paymentMethod: form.payment,
          status: 'Chờ xác nhận',
          cancelReason: null,
        };

        set((state) => ({ orders: [order, ...state.orders] }));
        return order;
      },

      cancelOrder: (id, reason) =>
        set((state) => ({
          orders: state.orders.map((o) =>
            o.id === id ? { ...o, status: 'Đã hủy', cancelReason: reason } : o
          ),
        })),

      updateOrder: (updated) =>
        set((state) => ({
          orders: state.orders.map((o) => (o.id === updated.id ? updated : o)),
        })),

      resetOrders: () => set({ orders: MOCK_MY_ORDERS, orderFilter: 'all' }),
    }),
    {
      name: 'vibeflow_orders',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ orders: state.orders }),
    }
  )
);

export default useOrderStore;

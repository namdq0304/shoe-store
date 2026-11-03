import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { VOUCHERS } from '../data/mockData';
import { formatVND } from '../components/customer/utils';
import gioHangApi  from '../api/GioHangApi.js';
import useAuthStore from "./useAuthStore.js";

const isLoggedIn = () => {
    return true
};

export function calculateCartTotals(cart = [], appliedVoucher = null) {
    const subtotal = cart.reduce(
        (sum, item) => sum + (Number(item?.product?.price) || 0) * (Number(item?.qty) || 1),
        0
    );
    const discountAmount =
        appliedVoucher && subtotal >= appliedVoucher.minOrder ? appliedVoucher.discount : 0;
    const total = Math.max(0, subtotal - discountAmount);
    const itemCount = cart.reduce((sum, item) => sum + (Number(item?.qty) || 0), 0);
    return { subtotal, discountAmount, total, itemCount };
}

// Chuyển 1 dòng từ server sang đúng shape mà UI đang dùng
const mapServerItem = (r) => ({
    id: r.id,                               // id dòng giỏ trên server
    chiTietSanPhamId: r.chiTietSanPhamId,
    product: {
        id: r.sanPhamId,
        name: r.tenSanPham,
        image: r.urlAnh,
        price: Number(r.donGia),
    },
    size: r.kichThuoc,
    color: r.mauSac,
    qty: r.soLuong,
    tonKho: r.tonKho,
});

// Tìm biến thể (màu + size) -> chiTietSanPhamId
const findVariantId = (product, size, color) =>
    product?.variants?.find((v) => v.kichThuoc === size && v.mauSac === color)?.id ??
    product?.chiTietSanPhamId ??
    null;

export const useCartStore = create(
    persist(
        (set, get) => ({
            cart: [],
            voucherCode: '',
            appliedVoucher: null,
            loading: false,
            ...calculateCartTotals([], null),

            _setTotals: (totals) => set(totals),
            setVoucherCode: (code) => set({ voucherCode: code }),

            _setCart: (cart) =>
                set({ cart, ...calculateCartTotals(cart, get().appliedVoucher) }),

            // Lấy giỏ từ server (gọi sau khi đăng nhập hoặc khi mở app)
            fetchCart: async () => {
                console.log("call get All giỏ hangg" ,isLoggedIn())
                console.log(isLoggedIn())
                if (!isLoggedIn()) return;
                set({ loading: true });
                try {
                    console.log("call get All giỏ hangg")
                    const rows = await gioHangApi.getAll();
                    get()._setCart(rows.map(mapServerItem));
                } catch (e) {
                    console.error('Không tải được giỏ hàng:', e.message);
                } finally {
                    set({ loading: false });
                }
            },

            // Gộp giỏ guest vào giỏ server ngay sau khi đăng nhập
            mergeGuestCart: async () => {
                if (!isLoggedIn()) return;
                const guestItems = get().cart.filter((i) => !i.id && i.chiTietSanPhamId);
                for (const i of guestItems) {
                    try {
                        await gioHangApi.add(i.chiTietSanPhamId, i.qty);
                    } catch (e) {
                        console.warn('Bỏ qua 1 sản phẩm khi gộp giỏ:', e.message);
                    }
                }
                await get().fetchCart();
            },

            // Gọi khi đăng xuất
            resetOnLogout: () =>
                set({ cart: [], voucherCode: '', appliedVoucher: null, ...calculateCartTotals([], null) }),

            // Trả về { ok, message } để UI hiện toast
            addToCart: async (product, size, color = product?.colors?.[0] || '') => {
                console.log(" 98 có chạy k")
                const variantId = product.variantId
                if (!variantId) return { ok: false, message: 'Vui lòng chọn màu và kích thước' };

                if (isLoggedIn()) {
                    try {
                        console.log("có chạy k")
                        await gioHangApi.add(variantId, 1);
                        await get().fetchCart();
                        return { ok: true, message: 'Đã thêm vào giỏ hàng' };
                    } catch (e) {
                        return { ok: false, message: e.message };
                    }
                }

                // Guest: lưu local
                const cur = get().cart;
                const idx = cur.findIndex((i) => i.chiTietSanPhamId === variantId);
                const newCart =
                    idx > -1
                        ? cur.map((it, k) => (k === idx ? { ...it, qty: it.qty + 1 } : it))
                        : [...cur, { chiTietSanPhamId: variantId, product, size, color, qty: 1 }];
                get()._setCart(newCart);
                return { ok: true, message: 'Đã thêm vào giỏ hàng' };
            },

            updateQty: async (idx, delta) => {
                const item = get().cart[idx];
                if (!item) return { ok: false, message: 'Không tìm thấy sản phẩm' };
                const newQty = item.qty + delta;

                if (isLoggedIn() && item.id) {
                    try {
                        await gioHangApi.update(item.id, Math.max(0, newQty)); // 0 = xóa
                        await get().fetchCart();
                        return { ok: true };
                    } catch (e) {
                        return { ok: false, message: e.message };
                    }
                }

                const newCart = get()
                    .cart.map((it, k) => (k === idx ? { ...it, qty: newQty } : it))
                    .filter((it) => it.qty > 0);
                get()._setCart(newCart);
                return { ok: true };
            },

            removeFromCart: async (idx) => {
                const item = get().cart[idx];
                if (!item) return { ok: false };

                if (isLoggedIn() && item.id) {
                    try {
                        await gioHangApi.delete(item.id);
                        await get().fetchCart();
                        return { ok: true };
                    } catch (e) {
                        return { ok: false, message: e.message };
                    }
                }
                get()._setCart(get().cart.filter((_, k) => k !== idx));
                return { ok: true };
            },

            clearCart: async () => {
                if (isLoggedIn()) {
                    try { await gioHangApi.clear(); } catch (e) { console.error(e.message); }
                }
                set({ cart: [], voucherCode: '', appliedVoucher: null, ...calculateCartTotals([], null) });
            },

            applyVoucher: () => {
                const { voucherCode, subtotal } = get();
                const v = VOUCHERS.find((x) => x.code === (voucherCode || '').trim().toUpperCase());
                if (!v)
                    return { ok: false, message: 'Mã voucher không hợp lệ! Hãy thử nhập: KICKS100K hoặc VIBEFLOW10' };
                if (subtotal < v.minOrder)
                    return { ok: false, message: `Đơn hàng cần đạt tối thiểu ${formatVND(v.minOrder)} để dùng mã này!` };
                set({ appliedVoucher: v, ...calculateCartTotals(get().cart, v) });
                return { ok: true, message: `🎉 Áp dụng mã ${v.code} thành công: Giảm ${formatVND(v.discount)}` };
            },
        }),
        {
            name: 'vibeflow_cart',
            storage: createJSONStorage(() => localStorage),
            partialize: (state) => ({
                cart: state.cart,
                voucherCode: state.voucherCode,
                appliedVoucher: state.appliedVoucher,
            }),
            onRehydrateStorage: () => (state) => {
                if (state) state._setTotals?.(calculateCartTotals(state.cart || [], state.appliedVoucher));
            },
        }
    )
);

export default useCartStore;
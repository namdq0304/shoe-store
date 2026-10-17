import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import {
  getCurrentSession,
  setAuthSession,
  clearAuthSession,
  updateAccessToken as updateStorageToken,
} from '../api/authStorage';

/**
 * Zustand Store quản lý trạng thái xác thực toàn cục cho VibeFlow
 */
export const useAuthStore = create(
  persist(
    (set, get) => ({
      session: getCurrentSession(),
      loading: false,

      // Hàm đăng nhập: Lưu session vào state và đồng bộ localStorage
      login: (sessionData) => {
        setAuthSession(sessionData);
        set({ session: sessionData });
      },

      // Hàm đăng xuất: Dọn dẹp session và tokens
      logout: () => {
        clearAuthSession();
        set({ session: null });
      },

      // Cập nhật access token mới khi refresh token thành công
      setAccessToken: (newAccessToken) => {
        updateStorageToken(newAccessToken);
        const currentSession = get().session;
        if (currentSession) {
          set({
            session: {
              ...currentSession,
              accessToken: newAccessToken,
            },
          });
        }
      },

      // Getters / Helper flags
      isAuthenticated: () => !!get().session,
      isAdmin: () => get().session?.role === 'ADMIN',
      isCashier: () => get().session?.role === 'CASHIER',
      isStaff: () => {
        const role = get().session?.role;
        return role === 'ADMIN' || role === 'CASHIER';
      },
      isCustomer: () => get().session?.role === 'KHACH_HANG' || get().session?.role === 'CUSTOMER',
    }),
    {
      name: 'vibeflow_session', // Khớp với key localStorage hiện tại
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ session: state.session }),
    }
  )
);

// Lắng nghe sự kiện token hết hạn từ axiosClient để tự động dọn dẹp state
if (typeof window !== 'undefined') {
  window.addEventListener('vibeflow:auth-expired', () => {
    useAuthStore.getState().logout();
  });
}

export default useAuthStore;

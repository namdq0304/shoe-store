import React, { createContext, useContext, useState, useEffect } from 'react';
import { clearAuthSession, getCurrentSession, setAuthSession } from '../api/authStorage';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [session, setSession] = useState(() => {
    return getCurrentSession();
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Khởi tạo kiểm tra session từ localStorage
    const saved = getCurrentSession();
    if (saved) {
      setSession(saved);
    }
    setLoading(false);

    // Lắng nghe sự kiện token hết hạn từ axiosClient
    const handleAuthExpired = () => {
      clearAuthSession();
      setSession(null);
      alert('⚠️ Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại!');
    };

    window.addEventListener('vibeflow:auth-expired', handleAuthExpired);
    return () => {
      window.removeEventListener('vibeflow:auth-expired', handleAuthExpired);
    };
  }, []);

  const login = (sessionData) => {
    setAuthSession(sessionData);
    setSession(sessionData);
  };

  const logout = () => {
    clearAuthSession();
    setSession(null);
  };

  const isAuthenticated = !!session;
  const isAdmin = session?.role === 'ADMIN';
  const isCashier = session?.role === 'CASHIER';
  const isStaff = isAdmin || isCashier;
  const isCustomer = session?.role === 'CUSTOMER';

  return (
    <AuthContext.Provider
      value={{
        session,
        loading,
        login,
        logout,
        isAuthenticated,
        isAdmin,
        isCashier,
        isStaff,
        isCustomer,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext;

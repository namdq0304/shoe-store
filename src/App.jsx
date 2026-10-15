import React, { useState, useEffect } from 'react';
import AuthLogin from './components/AuthLogin';
import OnlineStore from './components/OnlineStore';
import AdminPos from './components/AdminPos';

export default function App() {
  const [session, setSession] = useState(null);
  const [currentView, setCurrentView] = useState('auth'); // 'auth' | 'online' | 'admin'

  // Load session from localStorage on initial render
  useEffect(() => {
    const saved = localStorage.getItem('vibeflow_session');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setSession(parsed);
        if (parsed.role === 'ADMIN' || parsed.role === 'CASHIER') {
          setCurrentView('admin');
        } else {
          setCurrentView('online');
        }
      } catch (e) {
        console.error(e);
      }
    }
  }, []);

  const handleLoginSuccess = (userSession) => {
    setSession(userSession);
    if (userSession.role === 'ADMIN' || userSession.role === 'CASHIER') {
      setCurrentView('admin');
    } else {
      setCurrentView('online');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('vibeflow_session');
    setSession(null);
    setCurrentView('auth');
  };

  if (currentView === 'auth' || !session) {
    return <AuthLogin onLoginSuccess={handleLoginSuccess} />;
  }

  if (currentView === 'admin') {
    return (
      <AdminPos
        session={session}
        onLogout={handleLogout}
      />
    );
  }

  return (
    <OnlineStore
      session={session}
      onLogout={handleLogout}
    />
  );
}


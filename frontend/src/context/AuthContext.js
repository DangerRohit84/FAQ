import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

const AuthContext = createContext(null);

function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/auth/me', { credentials: 'include' })
      .then(res => {
        if (res.ok) return res.json().then(data => { setUser(data.user); setLoading(false); });
        setLoading(false);
      })
      .catch(() => { setLoading(false); });
  }, []);

  const login = useCallback((userData) => {
    setUser(userData);
  }, []);

  const register = useCallback((userData) => {
    setUser(userData);
  }, []);

  const logout = useCallback(async () => {
    await fetch('/api/auth/logout', { method: 'POST', credentials: 'include' });
    setUser(null);
  }, []);

  const authFetch = useCallback((url, options = {}) => {
    return fetch(url, {
      ...options,
      credentials: 'include',
    });
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, authFetch }}>
      {children}
    </AuthContext.Provider>
  );
}

function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}

export { AuthProvider, useAuth };

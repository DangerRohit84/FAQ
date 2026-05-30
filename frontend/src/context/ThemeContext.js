import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';

const ThemeContext = createContext(null);

function ThemeProvider({ children }) {
  const { user, authFetch } = useAuth();
  const [dark, setDark] = useState(false);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', dark ? 'dark' : 'light');
  }, [dark]);

  useEffect(() => {
    if (user && user.theme) {
      setDark(user.theme === 'dark');
    }
  }, [user]);

  const toggle = () => {
    setDark(prev => {
      const next = !prev;
      const theme = next ? 'dark' : 'light';
      authFetch('/api/auth/theme', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ theme }),
      }).catch(() => {});
      return next;
    });
  };

  return (
    <ThemeContext.Provider value={{ dark, toggle }}>
      {children}
    </ThemeContext.Provider>
  );
}

function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme must be used within ThemeProvider');
  return ctx;
}

export { ThemeProvider, useTheme };

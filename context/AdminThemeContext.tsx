'use client';

import { createContext, useContext, useState, useEffect, ReactNode, useSyncExternalStore } from 'react';

type Theme = 'light' | 'dark';

interface AdminThemeContextType {
  theme: Theme;
  toggleTheme: () => void;
  isDark: boolean;
}

const AdminThemeContext = createContext<AdminThemeContextType | undefined>(undefined);

// Subscribe to storage changes
const subscribe = (callback: () => void) => {
  window.addEventListener('storage', callback);
  return () => window.removeEventListener('storage', callback);
};

const getThemeSnapshot = (): Theme => {
  const savedTheme = localStorage.getItem('admin-theme');
  return savedTheme === 'dark' ? 'dark' : 'light';
};

const getServerSnapshot = (): Theme => 'light';

export function AdminThemeProvider({ children }: { children: ReactNode }) {
  const storedTheme = useSyncExternalStore(subscribe, getThemeSnapshot, getServerSnapshot);
  const [theme, setTheme] = useState<Theme>(storedTheme);

  useEffect(() => {
    localStorage.setItem('admin-theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'light' ? 'dark' : 'light'));
  };

  return (
    <AdminThemeContext.Provider value={{ theme, toggleTheme, isDark: theme === 'dark' }}>
      {children}
    </AdminThemeContext.Provider>
  );
}

export function useAdminTheme() {
  const context = useContext(AdminThemeContext);
  if (context === undefined) {
    throw new Error('useAdminTheme must be used within an AdminThemeProvider');
  }
  return context;
}

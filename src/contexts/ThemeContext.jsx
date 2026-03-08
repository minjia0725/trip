import { createContext, useContext, useEffect, useState, useCallback } from 'react';

const STORAGE_KEY = 'trip-planner-theme';

const ThemeContext = createContext(null);

function applyTheme(next) {
  const root = document.documentElement;
  root.classList.remove('light', 'dark');
  root.classList.add(next);
  if (typeof localStorage !== 'undefined') localStorage.setItem(STORAGE_KEY, next);
}

export function ThemeProvider({ children }) {
  const [theme, setThemeState] = useState(() => {
    if (typeof window === 'undefined') return 'light';
    return (localStorage.getItem(STORAGE_KEY) || 'light');
  });

  useEffect(() => {
    applyTheme(theme);
  }, [theme]);

  const setTheme = useCallback((value) => {
    const next = value === 'dark' ? 'dark' : 'light';
    setThemeState(next);
    applyTheme(next);
  }, []);

  const toggleTheme = useCallback(() => {
    setThemeState((prev) => {
      const next = prev === 'dark' ? 'light' : 'dark';
      applyTheme(next);
      return next;
    });
  }, []);

  return (
    <ThemeContext.Provider value={{ theme, setTheme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme 必須在 ThemeProvider 內使用');
  return ctx;
}

import React, { createContext, useContext, useEffect, useState } from 'react';
import type { SearchDirection } from '../types/legal.ts';

interface AppPreferencesContextValue {
  theme: 'light' | 'dark';
  toggleTheme: () => void;
  direction: SearchDirection;
  setDirection: (dir: SearchDirection) => void;
  favoritesCount: number;
  setFavoritesCount: React.Dispatch<React.SetStateAction<number>>;
}

const AppPreferencesContext = createContext<AppPreferencesContextValue | null>(null);

export const AppPreferencesProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    if (typeof window === 'undefined') return 'light';
    const saved = localStorage.getItem('ahd_kanuni_theme');
    if (saved === 'dark' || saved === 'light') return saved;
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  });

  const [direction, setDirectionState] = useState<SearchDirection>(() => {
    if (typeof window === 'undefined') return 'tr-ar';
    const saved = localStorage.getItem('ahd_kanuni_direction');
    return saved === 'ar-tr' ? 'ar-tr' : 'tr-ar';
  });

  const [favoritesCount, setFavoritesCount] = useState(0);

  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    localStorage.setItem('ahd_kanuni_theme', theme);
  }, [theme]);

  const toggleTheme = () => setTheme((prev) => (prev === 'light' ? 'dark' : 'light'));

  const setDirection = (dir: SearchDirection) => {
    setDirectionState(dir);
    localStorage.setItem('ahd_kanuni_direction', dir);
  };

  return (
    <AppPreferencesContext.Provider
      value={{
        theme,
        toggleTheme,
        direction,
        setDirection,
        favoritesCount,
        setFavoritesCount,
      }}
    >
      {children}
    </AppPreferencesContext.Provider>
  );
};

export function useAppPreferences() {
  const ctx = useContext(AppPreferencesContext);
  if (!ctx) throw new Error('useAppPreferences must be used within AppPreferencesProvider');
  return ctx;
}

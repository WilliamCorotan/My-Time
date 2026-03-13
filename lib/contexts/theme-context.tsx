"use client";

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';

export type Theme = 'light' | 'dark' | 'blue' | 'green' | 'purple' | 'orange' | 'rose';

const ALL_THEMES: Theme[] = ['light', 'dark', 'blue', 'green', 'purple', 'orange', 'rose'];

interface ThemeContextType {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  themes: Theme[];
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  // Always initialize as 'light' to match server render.
  // The blocking <script> in <head> already applies the real theme class to <html>,
  // so there's no visual flash. We sync React state on mount below.
  const [theme, setThemeState] = useState<Theme>('light');

  // Sync state from localStorage on mount (client only)
  useEffect(() => {
    const saved = localStorage.getItem('theme') as Theme;
    if (saved && ALL_THEMES.includes(saved)) {
      setThemeState(saved);
    }
  }, []);

  const setTheme = useCallback((newTheme: Theme) => {
    setThemeState(newTheme);
    localStorage.setItem('theme', newTheme);
    document.documentElement.classList.remove(...ALL_THEMES);
    document.documentElement.classList.add(newTheme);
  }, []);

  // Keep DOM class in sync with state
  useEffect(() => {
    document.documentElement.classList.remove(...ALL_THEMES);
    document.documentElement.classList.add(theme);
  }, [theme]);

  return (
    <ThemeContext.Provider value={{ theme, setTheme, themes: ALL_THEMES }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}

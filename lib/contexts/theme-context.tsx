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

function getStoredTheme(): Theme {
  if (typeof window === 'undefined') return 'light';
  const saved = localStorage.getItem('theme') as Theme;
  return saved && ALL_THEMES.includes(saved) ? saved : 'light';
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  // Initialize with stored theme to avoid mismatch (blocking script already applied it)
  const [theme, setThemeState] = useState<Theme>(getStoredTheme);

  const setTheme = useCallback((newTheme: Theme) => {
    setThemeState(newTheme);
    localStorage.setItem('theme', newTheme);
    document.documentElement.classList.remove(...ALL_THEMES);
    document.documentElement.classList.add(newTheme);
  }, []);

  // Sync class on mount (in case state and DOM are out of sync)
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
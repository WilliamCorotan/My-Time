"use client";

import { useTheme } from '@/lib/contexts/theme-context';
import { Button } from '@/components/ui/button';
import { Palette } from 'lucide-react';

export function ThemeToggle() {
  const { theme, setTheme, themes } = useTheme();

  const cycleTheme = () => {
    const currentIndex = themes.indexOf(theme);
    const nextIndex = (currentIndex + 1) % themes.length;
    setTheme(themes[nextIndex]);
  };

  return (
    <Button
      variant="outline"
      size="icon"
      onClick={cycleTheme}
      className="h-9 w-9"
      title={`Current theme: ${theme}. Click to cycle themes.`}
    >
      <Palette className="h-4 w-4" />
      <span className="sr-only">Toggle theme</span>
    </Button>
  );
} 
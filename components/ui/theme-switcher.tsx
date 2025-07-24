"use client";

import { useTheme } from '@/lib/contexts/theme-context';
import { Button } from '@/components/ui/button';
import { 
  Palette, 
  Sun, 
  Moon, 
  Droplets, 
  Leaf, 
  Sparkles, 
  Flame, 
  Heart 
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

const themeIcons = {
  light: Sun,
  dark: Moon,
  blue: Droplets,
  green: Leaf,
  purple: Sparkles,
  orange: Flame,
  rose: Heart,
};

const themeNames = {
  light: 'Light',
  dark: 'Dark Mode',
  blue: 'Ocean',
  green: 'Forest',
  purple: 'Royal',
  orange: 'Sunset',
  rose: 'Rose',
};

export function ThemeSwitcher() {
  const { theme, setTheme, themes } = useTheme();
  const CurrentIcon = themeIcons[theme];

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="icon" className="h-9 w-9">
          <CurrentIcon className="h-4 w-4" />
          <span className="sr-only">Toggle theme</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        <div className="flex items-center gap-2 px-2 py-1.5 text-sm font-medium">
          <Palette className="h-4 w-4" />
          Themes
        </div>
        {themes.map((themeOption) => {
          const Icon = themeIcons[themeOption];
          return (
            <DropdownMenuItem
              key={themeOption}
              onClick={() => setTheme(themeOption)}
              className="flex items-center gap-2"
            >
              <Icon className="h-4 w-4" />
              <span>{themeNames[themeOption]}</span>
              {theme === themeOption && (
                <div className="ml-auto h-2 w-2 rounded-full bg-primary" />
              )}
            </DropdownMenuItem>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
} 
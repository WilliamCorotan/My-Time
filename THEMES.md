# Theme System Documentation

This application includes a comprehensive theming system that allows users to customize the appearance of the DTR System.

## Available Themes

The application comes with 7 pre-built themes:

1. **Light** - Clean, bright theme with high contrast
2. **Dark Mode** - Enhanced dark theme with improved readability and reduced eye strain
3. **Ocean (Blue)** - Cool blue tones for a professional look
4. **Forest (Green)** - Natural green theme for a calming experience
5. **Royal (Purple)** - Elegant purple theme for a premium feel
6. **Sunset (Orange)** - Warm orange theme for energy and creativity
7. **Rose** - Soft pink theme for a gentle, friendly interface

## How to Use Themes

### Theme Switcher Component
The main theme switcher is available in the sidebar next to the user profile. It provides a dropdown menu with all available themes.

### Theme Toggle Component
A simple toggle button that cycles through all themes in order. Useful for quick theme switching.

### Theme Showcase Page
Visit `/themes` to see a comprehensive preview of all themes and how components look with each theme.

## Implementation Details

### Theme Context
The theming system is built around a React context (`ThemeProvider`) that manages:
- Current theme state
- Theme switching functionality
- Theme persistence in localStorage

### CSS Variables
Each theme defines CSS custom properties for:
- Background colors
- Text colors
- Primary/secondary colors
- Border colors
- Chart colors
- Sidebar colors

### Theme Classes
Themes are applied using CSS classes on the `html` element:
- `.light` - Light theme
- `.dark` - Dark theme
- `.blue` - Ocean theme
- `.green` - Forest theme
- `.purple` - Royal theme
- `.orange` - Sunset theme
- `.rose` - Rose theme

## Adding New Themes

To add a new theme:

1. **Add the theme type** in `lib/contexts/theme-context.tsx`:
   ```typescript
   export type Theme = 'light' | 'dark' | 'blue' | 'green' | 'purple' | 'orange' | 'rose' | 'your-theme';
   ```

2. **Add the theme to the themes array**:
   ```typescript
   const themes: Theme[] = ['light', 'dark', 'blue', 'green', 'purple', 'orange', 'rose', 'your-theme'];
   ```

3. **Add CSS variables** in `app/globals.css`:
   ```css
   .your-theme {
     --background: oklch(0.98 0.005 180);
     --foreground: oklch(0.15 0.01 180);
     /* ... other variables */
   }
   ```

4. **Add theme icon and name** in `components/ui/theme-switcher.tsx`:
   ```typescript
   const themeIcons = {
     // ... existing icons
     'your-theme': YourIcon,
   };
   
   const themeNames = {
     // ... existing names
     'your-theme': 'Your Theme',
   };
   ```

## Usage in Components

### Using the Theme Context
```typescript
import { useTheme } from '@/lib/contexts/theme-context';

function MyComponent() {
  const { theme, setTheme, themes } = useTheme();
  
  return (
    <div>
      <p>Current theme: {theme}</p>
      <button onClick={() => setTheme('dark')}>Switch to Dark</button>
    </div>
  );
}
```

### Using Theme Switcher
```typescript
import { ThemeSwitcher } from '@/components/ui/theme-switcher';

function Header() {
  return (
    <header>
      <h1>My App</h1>
      <ThemeSwitcher />
    </header>
  );
}
```

### Using Theme Toggle
```typescript
import { ThemeToggle } from '@/components/ui/theme-toggle';

function Header() {
  return (
    <header>
      <h1>My App</h1>
      <ThemeToggle />
    </header>
  );
}
```

## Best Practices

1. **Always use CSS variables** instead of hardcoded colors
2. **Test themes** on different screen sizes and in different lighting conditions
3. **Ensure sufficient contrast** for accessibility
4. **Consider color psychology** when choosing theme colors
5. **Keep themes consistent** across all components

## Accessibility

The theming system includes:
- High contrast ratios for all themes
- Proper color combinations for text readability
- Support for reduced motion preferences
- Screen reader friendly theme switching

## Browser Support

The theming system uses modern CSS features:
- CSS Custom Properties (CSS Variables)
- OKLCH color space for better color management
- CSS Grid and Flexbox for layouts

All modern browsers (Chrome 88+, Firefox 87+, Safari 14+, Edge 88+) are supported. 
"use client";

import { useTheme } from '@/lib/contexts/theme-context';
import { ThemeSwitcher } from '@/components/ui/theme-switcher';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Clock, 
  BarChart3, 
  Users, 
  Calendar,
  Sun,
  Moon,
  Droplets,
  Leaf,
  Sparkles,
  Flame,
  Heart
} from 'lucide-react';
import { DarkModePreview } from '@/components/ui/dark-mode-preview';

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

export default function ThemesPage() {
  const { theme, setTheme, themes } = useTheme();

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Theme Showcase</h1>
            <p className="text-muted-foreground mt-2">
              Explore different themes for your DTR System
            </p>
          </div>
          <ThemeSwitcher />
        </div>

        {/* Current Theme Display */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              Current Theme: {themeNames[theme]}
              <Badge variant="secondary">{theme}</Badge>
            </CardTitle>
            <CardDescription>
              You're currently using the {themeNames[theme].toLowerCase()} theme
            </CardDescription>
          </CardHeader>
        </Card>

        {/* Theme Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {themes.map((themeOption) => {
            const Icon = themeIcons[themeOption];
            const isActive = theme === themeOption;
            
            return (
              <Card 
                key={themeOption} 
                className={`cursor-pointer transition-all hover:shadow-lg ${
                  isActive ? 'ring-2 ring-primary' : ''
                }`}
                onClick={() => setTheme(themeOption)}
              >
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Icon className="h-5 w-5" />
                      <CardTitle className="text-lg">{themeNames[themeOption]}</CardTitle>
                    </div>
                    {isActive && <Badge>Active</Badge>}
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex gap-2">
                    <div className="w-4 h-4 rounded bg-primary"></div>
                    <div className="w-4 h-4 rounded bg-secondary"></div>
                    <div className="w-4 h-4 rounded bg-accent"></div>
                    <div className="w-4 h-4 rounded bg-muted"></div>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Click to switch to {themeNames[themeOption].toLowerCase()} theme
                  </p>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Dark Mode Preview */}
        <DarkModePreview />

        {/* Component Showcase */}
        <Card>
          <CardHeader>
            <CardTitle>Component Preview</CardTitle>
            <CardDescription>
              See how components look with the current theme
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <Tabs defaultValue="buttons" className="w-full">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="buttons">Buttons</TabsTrigger>
                <TabsTrigger value="inputs">Inputs</TabsTrigger>
                <TabsTrigger value="cards">Cards</TabsTrigger>
                <TabsTrigger value="navigation">Navigation</TabsTrigger>
              </TabsList>
              
              <TabsContent value="buttons" className="space-y-4">
                <div className="flex flex-wrap gap-4">
                  <Button>Default Button</Button>
                  <Button variant="secondary">Secondary</Button>
                  <Button variant="outline">Outline</Button>
                  <Button variant="ghost">Ghost</Button>
                  <Button variant="destructive">Destructive</Button>
                </div>
              </TabsContent>
              
              <TabsContent value="inputs" className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Email</label>
                    <Input type="email" placeholder="Enter your email" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Password</label>
                    <Input type="password" placeholder="Enter your password" />
                  </div>
                </div>
              </TabsContent>
              
              <TabsContent value="cards" className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Card>
                    <CardHeader>
                      <CardTitle>Sample Card</CardTitle>
                      <CardDescription>This is a sample card component</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground">
                        This card shows how content looks with the current theme.
                      </p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader>
                      <CardTitle>Another Card</CardTitle>
                      <CardDescription>With different content</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="flex gap-2">
                        <Badge>Tag 1</Badge>
                        <Badge variant="secondary">Tag 2</Badge>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>
              
              <TabsContent value="navigation" className="space-y-4">
                <div className="flex flex-col space-y-2">
                  {[
                    { name: 'Dashboard', icon: Clock, active: true },
                    { name: 'Analytics', icon: BarChart3, active: false },
                    { name: 'Team', icon: Users, active: false },
                    { name: 'Calendar', icon: Calendar, active: false },
                  ].map((item) => {
                    const Icon = item.icon;
                    return (
                      <div
                        key={item.name}
                        className={`flex items-center px-3 py-2 rounded-lg transition-colors ${
                          item.active
                            ? 'bg-primary text-primary-foreground'
                            : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                        }`}
                      >
                        <Icon className="mr-3 h-5 w-5" />
                        {item.name}
                      </div>
                    );
                  })}
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 
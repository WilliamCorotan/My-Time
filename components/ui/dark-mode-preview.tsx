"use client";

import { useTheme } from '@/lib/contexts/theme-context';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Clock, 
  BarChart3, 
  Users, 
  Calendar,
  Sun,
  Moon
} from 'lucide-react';

export function DarkModePreview() {
  const { theme, setTheme } = useTheme();
  const isDark = theme === 'dark';

  if (!isDark) {
    return (
      <Card className="border-2 border-dashed border-muted-foreground/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Moon className="h-5 w-5" />
            Dark Mode Preview
          </CardTitle>
          <CardDescription>
            Switch to dark mode to see the improved theme
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button 
            onClick={() => setTheme('dark')}
            className="w-full"
          >
            <Moon className="mr-2 h-4 w-4" />
            Switch to Dark Mode
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-2 border-dashed border-primary/50">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Sun className="h-5 w-5" />
          Dark Mode Active
        </CardTitle>
        <CardDescription>
          You're now viewing the improved dark mode theme
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
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

        <div className="flex flex-wrap gap-2">
          <Badge>Default</Badge>
          <Badge variant="secondary">Secondary</Badge>
          <Badge variant="outline">Outline</Badge>
          <Badge variant="destructive">Destructive</Badge>
        </div>

        <div className="flex flex-wrap gap-2">
          <Button>Default Button</Button>
          <Button variant="secondary">Secondary</Button>
          <Button variant="outline">Outline</Button>
          <Button variant="ghost">Ghost</Button>
          <Button variant="destructive">Destructive</Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Sample Card</CardTitle>
              <CardDescription>This is a sample card component</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                This card shows how content looks with the dark theme.
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Another Card</CardTitle>
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

        <Tabs defaultValue="navigation" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="navigation">Navigation</TabsTrigger>
            <TabsTrigger value="stats">Stats</TabsTrigger>
            <TabsTrigger value="info">Info</TabsTrigger>
          </TabsList>
          
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
          
          <TabsContent value="stats" className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-4 bg-muted/50 rounded-lg">
                <div className="text-2xl font-bold text-primary">8.5h</div>
                <div className="text-sm text-muted-foreground">Today's Hours</div>
              </div>
              <div className="text-center p-4 bg-muted/50 rounded-lg">
                <div className="text-2xl font-bold text-primary">42.5h</div>
                <div className="text-sm text-muted-foreground">This Week</div>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="info" className="space-y-4">
            <div className="space-y-2">
              <h4 className="font-medium">Dark Mode Improvements</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Better contrast ratios for readability</li>
                <li>• Softer background colors to reduce eye strain</li>
                <li>• Consistent color scheme across all components</li>
                <li>• Theme-aware sidebar and navigation</li>
                <li>• Improved text colors for better visibility</li>
              </ul>
            </div>
          </TabsContent>
        </Tabs>

        <Button 
          onClick={() => setTheme('light')}
          variant="outline"
          className="w-full"
        >
          <Sun className="mr-2 h-4 w-4" />
          Switch to Light Mode
        </Button>
      </CardContent>
    </Card>
  );
} 
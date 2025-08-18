"use client";
import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useUser, UserButton } from '@clerk/nextjs';
import { useOrganizationContext } from '@/lib/contexts/organization-context';
import { 
  Clock, 
  BarChart3, 
  Users, 
  Home,
  Menu,
  X,
  Calendar,
  Sparkles
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { OrganizationSelector } from './organization-selector';
import { getClientUserDisplayName, getClientUserEmail } from '@/lib/user-utils';
import { ThemeSwitcher } from '@/components/ui/theme-switcher';
import { User } from '@clerk/nextjs/server';
import { Organization } from '@clerk/nextjs/server';
import Image from 'next/image';

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: Home },
  { name: 'Time Clock', href: '/dtr', icon: Clock },
  { name: 'Time Tracker', href: '/tracker', icon: BarChart3 },
  { name: 'Calendar', href: '/calendar', icon: Calendar },
  { name: 'Themes', href: '/themes', icon: Sparkles, adminOnly: true },
  { name: 'Admin Panel', href: '/admin', icon: Users, adminOnly: true },
];

export function Sidebar() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const pathname = usePathname();
  const { user } = useUser();
  const { currentOrganization: organization } = useOrganizationContext();
  const membership = organization ? { role: organization.role } : null;
  const isAdmin = membership?.role === 'admin';

  const filteredNavigation = navigation.filter(item => 
    !item.adminOnly || isAdmin
  );

  return (
    <>
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Mobile sidebar */}
      <div className={cn(
        "fixed inset-y-0 left-0 z-50 w-64 bg-sidebar shadow-xl transform transition-transform duration-300 ease-in-out lg:hidden",
        sidebarOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <SidebarContent 
          navigation={filteredNavigation}
          pathname={pathname}
          user={user as User | null}
          organization={organization as Organization | null}
          onClose={() => setSidebarOpen(false)}
        />
      </div>

      {/* Desktop sidebar */}
      <div className="hidden lg:fixed lg:inset-y-0 lg:flex lg:w-64 lg:flex-col">
        <div className="flex min-h-0 flex-1 flex-col bg-sidebar shadow-xl border-r border-sidebar-border">
          <SidebarContent 
            navigation={filteredNavigation}
            pathname={pathname}
            user={user as User | null}
            organization={organization as Organization | null}
          />
        </div>
      </div>

      {/* Mobile menu button */}
      <div className="lg:hidden">
        <Button
          variant="ghost"
          size="icon"
          className="fixed top-4 left-4 z-40 bg-background/80 backdrop-blur-sm border border-border"
          onClick={() => setSidebarOpen(true)}
        >
          <Menu className="h-6 w-6" />
        </Button>
      </div>
    </>
  );
}

function SidebarContent({ navigation, pathname, user, organization, onClose }: {
  navigation: Array<{
    name: string;
    href: string;
    icon: React.ComponentType<{ className?: string }>;
    adminOnly?: boolean;
  }>;
  pathname: string;
  user: User | null;
  organization: Organization | null;
  onClose?: () => void;
}) {
  return (
    <div className="flex flex-1 flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-sidebar-border">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-gradient-to-r from-primary to-primary/80 rounded-lg flex items-center justify-center">
            <Clock className="w-5 h-5 text-primary-foreground" />
          </div>
          <div>
            <h1 className="text-lg font-semibold text-sidebar-foreground">DTR System</h1>
          </div>
        </div>
        {onClose && (
          <Button variant="ghost" size="icon" onClick={onClose} className="text-sidebar-foreground hover:bg-sidebar-accent">
            <X className="h-5 w-5" />
          </Button>
        )}
      </div>

      {/* Organization Selector */}
      <OrganizationSelector />

      {/* Navigation */}
      <nav className="flex-1 px-4 py-6 space-y-2">
        {navigation.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;
          
          return (
            <Link
              key={item.name}
              href={item.href}
              onClick={onClose}
              className={cn(
                "flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors",
                isActive
                  ? "bg-sidebar-primary text-sidebar-primary-foreground border-r-2 border-sidebar-primary"
                  : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
              )}
            >
              <Icon className="mr-3 h-5 w-5" />
              {item.name}
            </Link>
          );
        })}
      </nav>

      {/* User profile */}
      <div className="border-t border-sidebar-border p-4">
        <div className="flex items-center space-x-3">
          <UserButton 
            appearance={{
              elements: {
                avatarBox: "w-10 h-10",
                userButtonPopoverCard: "shadow-lg border border-border bg-popover",
                userButtonPopoverActionButton: "hover:bg-accent hover:text-accent-foreground"
              }
            }}
          />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-sidebar-foreground truncate">
              {getClientUserDisplayName(user)}
            </p>
            <p className="text-xs text-sidebar-foreground/60 truncate">
              {getClientUserEmail(user)}
            </p>
          </div>
          <ThemeSwitcher />
        </div>
      </div>
    </div>
  );
}
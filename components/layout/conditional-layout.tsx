"use client";
import { useState, useEffect } from 'react';
import { SignedIn, SignedOut, useUser } from '@clerk/nextjs';
import { usePathname } from 'next/navigation';
import { Sidebar } from './sidebar';
import { SidebarSkeleton } from './skeletons';

interface ConditionalLayoutProps {
  children: React.ReactNode;
}

export function ConditionalLayout({ children }: ConditionalLayoutProps) {
  const { isLoaded } = useUser();
  const pathname = usePathname();
  // mounted ensures server and client first render match (both false),
  // preventing hydration mismatch from Clerk's isLoaded differing
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Don't show sidebar on auth pages
  const isAuthPage = pathname?.startsWith('/sign-in') || pathname?.startsWith('/sign-up');

  const showSidebar = mounted && isLoaded;

  // For authenticated users (except on auth pages), show sidebar layout
  if (!isAuthPage) {
    return (
      <>
        <SignedIn>
          <div className="min-h-screen bg-background">
            {showSidebar ? <Sidebar /> : <SidebarSkeleton />}
            <div className="lg:pl-64">
              <main className="py-6 px-4 sm:px-6 lg:px-8">
                {children}
              </main>
            </div>
          </div>
        </SignedIn>
        <SignedOut>
          {children}
        </SignedOut>
      </>
    );
  }

  // For auth pages, show full-width layout
  return <>{children}</>;
}

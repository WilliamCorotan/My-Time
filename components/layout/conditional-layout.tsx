"use client";
import { SignedIn, SignedOut, useUser } from '@clerk/nextjs';
import { usePathname } from 'next/navigation';
import { Sidebar } from './sidebar';

interface ConditionalLayoutProps {
  children: React.ReactNode;
}

export function ConditionalLayout({ children }: ConditionalLayoutProps) {
  const { isLoaded } = useUser();
  const pathname = usePathname();
  
  // Don't show sidebar on auth pages
  const isAuthPage = pathname?.startsWith('/sign-in') || pathname?.startsWith('/sign-up');
  
  // For authenticated users (except on auth pages), show sidebar layout
  if (!isAuthPage) {
    return (
      <>
        <SignedIn>
          <div className="min-h-screen bg-background">
            {isLoaded ? <Sidebar /> : (
              <div className="hidden lg:fixed lg:inset-y-0 lg:flex lg:w-64 lg:flex-col">
                <div className="flex min-h-0 flex-1 flex-col bg-sidebar shadow-xl border-r border-sidebar-border animate-pulse" />
              </div>
            )}
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
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
  
  // Show loading state while Clerk is initializing
  if (!isLoaded) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-background/50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-gradient-to-r from-primary to-primary/80 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-primary-foreground animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary mx-auto mb-2"></div>
          <p className="text-muted-foreground text-sm">Loading DTR System...</p>
        </div>
      </div>
    );
  }

  // For authenticated users (except on auth pages), show sidebar layout
  if (!isAuthPage) {
    return (
      <>
        <SignedIn>
          <div className="min-h-screen bg-background">
            <Sidebar />
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
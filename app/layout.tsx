import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ClerkProvider } from '@clerk/nextjs';
import { ConditionalLayout } from '@/components/layout/conditional-layout';
import { Toaster } from '@/components/ui/sonner';
import ProgressBar from '@/components/ui/progress-bar';
import { ThemeProvider } from '@/lib/contexts/theme-context';
import { OrganizationProvider } from '@/lib/contexts/organization-context';

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "DTR System - Time Tracking Made Simple",
  description: "Modern daily time record system for organizations",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>
      <html lang="en" suppressHydrationWarning>
        <head>
          <script
            dangerouslySetInnerHTML={{
              __html: `try{var t=localStorage.getItem('theme');if(t)document.documentElement.classList.add(t)}catch(e){}`,
            }}
          />
        </head>
        <body
          className={`${geistSans.variable} ${geistMono.variable} antialiased`}
          suppressHydrationWarning
        >
          <ThemeProvider>
            <OrganizationProvider>
              <ProgressBar />
              <ConditionalLayout>
                {children}
              </ConditionalLayout>
              <Toaster />
            </OrganizationProvider>
          </ThemeProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}

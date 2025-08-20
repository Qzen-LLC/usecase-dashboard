import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ClerkProvider } from "@clerk/nextjs";
import React from "react";
import ConditionalSidebarLayout from '@/components/ConditionalSidebarLayout';
import { UserProvider } from '@/contexts/UserContext';

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: "swap",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-sans-mono",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "QUBE - AI Platform",
  description: "AI Use Case Management Platform",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <ClerkProvider>
      <html lang="en" suppressHydrationWarning>
        <head>
          <script
            dangerouslySetInnerHTML={{
              __html: `
              try {
                const saved = localStorage.getItem('theme') || 'system';
                const systemDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
                const isDark = saved === 'dark' || (saved === 'system' && systemDark);
                
                console.log('Theme initialization:', { saved, systemDark, isDark });
                
                if(isDark){
                  document.documentElement.classList.add('dark');
                  document.body.classList.add('dark');
                  console.log('Dark mode applied to document and body');
                } else {
                  document.documentElement.classList.remove('dark');
                  document.body.classList.remove('dark');
                  console.log('Light mode applied to document and body');
                }
                
                // Add a flag to indicate theme is ready
                document.documentElement.setAttribute('data-theme-ready', 'true');
                
              } catch(e) {
                console.error('Theme initialization error:', e);
              }
            `,
            }}
          />
        </head>
        <body
          className={`${geistSans.variable} ${geistMono.variable} antialiased font-sans bg-background text-foreground`}
          suppressHydrationWarning
        >
          <UserProvider>
            <ConditionalSidebarLayout>{children}</ConditionalSidebarLayout>
          </UserProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}
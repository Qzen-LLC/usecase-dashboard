import type { Metadata } from "next";
import { Geist, Geist_Mono, Inter, Poppins, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { ClerkProvider } from "@clerk/nextjs";
import React from "react";
import ConditionalSidebarLayout from '@/components/ConditionalSidebarLayout';
import { UserProvider } from '@/contexts/UserContext';
import { ThemeProvider } from '@/contexts/ThemeContext';

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: "swap",
  weight: ["100", "200", "300", "400", "500", "600", "700", "800", "900"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap",
  weight: ["100", "200", "300", "400", "500", "600", "700"],
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
  weight: ["100", "200", "300", "400", "500", "600", "700", "800", "900"],
});

const poppins = Poppins({
  variable: "--font-poppins",
  subsets: ["latin"],
  display: "swap",
  weight: ["100", "200", "300", "400", "500", "600", "700", "800", "900"],
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin"],
  display: "swap",
  weight: ["100", "200", "300", "400", "500", "600", "700"],
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
          className={`${geistSans.variable} ${geistMono.variable} ${inter.variable} ${poppins.variable} ${jetbrainsMono.variable} antialiased font-sans bg-background text-foreground`}
          suppressHydrationWarning
        >
          <ThemeProvider>
            <UserProvider>
              <ConditionalSidebarLayout>{children}</ConditionalSidebarLayout>
            </UserProvider>
          </ThemeProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}
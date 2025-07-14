import type { Metadata } from "next";
import { Geist, Geist_Mono, Inter, /*Lora,*/ Nunito /*, Merriweather*/ } from "next/font/google";
import "./globals.css";
import { ClerkProvider } from "@clerk/nextjs";
import Image from "next/image";
import React from "react";
import ConditionalSidebarLayout from '@/components/ConditionalSidebarLayout';

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

// const lora = Lora({
//   subsets: ["latin"],
//   variable: "--font-lora",
// });

const nunito = Nunito({
  subsets: ["latin"],
  variable: "--font-nunito",
  weight: ["600"],
});

// const merriweather = Merriweather({
//   subsets: ["latin"],
//   variable: "--font-merriweather",
//   weight: ["400"],
// });

export const metadata: Metadata = {
  title: "QUBE - AI Platform",
  description: "AI Use Case Management Platform",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <ClerkProvider>
      <html lang="en">
        <body
          className={`${geistSans.variable} ${geistMono.variable} ${inter.variable} ${nunito.variable} antialiased font-sans`}
          suppressHydrationWarning
        >
          <ConditionalSidebarLayout>{children}</ConditionalSidebarLayout>
        </body>
      </html>
    </ClerkProvider>
  );
}
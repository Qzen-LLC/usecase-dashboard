'use client';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import dynamic from 'next/dynamic';
import React from 'react';

// Dynamically import devtools only in development
const ReactQueryDevtools = dynamic(
  () => import('@tanstack/react-query-devtools').then((d) => ({ default: d.ReactQueryDevtools })),
  { ssr: false }
);

// Create a client instance with optimized settings
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Cache data for 5 minutes by default
      staleTime: 5 * 60 * 1000, // 5 minutes
      // Keep cached data for 10 minutes
      gcTime: 10 * 60 * 1000, // 10 minutes (was cacheTime)
      // Retry failed requests 2 times
      retry: 2,
      // Don't refetch on window focus in production
      refetchOnWindowFocus: process.env.NODE_ENV === 'development',
      // Don't refetch on mount if data is fresh
      refetchOnMount: false,
      // Background refetch interval (30 seconds)
      refetchInterval: 30 * 1000,
    },
    mutations: {
      // Retry mutations once on failure
      retry: 1,
    },
  },
});

interface ClientProvidersProps {
  children: React.ReactNode;
}

export default function ClientProviders({ children }: ClientProvidersProps) {
  return (
    <QueryClientProvider client={queryClient}>
      {children}
      {/* Only show dev tools in development */}
      {process.env.NODE_ENV === 'development' && (
        <ReactQueryDevtools initialIsOpen={false} />
      )}
    </QueryClientProvider>
  );
} 
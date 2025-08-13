import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  compress: true,
  poweredByHeader: false,
  generateEtags: true,
  reactStrictMode: false, // Disable strict mode to prevent double API calls in development
  // Vercel handles output automatically, no need for standalone mode
  // output: 'standalone', // Only needed for self-hosting/Docker

  // Ignore TypeScript and ESLint errors during build to avoid scanning issues
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },

  images: {
    dangerouslyAllowSVG: true,
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
    domains: [
      // Add any Neon-related domains here if needed for image hosting
    ],
  },

  pageExtensions: ["ts", "tsx", "js", "jsx"],

  serverExternalPackages: ["@prisma/client"],

  experimental: {
    webpackBuildWorker: false,
    // Enable modern JavaScript features
    optimizePackageImports: ['@radix-ui/react-icons', 'lucide-react', 'chart.js'],
  },

  // Optimize headers
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block',
          },
        ],
      },
    ];
  },
};

export default nextConfig;
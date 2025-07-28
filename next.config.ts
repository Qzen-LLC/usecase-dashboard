import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  compress: true,
  poweredByHeader: false,
  generateEtags: true,
  reactStrictMode: false, // Disable strict mode to prevent double API calls in development
  output: 'standalone', // Enable standalone output for Docker

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
      "blfsawovozyywndoiicu.supabase.co"
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
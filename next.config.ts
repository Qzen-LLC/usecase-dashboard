import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  compress: true,
  poweredByHeader: false,
  generateEtags: true,

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
  },
};

export default nextConfig;
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    optimizePackageImports: ['lucide-react', 'recharts'],
  },
  devIndicators: {
    appIsrStatus: false,
  },
};

export default nextConfig;

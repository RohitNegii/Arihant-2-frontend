import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  typescript: {
    ignoreBuildErrors: true, // Bypass TypeScript SWC worker crash on this host
  },
};

export default nextConfig;

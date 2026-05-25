import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    serverActions: {
      allowedOrigins: ["aidatalab.mooo.com", "*.aidatalab.mooo.com"],
    },
  },
};

export default nextConfig;

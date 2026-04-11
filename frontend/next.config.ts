

import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  devIndicators: false,
  allowedDevOrigins: ['unexploited-glenna-untrimmed.ngrok-free.dev'],
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: `${process.env.API_URL || 'http://127.0.0.1:5000'}/api/:path*` // Proxy to Backend
      }
    ]
  }
};

export default nextConfig;

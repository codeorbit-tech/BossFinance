

import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  devIndicators: false,
  allowedDevOrigins: ['*.ngrok-free.app', '*.ngrok-free.dev'],
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: `${process.env.API_URL || 'http://127.0.0.1:5000'}/api/:path*` // Proxy to Backend
      },
      {
        source: '/uploads/:path*',
        destination: `${process.env.API_URL || 'http://127.0.0.1:5000'}/uploads/:path*` // Proxy uploaded files from backend
      }
    ]
  }
};

export default nextConfig;

/** @type {import('next').NextConfig} */
const nextConfig = {
  devIndicators: {
    buildActivity: false,
  },
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: 'https://boss-finance-backend.onrender.com/api/:path*'
      }
    ]
  },
  experimental: {
    turbo: {
      resolveAlias: {
        fs: false,
        path: false,
        os: false,
        child_process: false,
        readline: false,
        rimraf: false,
      },
    },
  },
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        path: false,
        os: false,
        child_process: false,
        readline: false,
        rimraf: false,
      };
    }
    return config;
  },
};

export default nextConfig;

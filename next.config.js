/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  images: {
    domains: ['localhost'],
  },
  // Explicitly set the port
  devIndicators: {
    buildActivityPort: 3000,
  },
  // Ensure static files are served from the correct path
  basePath: '',
  // Disable static optimization to prevent 404s
  output: 'standalone',
  // Configure the port for the development server
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
      };
    }
    return config;
  },
};

module.exports = nextConfig;

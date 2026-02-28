import withPWAInit from '@ducanh2912/next-pwa';

const withPWA = withPWAInit({
  dest: 'public',
  disable: process.env.NODE_ENV === 'development',
});

/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: { ignoreBuildErrors: true },
  reactStrictMode: false,
  images: { unoptimized: true },
  serverExternalPackages: ['pino', 'thread-stream'],
  turbopack: {
    resolveAlias: {
      pino: 'pino/browser.js',
      'thread-stream': 'pino/browser.js', // Reuse pino's browser sham as it's safe and empty
      tap: 'node:events', // Or something that exists to stop "not found"
      'why-is-node-running': 'node:events',
    },
  },

  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
        stream: false,
        crypto: false,
        os: false,
        readline: false,
      };
    }
    return config;
  },
};

export default withPWA(nextConfig);

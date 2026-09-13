import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  webpack: (config) => {
    config.experiments = {
      ...config.experiments,
      asyncWebAssembly: true,
      topLevelAwait: true,
      layers: true,
    };
    config.optimization.moduleIds = 'named';

    if (!config.resolve) {
      config.resolve = {};
    }
    config.resolve.alias = {
      ...config.resolve.alias,
      'isomorphic-ws$': require('path').resolve(__dirname, 'src/isomorphic-ws.js'),
      '@midnight-ntwrk/onchain-runtime-v3': require('path').resolve(__dirname, '../node_modules/@midnight-ntwrk/onchain-runtime-v3'),
      '@midnight-ntwrk/ledger-v8': require('path').resolve(__dirname, '../node_modules/@midnight-ntwrk/ledger-v8')
    };
    config.resolve.fallback = {
      ...config.resolve.fallback,
      fs: false,
      path: false,
      crypto: false,
    };

    return config;
  },
};

export default nextConfig;

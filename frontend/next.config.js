const path = require('path');

/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  outputFileTracingRoot: path.join(__dirname),
  images: {
    unoptimized: true,
    remotePatterns: [
      { protocol: 'https', hostname: 'worldcup-tickets.s3.amazonaws.com' },
      { protocol: 'https', hostname: 'flagcdn.com' },
    ],
  }
};

module.exports = nextConfig;
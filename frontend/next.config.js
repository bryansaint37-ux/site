/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export', // <--- Add this line here
  outputFileTracingRoot: path.join(__dirname),
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'worldcup-tickets.s3.amazonaws.com' },
      { protocol: 'https', hostname: 'flagcdn.com' },
    ],
  },
  async rewrites() {
    const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
    return [{ source: '/api/:path*', destination: ${apiBaseUrl}/:path* }];
  },
};

module.exports = nextConfig;
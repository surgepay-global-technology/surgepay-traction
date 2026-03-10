/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  output: 'standalone',
  images: {
    domains: [],
  },
  // Increase keep-alive timeouts to prevent 502s on Render
  serverRuntimeConfig: {
    keepAliveTimeout: 120000,
    headersTimeout: 121000,
  },
}

module.exports = nextConfig

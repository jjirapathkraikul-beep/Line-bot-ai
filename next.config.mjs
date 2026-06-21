/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverComponentsExternalPackages: ['@line/bot-sdk', 'openai', '@vercel/kv'],
  },
};

export default nextConfig;

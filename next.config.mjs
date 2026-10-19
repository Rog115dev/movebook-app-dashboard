/** @type {import('next').NextConfig} */
const nextConfig = {
  // Allow large hero video uploads (default body limits reject most MP4s).
  experimental: {
    serverActions: {
      bodySizeLimit: '100mb',
    },
  },
};

export default nextConfig;

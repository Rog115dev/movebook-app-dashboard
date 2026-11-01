/** @type {import('next').NextConfig} */
const nextConfig = {
  // Bind / public IP access: do not invent absolute redirect hosts.
  // Keep trailingSlash off so redirects stay simple path locations.
  trailingSlash: false,
  poweredByHeader: false,
};

export default nextConfig;

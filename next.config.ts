import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'img.clerk.com',
      },
      {
        protocol: 'https',
        hostname: 'pub-e7c4b0be17964a1b81ed3f216b4a9dda.r2.dev',
      },
    ],
  },
};

export default nextConfig;

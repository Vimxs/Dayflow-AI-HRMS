import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* Dayflow HRMS — Next.js config */

  // Strict React mode
  reactStrictMode: true,

  // Image domains for S3/profile pictures (extend when S3 is configured in T3.4)
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**.amazonaws.com",
      },
    ],
  },

  // Security headers (more complete set wired in T8.1 hardening pass)
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          { key: "X-Frame-Options", value: "DENY" },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
        ],
      },
    ];
  },
};

export default nextConfig;

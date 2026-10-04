import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  turbopack: {
    root: __dirname,
  },
  experimental: {
    inlineCss: true,
  },
  images: {
    loader: "custom",
    loaderFile: "./lib/cloudinary-loader.ts",
    deviceSizes: [380, 640, 750, 828, 1080, 1200, 1920],
  },
  async redirects() {
    return [
      {
        source: "/:path*",
        has: [
          {
            type: "host",
            value: "realtor-rutch-iota.vercel.app",
          },
        ],
        destination: "https://realtor-rutch.com/:path*",
        permanent: true,
      },
      // ── Retired RFO pages → closest remaining category ──
      {
        source: "/:city/rfo-condo/:path*",
        destination: "/:city/condo-for-sale/:path*",
        permanent: true,
      },
      {
        source: "/:city/rfo-house-and-lot/:path*",
        destination: "/:city/house-and-lot-for-sale/:path*",
        permanent: true,
      },
      {
        source: "/:city/rfo-subdivision/:path*",
        destination: "/:city/house-and-lot-for-sale/:path*",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;

import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  turbopack: {
    root: __dirname,
  },
  images: {
    loader: "custom",
    loaderFile: "./lib/cloudinary-loader.ts",
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
    ];
  },
};

export default nextConfig;

import type { NextConfig } from "next";

const isDev = process.env.NODE_ENV === "development";

const nextConfig: NextConfig = {
  /* config options here */
  reactStrictMode: !isDev,
  productionBrowserSourceMaps: false,
  // output: "export",
  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: "http://10.106.10.220:8081/api/:path*",
      },
    ];
  },
};

export default nextConfig;

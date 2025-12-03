import type { NextConfig } from "next";

const isDev = process.env.NODE_ENV === "development";

const nextConfig: NextConfig = {
  /* config options here */
  reactStrictMode: !isDev,
  productionBrowserSourceMaps: false,
};

export default nextConfig;

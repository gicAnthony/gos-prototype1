import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  output: "export",
  trailingSlash: true,
  images: { unoptimized: true },
  basePath: process.env.NODE_ENV === "production" ? "/gos-prototype1" : "",
  assetPrefix: process.env.NODE_ENV === "production" ? "/gos-prototype1/" : "",
};

export default nextConfig;

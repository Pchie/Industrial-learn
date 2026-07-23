import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  transpilePackages: [
    "@industrial-learn/database",
    "@industrial-learn/design-system",
    "@industrial-learn/env",
    "@industrial-learn/shared"
  ]
};

export default nextConfig;

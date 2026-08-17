import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // компактный серверный бандл для деплоя на VPS (deploy/build-artifact.sh)
  output: "standalone",
};

export default nextConfig;

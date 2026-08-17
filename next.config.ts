import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // компактный серверный бандл для деплоя на VPS (deploy/build-artifact.sh)
  output: "standalone",
  // данные читаются с диска в рантайме: включаем их в серверный трейс
  // всех маршрутов — JSON нужен и странице, и /sitemap.xml
  // (нужно для Vercel-демо; на VPS data/ кладётся рядом с бандлом)
  outputFileTracingIncludes: {
    "/*": ["./data/*.json"],
  },
};

export default nextConfig;

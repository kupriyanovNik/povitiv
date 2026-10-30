import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // компактный серверный бандл для деплоя на VPS (deploy/build-artifact.sh);
  // на Vercel standalone ломает их постобработку сборки (ENOENT *.nft.json),
  // там трейсингом управляет сама платформа
  output: process.env.VERCEL ? undefined : "standalone",
  // данные читаются с диска в рантайме: включаем их в серверный трейс
  // всех маршрутов — JSON нужен и странице, и /sitemap.xml
  // (нужно для Vercel-демо; на VPS data/ кладётся рядом с бандлом)
  outputFileTracingIncludes: {
    "/*": ["./data/*.json"],
  },
  // журнал заявок (имена и телефоны) никогда не едет в сборку: на машине
  // разработчика он может лежать в data/leads, а трейсинг подхватил бы его
  outputFileTracingExcludes: {
    "/*": ["./data/leads/**"],
  },
  // демо на Vercel закрыто от индексации и заголовком на всех ответах,
  // включая фото объектов: метатег есть только у страниц
  async headers() {
    if (!process.env.VERCEL) return [];
    return [
      {
        source: "/:path*",
        headers: [{ key: "X-Robots-Tag", value: "noindex, nofollow" }],
      },
    ];
  },
};

export default nextConfig;

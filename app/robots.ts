import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  // демо на Vercel закрыто от поисковиков: иначе после запуска
  // positiv-vt.ru оказался бы копией уже проиндексированной страницы
  if (process.env.VERCEL) {
    return { rules: [{ userAgent: "*", disallow: "/" }] };
  }
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/privacy", "/consent", "/api/"],
      },
    ],
    sitemap: "https://positiv-vt.ru/sitemap.xml",
  };
}

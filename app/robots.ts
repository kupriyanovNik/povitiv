import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
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

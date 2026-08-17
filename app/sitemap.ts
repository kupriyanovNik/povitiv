import type { MetadataRoute } from "next";
import { getListings } from "@/lib/data";

export default function sitemap(): MetadataRoute.Sitemap {
  const base = "https://positiv-vt.ru";
  const { updatedAt } = getListings();
  return [
    {
      url: base,
      lastModified: new Date(updatedAt),
      changeFrequency: "daily",
      priority: 1,
    },
  ];
}

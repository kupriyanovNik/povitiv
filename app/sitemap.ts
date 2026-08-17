import type { MetadataRoute } from "next";
import { getListings } from "@/lib/data";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = "https://positiv-vt.ru";
  const { updatedAt } = await getListings();
  return [
    {
      url: base,
      lastModified: new Date(updatedAt),
      changeFrequency: "daily",
      priority: 1,
    },
  ];
}

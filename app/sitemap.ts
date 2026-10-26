import type { MetadataRoute } from "next";
import { getAgency } from "@/lib/data";

// как и страница: данные читаются с диска на каждый запрос
export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = "https://positiv-vt.ru";
  const { updatedAt } = await getAgency();
  return [
    {
      url: base,
      lastModified: new Date(updatedAt),
      changeFrequency: "monthly",
      priority: 1,
    },
  ];
}

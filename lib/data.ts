import { readFile } from "node:fs/promises";
import path from "node:path";
import { cache } from "react";
import type { AgencyData, ExternalReview, Listing } from "./types";

export type * from "./types";
export { formatMonthYear, formatPrice } from "./format";

/**
 * Данные читаются с диска В РАНТАЙМЕ, а не вшиваются в сборку.
 * Ночной синк на сервере просто перезаписывает JSON-файлы, и страница
 * сразу отдаёт свежие данные: без пересборки, рестарта и коммитов в git.
 * cache() дедуплицирует чтения в рамках одного рендера.
 */
const DATA_DIR = process.env.DATA_DIR ?? path.join(process.cwd(), "data");

async function readJson<T>(name: string): Promise<T> {
  const raw = await readFile(path.join(DATA_DIR, name), "utf8");
  return JSON.parse(raw) as T;
}

export const getListings = cache(
  async (): Promise<{ updatedAt: string; listings: Listing[] }> =>
    readJson("listings.json"),
);

export const getAgency = cache(
  async (): Promise<AgencyData> => readJson("agency.json"),
);

export const getExternalReviews = cache(
  async (): Promise<ExternalReview[]> =>
    (await readJson<{ reviews: ExternalReview[] }>("reviews-external.json"))
      .reviews,
);

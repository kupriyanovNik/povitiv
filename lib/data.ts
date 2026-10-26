import { readFile } from "node:fs/promises";
import path from "node:path";
import { cache } from "react";
import type { AgencyData, ExternalReview } from "./types";

export type * from "./types";
export { formatMonthYear } from "./format";

/**
 * Данные агентства (рейтинг, отзывы) читаются с диска в рантайме:
 * поправить JSON на сервере можно без пересборки. Объекты и их
 * автоматический сбор с площадок убраны (решение клиента, 26.10.2026).
 * cache() дедуплицирует чтения в рамках одного рендера.
 */
const DATA_DIR = process.env.DATA_DIR ?? path.join(process.cwd(), "data");

async function readJson<T>(name: string): Promise<T> {
  const raw = await readFile(path.join(DATA_DIR, name), "utf8");
  return JSON.parse(raw) as T;
}

export const getAgency = cache(
  async (): Promise<AgencyData> => readJson("agency.json"),
);

export const getExternalReviews = cache(
  async (): Promise<ExternalReview[]> =>
    (await readJson<{ reviews: ExternalReview[] }>("reviews-external.json"))
      .reviews,
);

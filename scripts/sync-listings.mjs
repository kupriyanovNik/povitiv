#!/usr/bin/env node
/**
 * Синхронизация реальных данных агентства «Позитив ВТ» с ЦИАН и Домклик.
 *
 *   npm run sync
 *
 * Что делает:
 *  1. Домклик (обычный fetch, сервер отдаёт данные в HTML):
 *     - статистика агентства, команда, отзывы -> data/agency.json
 *     - объявления через открытый API -> в общий список объектов
 *  2. ЦИАН (нужен браузер, страницы защищены от ботов):
 *     - карточки объявлений со страницы компании -> data/listings.json
 *     - использует playwright-core + установленный Chrome
 *  3. Скачивает фотографии объектов в public/listings/<id>/ и аватары в public/team/
 *
 * Если какой-то источник недоступен, его прежние данные сохраняются как есть.
 */

import { mkdir, readFile, writeFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import path from "node:path";

const ROOT = path.resolve(import.meta.dirname, "..");
const DATA_DIR = path.join(ROOT, "data");
const PUBLIC_DIR = path.join(ROOT, "public");

const CIAN_COMPANY_URL = "https://www.cian.ru/company/211681";
const DOMCLICK_AGENCY_ID = 269616;
const DOMCLICK_AGENCY_URL = `https://agencies.domclick.ru/agency/${DOMCLICK_AGENCY_ID}`;

const UA =
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0 Safari/537.36";

const today = new Date().toISOString().slice(0, 10);

/* ---------------------------------- utils ---------------------------------- */

async function readJson(file, fallback) {
  try {
    return JSON.parse(await readFile(file, "utf8"));
  } catch {
    return fallback;
  }
}

async function download(url, dest) {
  if (existsSync(dest)) return;
  const res = await fetch(url, { headers: { "User-Agent": UA } });
  if (!res.ok) throw new Error(`HTTP ${res.status} for ${url}`);
  await mkdir(path.dirname(dest), { recursive: true });
  await writeFile(dest, Buffer.from(await res.arrayBuffer()));
  console.log("  фото:", path.relative(ROOT, dest));
}

const translit = (s) =>
  s
    .toLowerCase()
    .replace(/[а-яё]/g, (c) => {
      const map = {
        а: "a", б: "b", в: "v", г: "g", д: "d", е: "e", ё: "e", ж: "zh",
        з: "z", и: "i", й: "y", к: "k", л: "l", м: "m", н: "n", о: "o",
        п: "p", р: "r", с: "s", т: "t", у: "u", ф: "f", х: "h", ц: "ts",
        ч: "ch", ш: "sh", щ: "sch", ъ: "", ы: "y", ь: "", э: "e", ю: "yu",
        я: "ya",
      };
      return map[c] ?? c;
    })
    .replace(/\s+/g, "-");

/* -------------------------------- ДОМКЛИК ---------------------------------- */

async function syncDomclick() {
  console.log("\nДомклик: загружаю страницу агентства…");
  const res = await fetch(DOMCLICK_AGENCY_URL, {
    headers: { "User-Agent": UA, "Accept-Language": "ru-RU,ru;q=0.9" },
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const html = await res.text();

  const marker = "window.__REACT_QUERY_STATE__=";
  const idx = html.indexOf(marker);
  if (idx < 0) throw new Error("__REACT_QUERY_STATE__ не найден");
  // после JSON в той же строке идёт ещё код, поэтому парсим "жадно" по балансу скобок
  const raw = html.slice(idx + marker.length);
  const state = JSON.parse(extractJson(raw));

  let agency = null;
  let agents = null;
  let reviews = null;
  for (const q of state.queries ?? []) {
    const key = JSON.stringify(q.queryKey ?? []);
    const data = q.state?.data;
    if (!data) continue;
    if (key.includes(`"agencies","${DOMCLICK_AGENCY_ID}"`) && key.includes("expand")) {
      agency = data.result;
    } else if (key.includes('"agents"') && key.includes("companyId")) {
      agents = data.result;
    } else if (key.includes("reviews")) {
      reviews = (data.pages ?? []).flatMap((p) => p.result ?? []);
    }
  }
  if (!agency || !agents) throw new Error("не удалось найти данные агентства в стейте");

  const prev = await readJson(path.join(DATA_DIR, "agency.json"), {});
  const agentsOut = [];
  for (const a of agents) {
    let avatar = null;
    if (a.avatarUrl) {
      const slug = translit(a.name);
      const dest = path.join(PUBLIC_DIR, "team", `${slug}.png`);
      try {
        await download(a.avatarUrl.replace("s200x200q80", "s400x400q80"), dest);
        avatar = `/team/${slug}.png`;
      } catch (e) {
        console.warn("  не удалось скачать аватар:", a.name, e.message);
      }
    }
    agentsOut.push({
      name: a.name,
      casId: a.casId,
      verified: Boolean(a.verified),
      avatar,
      registeredAt: (a.registeredAt ?? "").slice(0, 10),
      deals12m: a.stats?.dealsCount ?? 0,
      ratingAvg: a.rating?.avg ?? null,
      ratingVotes: a.rating?.votesTotal ?? 0,
    });
  }

  const out = {
    updatedAt: today,
    sources: { domclick: DOMCLICK_AGENCY_URL, cian: CIAN_COMPANY_URL },
    agency: {
      ...(prev.agency ?? {}),
      name: "Позитив ВТ",
      nameLegal: agency.nameLegal,
      inn: agency.inn,
      dealsCount12m: agency.stats?.dealsCount ?? prev.agency?.dealsCount12m ?? 0,
      domclickRating: agency.rating?.avg ?? prev.agency?.domclickRating ?? null,
      domclickReviewVotes: (reviews ?? []).length || prev.agency?.domclickReviewVotes || 0,
      logoUrl: agency.logoUrl,
    },
    agents: agentsOut,
    reviews: (reviews ?? []).map((r) => ({
      id: r.id,
      rating: r.rating,
      text: r.message || null,
      createdAt: (r.createdAt ?? "").slice(0, 10),
      dealAt: (r.dealIssuedAt ?? "").slice(0, 10) || null,
      agent: r.agent?.fullname ?? "",
      author: r.author?.name ?? "Клиент",
    })),
  };

  await writeFile(
    path.join(DATA_DIR, "agency.json"),
    JSON.stringify(out, null, 2) + "\n",
  );
  console.log(
    `Домклик: ок. Сделок за 12 мес: ${out.agency.dealsCount12m}, команда: ${agentsOut.length}, отзывов: ${out.reviews.length}`,
  );
}

function extractJson(raw) {
  let depth = 0;
  let inStr = false;
  let esc = false;
  for (let i = 0; i < raw.length; i++) {
    const ch = raw[i];
    if (esc) { esc = false; continue; }
    if (ch === "\\") { esc = true; continue; }
    if (ch === '"') inStr = !inStr;
    if (inStr) continue;
    if (ch === "{") depth++;
    if (ch === "}") {
      depth--;
      if (depth === 0) return raw.slice(0, i + 1);
    }
  }
  throw new Error("несбалансированный JSON");
}

/* --------------------------- Домклик: объявления --------------------------- */

async function fetchDomclickOffers() {
  const offers = [];
  for (const dealType of ["sale", "rent"]) {
    const url = `https://api.domclick.ru/pts/agencies/v1/offers?company_id=${DOMCLICK_AGENCY_ID}&deal_type=${dealType}&limit=9`;
    const res = await fetch(url, {
      headers: { "User-Agent": UA, Accept: "application/json" },
    });
    if (!res.ok) {
      console.warn(`Домклик offers ${dealType}: HTTP ${res.status}`);
      continue;
    }
    const data = await res.json();
    for (const o of data.result ?? []) {
      const isLot = String(o.link ?? "").includes("__lot__");
      offers.push({
        id: `domclick-${o.id}`,
        source: "domclick",
        url: o.link,
        dealType,
        category: isLot ? "land" : "flat",
        title: isLot ? "Участок" : "Объект",
        badge: null,
        price: o.price,
        priceNote: dealType === "rent" ? "в месяц" : null,
        area: o.area ?? null,
        floor: o.floor ? String(o.floor) : null,
        rooms: o.rooms ?? null,
        address: o.address_full ?? "",
        metro: null,
        highlight: "",
        posterUrl: o.poster_path
          ? `https://img.dmclk.ru/s1200x800q80${o.poster_path}`
          : null,
      });
    }
  }
  return offers;
}

/* ----------------------------------- ЦИАН ---------------------------------- */

async function fetchCianListings() {
  console.log("\nЦИАН: пробую открыть страницу компании через Chrome…");
  let chromium;
  try {
    ({ chromium } = await import("playwright-core"));
  } catch {
    console.warn("ЦИАН: playwright-core не установлен (npm i -D playwright-core). Пропускаю.");
    return null;
  }

  let browser;
  try {
    browser = await chromium.launch({ channel: "chrome", headless: true });
  } catch (e) {
    console.warn("ЦИАН: не удалось запустить Chrome:", e.message);
    console.warn("Установите Google Chrome или запустите: npx playwright install chromium");
    try {
      browser = await chromium.launch({ headless: true });
    } catch {
      return null;
    }
  }

  try {
    const page = await browser.newPage({
      userAgent: UA,
      locale: "ru-RU",
      viewport: { width: 1440, height: 900 },
    });
    await page.goto(CIAN_COMPANY_URL, { waitUntil: "domcontentloaded", timeout: 45000 });
    await page.waitForTimeout(3500);

    const cards = await page.evaluate(() => {
      const links = Array.from(
        document.querySelectorAll('a[href*="/sale/"],a[href*="/rent/"]'),
      ).filter((a) => !/export|favorites/.test(a.href));
      const seen = new Set();
      const out = [];
      for (const a of links) {
        if (seen.has(a.href)) continue;
        seen.add(a.href);
        let el = a;
        for (let i = 0; i < 12 && el.parentElement; i++) {
          el = el.parentElement;
          if (el.innerText && el.innerText.includes("₽")) break;
        }
        let imgEl = a;
        let imgs = [];
        for (let i = 0; i < 12 && imgEl.parentElement; i++) {
          imgEl = imgEl.parentElement;
          const found = imgEl.querySelectorAll('img[src*="images.cdn-cian"]');
          if (found.length) {
            imgs = Array.from(found).map((im) => im.src);
            break;
          }
        }
        out.push({
          href: a.href,
          text: (el.innerText || "").replace(/\n+/g, " | "),
          imgs: imgs.slice(0, 4),
        });
      }
      return out;
    });

    if (!cards.length) {
      console.warn("ЦИАН: карточки не найдены (возможно, показана капча). Пропускаю.");
      return null;
    }
    return cards.map(parseCianCard).filter(Boolean);
  } finally {
    await browser.close();
  }
}

function parseCianCard(card) {
  const m = card.href.match(/\/(sale|rent)\/(flat|suburban)\/(\d+)/);
  if (!m) return null;
  const [, deal, kind, id] = m;
  const text = card.text;

  const price =
    Number((text.match(/([\d\s]{4,})\s*₽/) || [])[1]?.replace(/\s/g, "")) || 0;
  const area = Number(
    (text.match(/([\d.,]+)\s*м²/) || [])[1]?.replace(",", "."),
  ) || null;
  const floor = (text.match(/(\d+\/\d+)\s*этаж/) || [])[1] ?? null;
  const roomsMatch = text.match(/(\d+)-комн/);
  const isRoom = /комната|1 комната/i.test(text);
  const isHouse = kind === "suburban";

  // адрес: фрагменты между «|» после названия города
  const parts = text.split("|").map((s) => s.trim().replace(/,\s*$/, ""));
  const addrStart = parts.findIndex((p) =>
    /^(Москва|Московская область)/.test(p),
  );
  const priceIdx = parts.findIndex((p) => /₽/.test(p));
  const address =
    addrStart >= 0 && priceIdx > addrStart
      ? parts.slice(addrStart, priceIdx).join(", ")
      : "";
  const metroPart = parts.find((p) => /^м\.\s/.test(p));
  const descIdx = parts.findIndex(
    (p, i) => i > priceIdx && p.length > 60 && !/₽/.test(p),
  );

  let title;
  let category;
  if (isHouse) {
    category = "house";
    title = `Дом${area ? ` ${area} м²` : ""}`;
  } else if (isRoom && !roomsMatch) {
    category = "room";
    title = `Комната${area ? ` ${String(area).replace(".", ",")} м²` : ""}`;
  } else {
    category = "flat";
    const rooms = roomsMatch ? Number(roomsMatch[1]) : null;
    title = `${rooms ? `${rooms}-комнатная квартира` : "Квартира"}${area ? `, ${area} м²` : ""}`;
  }

  return {
    id: `cian-${id}`,
    source: "cian",
    url: card.href,
    dealType: deal,
    category,
    title,
    badge: /АВАНС/i.test(text) ? "Внесён аванс" : null,
    price,
    priceNote: deal === "rent" ? "в месяц" : null,
    area,
    floor: floor ? floor.replace("/", " из ") : null,
    rooms: roomsMatch ? Number(roomsMatch[1]) : null,
    address,
    metro: metroPart ? metroPart.replace(/^м\.\s*/, "") : null,
    highlight: descIdx > 0 ? `${parts[descIdx].slice(0, 140).trim()}…` : "",
    photoUrls: card.imgs.map((u) => u.replace(/-2\.jpg$/, "-1.jpg")),
  };
}

/* ---------------------------------- main ----------------------------------- */

async function main() {
  await mkdir(DATA_DIR, { recursive: true });
  const prev = await readJson(path.join(DATA_DIR, "listings.json"), {
    listings: [],
  });

  // 1. Домклик: агентство, команда, отзывы
  try {
    await syncDomclick();
  } catch (e) {
    console.warn("Домклик: не удалось обновить данные агентства:", e.message);
  }

  // 2. Объявления
  let cian = null;
  try {
    cian = await fetchCianListings();
  } catch (e) {
    console.warn("ЦИАН: ошибка:", e.message);
  }

  let domclickOffers = [];
  try {
    domclickOffers = await fetchDomclickOffers();
  } catch (e) {
    console.warn("Домклик offers: ошибка:", e.message);
  }

  const prevById = new Map(prev.listings.map((l) => [l.id, l]));
  const listings = [];

  const cianFinal =
    cian ?? prev.listings.filter((l) => l.source === "cian");
  for (const item of cianFinal) {
    const photos = [];
    if (item.photoUrls) {
      for (let i = 0; i < item.photoUrls.length; i++) {
        const dest = path.join(PUBLIC_DIR, "listings", item.id, `${i + 1}.jpg`);
        try {
          await download(item.photoUrls[i], dest);
          photos.push(`/listings/${item.id}/${i + 1}.jpg`);
        } catch (e) {
          console.warn("  фото не скачалось:", e.message);
        }
      }
    }
    const prevItem = prevById.get(item.id);
    const rest = { ...item };
    delete rest.photoUrls;
    listings.push({
      ...rest,
      // рукописные поля из прежних данных важнее автоматических
      title: prevItem?.title ?? rest.title,
      highlight: prevItem?.highlight || rest.highlight,
      address: prevItem?.address || rest.address,
      photos: photos.length ? photos : (prevItem?.photos ?? []),
    });
  }

  const domclickFinal = domclickOffers.length
    ? domclickOffers
    : prev.listings.filter((l) => l.source === "domclick");
  for (const item of domclickFinal) {
    // не дублируем объект, который уже есть на ЦИАН (совпадение цены и типа)
    if (
      listings.some(
        (l) => l.price === item.price && l.dealType === item.dealType,
      )
    )
      continue;
    const prevItem = prevById.get(item.id);
    let photos = prevItem?.photos ?? [];
    if (item.posterUrl) {
      const dest = path.join(PUBLIC_DIR, "listings", item.id, "1.jpg");
      try {
        await download(item.posterUrl, dest);
        photos = [`/listings/${item.id}/1.jpg`];
      } catch (e) {
        console.warn("  фото не скачалось:", e.message);
      }
    }
    const rest = { ...item };
    delete rest.posterUrl;
    listings.push({
      ...rest,
      title: prevItem?.title ?? rest.title,
      highlight: prevItem?.highlight ?? rest.highlight,
      photos,
    });
  }

  const out = {
    updatedAt: today,
    sources: { cian: CIAN_COMPANY_URL, domclick: DOMCLICK_AGENCY_URL },
    listings,
  };
  await writeFile(
    path.join(DATA_DIR, "listings.json"),
    JSON.stringify(out, null, 2) + "\n",
  );
  console.log(`\nГотово: ${listings.length} объектов в data/listings.json`);
  if (!cian) {
    console.log(
      "ЦИАН не обновился, использованы прежние данные. Для обновления нужен установленный Chrome.",
    );
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});

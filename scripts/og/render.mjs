#!/usr/bin/env node
/**
 * Рендер карточки превью ссылки public/og.png из scripts/og/card.html.
 *
 *   npm run og
 *
 * Шрифты (Geologica, Golos) и эмблема встраиваются data-URI: Chrome не
 * берёт маски и шрифты из file:// в чужом контексте. Нужен установленный
 * Google Chrome, как и для синка ЦИАН.
 *
 * После замены картинки Telegram ещё какое-то время показывает старое
 * превью: обновить можно через @WebpageBot (отправить ему ссылку).
 */
import { readFile } from "node:fs/promises";
import path from "node:path";
import { chromium } from "playwright-core";

const ROOT = path.resolve(import.meta.dirname, "../..");
// офисный номер из lib/site.ts (phone); TS из .mjs не импортировать
const OFFICE_PHONE = "+7 (495) 609-28-64";

const dataUri = async (file, mime) =>
  `data:${mime};base64,${(await readFile(path.join(ROOT, file))).toString("base64")}`;

const font = async (family, file, range) =>
  `@font-face { font-family: ${family}; font-weight: 100 900; src: url("${await dataUri(
    `node_modules/@fontsource-variable/${file}`,
    "font/woff2",
  )}") format("woff2");${range ? ` unicode-range: ${range};` : ""} }`;

const CYRILLIC = "U+0400-045F, U+0490-0491, U+04B0-04B1, U+2116";

const fonts = [
  await font("Geologica", "geologica/files/geologica-cyrillic-wght-normal.woff2", CYRILLIC),
  await font("Geologica", "geologica/files/geologica-latin-wght-normal.woff2"),
  await font("Golos", "golos-text/files/golos-text-cyrillic-wght-normal.woff2", CYRILLIC),
  await font("Golos", "golos-text/files/golos-text-latin-wght-normal.woff2"),
].join("\n");

const html = (await readFile(path.join(ROOT, "scripts/og/card.html"), "utf8"))
  .replace("{{FONTS}}", fonts)
  .replaceAll("{{EMBLEM}}", await dataUri("public/brand/emblem.svg", "image/svg+xml"))
  .replaceAll("{{WORDMARK}}", await dataUri("public/brand/wordmark.svg", "image/svg+xml"))
  .replace("{{PHONE}}", OFFICE_PHONE);

const browser = await chromium.launch({
  channel: process.env.CHROME_BIN ? undefined : "chrome",
  executablePath: process.env.CHROME_BIN || undefined,
});
try {
  const page = await browser.newPage({ viewport: { width: 1200, height: 630 } });
  await page.setContent(html, { waitUntil: "load" });
  await page.evaluate(() => document.fonts.ready);
  const out = path.join(ROOT, "public/og.png");
  await page.screenshot({ path: out });
  console.log("готово:", path.relative(ROOT, out));
} finally {
  await browser.close();
}

import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";

type LeadPayload = {
  name?: string;
  phone?: string;
  task?: string;
  object?: string;
  comment?: string;
  page?: string;
  company?: string; // honeypot: настоящие посетители это поле не видят
};

const ALLOWED_TASKS = new Set([
  "Продать",
  "Купить",
  "Обменять",
  "Сдать",
  "Снять",
  "Сопровождение",
  "Другое",
]);

// Простейший rate-limit в памяти процесса: 5 заявок в минуту с одного IP
const hits = new Map<string, number[]>();
const WINDOW_MS = 60_000;
const MAX_PER_WINDOW = 5;

function rateLimited(ip: string): boolean {
  const now = Date.now();
  const arr = (hits.get(ip) ?? []).filter((t) => now - t < WINDOW_MS);
  if (arr.length >= MAX_PER_WINDOW) {
    hits.set(ip, arr);
    return true;
  }
  arr.push(now);
  hits.set(ip, arr);
  return false;
}

function escapeHtml(s: string): string {
  return s
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;");
}

export async function POST(req: NextRequest) {
  let body: LeadPayload;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json(
      { ok: false, error: "Некорректный запрос" },
      { status: 400 },
    );
  }

  // Honeypot: боты заполняют скрытое поле, отвечаем «успехом» и выходим
  if (body.company && body.company.trim() !== "") {
    return NextResponse.json({ ok: true, delivered: false });
  }

  const ip =
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "local";
  if (rateLimited(ip)) {
    return NextResponse.json(
      { ok: false, error: "Слишком много заявок. Попробуйте через минуту." },
      { status: 429 },
    );
  }

  const name = (body.name ?? "").trim().slice(0, 100);
  const phoneRaw = (body.phone ?? "").trim().slice(0, 30);
  const phoneDigits = phoneRaw.replace(/\D/g, "");
  const task = ALLOWED_TASKS.has(body.task ?? "") ? body.task! : "Другое";
  const object = (body.object ?? "").trim().slice(0, 200);
  const comment = (body.comment ?? "").trim().slice(0, 1000);
  const page = (body.page ?? "").trim().slice(0, 200);

  if (name.length < 2) {
    return NextResponse.json(
      { ok: false, error: "Укажите имя" },
      { status: 400 },
    );
  }
  if (phoneDigits.length < 10 || phoneDigits.length > 15) {
    return NextResponse.json(
      { ok: false, error: "Укажите корректный номер телефона" },
      { status: 400 },
    );
  }

  const time = new Intl.DateTimeFormat("ru-RU", {
    dateStyle: "short",
    timeStyle: "short",
    timeZone: "Europe/Moscow",
  }).format(new Date());

  const lines = [
    "<b>Новая заявка с сайта</b>",
    "",
    `<b>Имя:</b> ${escapeHtml(name)}`,
    `<b>Телефон:</b> ${escapeHtml(phoneRaw)}`,
    `<b>Задача:</b> ${escapeHtml(task)}`,
  ];
  if (object) lines.push(`<b>Объект или район:</b> ${escapeHtml(object)}`);
  if (comment) lines.push(`<b>Комментарий:</b> ${escapeHtml(comment)}`);
  lines.push("", `${time} МСК${page ? ` · ${escapeHtml(page)}` : ""}`);

  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;

  if (!token || !chatId) {
    // Telegram ещё не настроен: не теряем заявку молча, пишем в лог сервера
    console.warn("[lead] TELEGRAM_BOT_TOKEN / TELEGRAM_CHAT_ID не заданы.");
    console.warn("[lead]", JSON.stringify({ name, phoneRaw, task, object, comment }));
    return NextResponse.json({ ok: true, delivered: false });
  }

  try {
    const res = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: chatId,
        text: lines.join("\n"),
        parse_mode: "HTML",
        disable_web_page_preview: true,
      }),
      signal: AbortSignal.timeout(10_000),
    });
    const data = (await res.json()) as { ok?: boolean; description?: string };
    if (!res.ok || !data.ok) {
      console.error("[lead] Telegram API error:", data.description ?? res.status);
      return NextResponse.json(
        { ok: false, error: "Не удалось отправить заявку" },
        { status: 502 },
      );
    }
  } catch (e) {
    console.error("[lead] Telegram request failed:", e);
    return NextResponse.json(
      { ok: false, error: "Не удалось отправить заявку" },
      { status: 502 },
    );
  }

  return NextResponse.json({ ok: true, delivered: true });
}

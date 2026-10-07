import { NextRequest, NextResponse } from "next/server";
import { processLead } from "@/lib/leads";

export const runtime = "nodejs";

type LeadPayload = {
  name?: string;
  phone?: string;
  task?: string;
  object?: string;
  comment?: string;
  page?: string;
  consent?: boolean;
  company?: string; // honeypot: настоящие посетители это поле не видят
};

const ALLOWED_TASKS = new Set([
  "Продать",
  "Купить",
  "Обменять",
  "Сдать",
  "Снять",
  "Сопровождение",
  "Перезвоните мне",
  "Другое",
]);

// Простейший rate-limit в памяти процесса: 5 заявок в минуту с одного IP
const hits = new Map<string, number[]>();
const WINDOW_MS = 60_000;
const MAX_PER_WINDOW = 5;
const SWEEP_AT = 500;

function rateLimited(ip: string): boolean {
  const now = Date.now();
  // не копим записи по каждому IP вечно: процесс живёт месяцами
  if (hits.size > SWEEP_AT) {
    for (const [key, times] of hits) {
      if (!times.some((t) => now - t < WINDOW_MS)) hits.delete(key);
    }
  }
  const arr = (hits.get(ip) ?? []).filter((t) => now - t < WINDOW_MS);
  if (arr.length >= MAX_PER_WINDOW) {
    hits.set(ip, arr);
    return true;
  }
  arr.push(now);
  hits.set(ip, arr);
  return false;
}

// JSON может прислать что угодно: числа и объекты не должны ронять .trim()
function str(v: unknown): string {
  return typeof v === "string" ? v : "";
}

export async function POST(req: NextRequest) {
  let body: LeadPayload;
  try {
    body = (await req.json()) as LeadPayload;
  } catch {
    return NextResponse.json(
      { ok: false, error: "Некорректный запрос" },
      { status: 400 },
    );
  }
  if (typeof body !== "object" || body === null) {
    return NextResponse.json(
      { ok: false, error: "Некорректный запрос" },
      { status: 400 },
    );
  }

  // Honeypot: боты заполняют скрытое поле, отвечаем «успехом» и выходим
  if (str(body.company).trim() !== "") {
    return NextResponse.json({ ok: true });
  }

  // x-real-ip ставит наш nginx (или Vercel) и его нельзя подделать снаружи;
  // первый элемент x-forwarded-for контролируется клиентом, он только фолбэк
  const ip =
    req.headers.get("x-real-ip")?.trim() ||
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    "local";
  if (rateLimited(ip)) {
    return NextResponse.json(
      { ok: false, error: "Слишком много заявок. Попробуйте через минуту." },
      { status: 429 },
    );
  }

  const name = str(body.name).trim().slice(0, 100);
  const phoneRaw = str(body.phone).trim().slice(0, 30);
  const phoneDigits = phoneRaw.replace(/\D/g, "");
  const task = ALLOWED_TASKS.has(str(body.task)) ? str(body.task) : "Другое";

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
  if (body.consent !== true) {
    return NextResponse.json(
      { ok: false, error: "Подтвердите согласие на обработку данных" },
      { status: 400 },
    );
  }

  let result;
  try {
    result = await processLead({
      name,
      phone: phoneRaw,
      task,
      object: str(body.object).trim().slice(0, 200),
      comment: str(body.comment).trim().slice(0, 1000),
      page: str(body.page).trim().slice(0, 200),
      ip,
      consentAt: new Date().toISOString(),
    });
  } catch (e) {
    // неожиданный сбой не должен отдавать HTML-500: клиент ждёт JSON
    console.error("[lead] processLead упал:", e);
    return NextResponse.json(
      { ok: false, error: "Не удалось отправить заявку" },
      { status: 500 },
    );
  }

  // Заявка принята, если записана в журнал ИЛИ доставлена хоть одним каналом
  const deliveredSomewhere = Object.values(result.delivery).some(
    (s) => s === "ok" || s === "partial",
  );
  if (!result.journaled && !deliveredSomewhere) {
    return NextResponse.json(
      { ok: false, error: "Не удалось отправить заявку" },
      { status: 502 },
    );
  }

  return NextResponse.json({ ok: true, delivery: result.delivery });
}

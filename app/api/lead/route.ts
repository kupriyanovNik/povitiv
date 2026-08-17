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
    return NextResponse.json({ ok: true });
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

  const result = await processLead({
    name,
    phone: phoneRaw,
    task,
    object: (body.object ?? "").trim().slice(0, 200),
    comment: (body.comment ?? "").trim().slice(0, 1000),
    page: (body.page ?? "").trim().slice(0, 200),
    ip,
    consentAt: new Date().toISOString(),
  });

  // Заявка принята, если записана в журнал ИЛИ доставлена хоть одним каналом
  const deliveredSomewhere = Object.values(result.delivery).includes("ok");
  if (!result.journaled && !deliveredSomewhere) {
    return NextResponse.json(
      { ok: false, error: "Не удалось отправить заявку" },
      { status: 502 },
    );
  }

  return NextResponse.json({ ok: true, delivery: result.delivery });
}

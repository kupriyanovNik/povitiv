import { appendFile, mkdir } from "node:fs/promises";
import { randomUUID } from "node:crypto";
import path from "node:path";
import nodemailer from "nodemailer";

/**
 * Лид-пайплайн: заявка = запись, а не сообщение.
 *
 * 1. Заявка СНАЧАЛА пишется в журнал на сервере (JSONL, каталог LEADS_DIR).
 *    Это требование 152-ФЗ (первичная запись ПДн в БД на территории РФ)
 *    и страховка: лид не теряется, даже если все каналы уведомлений лежат.
 * 2. Затем уведомления по каналам, каждый с повтором при сбое:
 *    email (SMTP_*) — основной, MAX-бот (MAX_*) — вторичный,
 *    Telegram (TELEGRAM_*) — опция для не-РФ окружений.
 * 3. Итог доставки дописывается в журнал отдельной строкой.
 */

export type LeadInput = {
  name: string;
  phone: string;
  task: string;
  object?: string;
  comment?: string;
  page?: string;
  ip: string;
  consentAt: string; // ISO-время отметки чекбокса согласия
};

export type DeliveryStatus = "ok" | "failed" | "skipped";

const LEADS_DIR =
  process.env.LEADS_DIR ?? path.join(process.cwd(), "data", "leads");

/* --------------------------------- журнал --------------------------------- */

async function appendJournal(entry: Record<string, unknown>): Promise<void> {
  await mkdir(LEADS_DIR, { recursive: true });
  const month = new Date().toISOString().slice(0, 7);
  const file = path.join(LEADS_DIR, `leads-${month}.jsonl`);
  await appendFile(file, JSON.stringify(entry) + "\n", "utf8");
}

/* --------------------------------- каналы --------------------------------- */

function formatLeadText(lead: LeadInput, forHtml = false): string {
  const esc = (s: string) =>
    forHtml
      ? s.replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;")
      : s;
  const time = new Intl.DateTimeFormat("ru-RU", {
    dateStyle: "short",
    timeStyle: "short",
    timeZone: "Europe/Moscow",
  }).format(new Date());
  const lines = [
    forHtml ? "<b>Новая заявка с сайта</b>" : "Новая заявка с сайта",
    "",
    `Имя: ${esc(lead.name)}`,
    `Телефон: ${esc(lead.phone)}`,
    `Задача: ${esc(lead.task)}`,
  ];
  if (lead.object) lines.push(`Объект или район: ${esc(lead.object)}`);
  if (lead.comment) lines.push(`Комментарий: ${esc(lead.comment)}`);
  lines.push("", `${time} МСК${lead.page ? ` · ${esc(lead.page)}` : ""}`);
  return lines.join("\n");
}

async function withRetry(
  attempt: () => Promise<void>,
  tries = 2,
  backoffMs = 2000,
): Promise<DeliveryStatus> {
  for (let i = 0; i < tries; i++) {
    try {
      await attempt();
      return "ok";
    } catch (e) {
      if (i === tries - 1) {
        console.error("[lead] канал доставки упал:", e);
        return "failed";
      }
      await new Promise((r) => setTimeout(r, backoffMs));
    }
  }
  return "failed";
}

async function sendEmail(lead: LeadInput): Promise<DeliveryStatus> {
  const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, LEAD_EMAIL_TO } =
    process.env;
  if (!SMTP_HOST || !LEAD_EMAIL_TO) return "skipped";
  const transport = nodemailer.createTransport({
    host: SMTP_HOST,
    port: Number(SMTP_PORT ?? 465),
    secure: (process.env.SMTP_SECURE ?? "true") !== "false",
    auth: SMTP_USER ? { user: SMTP_USER, pass: SMTP_PASS } : undefined,
  });
  return withRetry(async () => {
    await transport.sendMail({
      from: process.env.LEAD_EMAIL_FROM ?? SMTP_USER,
      to: LEAD_EMAIL_TO,
      subject: `Заявка с сайта: ${lead.task}, ${lead.name}`,
      text: formatLeadText(lead),
    });
  });
}

async function sendMax(lead: LeadInput): Promise<DeliveryStatus> {
  const token = process.env.MAX_BOT_TOKEN;
  const chatId = process.env.MAX_CHAT_ID;
  if (!token || !chatId) return "skipped";
  return withRetry(async () => {
    const res = await fetch(
      `https://platform-api2.max.ru/messages?chat_id=${encodeURIComponent(chatId)}`,
      {
        method: "POST",
        headers: {
          Authorization: token,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ text: formatLeadText(lead) }),
        signal: AbortSignal.timeout(10_000),
      },
    );
    if (!res.ok) {
      throw new Error(`MAX API ${res.status}: ${(await res.text()).slice(0, 200)}`);
    }
  });
}

async function sendTelegram(lead: LeadInput): Promise<DeliveryStatus> {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;
  if (!token || !chatId) return "skipped";
  const base = process.env.TELEGRAM_API_BASE ?? "https://api.telegram.org";
  return withRetry(async () => {
    const res = await fetch(`${base}/bot${token}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: chatId,
        text: formatLeadText(lead, true),
        parse_mode: "HTML",
        disable_web_page_preview: true,
      }),
      signal: AbortSignal.timeout(10_000),
    });
    const data = (await res.json()) as { ok?: boolean; description?: string };
    if (!res.ok || !data.ok) {
      throw new Error(`Telegram API: ${data.description ?? res.status}`);
    }
  });
}

/* ---------------------------------- вход ----------------------------------- */

export type LeadResult = {
  id: string;
  journaled: boolean;
  delivery: Record<string, DeliveryStatus>;
};

export async function processLead(lead: LeadInput): Promise<LeadResult> {
  const id = randomUUID();
  const createdAt = new Date().toISOString();

  // 1. Сначала запись в журнал на сервере
  let journaled = true;
  try {
    await appendJournal({
      type: "lead",
      id,
      createdAt,
      name: lead.name,
      phone: lead.phone,
      task: lead.task,
      object: lead.object || undefined,
      comment: lead.comment || undefined,
      page: lead.page || undefined,
      consent: { given: true, at: lead.consentAt, ip: lead.ip },
    });
  } catch (e) {
    // например, read-only ФС на serverless: заявка уйдёт каналами
    journaled = false;
    console.error("[lead] не удалось записать журнал:", e);
  }

  // 2. Каналы уведомлений (параллельно, каждый со своими ретраями)
  const [email, max, telegram] = await Promise.all([
    sendEmail(lead),
    sendMax(lead),
    sendTelegram(lead),
  ]);
  const delivery = { email, max, telegram };

  // 3. Итог доставки в журнал
  try {
    await appendJournal({ type: "delivery", id, at: new Date().toISOString(), delivery });
  } catch {
    /* журнал уже мог быть недоступен, статусы есть в логе ниже */
  }

  console.log("[lead]", id, JSON.stringify(delivery), journaled ? "" : "(журнал недоступен)");
  return { id, journaled, delivery };
}

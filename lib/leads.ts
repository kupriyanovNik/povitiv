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
 * 2. Затем уведомление на почту агентства. Решение клиента (26.10.2026):
 *    только email, без MAX и Telegram. Без SMTP_HOST и LEAD_EMAIL_TO в env
 *    отправка пропускается ("skipped"), заявка остаётся в журнале.
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

/* ---------------------------------- почта ---------------------------------- */

function formatLeadText(lead: LeadInput): string {
  const time = new Intl.DateTimeFormat("ru-RU", {
    dateStyle: "short",
    timeStyle: "short",
    timeZone: "Europe/Moscow",
  }).format(new Date());
  const lines = [
    "Новая заявка с сайта",
    "",
    `Имя: ${lead.name}`,
    `Телефон: ${lead.phone}`,
    `Задача: ${lead.task}`,
  ];
  if (lead.object) lines.push(`Объект или район: ${lead.object}`);
  if (lead.comment) lines.push(`Комментарий: ${lead.comment}`);
  lines.push("", `${time} МСК${lead.page ? `, ${lead.page}` : ""}`);
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
        console.error("[lead] письмо не отправлено:", e);
        return "failed";
      }
      await new Promise((r) => setTimeout(r, backoffMs));
    }
  }
  return "failed";
}

/**
 * Уведомление о заявке на почту агентства (positiv-vt@mail.ru) через SMTP
 * из env, см. .env.example. Для mail.ru нужен пароль для внешнего
 * приложения, обычный пароль ящика SMTP не примет.
 */
async function sendEmail(lead: LeadInput): Promise<DeliveryStatus> {
  const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, LEAD_EMAIL_TO } =
    process.env;
  if (!SMTP_HOST || !LEAD_EMAIL_TO) return "skipped";
  const transport = nodemailer.createTransport({
    host: SMTP_HOST,
    port: Number(SMTP_PORT ?? 465),
    secure: (process.env.SMTP_SECURE ?? "true") !== "false",
    auth: SMTP_USER ? { user: SMTP_USER, pass: SMTP_PASS } : undefined,
    // без таймаутов зависший SMTP держал бы запрос заявки минутами
    connectionTimeout: 10_000,
    greetingTimeout: 10_000,
    socketTimeout: 15_000,
  });
  // в теме только задача и имя без переводов строк
  const subjectName = lead.name.replace(/[\r\n]+/g, " ").slice(0, 60);
  return withRetry(async () => {
    await transport.sendMail({
      from: process.env.LEAD_EMAIL_FROM || SMTP_USER,
      to: LEAD_EMAIL_TO,
      subject: `Заявка с сайта: ${lead.task}, ${subjectName}`,
      text: formatLeadText(lead),
    });
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
    // например, read-only ФС на serverless
    journaled = false;
    console.error("[lead] не удалось записать журнал:", e);
  }

  // 2. Уведомление на почту
  const delivery = { email: await sendEmail(lead) };

  // 3. Итог доставки в журнал
  try {
    await appendJournal({ type: "delivery", id, at: new Date().toISOString(), delivery });
  } catch {
    /* журнал уже мог быть недоступен, статусы есть в логе ниже */
  }

  console.log("[lead]", id, JSON.stringify(delivery), journaled ? "" : "(журнал недоступен)");
  return { id, journaled, delivery };
}

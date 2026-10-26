import { appendFile, mkdir } from "node:fs/promises";
import { randomUUID } from "node:crypto";
import path from "node:path";

/**
 * Лид-пайплайн: заявка = запись, а не сообщение.
 *
 * 1. Заявка СНАЧАЛА пишется в журнал на сервере (JSONL, каталог LEADS_DIR).
 *    Это требование 152-ФЗ (первичная запись ПДн в БД на территории РФ)
 *    и страховка: лид не теряется, даже если все каналы уведомлений лежат.
 * 2. Затем уведомление на почту. Решение клиента (26.10.2026): только
 *    email, без MAX и Telegram. Сама отправка пока не реализована,
 *    sendEmail — заглушка (см. ниже).
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

/**
 * ЗАГЛУШКА: уведомление о заявке на почту агентства.
 * Отправка будет реализована позже (SMTP-параметры из env, см.
 * .env.example). Пока заявка сохраняется только в журнал, а функция
 * возвращает "skipped".
 */
async function sendEmail(lead: LeadInput): Promise<DeliveryStatus> {
  void lead;
  return "skipped";
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

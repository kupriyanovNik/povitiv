import { timingSafeEqual } from "node:crypto";
import { handleMaxUpdate, type MaxUpdate } from "@/lib/max-bot";

/**
 * Вебхук бота MAX: сюда MAX присылает события (нажали «Начать», бота
 * добавили в чат, написали боту). Подписка: node scripts/max-bot.mjs webhook.
 *
 * MAX подписывает каждый запрос заголовком X-Max-Bot-Api-Secret со
 * значением MAX_WEBHOOK_SECRET, чужие запросы отбиваются. Отвечаем 200
 * даже при сбое обработки: на любой другой ответ MAX повторяет событие
 * до 8 часов, и бот отвечал бы человеку по многу раз.
 */

export const runtime = "nodejs";

function validSecret(header: string | null): boolean {
  const secret = process.env.MAX_WEBHOOK_SECRET;
  if (!secret || !header) return false;
  const a = Buffer.from(header);
  const b = Buffer.from(secret);
  return a.length === b.length && timingSafeEqual(a, b);
}

export async function POST(req: Request) {
  // бот не настроен: для внешнего мира эндпоинта нет
  if (!process.env.MAX_BOT_TOKEN || !process.env.MAX_WEBHOOK_SECRET) {
    return new Response(null, { status: 404 });
  }
  if (!validSecret(req.headers.get("x-max-bot-api-secret"))) {
    return new Response(null, { status: 401 });
  }

  let update: MaxUpdate;
  try {
    update = (await req.json()) as MaxUpdate;
  } catch {
    return Response.json({ ok: true });
  }

  try {
    await handleMaxUpdate(update);
  } catch (e) {
    console.error("[max] не удалось обработать событие", update?.update_type, e);
  }
  return Response.json({ ok: true });
}

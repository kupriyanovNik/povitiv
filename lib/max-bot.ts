import { timingSafeEqual } from "node:crypto";
import { maxChatIds, maxSend } from "./max";
import { phones, site } from "./site";

/**
 * Ответы бота MAX на события из мессенджера (приходят на вебхук
 * app/api/max/webhook). Заявки бот присылает сам из lib/leads.ts.
 *
 * Кому слать заявки, решает только MAX_CHAT_ID на сервере: бот никого
 * не подключает сам. Ссылка подключения с MAX_CONNECT_CODE лишь
 * показывает сотруднику код его чата и пишет запрос в лог сервера;
 * код в MAX_CHAT_ID вносит администратор. Утечка ссылки поэтому не
 * отдаёт заявки постороннему.
 *
 * Посторонний, нашедший бота в поиске MAX, получает сведения об агентстве:
 * правила MAX требуют от бота названия и адреса владельца, контактов
 * поддержки и политики обработки персональных данных.
 */

type MaxUser = {
  user_id: number;
  first_name?: string;
  name?: string;
  is_bot?: boolean;
};

export type MaxUpdate = {
  update_type: string;
  chat_id?: number;
  user?: MaxUser;
  payload?: string | null;
  is_channel?: boolean;
  message?: {
    sender?: MaxUser | null;
    recipient?: { chat_id?: number | null; chat_type?: string };
    body?: { text?: string | null } | null;
  };
};

const ABOUT = [
  `Здравствуйте! Это служебный бот агентства недвижимости «${site.name}»: он присылает сотрудникам заявки с сайта.`,
  "",
  "Связаться с агентством:",
  ...phones.map((p) => `${p.display} (${p.label.toLowerCase()})`),
  site.workHours,
  site.url,
  "",
  `${site.legal.name}, ИНН ${site.legal.inn}`,
  site.address,
  `Политика обработки персональных данных: ${site.url}/privacy`,
].join("\n");

const CONNECTED =
  "Этот чат подключён: сюда приходят заявки с сайта. Отвечать на сообщения бот не умеет, клиенту звоните по номеру из заявки.";

const pending = (chatId: string) =>
  [
    "Запрос на подключение получен.",
    `Код этого чата: ${chatId}`,
    "",
    "Заявки с сайта начнут приходить сюда, когда разработчик добавит этот код в настройки сайта. Если он попросит, перешлите ему это сообщение.",
  ].join("\n");

function isConnectCode(value: string | null | undefined): boolean {
  const code = process.env.MAX_CONNECT_CODE;
  if (!code || !value) return false;
  const a = Buffer.from(value);
  const b = Buffer.from(code);
  return a.length === b.length && timingSafeEqual(a, b);
}

const userName = (u?: MaxUser | null) => u?.first_name ?? u?.name ?? "без имени";

const reply = (chatId: string, text: string) => maxSend(chatId, { text });

export async function handleMaxUpdate(update: MaxUpdate): Promise<void> {
  const connected = new Set(maxChatIds());

  switch (update.update_type) {
    // нажали «Начать», в том числе по ссылке подключения ?start=<код>
    case "bot_started": {
      if (!update.chat_id) return;
      const chatId = String(update.chat_id);
      if (connected.has(chatId)) return reply(chatId, CONNECTED);
      if (isConnectCode(update.payload)) {
        console.log(`[max] запрос на подключение: чат ${chatId}, ${userName(update.user)}`);
        return reply(chatId, pending(chatId));
      }
      return reply(chatId, ABOUT);
    }

    // бота добавили в групповой чат: так заявки видит сразу несколько человек
    case "bot_added": {
      if (!update.chat_id || update.is_channel) return;
      const chatId = String(update.chat_id);
      if (connected.has(chatId)) return reply(chatId, CONNECTED);
      console.log(`[max] бота добавили в чат ${chatId}, добавил ${userName(update.user)}`);
      return reply(chatId, pending(chatId));
    }

    // сообщение в личном диалоге с ботом; в группах бот молчит
    case "message_created": {
      const m = update.message;
      if (!m || m.sender?.is_bot || m.recipient?.chat_type !== "dialog") return;
      if (!m.recipient.chat_id) return;
      const chatId = String(m.recipient.chat_id);
      const [command, arg] = (m.body?.text ?? "").trim().split(/\s+/);
      if (command === "/id") return reply(chatId, `Код этого чата: ${chatId}`);
      if (connected.has(chatId)) return reply(chatId, CONNECTED);
      // «/start <код>» вручную: на старых версиях MAX ссылки с ?start= не работают
      if (command === "/start" && isConnectCode(arg)) {
        console.log(`[max] запрос на подключение: чат ${chatId}, ${userName(m.sender)}`);
        return reply(chatId, pending(chatId));
      }
      return reply(chatId, ABOUT);
    }
  }
}

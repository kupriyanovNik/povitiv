#!/usr/bin/env node
/**
 * Настройка бота MAX. На сервере запускать через обёртку, она подхватывает
 * .env сайта и сертификат для API MAX:
 *
 *   deploy/max-bot.sh secret        — сгенерировать MAX_WEBHOOK_SECRET и MAX_CONNECT_CODE
 *   deploy/max-bot.sh check         — токен, имя бота, ссылка подключения, чаты, вебхук
 *   deploy/max-bot.sh webhook [url] — направить события бота на сайт
 *                                     (по умолчанию https://positiv-vt.ru/api/max/webhook)
 *   deploy/max-bot.sh webhook-off   — отключить вебхук
 *   deploy/max-bot.sh test          — тестовое сообщение во все чаты из MAX_CHAT_ID
 *
 * Локально без сертификата работает только `secret`: API MAX отвечает
 * сертификатом Минцифры (см. deploy/README-VPS.md, «Бот MAX»).
 */
import { randomBytes } from "node:crypto";

const API = "https://platform-api2.max.ru";
const DEFAULT_WEBHOOK = "https://positiv-vt.ru/api/max/webhook";
const UPDATE_TYPES = ["bot_started", "bot_added", "message_created"];

const chatIds = () =>
  (process.env.MAX_CHAT_ID ?? "").split(/[\s,]+/).filter((id) => /^-?\d+$/.test(id));

async function api(method, path, { query, body } = {}) {
  const token = process.env.MAX_BOT_TOKEN;
  if (!token) throw new Error("MAX_BOT_TOKEN не задан в .env");
  const url = new URL(path, API);
  for (const [k, v] of Object.entries(query ?? {})) url.searchParams.set(k, v);
  let res;
  try {
    res = await fetch(url, {
      method,
      headers: {
        Authorization: token,
        ...(body ? { "Content-Type": "application/json" } : {}),
      },
      body: body ? JSON.stringify(body) : undefined,
      signal: AbortSignal.timeout(15_000),
    });
  } catch (e) {
    const code = e.cause?.code ?? "";
    if (/CERT|SIGNATURE/.test(code)) {
      throw new Error(
        `нет доверия к сертификату API MAX (${code}). Нужен NODE_EXTRA_CA_CERTS: deploy/README-VPS.md, «Бот MAX»`,
      );
    }
    throw e;
  }
  const data = await res.json().catch(() => ({}));
  // часть методов отвечает 200 с { success: false, message }
  if (!res.ok || data.success === false) {
    throw new Error(`MAX API ${res.status}: ${data.message ?? data.code ?? "ошибка"}`);
  }
  return data;
}

const commands = {
  secret() {
    const token = () => randomBytes(24).toString("base64url");
    console.log("Добавьте в .env и перезапустите сайт (systemctl restart positiv-vt):\n");
    console.log(`MAX_WEBHOOK_SECRET=${token()}`);
    console.log(`MAX_CONNECT_CODE=${token()}`);
  },

  async check() {
    const me = await api("GET", "/me");
    console.log(`Бот: ${me.first_name ?? me.name} (@${me.username}), токен работает`);
    const code = process.env.MAX_CONNECT_CODE;
    console.log(
      code
        ? `Ссылка подключения сотрудника: https://max.ru/${me.username}?start=${code}`
        : "MAX_CONNECT_CODE не задан: ссылки подключения нет (deploy/max-bot.sh secret)",
    );
    const ids = chatIds();
    console.log(ids.length ? `Заявки уходят в чаты: ${ids.join(", ")}` : "MAX_CHAT_ID пуст: заявки в MAX не уходят");
    const { subscriptions = [] } = await api("GET", "/subscriptions");
    console.log(
      subscriptions.length
        ? `Вебхук: ${subscriptions.map((s) => s.url).join(", ")}`
        : "Вебхук не настроен (deploy/max-bot.sh webhook)",
    );
  },

  async webhook(url = DEFAULT_WEBHOOK) {
    const secret = process.env.MAX_WEBHOOK_SECRET;
    if (!secret) throw new Error("MAX_WEBHOOK_SECRET не задан в .env (deploy/max-bot.sh secret)");
    if (!url.startsWith("https://")) throw new Error("MAX принимает только https-адрес вебхука");
    // у бота один получатель событий: прежние подписки (например, старый домен) снимаем
    const { subscriptions = [] } = await api("GET", "/subscriptions");
    for (const s of subscriptions) {
      if (s.url !== url) await api("DELETE", "/subscriptions", { query: { url: s.url } });
    }
    await api("POST", "/subscriptions", {
      body: { url, update_types: UPDATE_TYPES, secret },
    });
    console.log(`Готово: события бота идут на ${url}`);
  },

  async "webhook-off"() {
    const { subscriptions = [] } = await api("GET", "/subscriptions");
    for (const s of subscriptions) {
      await api("DELETE", "/subscriptions", { query: { url: s.url } });
    }
    console.log(subscriptions.length ? "Вебхук отключён" : "Вебхук и так не настроен");
  },

  async test() {
    const ids = chatIds();
    if (!ids.length) throw new Error("MAX_CHAT_ID пуст: некуда отправлять");
    let failed = 0;
    for (const id of ids) {
      try {
        await api("POST", "/messages", {
          query: { chat_id: id },
          body: {
            text: "Проверка связи: этот чат подключён, сюда будут приходить заявки с сайта positiv-vt.ru.",
          },
        });
        console.log(`Чат ${id}: отправлено`);
      } catch (e) {
        failed++;
        console.error(`Чат ${id}: ${e.message}`);
      }
    }
    if (failed) throw new Error(`не дошло в ${failed} из ${ids.length} чатов`);
  },
};

const [name = "check", ...args] = process.argv.slice(2);
const command = commands[name];
if (!command) {
  console.error(`Неизвестная команда «${name}». Есть: ${Object.keys(commands).join(", ")}`);
  process.exit(1);
}
try {
  await command(...args);
} catch (e) {
  console.error(`Ошибка: ${e.message}`);
  process.exit(1);
}

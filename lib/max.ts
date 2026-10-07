/**
 * Bot API мессенджера MAX (dev.max.ru/docs-api): общая часть для заявок
 * (lib/leads.ts) и вебхука бота (app/api/max/webhook).
 *
 * Сертификат platform-api2.max.ru выпущен корневым центром Минцифры,
 * которого нет во встроенном списке Node. На прод-сервере администратор
 * подключает его через NODE_EXTRA_CA_CERTS в systemd-юнитах
 * (deploy/README-VPS.md, раздел «Бот MAX»); в коде и репозитории его нет.
 * На демо в Vercel запросы к MAX поэтому падают, это ожидаемо.
 */

const API = "https://platform-api2.max.ru";

/** Чаты, куда бот присылает заявки: MAX_CHAT_ID, через запятую или пробел */
export function maxChatIds(): string[] {
  return (process.env.MAX_CHAT_ID ?? "")
    .split(/[\s,]+/)
    .filter((id) => /^-?\d+$/.test(id));
}

export type MaxMessage = {
  text: string;
  format?: "html" | "markdown";
  notify?: boolean;
};

const TLS_ERRORS = new Set([
  "UNABLE_TO_GET_ISSUER_CERT_LOCALLY",
  "UNABLE_TO_VERIFY_LEAF_SIGNATURE",
  "SELF_SIGNED_CERT_IN_CHAIN",
]);

export async function maxRequest<T = unknown>(
  method: "GET" | "POST" | "DELETE",
  path: string,
  { query, body }: { query?: Record<string, string>; body?: unknown } = {},
): Promise<T> {
  const token = process.env.MAX_BOT_TOKEN;
  if (!token) throw new Error("MAX_BOT_TOKEN не задан");
  const url = new URL(path, API);
  for (const [k, v] of Object.entries(query ?? {})) url.searchParams.set(k, v);

  let res: Response;
  try {
    res = await fetch(url, {
      method,
      // токен только в заголовке: в query-параметре MAX его больше не принимает
      headers: {
        Authorization: token,
        ...(body ? { "Content-Type": "application/json" } : {}),
      },
      body: body ? JSON.stringify(body) : undefined,
      signal: AbortSignal.timeout(10_000),
    });
  } catch (e) {
    const code = (e as { cause?: { code?: string } }).cause?.code;
    if (code && TLS_ERRORS.has(code)) {
      throw new Error(
        `MAX API: нет доверия к сертификату (${code}); на сервере нужен NODE_EXTRA_CA_CERTS, см. deploy/README-VPS.md`,
      );
    }
    throw e;
  }
  if (!res.ok) {
    throw new Error(`MAX API ${res.status}: ${(await res.text()).slice(0, 200)}`);
  }
  return (await res.json()) as T;
}

export async function maxSend(chatId: string, message: MaxMessage): Promise<void> {
  await maxRequest("POST", "/messages", { query: { chat_id: chatId }, body: message });
}

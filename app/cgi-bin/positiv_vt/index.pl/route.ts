/**
 * Адреса старого сайта positiv-vt.ru (CGI, в индексе Яндекса с 2011 года):
 * /cgi-bin/positiv_vt/index.pl?text=…  Постоянный редирект (301) на
 * соответствующий раздел лендинга сохраняет их вес в поиске и не оставляет
 * битых ссылок после переезда.
 *
 * Не через redirects() в next.config: тот переносит параметры старого
 * запроса в новый адрес (/?text=page&i=4#kontakty), а такие хвосты
 * плодили бы дубли главной. Location относительный: за nginx не важно,
 * с каким хостом и протоколом пришёл запрос.
 */

// страницы старого сайта: text=page&i=N (обход 07.10.2026)
const PAGES: Record<string, string> = {
  "2": "/", // о компании
  "3": "/", // вакансии
  "4": "/#kontakty", // контакты
  "5": "/#zayavka", // форма «Ваш вопрос»
  "6": "/#faq", // справочная статья (приватизация)
  "7": "/",
  "8": "/#zayavka", // онлайн-заявка
};

function target(params: URLSearchParams): string {
  const text = params.get("text");
  if (text === "page") return PAGES[params.get("i") ?? ""] ?? "/";
  // разделы каталога и карточки объектов старого сайта: объектов на
  // новом сайте нет, ближе всего по смыслу блок видов недвижимости
  if (text === "cat" || text === "elem") return "/#nedvizhimost";
  return "/";
}

function redirect(request: Request): Response {
  const { searchParams } = new URL(request.url);
  return new Response(null, {
    status: 301,
    headers: { Location: target(searchParams) },
  });
}

export const GET = redirect;
export const HEAD = redirect;

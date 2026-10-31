# Статическая версия сайта «Позитив ВТ»

Полностью статичная копия лендинга: без Node.js, без сборки и без
внешних зависимостей. Дизайн, тексты и разметка сняты с продакшен-сборки
приложения (Next.js) пиксель-в-пиксель; интерактив (шапка, мобильное меню,
модалка заявки, FAQ, карусель отзывов, мобильная панель) повторён на
ванильном JS в `script.js`.

## Состав

```
index.html        — главная
privacy.html      — политика обработки персональных данных
consent.html      — согласие на обработку данных
404.html          — страница «Такой страницы нет»
styles.css        — все стили (Tailwind-сборка приложения + состояния UI)
script.js         — ванильный JS без зависимостей
robots.txt        — правила индексации
sitemap.xml       — карта сайта
favicon.ico, icon.svg, apple-icon.png — иконки
og.png            — картинка для превью в соцсетях/мессенджерах
img/photos/       — фотографии объектов (оригиналы)
img/brand/        — эмблема и надпись логотипа (SVG-маски)
img/partners/     — логотипы банков-партнёров
fonts/            — woff2-шрифты Golos Text и Geologica (кириллица)
```

## Требования

- Любой веб-сервер (Apache 2.4+, nginx, IIS) с **HTTPS**-сертификатом для
  `positiv-vt.ru` и `www.positiv-vt.ru` — без него браузеры помечают форму
  как небезопасную, а превью ссылки в мессенджерах не показывается.
- Если сервер новый: сначала переведите DNS (A-записи домена и www) на его
  IP, **только потом** выпускайте сертификат Let's Encrypt — иначе проверка
  управления доменом уйдёт на старый сервер.
- **Перед заменой сохраните текущий сайт архивом** на случай отката.
- Node.js не требуется: сайт — обычные статичные файлы.

## Деплой

1. Скопируйте **содержимое** этой папки в DocumentRoot сайта
   (nginx: `root /var/www/positiv-vt/static-site;`, Apache: `DocumentRoot …`).
   Файлы должны открываться по адресу `/` (index.html — главная).
2. Настройте 404:
   - nginx: `error_page 404 /404.html;`
   - Apache: `ErrorDocument 404 /404.html`
3. Проверьте, что домен в `robots.txt` и `sitemap.xml`
   (`https://positiv-vt.ru`) совпадает с боевым; при другом домене — поправьте.
4. Карта в подвале — iframe-виджет Яндекс Карт (`yandex.ru/map-widget/...`)
   и работает без ключей и настроек. Остальной сайт полностью локален:
   шрифты, фото и иконки лежат рядом.

## Редиректы старого сайта (301)

Адреса старого CGI-сайта `/cgi-bin/positiv_vt/index.pl?text=…&i=…`
находятся в поисковом индексе с 2011 года. Постоянный редирект сохраняет
их вес и не оставляет битых ссылок. Карта целей — из
`app/cgi-bin/positiv_vt/index.pl/route.ts` исходного приложения:

| Старый адрес                          | Новый     |
| ------------------------------------- | --------- |
| `?text=page&i=2` (о компании)         | `/`       |
| `?text=page&i=3` (вакансии)           | `/`       |
| `?text=page&i=4` (контакты)           | `/#kontakty` |
| `?text=page&i=5` (форма «Ваш вопрос») | `/#zayavka` |
| `?text=page&i=6` (справка)            | `/#faq`   |
| `?text=page&i=7`                      | `/`       |
| `?text=page&i=8` (онлайн-заявка)      | `/#zayavka` |
| `?text=cat…`, `?text=elem…` (каталог объектов) | `/#nedvizhimost` |
| любые прочие параметры                | `/`       |

### nginx

```nginx
# 301 со старых адресов CGI-сайта на разделы лендинга
location = /cgi-bin/positiv_vt/index.pl {
    # страницы старого сайта: text=page&i=N
    if ($arg_text = "page") {
        set $dst "/";
        if ($arg_i = "4") { set $dst "/#kontakty"; }
        if ($arg_i = "5") { set $dst "/#zayavka"; }
        if ($arg_i = "6") { set $dst "/#faq"; }
        if ($arg_i = "8") { set $dst "/#zayavka"; }
        return 301 $dst;
    }
    # разделы каталога и карточки объектов старого сайта
    if ($arg_text = "cat")  { return 301 /#nedvizhimost; }
    if ($arg_text = "elem") { return 301 /#nedvizhimost; }
    # прочее
    return 301 /;
}
```

### Apache (mod_rewrite, в .htaccess или vhost)

```apache
RewriteEngine On

# страницы старого сайта: text=page&i=N
RewriteCond %{QUERY_STRING} (^|&)text=page(&|$) [NC]
RewriteCond %{QUERY_STRING} (^|&)i=4(&|$) [NC]
RewriteRule ^cgi-bin/positiv_vt/index\.pl$ /#kontakty [NE,R=301,L]

RewriteCond %{QUERY_STRING} (^|&)text=page(&|$) [NC]
RewriteCond %{QUERY_STRING} (^|&)i=5(&|$) [NC]
RewriteRule ^cgi-bin/positiv_vt/index\.pl$ /#zayavka [NE,R=301,L]

RewriteCond %{QUERY_STRING} (^|&)text=page(&|$) [NC]
RewriteCond %{QUERY_STRING} (^|&)i=6(&|$) [NC]
RewriteRule ^cgi-bin/positiv_vt/index\.pl$ /#faq [NE,R=301,L]

RewriteCond %{QUERY_STRING} (^|&)text=page(&|$) [NC]
RewriteCond %{QUERY_STRING} (^|&)i=8(&|$) [NC]
RewriteRule ^cgi-bin/positiv_vt/index\.pl$ /#zayavka [NE,R=301,L]

# i=2, 3, 7 и неучтённые страницы — на главную
RewriteCond %{QUERY_STRING} (^|&)text=page(&|$) [NC]
RewriteRule ^cgi-bin/positiv_vt/index\.pl$ / [R=301,L]

# разделы каталога и карточки объектов старого сайта
RewriteCond %{QUERY_STRING} (^|&)text=(cat|elem)(&|$) [NC]
RewriteRule ^cgi-bin/positiv_vt/index\.pl$ /#nedvizhimost [NE,R=301,L]

# прочее — на главную
RewriteRule ^cgi-bin/positiv_vt/index\.pl$ / [R=301,L]
```

(`NE` запрещает кодировать `#` в `%23`; якоря `#…` браузер применяет сам,
сервер их не получает — редирект на адрес с якорем корректен.)

## Подключение отправки формы

Отправка заявок — через зарезервированную функцию `window.submitLead`
в **`script.js`, строка 12**:

```js
function submitLead(formData) { /* Подключается при деплое: сюда приходит FormData формы. Ничего не делает. */ }
```

Обе формы (инлайн-секция «Получите предварительную оценку…» и модалка
заявки) перехватывают `submit` и вызывают `window.submitLead(new FormData(form))`.
Поля FormData: `name`, `phone`, `task`, `object`, `comment` (модалка: только
для задачи «Другое»), `consent` («on», если отмечен), `company` (honeypot
для ботов — всегда пустой у людей). Валидации и сообщений нет по замыслу:
заглушка ничего не делает, при деплое замените тело функции на отправку
(например, `fetch('/api/lead', { method: 'POST', body: formData })`).

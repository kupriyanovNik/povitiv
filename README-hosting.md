# Деплой статичного сайта «Позитив ВТ» — инструкция для хостинга

Сайт полностью статичен (`index.html` + `styles.css` + `script.js` +
картинки и шрифты; без Node.js и сборки). Администратор распаковывает
архив в DocumentRoot, настраивает веб-сервер и выполняет **две
интеграции** из чек-листа ниже.

## Чек-лист: интеграции, которые нужно выполнить

Без них сайт открывается, но неполноценен: заявки никуда не уходят,
а карта в подвале — с рекламной плашкой.

- [ ] **1. Отправка заявок.** Форма вызывает `window.submitLead(formData)` —
  в `script.js` это зарезервированная пустая функция (строка 28, ищите
  по имени `submitLead`); сейчас она возвращает `undefined`: после
  сабмита посетитель видит сообщение
  «Не удалось отправить заявку…», заявка никуда не уходит. Подставить
  реальный обработчик — раздел «Интеграция 1».
- [ ] **2. Ключ Яндекс Карт.** В `script.js` константа `YANDEX_MAPS_API_KEY`
  (строка 21, ищите по этому имени) сейчас пуста: в подвале работает
  iframe-виджет Яндекс Карт **с рекламным баннером** (свойство
  бесплатного встраивания). Вписанный ключ JS API заменяет виджет на
  брендированную карту в палитре сайта без рекламы — раздел «Интеграция 2».

## Требования

- Любой веб-сервер (Apache 2.4+, nginx, IIS) с **HTTPS**-сертификатом для
  `positiv-vt.ru` и `www.positiv-vt.ru` — без него браузеры помечают форму
  как небезопасную, а превью ссылки в мессенджерах не показывается.
  Настройте также постоянный редирект HTTP → HTTPS.
- Если сервер новый: сначала переведите DNS (A-записи домена и www) на его
  IP, **только потом** выпускайте сертификат Let's Encrypt — иначе проверка
  управления доменом уйдёт на старый сервер.
- **Перед заменой сохраните текущий сайт архивом** на случай отката.
- Node.js не требуется: сайт — обычные статичные файлы.

## Деплой

1. Скопируйте **содержимое** архива в DocumentRoot сайта
   (nginx: `root /var/www/positiv-vt/static-site;`, Apache: `DocumentRoot …`).
   Файлы должны открываться по адресу `/` (index.html — главная).
2. Настройте 404 — страница `404.html` использует абсолютные пути и
   корректно отдаётся с любых вложенных адресов:
   nginx: `error_page 404 /404.html;` · Apache: `ErrorDocument 404 /404.html`.
3. Проверьте домен в `robots.txt` и `sitemap.xml` (`https://positiv-vt.ru`);
   при другом домене — поправьте. Затем настройте редиректы (ниже)
   и выполните обе интеграции из чек-листа.

## Редиректы старого сайта (301)

Адреса старого CGI-сайта `/cgi-bin/positiv_vt/index.pl?text=…&i=…`
находятся в поисковом индексе с 2011 года; постоянный редирект сохраняет
их вес и не оставляет битых ссылок. Карта целей:

| Старый адрес                                   | Новый     |
| ---------------------------------------------- | --------- |
| `?text=page&i=2`, `i=3`, `i=7` (о компании, вакансии, прочее) | `/` |
| `?text=page&i=4` (контакты)                    | `/#kontakty` |
| `?text=page&i=5` (форма «Ваш вопрос»), `i=8` (онлайн-заявка) | `/#zayavka` |
| `?text=page&i=6` (справка)                     | `/#faq`   |
| `?text=cat…`, `?text=elem…` (каталог объектов) | `/#nedvizhimost` |
| любые прочие параметры                         | `/`       |

### nginx

```nginx
# ── Куда класть ──────────────────────────────────────────────────────
# Блок «map» — на уровне http, ВНЕ блока server{}: отдельным файлом в
# /etc/nginx/conf.d/ (каталог подключается в контексте http) или в конфиге
# виртуального хоста ПЕРЕД блоком server (map есть только в контексте http).
# Цель вычисляется по строке «text:i», склеенной из аргументов запроса
# (вложенные if в location запрещены). Значения в кавычках: без них «#»
# якоря начинает комментарий. Нет аргумента — срабатывает default («/»).
# «return 301 $cgi_target» подставляет переменную как есть: исходная
# query-строка к цели не приклеивается.

map "$arg_text:$arg_i" $cgi_target {
    default           "/";
    ~^page:4$         "/#kontakty";
    ~^page:5$         "/#zayavka";
    ~^page:6$         "/#faq";
    ~^page:8$         "/#zayavka";
    ~^page:(2|3|7)$   "/";
    ~^(cat|elem):     "/#nedvizhimost";
}

# ── Внутрь существующего server{} сайта ──────────────────────────────
location = /cgi-bin/positiv_vt/index.pl {
    return 301 $cgi_target;
}

# прежние адреса /privacy и /consent
location = /privacy { return 301 /privacy.html; }
location = /consent { return 301 /consent.html; }
```

### Apache (mod_rewrite)

⚠️ В `RewriteRule` путь **без начального слэша** — в контексте per-directory
(`.htaccess` в каталоге сайта), **со слэшем** — в контексте сервера
(VirtualHost). Используйте подходящий блок целиком.

#### .htaccess (в каталоге сайта)

Для работы правил нужен включённый `mod_rewrite` и `AllowOverride All`
в конфиге каталога; если это недоступно — VirtualHost-вариант ниже.

```apache
RewriteEngine On
# страницы старого сайта: text=page&i=N
RewriteCond %{QUERY_STRING} (^|&)text=page(&|$) [NC]
RewriteCond %{QUERY_STRING} (^|&)i=4(&|$) [NC]
RewriteRule ^cgi-bin/positiv_vt/index\.pl$ /#kontakty? [NE,R=301,L]
RewriteCond %{QUERY_STRING} (^|&)text=page(&|$) [NC]
RewriteCond %{QUERY_STRING} (^|&)i=5(&|$) [NC]
RewriteRule ^cgi-bin/positiv_vt/index\.pl$ /#zayavka? [NE,R=301,L]
RewriteCond %{QUERY_STRING} (^|&)text=page(&|$) [NC]
RewriteCond %{QUERY_STRING} (^|&)i=6(&|$) [NC]
RewriteRule ^cgi-bin/positiv_vt/index\.pl$ /#faq? [NE,R=301,L]
RewriteCond %{QUERY_STRING} (^|&)text=page(&|$) [NC]
RewriteCond %{QUERY_STRING} (^|&)i=8(&|$) [NC]
RewriteRule ^cgi-bin/positiv_vt/index\.pl$ /#zayavka? [NE,R=301,L]
# i=2, 3, 7 и неучтённые страницы — на главную
RewriteCond %{QUERY_STRING} (^|&)text=page(&|$) [NC]
RewriteRule ^cgi-bin/positiv_vt/index\.pl$ /? [R=301,L]
# разделы каталога и карточки объектов старого сайта
RewriteCond %{QUERY_STRING} (^|&)text=(cat|elem)(&|$) [NC]
RewriteRule ^cgi-bin/positiv_vt/index\.pl$ /#nedvizhimost? [NE,R=301,L]
# прочее — на главную
RewriteRule ^cgi-bin/positiv_vt/index\.pl$ /? [R=301,L]
# прежние адреса /privacy и /consent
RewriteRule ^privacy$ /privacy.html? [R=301,L]
RewriteRule ^consent$ /consent.html? [R=301,L]
```

#### VirtualHost (конфиг сервера)

Те же правила с начальным слэшем в путях:

```apache
RewriteEngine On
# страницы старого сайта: text=page&i=N
RewriteCond %{QUERY_STRING} (^|&)text=page(&|$) [NC]
RewriteCond %{QUERY_STRING} (^|&)i=4(&|$) [NC]
RewriteRule ^/cgi-bin/positiv_vt/index\.pl$ /#kontakty? [NE,R=301,L]
RewriteCond %{QUERY_STRING} (^|&)text=page(&|$) [NC]
RewriteCond %{QUERY_STRING} (^|&)i=5(&|$) [NC]
RewriteRule ^/cgi-bin/positiv_vt/index\.pl$ /#zayavka? [NE,R=301,L]
RewriteCond %{QUERY_STRING} (^|&)text=page(&|$) [NC]
RewriteCond %{QUERY_STRING} (^|&)i=6(&|$) [NC]
RewriteRule ^/cgi-bin/positiv_vt/index\.pl$ /#faq? [NE,R=301,L]
RewriteCond %{QUERY_STRING} (^|&)text=page(&|$) [NC]
RewriteCond %{QUERY_STRING} (^|&)i=8(&|$) [NC]
RewriteRule ^/cgi-bin/positiv_vt/index\.pl$ /#zayavka? [NE,R=301,L]
# i=2, 3, 7 и неучтённые страницы — на главную
RewriteCond %{QUERY_STRING} (^|&)text=page(&|$) [NC]
RewriteRule ^/cgi-bin/positiv_vt/index\.pl$ /? [R=301,L]
# разделы каталога и карточки объектов старого сайта
RewriteCond %{QUERY_STRING} (^|&)text=(cat|elem)(&|$) [NC]
RewriteRule ^/cgi-bin/positiv_vt/index\.pl$ /#nedvizhimost? [NE,R=301,L]
# прочее — на главную
RewriteRule ^/cgi-bin/positiv_vt/index\.pl$ /? [R=301,L]
# прежние адреса /privacy и /consent
RewriteRule ^/privacy$ /privacy.html? [R=301,L]
RewriteRule ^/consent$ /consent.html? [R=301,L]
```

`NE` запрещает кодировать `#` в `%23`; завершающий `?` в подстановке
отбрасывает исходную query-строку; якорь `#…` браузер применяет сам —
сервер фрагменты не получает.

## IIS (web.config)

В корне сайта — файл `web.config` (нужен модуль URL Rewrite); он
закрывает и 404 из раздела «Деплой», и редиректы выше. В примере — 404,
`/privacy`, `/consent` и правило для старого `/cgi-bin/…`; остальные
цели (`i=5/6/8`, `cat|elem`) — копии правила `cgi-old` с условиями
(аналог `RewriteCond`) и целями из таблицы выше — во всех action
обязательно `appendQueryString="false"` (иначе старая query приклеится
к чистой цели: `/#kontakty?text=page&i=4`):

```xml
<?xml version="1.0" encoding="UTF-8"?>
<configuration>
  <system.webServer>
    <httpErrors existingResponse="Replace" errorMode="Custom">
      <remove statusCode="404" />
      <!-- ExecuteURL: path — URL на сайте (/404.html), а не физический путь;
           404.html использует абсолютные пути (/styles.css), поэтому работает.
           Кастомная страница httpErrors отдаётся с ИСХОДНЫМ статусом ошибки
           (404 сохраняется; режим Redirect сделал бы 302 — не годится). -->
      <error statusCode="404" path="/404.html" responseMode="ExecuteURL" />
    </httpErrors>
    <rewrite>
      <rules>
        <rule name="privacy" stopProcessing="true">
          <match url="^privacy$" />
          <action type="Redirect" url="/privacy.html" appendQueryString="false" redirectType="Permanent" />
        </rule>
        <rule name="consent" stopProcessing="true">
          <match url="^consent$" />
          <action type="Redirect" url="/consent.html" appendQueryString="false" redirectType="Permanent" />
        </rule>
        <rule name="cgi-old" stopProcessing="true">
          <match url="^cgi-bin/positiv_vt/index\.pl$" />
          <conditions>
            <add input="{QUERY_STRING}" pattern="(^|&amp;)text=page(&amp;|$)" />
            <add input="{QUERY_STRING}" pattern="(^|&amp;)i=4(&amp;|$)" />
          </conditions>
          <action type="Redirect" url="/#kontakty" appendQueryString="false" redirectType="Permanent" />
        </rule>
        <rule name="cgi-old fallback" stopProcessing="true">
          <match url="^cgi-bin/positiv_vt/index\.pl$" />
          <action type="Redirect" url="/" appendQueryString="false" redirectType="Permanent" />
        </rule>
      </rules>
    </rewrite>
  </system.webServer>
</configuration>
```

## Кэширование и сжатие

- Включите на веб-сервере сжатие текстовых файлов (gzip или brotli):
  html, css, js и svg сайта сжимаются в несколько раз.
- **HTML, `styles.css` и `script.js` — `Cache-Control: no-cache`**
  (хранить, но перепроверять: ETag/Last-Modified → ответ 304, повторные
  визиты почти бесплатны). Имена стабильные, без хэшей — обновление
  заменой файла; разметка, логика и стили — связная тройка, и недельное
  расхождение кэша после обновления означает у части посетителей старую
  заглушку формы (заявки в этом окне теряются) и сломанные интеракции.
  Альтернатива на будущее: версионировать имена (`styles.v2.css`) —
  тогда этой тройке можно вернуть длинный кэш.
- `img/` — неделя: `Cache-Control: public, max-age=604800`. Имена
  стабильные, без версионирования (`city-skyline.jpg`, `wordmark.svg`):
  годовой immutable при замене картинки месяц держал бы старый файл у
  посетителей. Риск устаревания лишь визуальный и окно ограничено —
  заменённая картинка подхватится максимум через неделю без какой-либо
  инфраструктуры версионирования.
- `fonts/` — год: `Cache-Control: public, max-age=31536000, immutable`.
  Имена файлов содержат хэш
  (`golos-text-cyrillic-wght-normal.3hv5e6a_c0lmc.woff2`), при обновлении
  шрифта имя меняется — кэш не мешает.

## Интеграция 1: отправка заявок

Формы две: инлайн-форма в секции «Заявка» (`#zayavka`) и модалка,
которую открывают кнопки по всему сайту. Обе после встроенной клиентской
валидации вызывают `window.submitLead(formData)` — зарезервированную
пустую функцию в `script.js` (строка 28, ищите по имени `submitLead`):

```js
function submitLead(formData) { /* Подключается при деплое: сюда приходит FormData формы. Верните true после успешной отправки. */ }
```

Контракт:

- функция вызывается с `FormData` **валидной** формы. Валидация уже
  встроена в страницу: имя короче 2 символов → «Укажите имя», телефон
  без 10–15 цифр → «Укажите корректный номер телефона», нет отметки
  согласия → «Подтвердите согласие на обработку персональных данных»;
- **`true` (синхронно) или Promise, разрешившийся `true` после успешного
  ответа сервера** → посетителю показывается экран успеха («Спасибо,
  заявка отправлена»);
- **любой другой исход** — `false`, `undefined`, Promise, разрешившийся
  не-`true`, отклонённый Promise (сетевая ошибка), исключение внутри
  функции → посетителю **само** появляется встроенное сообщение
  «Не удалось отправить заявку. Позвоните нам: +7 (495) 609-28-64»;
  исчезает при следующем сабмите или после успешной отправки;
- до разрешения Promise повторный сабмит игнорируется (без индикатора);
  поэтому не возвращайте `true` сразу после **запуска** `fetch` —
  «Спасибо» показывалось бы даже при сетевой ошибке.

Поля `FormData`:

| Поле | Где | Значение |
| --- | --- | --- |
| `name` | обе формы | имя |
| `phone` | обе формы | телефон как введён |
| `task` | обе формы | скрытое поле: Продать / Купить / Обменять / Новостройка / Ипотека / Сопровождение / Другое |
| `object` | только секционная форма | описание объекта, напр. «двухкомнатная квартира, Химки» (необязательно) |
| `comment` | обе формы | комментарий (необязательно); в модалке раскрывается только для задачи «Другое» |
| `consent` | обе формы | «on», если отмечено согласие |
| `company` | обе формы | **honeypot от ботов**: скрытое поле, у людей всегда пустое |

**Honeypot обязателен к обработке:** заявки с непустым `company`
обработчик должен **молча отбрасывать** — не отправлять и не отвечать
ошибкой (боту не сообщаем об отклонении); ту же проверку стоит повторить
и на сервере-приёмщике. Пример — заменить тело `submitLead` в `script.js`
и перезалить файл:

```js
function submitLead(formData) {
  // honeypot: бот заполнил скрытое поле — тихо имитируем успех
  if (String(formData.get("company") || "") !== "") return true;
  return fetch("/api/lead", { method: "POST", body: formData })
    .then(function (res) { return res.ok; });
}
```

## Интеграция 2: ключ Яндекс Карт

В `script.js` (строка 21) константа:

```js
var YANDEX_MAPS_API_KEY = "";
```

- **Пусто (сейчас)** → в подвале работает iframe-виджет Яндекс Карт
  (`yandex.ru/map-widget/…`) — бесплатное встраивание с рекламным
  баннером Яндекса.
- **Вписан ключ JS API** → при прокрутке к футеру (запас 600 px)
  подгружается JS API 3.0 (`https://api-maps.yandex.ru/v3/?apikey=…&lang=ru_RU`,
  таймаут 12 с), и iframe заменяется брендированной картой: палитра сайта,
  маркер с плашкой «Позитив ВТ» (ул. Палиха, 14/33, стр. 2, телефон,
  кнопка «Построить маршрут»), кнопка «Открыть Яндекс Карты», кнопки
  зума справа — на экранах от 640 px — всё это без рекламы.
- **Любой сбой** (не загрузился скрипт, таймаут, невалидный ключ) →
  автоматический откат на iframe-виджет; попытка — одна за загрузку
  страницы, сайт не ломается.

Ключ получают в кабинете разработчика Яндекса (developer.tech.yandex.ru,
сервис «JavaScript API и HTTP Геокодер»), при получении привязывают к
доменам `positiv-vt.ru` и `www.positiv-vt.ru`. Впишите ключ в константу
и перезалейте `script.js`:

```js
var YANDEX_MAPS_API_KEY = "ваш-ключ";
```

## Проверки после запуска

1. `https://positiv-vt.ru` открывает главную (200); `http://` и `www`
   перенаправляются на основной домен с HTTPS.
2. Случайный адрес (например, `/no-such-page`) отдаёт 404-страницу
   со статусом 404.
3. Редиректы: `curl -sI "https://positiv-vt.ru/cgi-bin/positiv_vt/index.pl?text=page&i=4"`
   → 301 на `/#kontakty`; `?text=cat…` → 301 на `/#nedvizhimost`;
   `/privacy` → 301 на `/privacy.html`.
4. **Форма**: отправьте заявку → экран «Спасибо, заявка отправлена»,
   заявка дошла до обработчика. Заявка с заполненным скрытым `company`
   (подставьте через devtools) → экран успеха, но заявка **не сохранена**
   (honeypot). Пока обработчик не подключён — сообщение с телефоном,
   без экрана успеха.
5. **Карта**: до вписывания ключа — iframe-виджет (с рекламой); после —
   брендированная карта без рекламы при скролле к контактам (проверяйте
   в режиме инкогнито, чтобы кэш не мешал).
6. `robots.txt` и `sitemap.xml` открываются и указывают на боевой домен.

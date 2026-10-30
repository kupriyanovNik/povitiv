# Новый сайт positiv-vt.ru: инструкция по размещению

Документ для администраторов хостинга (Ниагара Стар). Домен и сервер остаются
у вас; меняется только программа, которая отдаёт сайт.

## 1. Что это за сайт

Одностраничный сайт агентства недвижимости «Позитив ВТ» на Node.js
(фреймворк Next.js 16). Вместо старого сайта на Perl/CGI.

- Страницы: `/` (главная), `/privacy` (политика), `/consent` (согласие на
  обработку персональных данных), `/robots.txt`, `/sitemap.xml`.
- `POST /api/lead` — приём заявок с формы. Заявка сначала записывается в файл
  журнала на сервере (персональные данные остаются в РФ), затем копия уходит
  письмом на почту агентства positiv-vt@mail.ru.
- Базы данных нет. Рейтинг и отзывы лежат в `data/*.json` и читаются с диска.
- Внешние обращения со страницы: только Яндекс Карты в контактах (JS API с
  ключом или, без ключа, виджет Яндекса; виджет ставит cookie Яндекса).
  Шрифты, картинки и скрипты отдаёт сам сайт.
- Адреса старого сайта `/cgi-bin/positiv_vt/index.pl?...` новый сайт
  перенаправляет (301) на нужные разделы, чтобы не потерять позиции в поиске.

## 2. Что передаём и как собрать

Исходный код: репозиторий https://github.com/kupriyanovNik/povitiv, ветка
`main` (или архив этой ветки). Сайт нужно один раз собрать — на сервере или на
любом компьютере с той же ОС, что и сервер. Нужны Node.js 20.9+ и доступ к
registry.npmjs.org.

**Windows (PowerShell), в каталоге с исходниками:**

```powershell
$ErrorActionPreference = 'Stop'
# npm.cmd, а не npm: при политике выполнения Restricted npm.ps1 не запустится
npm.cmd ci
if ($LASTEXITCODE -ne 0) { throw 'npm ci failed' }
npm.cmd run build
if ($LASTEXITCODE -ne 0) { throw 'npm run build failed' }
# готовый сайт — в .next\standalone; копируем в него статику и данные
# (каждый раз после свежей сборки: build пересоздаёт .next\standalone)
Copy-Item -Recurse -LiteralPath '.next\static' -Destination '.next\standalone\.next\static'
Copy-Item -Recurse -LiteralPath 'public' -Destination '.next\standalone\public'
New-Item -ItemType Directory -Force -Path '.next\standalone\data' | Out-Null
Copy-Item -LiteralPath 'data\agency.json', 'data\reviews-external.json' -Destination '.next\standalone\data\'
Copy-Item -LiteralPath '.env.example' -Destination '.next\standalone\.env.example'
# В комплект не должны попасть ни локальные .env*, ни журнал заявок
# (data\leads, *.jsonl) с компьютера, где идёт сборка: удаляем и проверяем.
# Скрипт не переходит по символическим ссылкам и сохраняет только корневой шаблон.
node '.\deploy\artifact-env.cjs' clean '.next\standalone'
if ($LASTEXITCODE -ne 0) { throw 'Artifact cleanup/verification failed; do not transfer this build' }
```

Только после успешного завершения всех команд содержимое `.next\standalone`
переносится в каталог сайта (например
`C:\sites\positiv-vt`) — это и есть рабочий сайт.
Локальные `.env*` и журнал заявок передавать нельзя; настройки сервера
создаются отдельно по разделу 6.

**Linux / macOS:** `./deploy/build-artifact.sh` делает то же самое и
упаковывает результат в архив `positiv-vt-dist.tar.gz`.

Состав собранного сайта:

```
server.js            точка входа: node server.js
.next/               собранный сайт
node_modules/        только нужные для работы зависимости
public/              картинки, логотипы, og.png
data/                agency.json, reviews-external.json
.env.example         шаблон настроек
```

Исходники, `npm` и `node_modules` из каталога исходников для работы сайта
не нужны: служба запускает только `node server.js`.

## 3. Требования к серверу

| | |
|---|---|
| Node.js | **20.9 или новее**, рекомендуем 22 LTS (Windows или Linux, x64) |
| Процесс | постоянно работающий процесс Node.js (служба Windows или systemd) |
| Веб-сервер | обратный прокси перед Node: Apache 2.4.10+, nginx или IIS с ARR |
| HTTPS | обязателен: сертификат на `positiv-vt.ru` и `www.positiv-vt.ru` |
| Порт | Node слушает только `127.0.0.1:3000` (порт можно сменить) |
| Диск | ~300 МБ под сайт + каталог журнала заявок с правом записи |
| Память | ~200–300 МБ под процесс Node |

**Что мы увидели на текущем сервере** (30.10.2026, по ответу positiv-vt.ru):
`Apache/2.2.19 (Win32) mod_perl/2.0.4`, без HTTPS, IP 89.179.241.13.
Apache 2.2 (2011 год) не поддерживает современный TLS: браузеры не откроют
сайт по HTTPS. Для нового сайта нужен Apache 2.4.10+ (сборки Apache Lounge для
Windows) или другой прокси (nginx, IIS + ARR, Caddy). Если Apache 2.2 нельзя
обновить из-за других сайтов на сервере — поставьте перед ним Apache 2.4/nginx
либо выделите под сайт отдельный сервер или VPS.

HTTPS нужен не формально: без него браузеры помечают форму с телефоном как
небезопасную, а превью ссылки в мессенджерах (картинка `og.png`) не
показывается.

## 4. Установка на Windows Server

1. Установите Node.js 22 LTS (msi с nodejs.org, x64). Проверка: `node -v`.
2. Соберите сайт (раздел 2) и перенесите собранное в каталог сайта,
   например `C:\sites\positiv-vt`.
3. Создайте каталог журнала заявок вне каталога сайта, например
   `C:\sites\positiv-vt-data\leads`, и дайте учётной записи службы право
   записи.
4. Скопируйте `.env.example` в `.env` (в том же каталоге, что `server.js`) и заполните
   (раздел 6). Обязательно впишите `LEADS_DIR` — каталог из шага 3 (например
   `C:\sites\positiv-vt-data\leads`): без него журнал заявок пишется в `data/leads`
   внутри каталога сайта и затирается при обновлении (раздел 10). Сайт читает `.env`
   из своего каталога сам.
5. Пробный запуск в консоли:
   ```powershell
   cd C:\sites\positiv-vt
   $env:PORT="3000"; $env:HOSTNAME="127.0.0.1"; node server.js
   ```
   Откройте `http://127.0.0.1:3000` на сервере — должна открыться главная.
   `HOSTNAME` задавайте явно: иначе Node будет слушать все интерфейсы.
6. Служба Windows. Удобнее всего через NSSM (nssm.cc) или WinSW:
   ```powershell
   nssm install positiv-vt "C:\Program Files\nodejs\node.exe" server.js
   nssm set positiv-vt AppDirectory C:\sites\positiv-vt
   nssm set positiv-vt AppEnvironmentExtra NODE_ENV=production PORT=3000 HOSTNAME=127.0.0.1
   nssm set positiv-vt AppStdout C:\sites\positiv-vt-data\site.log
   nssm set positiv-vt AppStderr C:\sites\positiv-vt-data\site.log
   nssm set positiv-vt Start SERVICE_AUTO_START
   nssm start positiv-vt
   ```
   Рабочий каталог службы должен быть каталогом сайта: оттуда читаются
   `.env` и `data/`.
7. Apache 2.4.10+: виртуальный хост из [apache-proxy.conf](apache-proxy.conf)
   (включить `mod_proxy`, `mod_proxy_http`, `mod_headers`, `mod_rewrite`,
   `mod_ssl`). В этом хосте не должно остаться `ScriptAlias /cgi-bin/` и
   обработчиков Perl старого сайта.
   IIS вместо Apache: URL Rewrite + Application Request Routing, правило
   reverse proxy на `http://127.0.0.1:3000`, сервер-переменная
   `HTTP_X_REAL_IP` = `{REMOTE_ADDR}`.
8. Сертификат: win-acme (win-acme.com) для Let's Encrypt, с автопродлением.
   Пути к файлам сертификата пропишите в vhost.

## 5. Установка на Linux

Готовый комплект: [README-VPS.md](README-VPS.md) — systemd-юнит
[positiv-vt.service](positiv-vt.service), конфиг [nginx.conf](nginx.conf),
certbot: `certbot --nginx -d positiv-vt.ru -d www.positiv-vt.ru --redirect`
(флаг `--redirect` явно включает редирект HTTP→HTTPS).
Если на Linux-сервере уже работает Apache — используйте
[apache-proxy.conf](apache-proxy.conf), поправив пути к сертификату.

## 6. Настройки (`.env`)

| Переменная | Что это | Пример |
|---|---|---|
| `LEADS_DIR` | каталог журнала заявок, нужна запись | `C:\sites\positiv-vt-data\leads` или `/var/lib/positiv-vt/leads` |
| `YANDEX_MAPS_API_KEY` | ключ JS API Яндекс Карт (выдан агентству, ограничен доменом positiv-vt.ru) | передаётся отдельно |
| `SMTP_HOST`, `SMTP_PORT`, `SMTP_SECURE` | SMTP ящика агентства | `smtp.mail.ru`, `465`, `true` |
| `SMTP_USER`, `LEAD_EMAIL_FROM`, `LEAD_EMAIL_TO` | ящик агентства | `positiv-vt@mail.ru` |
| `SMTP_PASS` | **пароль для внешнего приложения** ящика positiv-vt@mail.ru (mail.ru → Настройки → Безопасность → Пароли для внешних приложений). Обычный пароль от ящика SMTP не примет | создаёт владелец ящика |
| `PORT`, `HOSTNAME` | адрес Node; задаются службой | `3000`, `127.0.0.1` |

После правки `.env` перезапустите службу.

## 7. Порядок переключения домена

1. Разверните сайт и проверьте его на сервере по `http://127.0.0.1:3000`.
2. Проверьте через прокси до переключения: временно пропишите
   `positiv-vt.ru` на IP сервера в `hosts` своего компьютера.
3. Выпустите сертификат, переключите виртуальный хост positiv-vt.ru на новый
   сайт. Старый сайт сохраните (архивом) на случай отката.
4. DNS менять не нужно, если сайт остаётся на том же IP.

## 8. Проверка после запуска

```bash
curl -sI https://positiv-vt.ru                    # 200
curl -sI https://www.positiv-vt.ru                # 301 на https://positiv-vt.ru/
curl -sI http://positiv-vt.ru                     # 301 на https://
curl -s  https://positiv-vt.ru/robots.txt         # правила + Sitemap
curl -sI https://positiv-vt.ru/og.png             # 200, image/png
curl -sI "https://positiv-vt.ru/cgi-bin/positiv_vt/index.pl?text=page&i=4"
                                                  # 301, Location: /#kontakty
```

Если `http://` не уводит на `https://` (сертификат на nginx выпустили без
`--redirect`), включите редирект: `certbot enhance --redirect --cert-name positiv-vt.ru`.

И в браузере:
- в контактах видна карта с плашкой агентства (если вместо неё обычный
  виджет Яндекса — ключ карты не задан или не подходит к домену);
- тестовая заявка с формы (с телефона через мобильный интернет, не с
  сервера): в `LEADS_DIR` появляется файл `leads-ГГГГ-ММ.jsonl` с этой
  заявкой, а на positiv-vt@mail.ru приходит письмо «Заявка с сайта: …».
  В журнале проверьте:
  - в строке заявки `"consent":{…,"ip":"…"}` — внешний IP телефона. Если там
    `"local"` или IP самого сервера, прокси не передаёт `X-Real-IP`
    (раздел 4, шаг 7): у всех посетителей окажется общий лимит заявок, а в
    журнале согласий — неверный адрес;
  - в строке `"type":"delivery"` — `"email":"ok"`. `skipped` значит, что в
    `.env` не заданы `SMTP_HOST`/`LEAD_EMAIL_TO`; `failed` — смотрите лог
    сайта: там код ошибки, `EAUTH`/`535` — неверный пароль приложения,
    `ETIMEDOUT`/`ECONNECTION` — SMTP недоступен с сервера.

  Тестовую заявку из журнала потом удалите.

## 9. Особенности

- **Почта.** Если письмо не ушло (SMTP недоступен, неверный пароль), заявка
  всё равно сохранена в журнале `LEADS_DIR`, а посетитель видит «заявка
  принята». Если письма перестали приходить, проверьте журнал и лог сайта.
- **Журнал недоступен** (нет прав на `LEADS_DIR`, кончился диск): заявка не
  принимается, посетитель видит ошибку с телефоном агентства. В логе сайта —
  «не удалось записать первичный журнал» с кодом ошибки (`EACCES`, `ENOSPC`).
- **Ключ Яндекс Карт** работает только на positiv-vt.ru и www.positiv-vt.ru.
  На других адресах (IP сервера, временный домен) вместо фирменной карты
  будет обычный виджет Яндекса — это нормально.

## 10. Обслуживание

- **Обновление сайта.** `.env` и журнала в собранном комплекте нет, поэтому
  новую версию копируют поверх каталога сайта, не удаляя его:
  - Windows (после сборки по разделу 2, в каталоге с исходниками):
    ```powershell
    nssm stop positiv-vt
    Copy-Item -Recurse -Force '.next\standalone\*' 'C:\sites\positiv-vt\'
    nssm start positiv-vt
    ```
  - Linux: шаги «Обновление версии» в [README-VPS.md](README-VPS.md).

  Каталог сайта целиком не удаляйте: в нём лежит `.env`.
- **Журнал заявок** (`LEADS_DIR`) содержит персональные данные: доступ
  только администраторам и агентству, резервная копия вместе с остальными
  данными сервера. При обновлении сайта не затрагивается только если задан
  `LEADS_DIR` вне каталога сайта: без него журнал лежит в `data/leads`
  внутри каталога сайта и заменяется новой сборкой.
- **Логи сайта:** вывод процесса Node (`site.log` при NSSM, `journalctl -u
  positiv-vt` на Linux).
- **Отзывы и рейтинг** меняются правкой `data/agency.json` и
  `data/reviews-external.json` — подхватываются без перезапуска.

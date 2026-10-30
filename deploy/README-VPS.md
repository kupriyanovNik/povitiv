# Деплой на Linux-сервер

Общая инструкция для хостинга, включая Windows и Apache:
[HANDOFF.md](HANDOFF.md). Здесь — вариант Linux + nginx + systemd.

Схема: архив собирается отдельно (`deploy/build-artifact.sh`), на сервер
попадает готовый бандл; на сервере нужны только node и nginx. Собирать лучше
на Linux x64 (Linux-машина, WSL или CI): тогда в архив попадает нативный
модуль оптимизации картинок под сервер. Архив, собранный на macOS, тоже
работает, но картинки оптимизируются медленнее. Собирать можно и на самом
сервере, если с него доступен registry.npmjs.org.

## Требования к серверу

- сервер у хостинга агентства (Ниагара Стар) или любой VPS у провайдера из
  реестра РКН; 1–2 vCPU / 1–2 ГБ RAM достаточно
- Ubuntu 22.04+ / Debian 12+
- Доступ root или sudo

## 1. Разовая настройка сервера

```bash
apt update && apt install -y nginx certbot python3-certbot-nginx curl
# Node из стандартных репозиториев Ubuntu/Debian слишком старый для Next 16
# (нужен 20.9+): ставим Node 22 LTS из NodeSource
curl -fsSL https://deb.nodesource.com/setup_22.x | bash -
apt install -y nodejs
node -v   # v22.x
mkdir -p /var/www/positiv-vt /var/lib/positiv-vt/leads
chown -R www-data:www-data /var/www/positiv-vt /var/lib/positiv-vt
```

## 2. Сборка и загрузка архива

```bash
./deploy/build-artifact.sh
scp positiv-vt-dist.tar.gz root@SERVER:/tmp/
```

## 3. Распаковка на сервере

```bash
ssh root@SERVER
tar -xzf /tmp/positiv-vt-dist.tar.gz -C /var/www/positiv-vt
# data/agency.json и data/reviews-external.json приезжают в артефакте:
# правятся руками в репозитории и обновляются каждым деплоем
# .env создаётся один раз, при первом деплое; существующий файл не
# перезаписываем — иначе cp затёр бы SMTP_PASS и YANDEX_MAPS_API_KEY
[ -f /var/www/positiv-vt/.env ] || cp /var/www/positiv-vt/.env.example /var/www/positiv-vt/.env
nano /var/www/positiv-vt/.env   # LEADS_DIR=/var/lib/positiv-vt/leads, YANDEX_MAPS_API_KEY
chown -R www-data:www-data /var/www/positiv-vt
```

## 4. systemd и nginx

```bash
cp /var/www/positiv-vt/deploy/positiv-vt.service /etc/systemd/system/
systemctl daemon-reload
systemctl enable --now positiv-vt.service

cp /var/www/positiv-vt/deploy/nginx.conf /etc/nginx/sites-available/positiv-vt
ln -s /etc/nginx/sites-available/positiv-vt /etc/nginx/sites-enabled/
nginx -t && systemctl reload nginx
# --redirect явно включает редирект HTTP->HTTPS
certbot --nginx -d positiv-vt.ru -d www.positiv-vt.ru --redirect
```

DNS: A-запись `positiv-vt.ru` и `www` на IP сервера (у текущего регистратора домена).

## 5. Проверка

```bash
systemctl status positiv-vt          # сайт работает
curl -s http://127.0.0.1:3000 | head # отвечает локально
tail -f /var/lib/positiv-vt/leads/leads-*.jsonl  # журнал заявок
```

## Обновление версии сайта

Повторить шаги 2-3 (build-artifact → scp → tar -xzf) и
`systemctl restart positiv-vt`. Журнал заявок живёт в `LEADS_DIR` вне
каталога сайта и при обновлении не затрагивается. Настройки `.env` тоже
сохраняются: архив содержит только шаблон `.env.example` и не содержит
журнала заявок (это проверяет `deploy/artifact-env.cjs`), а cp в шаге 3
защищён проверкой `[ -f .env ]` и существующий файл не перезаписывает.

## Как это работает

- **Сайт**: standalone-бандл Next.js, `node server.js` на 127.0.0.1:3000,
  nginx проксирует запросы и сам отдаёт `/_next/static/` с длинным кэшем;
  фото и остальное отдаёт Node.
- **Заявки**: пишутся в `LEADS_DIR` (journal JSONL, персональные данные
  остаются на сервере в РФ). Копия заявки уходит на почту
  агентства через SMTP (`SMTP_*` в `.env`).
- **TLS**: Let's Encrypt через certbot (авто-продление). План Б, если LE
  перестанет выдавать: HARICA (бесплатный ACME-совместимый CA).

## Чего НЕ делать

- Не проксировать сайт через Cloudflare (соединения из РФ режутся).
- Не запускать `npm install` / `npm run build` на сервере без необходимости.

# Деплой на VPS в России

Схема: артефакт собирается **вне РФ** (локально или в CI), на сервер попадает
готовый бандл. На сервере ничего не собирается — только node, nginx и chromium
для ночного синка. Это защищает от деградации GitHub/npm/Google Fonts из РФ.

## Требования к серверу

- VPS у провайдера из реестра РКН (Timeweb / Beget / Selectel / Reg.ru),
  2 vCPU / 2 ГБ RAM достаточно (~550-1000 ₽/мес)
- Ubuntu 22.04+ / Debian 12+
- Доступ root или sudo

## 1. Разовая настройка сервера

```bash
apt update && apt install -y nginx certbot python3-certbot-nginx chromium nodejs npm
node -v   # нужен Node 20+; если старее — поставить NodeSource 22.x
mkdir -p /var/www/positiv-vt /var/lib/positiv-vt/leads
chown -R www-data:www-data /var/www/positiv-vt /var/lib/positiv-vt
```

## 2. Сборка и загрузка артефакта (на вашей машине)

```bash
./deploy/build-artifact.sh
scp positiv-vt-dist.tar.gz root@SERVER:/tmp/
```

## 3. Распаковка на сервере

```bash
ssh root@SERVER
tar -xzf /tmp/positiv-vt-dist.tar.gz -C /var/www/positiv-vt
# данные: сид копируется только если файла ещё нет — данные ночного синка
# при обновлении версии сайта НЕ затираются; reviews-external.json
# курируется руками, поэтому обновляется всегда
cp /var/www/positiv-vt/data-seed/reviews-external.json /var/www/positiv-vt/data/
for f in listings.json agency.json; do
  [ -f /var/www/positiv-vt/data/$f ] || cp /var/www/positiv-vt/data-seed/$f /var/www/positiv-vt/data/
done
cp /var/www/positiv-vt/.env.example /var/www/positiv-vt/.env  # если ещё нет
nano /var/www/positiv-vt/.env   # SMTP_*, MAX_*, LEADS_DIR=/var/lib/positiv-vt/leads
chown -R www-data:www-data /var/www/positiv-vt
```

## 4. systemd и nginx

```bash
cp /var/www/positiv-vt/deploy/positiv-vt.service /etc/systemd/system/
cp /var/www/positiv-vt/deploy/positiv-vt-sync.service /etc/systemd/system/
cp /var/www/positiv-vt/deploy/positiv-vt-sync.timer /etc/systemd/system/
systemctl daemon-reload
systemctl enable --now positiv-vt.service positiv-vt-sync.timer

cp /var/www/positiv-vt/deploy/nginx.conf /etc/nginx/sites-available/positiv-vt
ln -s /etc/nginx/sites-available/positiv-vt /etc/nginx/sites-enabled/
nginx -t && systemctl reload nginx
certbot --nginx -d positiv-vt.ru -d www.positiv-vt.ru
```

DNS: A-запись `positiv-vt.ru` и `www` на IP сервера (у текущего регистратора домена).

## 5. Проверка

```bash
systemctl status positiv-vt          # сайт работает
curl -s http://127.0.0.1:3000 | head # отвечает локально
systemctl start positiv-vt-sync      # ручной прогон синка
tail -f /var/lib/positiv-vt/leads/leads-*.jsonl  # журнал заявок
```

## Обновление версии сайта

Повторить шаги 2-3 (build-artifact → scp → tar -xzf → сид данных) и
`systemctl restart positiv-vt`. Данные ночного синка (`data/listings.json`,
`data/agency.json`) при этом не затираются: артефакт возит их в `data-seed/`,
а копирование выше пропускает уже существующие файлы.

## Как это работает

- **Сайт**: standalone-бандл Next.js, `node server.js` на 127.0.0.1:3000,
  nginx проксирует и отдаёт статику/фото напрямую с длинным кэшем.
- **Ночной синк**: systemd-таймер в 00:00 МСК запускает
  `scripts/sync-listings.mjs` (Домклик — fetch, ЦИАН — chromium; путь до
  браузера задаётся `CHROME_BIN=/usr/bin/chromium` в юните синка,
  playwright-core приезжает в артефакте) и обновляет data/*.json и фото
  ПРЯМО НА ДИСКЕ. JSON пишется атомарно (tmp + rename), поэтому запрос
  никогда не увидит полузаписанный файл. Сайт читает данные в рантайме,
  изменения видны сразу: без пересборки, без рестарта, без git.
- **Заявки**: пишутся в `LEADS_DIR` (journal JSONL, персональные данные
  остаются на сервере в РФ), уведомления уходят по email (SMTP) и в MAX-бот.
- **TLS**: Let's Encrypt через certbot (авто-продление). План Б, если LE
  перестанет выдавать: HARICA (бесплатный ACME-совместимый CA).

## Чего НЕ делать

- Не проксировать сайт через Cloudflare (соединения из РФ режутся).
- Не запускать `npm install` / `npm run build` на сервере без необходимости.
- Не включать Telegram-канал на РФ-сервере (api.telegram.org блокируется
  ТСПУ) — он остаётся для зарубежных окружений.

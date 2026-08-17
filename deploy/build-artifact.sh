#!/usr/bin/env bash
# Сборка деплой-артефакта ВНЕ РФ (локально или в CI):
# на сервере ничего не собирается, только распаковывается и запускается.
set -euo pipefail
cd "$(dirname "$0")/.."

echo "==> npm ci"
npm ci

echo "==> next build (standalone)"
npm run build

echo "==> сборка dist/"
rm -rf dist
mkdir -p dist
cp -R .next/standalone/. dist/
mkdir -p dist/.next
cp -R .next/static dist/.next/static
cp -R public dist/public
# скрипт синка нужен на сервере для ночного обновления
mkdir -p dist/scripts dist/data
cp scripts/sync-listings.mjs dist/scripts/
# данные кладём в data-seed/, а НЕ в data/: на сервере data/ живёт своей
# жизнью (ночной синк), и распаковка нового артефакта не должна затирать
# свежие данные старым снапшотом. Исключение — reviews-external.json,
# он курируется руками и обновляется именно деплоем (см. README-VPS.md).
mkdir -p dist/data-seed
cp -R data/listings.json data/agency.json data/reviews-external.json dist/data-seed/ 2>/dev/null || true
cp package.json dist/package.json
# юниты, nginx-конфиг и шаблон .env нужны на сервере по README-VPS.md
cp -R deploy dist/deploy
cp .env.example dist/.env.example
# playwright-core не попадает в standalone-трейс (его импортирует только
# скрипт синка), кладём вручную — иначе ЦИАН на сервере молча пропускается
mkdir -p dist/node_modules
cp -R node_modules/playwright-core dist/node_modules/playwright-core

echo "==> архив"
tar -czf positiv-vt-dist.tar.gz -C dist .
echo "Готово: positiv-vt-dist.tar.gz ($(du -h positiv-vt-dist.tar.gz | cut -f1))"
echo "Дальше: scp positiv-vt-dist.tar.gz на сервер и см. deploy/README-VPS.md"

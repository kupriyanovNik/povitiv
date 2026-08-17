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
# скрипт синка и данные нужны на сервере для ночного обновления
mkdir -p dist/scripts dist/data
cp scripts/sync-listings.mjs dist/scripts/
cp -R data/listings.json data/agency.json data/reviews-external.json dist/data/ 2>/dev/null || true
cp package.json dist/package.json

echo "==> архив"
tar -czf positiv-vt-dist.tar.gz -C dist .
echo "Готово: positiv-vt-dist.tar.gz ($(du -h positiv-vt-dist.tar.gz | cut -f1))"
echo "Дальше: scp positiv-vt-dist.tar.gz на сервер и см. deploy/README-VPS.md"

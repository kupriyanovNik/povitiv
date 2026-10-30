#!/usr/bin/env bash
# Сборка деплой-артефакта ВНЕ РФ (локально или в CI):
# на сервере ничего не собирается, только распаковывается и запускается.
set -euo pipefail
cd "$(dirname "$0")/.."

# SKIP_NPM_CI=1 — собрать из уже установленных node_modules, без скачивания
if [ "${SKIP_NPM_CI:-}" != "1" ]; then
  echo "==> npm ci"
  npm ci
fi

echo "==> next build (standalone)"
npm run build

echo "==> сборка dist/"
rm -rf dist
mkdir -p dist
cp -R .next/standalone/. dist/
mkdir -p dist/.next
cp -R .next/static dist/.next/static
cp -R public dist/public
# данные агентства (рейтинг, отзывы) правятся руками и едут с каждым деплоем
mkdir -p dist/data
cp data/agency.json data/reviews-external.json dist/data/
cp package.json dist/package.json
# юниты, nginx-конфиг и шаблон .env нужны на сервере по README-VPS.md
cp -R deploy dist/deploy
cp .env.example dist/.env.example

# Next.js может скопировать .env и .env.production в standalone.
# Серверные настройки передаются отдельно; в артефакте оставляем только
# корневой шаблон. Удаляем также вложенные .env* и символические ссылки.
node deploy/artifact-env.cjs clean dist

echo "==> архив"
archive_tmp=''
trap 'if [ -n "$archive_tmp" ]; then rm -f -- "$archive_tmp"; fi' EXIT
archive_tmp=$(mktemp "./positiv-vt-dist.tar.gz.tmp.XXXXXX")
tar -czf "$archive_tmp" -C dist .
# Проверяем уже упакованные пути: приватные .env* не должны попасть
# хостингу или перезаписать .env при распаковке поверх рабочего сайта.
tar -tzf "$archive_tmp" | node deploy/artifact-env.cjs verify-manifest
mv -f -- "$archive_tmp" positiv-vt-dist.tar.gz
echo "Готово: positiv-vt-dist.tar.gz ($(du -h positiv-vt-dist.tar.gz | cut -f1))"
echo "Дальше: передать архив на сервер, см. deploy/HANDOFF.md"

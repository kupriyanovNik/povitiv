#!/usr/bin/env bash
# Утилита бота MAX на сервере с окружением сайта:
#   /var/www/positiv-vt/deploy/max-bot.sh check
# Команды: scripts/max-bot.mjs. NODE_EXTRA_CA_CERTS из файла, переданного
# через --env-file, Node не применяет, поэтому путь к сертификату берётся
# из .env и передаётся настоящей переменной окружения (как это делает systemd).
set -euo pipefail
cd "$(dirname "$0")/.."
ca=$(sed -n 's/^NODE_EXTRA_CA_CERTS=//p' .env | tail -n 1 | tr -d '"')
NODE_EXTRA_CA_CERTS="$ca" exec node --env-file=.env scripts/max-bot.mjs "$@"

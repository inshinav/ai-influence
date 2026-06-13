#!/usr/bin/env bash
# ─────────────────────────────────────────────────────────────────────────────
# Деплой статики «Я-Ферма» на nginx-докрут (Beget VPS, inshinlab.com).
# Собирает прод-бандл и кладёт его в подпапку докрута → сайт работает по адресу
# https://inshinlab.com/ai-influence/ без правок nginx (отдаётся существующим
# location / из server-блока inshinlab.com; HTTPS уже выдан certbot на домен).
#
# Запуск на сервере (из корня клонированного репозитория):
#   sudo bash deploy/deploy.sh
#
# Цель можно переопределить:  DEPLOY_TARGET=/var/www/html/ai-influence sudo -E bash deploy/deploy.sh
# ─────────────────────────────────────────────────────────────────────────────
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
TARGET="${DEPLOY_TARGET:-/var/www/html/ai-influence}"

cd "$ROOT"
echo "→ Репозиторий: $ROOT"
echo "→ Цель:        $TARGET"

echo "→ npm ci (включая devDeps для сборки)…"
npm ci

echo "→ npm run build…"
npm run build

echo "→ Чистим и копируем dist → $TARGET…"
mkdir -p "$TARGET"
find "$TARGET" -mindepth 1 -delete
cp -r dist/. "$TARGET"/

echo "✓ Готово: https://inshinlab.com/ai-influence/"

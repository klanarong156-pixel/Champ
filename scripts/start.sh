#!/usr/bin/env bash
set -euo pipefail

cd "$(dirname "$0")/.."

if [ ! -f .env ]; then
  printf '%s\n' 'ยังไม่มีไฟล์ .env กรุณารัน: pnpm smartfarm:setup'
  exit 1
fi

printf '%s\n' 'กำลัง build Smart Farm...'
pnpm build
printf '%s\n' 'กำลังเริ่มระบบที่ http://localhost:${PORT:-3000}'
set -a
. ./.env
set +a
NODE_ENV=production node dist/index.js

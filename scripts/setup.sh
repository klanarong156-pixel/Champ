#!/usr/bin/env bash
set -euo pipefail

cd "$(dirname "$0")/.."

printf '\nSmart Farm setup\n'
printf '%s\n' 'กำลังติดตั้ง dependencies...'
pnpm install

if [ ! -f .env ]; then
  cp config/.env.example .env
  printf '%s\n' 'สร้างไฟล์ .env แล้ว กรุณาเปิดไฟล์นี้และใส่ค่า MQTT ก่อนเริ่มระบบ'
else
  printf '%s\n' 'พบไฟล์ .env เดิม จึงไม่เขียนทับ'
fi

printf '\nเสร็จแล้ว ขั้นตอนถัดไป:\n'
printf '%s\n' '1) แก้ค่า MQTT ในไฟล์ .env'
printf '%s\n' '2) รัน: pnpm smartfarm:start'

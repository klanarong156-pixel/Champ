# Smart Farm ใช้งานแบบง่าย

เอกสารนี้ใช้สำหรับการเปิดระบบ Smart Farm จากเครื่องที่มี Node.js 22 ขึ้นไปและมีค่า MQTT Broker พร้อมแล้ว

## ขั้นตอนแรก: ดาวน์โหลดและติดตั้ง

เปิด Terminal แล้วรันเพียงชุดคำสั่งนี้:

```bash
git clone https://github.com/klanarong156-pixel/Farm.git
cd Farm
pnpm smartfarm:setup
```

คำสั่งดังกล่าวจะติดตั้งโปรแกรมที่จำเป็นและสร้างไฟล์ `.env` ให้โดยไม่เขียนทับไฟล์เดิม

## ขั้นตอนที่สอง: ใส่ค่า MQTT

เปิดไฟล์ `.env` แล้วกรอกเฉพาะ 5 ค่านี้:

| ค่า | ความหมาย |
|---|---|
| `MQTT_HOST` | ชื่อ Broker |
| `MQTT_PORT` | พอร์ต Broker โดยทั่วไปใช้ 8883 เมื่อเป็น TLS |
| `MQTT_USERNAME` | ชื่อผู้ใช้ MQTT ของ Backend |
| `MQTT_PASSWORD` | รหัสผ่าน MQTT ของ Backend |
| `MQTT_BASE` | prefix ของ topic เช่น `smartfarm` |

ไม่ต้องแก้ไฟล์ใน `client/` และไม่ต้องสร้างตัวแปร `VITE_MQTT_*` เพราะ Dashboard ไม่ได้เชื่อม MQTT โดยตรง

## ขั้นตอนที่สาม: เปิดระบบ

```bash
pnpm smartfarm:start
```

จากนั้นเปิด Browser ไปที่:

```text
http://localhost:3000
```

หากเห็น `DISCONNECTED` ให้ตรวจสอบค่า MQTT ใน `.env`, firewall และสิทธิ์ของ MQTT user. สถานะจะเปลี่ยนเป็น `CONNECTED` เมื่อ Backend เชื่อม Broker ได้จริง

## การควบคุม Relay

เลือก Relay ที่ต้องการแล้วกดปุ่ม ON หรือ OFF. ระบบจะแสดง `PENDING CONFIRMATION` ระหว่างรอ ESP8266 ตอบกลับ และจะแสดงสถานะ Hardware ที่ยืนยันแล้วเท่านั้น หาก ESP8266 ไม่ตอบกลับ สถานะ confirmed จะไม่ถูกเปลี่ยนตามการคาดเดา

## ถ้าต้องการหยุดระบบ

กด `Ctrl+C` ใน Terminal เดิม ระบบจะหยุด Backend อย่างปลอดภัย

## ถ้าต้องการทดสอบโค้ดโดยไม่ต่อ ESP8266

```bash
pnpm check
pnpm test
pnpm build
```

การทดสอบชุดนี้ตรวจสอบ source code เท่านั้น ไม่ได้จำลองว่า MQTT หรือ Hardware เชื่อมต่อสำเร็จ

## เปิดจาก GitHub Pages

เมื่อ push เข้า branch `main` GitHub Actions จะ build และ deploy Dashboard แบบ static ไปยัง GitHub Pages โดยใช้ URL:

```text
https://klanarong156-pixel.github.io/Farm/
```

หาก URL ยังเป็น 404 ให้เข้า Repository > **Settings > Pages** แล้วเลือก **Source: GitHub Actions** จากนั้นรอ workflow `Deploy Dashboard to GitHub Pages` ทำงานเสร็จและ refresh URL อีกครั้ง

GitHub Pages ใช้แสดงหน้า Dashboard เท่านั้นและไม่สามารถรัน Backend MQTT ได้ หากต้องการดูสถานะจริงและสั่ง Relay ต้องรัน Backend ด้วย `pnpm smartfarm:start` หรือกำหนด `VITE_API_BASE_URL` เป็น URL ของ Backend ที่ deploy แยกไว้ ระบบจะไม่ใส่ MQTT credential ลงใน GitHub Pages

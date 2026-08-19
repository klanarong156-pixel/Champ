# Todo: Fix Duplicate React Keys

- [x] à¸£à¸°à¸šà¸¸à¸—à¸¸à¸�à¸ˆà¸¸à¸”à¸—à¸µà¹ˆ render à¸£à¸²à¸¢à¸�à¸²à¸£ action à¸”à¹‰à¸§à¸¢ key à¸—à¸µà¹ˆà¹„à¸¡à¹ˆ unique
- [x] à¹€à¸›à¸¥à¸µà¹ˆà¸¢à¸™ key à¹€à¸›à¹‡à¸™ identifier à¸—à¸µà¹ˆà¸¡à¸µà¹€à¸­à¸�à¸¥à¸±à¸�à¸©à¸“à¹Œà¸•à¹ˆà¸­à¸£à¸²à¸¢à¸�à¸²à¸£ à¹‚à¸”à¸¢à¹„à¸¡à¹ˆà¹€à¸›à¸¥à¸µà¹ˆà¸¢à¸™à¸‚à¹‰à¸­à¸„à¸§à¸²à¸¡à¸—à¸µà¹ˆà¹�à¸ªà¸”à¸‡
- [x] à¸•à¸£à¸§à¸ˆà¹„à¸¡à¹ˆà¸¡à¸µ duplicate key à¹ƒà¸™à¸£à¸²à¸¢à¸�à¸²à¸£à¸ªà¸–à¸²à¸™à¸°à¹�à¸¥à¸° action à¸­à¸·à¹ˆà¸™
- [x] à¸£à¸±à¸™ typecheck/build à¹�à¸¥à¸°à¸•à¸£à¸§à¸ˆ browser console à¸«à¸¥à¸±à¸‡à¹�à¸�à¹‰
- [x] à¸ªà¸£à¹‰à¸²à¸‡ checkpoint à¸‰à¸šà¸±à¸šà¸ªà¹ˆà¸‡à¸¡à¸­à¸š

## Smart Farm Implementation

- [x] Backend-only MQTT service with TLS options, reconnect backoff, duplicate subscription/listener protection, and truthful connection status
- [x] Relay 4-channel desired/confirmed state reconciliation with pending timeout
- [x] DHT22 telemetry freshness timeout and SENSOR ERROR handling
- [x] RTC and heartbeat monitoring with Online / Offline and RTC ERROR states
- [x] HTTP API and SSE event stream for the Dashboard; no frontend MQTT credentials
- [x] SQLite persistence for telemetry, heartbeat, and relay events using Node 22 `node:sqlite`
- [x] Elegant responsive Dashboard with relay cards, pending confirmation, telemetry cards, and system status
- [x] ESP8266 firmware sample for DHT22, RTC, Relay x4, heartbeat, retained online status, and acknowledgments
- [x] Environment template and Git ignore rules for MQTT secrets and runtime database files
- [x] Architecture and setup documentation
- [x] Vitest coverage for desired/confirmed state and freshness/offline detection
- [x] TypeScript check, tests, production build, and server startup smoke test
- [ ] Validate with the user's real MQTT broker and physical ESP8266 hardware
- [ ] Replace firmware TLS `setInsecure()` placeholder with the broker CA certificate before production
- [ ] Configure deployment process and TLS certificate rotation policy

## Simple Usage Improvements

- [x] à¹€à¸žà¸´à¹ˆà¸¡à¸„à¸³à¸ªà¸±à¹ˆà¸‡ setup à¹�à¸šà¸šà¸‡à¹ˆà¸²à¸¢à¸ªà¸³à¸«à¸£à¸±à¸šà¸•à¸´à¸”à¸•à¸±à¹‰à¸‡ dependency à¹�à¸¥à¸°à¸ªà¸£à¹‰à¸²à¸‡ .env à¸ˆà¸²à¸� template
- [x] à¹€à¸žà¸´à¹ˆà¸¡à¸„à¸³à¸ªà¸±à¹ˆà¸‡ start à¹�à¸šà¸šà¸‡à¹ˆà¸²à¸¢à¸ªà¸³à¸«à¸£à¸±à¸š build à¹�à¸¥à¸°à¹€à¸£à¸´à¹ˆà¸¡ Backend/Dashboard
- [x] à¹€à¸žà¸´à¹ˆà¸¡à¹„à¸Ÿà¸¥à¹Œà¸•à¸±à¸§à¸­à¸¢à¹ˆà¸²à¸‡à¸•à¸±à¹‰à¸‡à¸„à¹ˆà¸² MQTT à¸—à¸µà¹ˆà¸­à¹ˆà¸²à¸™à¸‡à¹ˆà¸²à¸¢ à¸žà¸£à¹‰à¸­à¸¡à¸„à¸³à¸­à¸˜à¸´à¸šà¸²à¸¢à¸ à¸²à¸©à¸²à¹„à¸—à¸¢
- [x] à¹€à¸‚à¸µà¸¢à¸™à¸„à¸¹à¹ˆà¸¡à¸·à¸­ Quick Start à¸ à¸²à¸©à¸²à¹„à¸—à¸¢à¹�à¸šà¸šà¸—à¸³à¸•à¸²à¸¡à¸—à¸µà¸¥à¸°à¸‚à¸±à¹‰à¸™­à¸¢à¸—à¸µà¹ˆà¸ªà¸¸à¸”
- [x] à¹€à¸žà¸´à¹ˆà¸¡à¸�à¸²à¸£à¸•à¸£à¸§à¸ˆà¸ªà¸­à¸šà¸„à¹ˆà¸²à¸•à¸±à¹‰à¸‡à¸„à¹ˆà¸²à¸—à¸µà¹ˆà¸ˆà¸³à¹€à¸›à¹‡à¸™à¹�à¸¥à¸°à¸‚à¹‰à¸­à¸„à¸§à¸²à¸¡ error à¸—à¸µà¹ˆà¹€à¸‚à¹‰à¸²à¹ƒà¸ˆà¸‡à¹ˆà¸²à¸¢
- [x] à¸—à¸”à¸ªà¸­à¸š flow setup/start à¹�à¸¥à¸° push à¸�à¸²à¸£à¸›à¸£à¸±à¸šà¸›à¸£à¸¸à¸‡à¸‚à¸¶à¹‰à¸™ GitHub

## Simple Dashboard on GitHub

- [x] ปรับ Dashboard ให้เป็นหน้าเดียวแบบธรรมดา อ่านง่าย และไม่ใช้ visual decoration ที่ซับซ้อน
- [x] แสดง MQTT, ESP8266, heartbeat, DHT22, RTC และ Relay 1-4 ใน layout ที่เข้าใจได้ทันที
- [x] คง pending confirmation และ desired/confirmed state ของ Relay
- [x] ตรวจสอบ responsive layout, typecheck, tests และ build
- [x] Commit และ push Dashboard แบบธรรมดาขึ้น GitHub
- [x] ยึดข้อกำหนดจากไฟล์แนบเป็น source of truth และคงฟีเจอร์หลักทั้งหมดระหว่างปรับ Dashboard แบบธรรมดา

## Additional GitHub and Production Requirements

- [x] ตรวจให้โครงสร้าง `firmware/`, `dashboard/`, `backend/`, `config/` และ `docs/` สอดคล้องกับข้อกำหนดจากไฟล์แนบล่าสุด
- [x] ตรวจว่ามีเอกสาร `architecture.md`, `mqtt_flow.md`, `failure_modes.md` และ `hardware_mapping.md` หรือบันทึกเหตุผลหากยังไม่สร้าง
- [x] จัดทำ FILES CREATED, FILES MODIFIED และ FILES REMOVED report หลังการเปลี่ยนแปลงทุกครั้ง
- [x] ตรวจ Git state จริงก่อนรายงานว่า commit/push สำเร็จ
- [x] จัดทำ GitHub output report ที่ระบุ Repository URL, branch, latest commit hash และ changed files

## Mandatory MQTT Configuration Verification

- [x] ตรวจ MQTT host และ port หลักจากไฟล์แนบโดยไม่ hard-code password ลง repository
- [x] ยืนยัน TLS/SSL และ Backend-only secure configuration
- [x] ตรวจ MQTT_BASE และ topic compatibility กับ Firmware/Dashboard เดิม
- [x] ตรวจ Relay 1-4 command/status synchronization
- [x] ตรวจ DHT22, RTC, ESP heartbeat, reconnect และ offline detection
- [x] ตรวจ duplicate subscription/listener และไม่มี fake MQTT/sensor status
- [ ] ทดสอบ Broker จริงเมื่อมี runtime credentials ที่ปลอดภัย และรายงานผลตามจริง
- [ ] แจ้งให้หมุนเวียน MQTT password เนื่องจาก credential ถูกแนบมาในข้อความ/ไฟล์

## 404 Dashboard Fix

- [x] ตรวจสาเหตุที่เปิดหน้า Dashboard แล้วได้ 404
- [x] แก้ static serving หรือ route fallback ให้ `/` เปิด Dashboard ได้
- [x] ตรวจคำสั่ง build/start และ production output
- [x] ทดสอบ root URL และ push bug fix ขึ้น GitHub

## GitHub Pages Workflow Cancellation

- [ ] ตรวจ run ล่าสุดและสาเหตุที่ Pages workflow ถูกยกเลิกจาก concurrency
- [ ] ปรับ workflow ให้ run ล่าสุด deploy ได้อย่างเสถียรโดยไม่สร้างงานซ้อนที่ไม่จำเป็น
- [ ] ตรวจผล build/deploy ล่าสุดและยืนยัน URL Dashboard

# SmartFarm สวนลุงนะ — Design Direction

## Three Initial Directions

### Theme Name: Midnight SCADA
Very Brief Intro: แดชบอร์ด IoT โทน navy-black แบบศูนย์ควบคุม มี emerald/cyan เป็นสัญญาณสถานะและชั้นข้อมูลแบบ real-time
Probability: 0.07

### Theme Name: Field Journal
Very Brief Intro: อินเทอร์เฟซเหมือนสมุดบันทึกฟาร์มร่วมสมัย ใช้กระดาษอุ่น สีดิน และเส้นกราฟแบบเขียนมือเพื่อสื่อความเป็นช่างและความเป็นมนุษย์
Probability: 0.04

### Theme Name: Hydroglass
Very Brief Intro: แดชบอร์ดกระจกใสโทนฟ้า-เขียวที่เน้นการไหลของน้ำ แสง และสถานะอุปกรณ์ด้วยเลเยอร์โปร่งแสง
Probability: 0.09

## Chosen Direction: Midnight SCADA

### Design Movement
A refined industrial control-room aesthetic blended with Thai agricultural identity: dense but legible monitoring surfaces, luminous status signals, and a quiet night-field atmosphere.

### Core Principles
1. **Signal before decoration:** ON/OFF, MQTT, RTC, และ DHT22 ต้องอ่านได้ในเวลาไม่กี่วินาที
2. **Dark depth, not neon noise:** ใช้ navy layers, soft borders, restrained glow และ emerald status color แทนการใช้ gradient จัดจ้าน
3. **Asymmetric control layout:** persistent sidebar + command rail + feature-led main panel ลดความรู้สึกเป็น card grid ที่ซ้ำกัน
4. **Real device honesty:** state ที่ยังไม่ได้รับ MQTT confirmation แสดงเป็น pending/unknown เสมอ ห้าม optimistic ON/OFF

### Color Philosophy
พื้นหลังเกือบดำ navy สื่อถึงการตรวจฟาร์มในช่วงเช้ามืดและช่วยให้ข้อมูลสว่างขึ้นมาอย่างมีลำดับ สี emerald เป็นสีประจำระบบเมื่อ ESP ยืนยันการทำงาน สี cyan สื่อถึง telemetry และ MQTT ส่วน amber/red ใช้เฉพาะคำเตือนจริงและ action ที่เสี่ยง

Signature Brand Color: #86E26B — field signal green, ใช้กับสถานะที่ยืนยันจากอุปกรณ์และเครื่องหมายแบรนด์

### Layout Paradigm
ใช้โครงสร้างแบบ control room: sidebar แนวตั้งด้านซ้าย, header telemetry bar ด้านบน, feature panel ขนาดใหญ่ที่ให้ pump/selected device เป็น anchor, และ right rail สำหรับ RTC/MQTT/last action. บนมือถือเปลี่ยนเป็น bottom navigation และเรียง command surfaces แบบ single-column

### Signature Elements
- เส้น divider แบบ hairline พร้อมจุด signal สีเขียวที่กระพริบเฉพาะเมื่อ online
- status pill แบบ capsule ที่แยกชัดระหว่าง confirmed, pending, offline
- เส้นกราฟ telemetry ขนาดเล็กบนการ์ด โดยไม่มีข้อมูลปลอม: ถ้าไม่มี sample จริงจะแสดง “รอข้อมูลจาก ESP”

### Interaction Philosophy
ทุกคำสั่งเริ่มจาก intent ของผู้ใช้และจบเมื่อ MQTT status กลับมาเท่านั้น ปุ่ม toggle อยู่ในสถานะ pending ระหว่างรอ confirmation ชื่ออุปกรณ์แก้ไขได้ทันทีใน UI layer โดยไม่ publish ไป MQTT

### Animation
ใช้ transition 160–220ms สำหรับ hover, pressed, mode changes และ drawer. ใช้ pulse เบามากเฉพาะ online dot และ pending state. ไม่ใช้ animation เพื่อทำให้ค่าที่ไม่จริงดูมีชีวิต และเคารพ prefers-reduced-motion.

### Typography System
ใช้ **IBM Plex Sans Thai** เป็น body/UI font เพื่อความอ่านง่ายของตัวเลขและภาษาไทย และใช้ **Space Grotesk** เฉพาะตัวเลข telemetry/labels ภาษาอังกฤษเพื่อความรู้สึก instrumentation. H1 หนัก 700, section title 600, body 400/500, telemetry values 700 พร้อม tabular numerals.

### Brand Essence
ศูนย์ควบคุมฟาร์มจริงสำหรับเจ้าของสวนที่ต้องการเห็นสถานะอุปกรณ์และสั่งงานอย่างรับผิดชอบ — ต่างจาก dashboard ทั่วไปตรงที่ไม่แกล้งทำเป็น online และไม่คาดเดาสถานะ relay. บุคลิก: **นิ่ง, แม่นยำ, เป็นช่าง**

### Brand Voice
หัวข้อและ CTA สั้น ชัด เป็นภาษาไทยที่ใช้ได้หน้างาน ไม่ใช้คำโฆษณาเกินจริง.
- “สั่งงานเมื่อพร้อม ยืนยันเมื่อ ESP ตอบกลับ”
- “ตาราง RTC วันนี้ — ตรวจจากเวลาที่ node รายงาน”

### Wordmark & Logo
ใช้ emblem ใบไม้ 3 แฉกประกบเส้นน้ำ 2 เส้นและทรงหลังคาศาลาเป็นสัญลักษณ์หลัก วางคู่กับ wordmark ภาษาไทยแบบ geometric sans ที่มีการตัดปลายตัวอักษรเล็กน้อยให้รู้สึกเป็นระบบควบคุม ไม่ใช้ชื่อแบรนด์ใน default font โดยตรงเป็นโลโก้

## Implementation Guardrails

- ไม่มี mock device status: ค่าเริ่มต้นทุก device เป็น `unknown` จนกว่าจะได้รับ status จาก MQTT
- ไม่เปลี่ยน command/status/heartbeat topics ที่มีอยู่; ถ้ายังไม่มี topic mapping ใน repo จะเก็บเป็น config และทำเครื่องหมายให้เติมตาม firmware จริง
- ไม่ใช้ browser clock เป็น scheduling authority; UI clock เป็นเพียงเวลาที่แสดงและ scheduler จะทำงานเมื่อมี RTC timestamp จาก node/backend bridge
- ไม่สร้าง MQTT listener ซ้ำ; connection/listener อยู่ใน hook เดียวและ cleanup ครบ
- ชื่ออุปกรณ์เก็บเป็น UI preference แยกจาก payload ที่ส่งไป ESP
- ไฟล์นี้เป็น ground-truth ด้านภาพสำหรับทุก component ที่เพิ่มเข้ามา

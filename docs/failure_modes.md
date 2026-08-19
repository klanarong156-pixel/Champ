# Smart Farm Failure Modes

เอกสารนี้กำหนดพฤติกรรมที่ระบบต้องแสดงตามเหตุการณ์จริง โดยห้ามใช้ fake status หรือค่าที่ค้างโดยไม่ระบุ freshness

| เหตุการณ์ | Backend behavior | Dashboard behavior |
|---|---|---|
| MQTT connection lost | Mark MQTT disconnected and start bounded reconnect | Show `DISCONNECTED`; disable or reject relay commands until connected |
| ESP heartbeat timeout | Mark ESP offline and retain last heartbeat timestamp | Show `Offline` and heartbeat age |
| DHT22 no fresh reading | Mark telemetry stale | Show `–` and `DHT22 OFFLINE` |
| DHT22 invalid/error payload | Reject invalid value and mark sensor error | Show `SENSOR ERROR` |
| RTC unavailable | Preserve no trusted RTC timestamp | Show `RTC ERROR` |
| Relay command sent | Store desired state and pending command | Show `PENDING CONFIRMATION`; do not change confirmed state |
| Relay confirmation timeout | Expire pending command | Keep the last confirmed state and show timeout/error |
| MQTT reconnect | Recreate client subscription state once | Show `CONNECTED` only after Backend confirms connection |
| Unknown MQTT topic/payload | Ignore and log only safe metadata | Do not mutate UI state |

MQTT passwords, tokens and full connection URLs containing credentials must never appear in logs or error messages. Logs may include safe event names, relay IDs, topic categories and error codes.

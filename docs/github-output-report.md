# GitHub Output Report

## Repository

| Field | Value |
|---|---|
| Repository | https://github.com/klanarong156-pixel/Farm |
| Branch | `main` |
| Latest delivered commit | `c019353` |
| Commit message | `feat: align smart farm mqtt configuration` |
| Push verification | `origin/main` points to `c019353` |

## Files created

| File | Purpose |
|---|---|
| `dashboard/README.md` | Documents the existing React Dashboard source boundary under `client/` |
| `docs/mqtt_flow.md` | MQTT flow, topic contract, state confirmation and reconnect behavior |
| `docs/failure_modes.md` | Required UI and Backend behavior for MQTT, ESP, DHT22, RTC and Relay failures |
| `docs/hardware_mapping.md` | ESP8266 GPIO mapping and production hardware notes |
| `docs/github-output-report.md` | This delivery report |

## Files modified

| File | Change |
|---|---|
| `backend/src/config.ts` | Uses the required Broker host as the non-secret default and requires username/password from runtime environment variables |
| `config/.env.example` | Uses the required non-secret host, TLS port and topic base while keeping credential values as placeholders |
| `firmware/esp8266/smartfarm_esp8266.ino` | Uses the required non-secret Broker host and TLS port; credentials remain placeholders |
| `todo.md` | Records the latest configuration, documentation and verification requirements |

## Files removed

No files were removed.

## Verification

`pnpm check`, `pnpm test` and `pnpm build` passed. The secret scan found no real MQTT password in tracked source. The actual Broker, ESP8266, Relay, DHT22 and RTC verification remains pending until the device is provisioned and runtime credentials are supplied securely.

## Security note

The MQTT password from the supplied attachment is treated as compromised because it was shared in a file/message. Rotate it in the Broker console before production use. The password is intentionally not reproduced in this report, source code or Git history.

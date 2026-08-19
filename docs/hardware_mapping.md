# Smart Farm Hardware Mapping

| Component | Firmware mapping | Notes |
|---|---|---|
| DHT22 | D2 | Temperature and humidity input |
| Relay 1 | D5 | Default logical name `pump` |
| Relay 2 | D6 | Default logical name `zone1` |
| Relay 3 | D7 | Default logical name `lighthome` / compatible `zone2` |
| Relay 4 | D8 | Default logical name `lightsala` / compatible `light` |
| RTC DS3231 | Board I²C pins | Source of trusted device time |

The sample firmware assumes an active-low relay module. The output is driven HIGH during initialization to keep relays off and is driven LOW for the ON state. Verify the electrical behavior of the actual relay board before connecting a load.

The firmware contains placeholders for Wi-Fi and MQTT username/password. Replace them only in the local firmware build environment or a secure provisioning process; do not commit real credentials to GitHub.

Before production, replace the TLS `setInsecure()` placeholder with the HiveMQ Cloud broker CA certificate and validate the certificate chain on the ESP8266.

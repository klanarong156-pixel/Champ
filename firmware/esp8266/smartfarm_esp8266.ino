#include <ArduinoJson.h>
#include <DHT.h>
#include <ESP8266WiFi.h>
#include <PubSubClient.h>
#include <Wire.h>
#include <RTClib.h>

#define DHT_PIN D2
#define DHT_TYPE DHT22
const uint8_t RELAY_PINS[4] = {D5, D6, D7, D8};
const char* RELAY_NAMES[4] = {"pump", "zone1", "lighthome", "lightsala"};
const char* WIFI_SSID = "CHANGE_ME";
const char* WIFI_PASSWORD = "CHANGE_ME";
const char* MQTT_HOST = "650188a0ee2b4367b7c131fb385590a9.s1.eu.hivemq.cloud";
const uint16_t MQTT_PORT = 8883;
const char* MQTT_USERNAME = "CHANGE_ME";
const char* MQTT_PASSWORD = "CHANGE_ME";
const char* MQTT_BASE = "smartfarm";

DHT dht(DHT_PIN, DHT_TYPE);
RTC_DS3231 rtc;
WiFiClientSecure secureClient;
PubSubClient mqtt(secureClient);
unsigned long lastTelemetry = 0;
unsigned long lastHeartbeat = 0;
bool relayState[4] = {false, false, false, false};

String relayStatusTopic(uint8_t index) { return String(MQTT_BASE) + "/relay/" + RELAY_NAMES[index] + "/status"; }
String relayCommandTopic(uint8_t index) { return String(MQTT_BASE) + "/relay/" + RELAY_NAMES[index] + "/set"; }

void publishRelayStatus(uint8_t index) { mqtt.publish(relayStatusTopic(index).c_str(), relayState[index] ? "ON" : "OFF", true); }
void publishHeartbeat() {
  StaticJsonDocument<192> doc;
  doc["online"] = true;
  doc["time"] = rtc.now().timestamp(DateTime::TIMESTAMP_FULL);
  doc["rtc"] = true;
  char buffer[192];
  serializeJson(doc, buffer);
  mqtt.publish((String(MQTT_BASE) + "/status/heartbeat").c_str(), buffer, false);
  mqtt.publish((String(MQTT_BASE) + "/status/online").c_str(), "true", true);
}

void mqttCallback(char* topic, byte* payload, unsigned int length) {
  String message;
  for (unsigned int i = 0; i < length; i++) message += (char)payload[i];
  for (uint8_t i = 0; i < 4; i++) {
    if (String(topic) == relayCommandTopic(i)) {
      String normalized = message;
      normalized.trim();
      normalized.toUpperCase();
      if (normalized == "ON" || normalized == "OFF") {
        relayState[i] = normalized == "ON";
        digitalWrite(RELAY_PINS[i], relayState[i] ? LOW : HIGH); // active-low relay module
        publishRelayStatus(i); // confirmed only after hardware write
      }
    }
  }
}

void connectMqtt() {
  while (!mqtt.connected()) {
    String clientId = "smartfarm-esp8266-" + String(ESP.getChipId(), HEX);
    if (mqtt.connect(clientId.c_str(), MQTT_USERNAME, MQTT_PASSWORD, (String(MQTT_BASE) + "/status/online").c_str(), 1, true, "false")) {
      for (uint8_t i = 0; i < 4; i++) { mqtt.subscribe(relayCommandTopic(i).c_str(), 1); publishRelayStatus(i); }
      publishHeartbeat();
    } else delay(3000);
  }
}

void setup() {
  Serial.begin(115200);
  for (uint8_t i = 0; i < 4; i++) { pinMode(RELAY_PINS[i], OUTPUT); digitalWrite(RELAY_PINS[i], HIGH); }
  dht.begin();
  Wire.begin();
  rtc.begin();
  WiFi.begin(WIFI_SSID, WIFI_PASSWORD);
  while (WiFi.status() != WL_CONNECTED) delay(250);
  secureClient.setInsecure(); // Replace with broker CA certificate before production deployment.
  mqtt.setServer(MQTT_HOST, MQTT_PORT);
  mqtt.setCallback(mqttCallback);
}

void loop() {
  if (!mqtt.connected()) connectMqtt();
  mqtt.loop();
  const unsigned long now = millis();
  if (now - lastTelemetry >= 10000) {
    lastTelemetry = now;
    float temperature = dht.readTemperature();
    float humidity = dht.readHumidity();
    if (!isnan(temperature) && !isnan(humidity)) {
      StaticJsonDocument<128> doc;
      doc["temperature"] = temperature;
      doc["humidity"] = humidity;
      char buffer[128];
      serializeJson(doc, buffer);
      mqtt.publish((String(MQTT_BASE) + "/sensor/dht22").c_str(), buffer, false);
    }
    publishHeartbeat();
  }
}

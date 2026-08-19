import { EventEmitter } from "node:events";
import type { FarmSnapshot, RelayState, ServerEvent } from "./types";

const nowIso = () => new Date().toISOString();

export class FarmStateStore extends EventEmitter {
  private snapshot: FarmSnapshot;
  private readonly heartbeatTimeoutMs: number;
  private readonly sensorFreshnessMs: number;
  private readonly commandTimeoutMs: number;

  constructor(options: { heartbeatTimeoutMs: number; sensorFreshnessMs: number; commandTimeoutMs: number; brokerConfigured: boolean }) {
    super();
    this.heartbeatTimeoutMs = options.heartbeatTimeoutMs;
    this.sensorFreshnessMs = options.sensorFreshnessMs;
    this.commandTimeoutMs = options.commandTimeoutMs;
    this.snapshot = {
      mqtt: { status: "DISCONNECTED", lastMessageAt: null, brokerConfigured: options.brokerConfigured },
      esp8266: { status: "Unknown", lastHeartbeatAt: null, heartbeatAgeMs: null },
      dht22: { temperature: null, humidity: null, status: "DHT22 OFFLINE", capturedAt: null, ageMs: null },
      rtc: { iso: null, status: "UNKNOWN" },
      relays: [1, 2, 3, 4].map((id) => ({ id, name: `Relay ${id}`, desiredState: null, confirmedState: "UNKNOWN", pendingCommand: null, pendingSince: null, lastConfirmedAt: null })),
      updatedAt: nowIso(),
    };
  }

  getSnapshot(): FarmSnapshot {
    return structuredClone(this.snapshot);
  }

  setMqttStatus(status: "CONNECTED" | "DISCONNECTED") {
    this.snapshot.mqtt.status = status;
    this.commit();
  }

  noteMqttMessage() {
    this.snapshot.mqtt.lastMessageAt = nowIso();
    this.commit();
  }

  setRelayDesired(id: number, desiredState: "ON" | "OFF") {
    const relay = this.snapshot.relays.find((item) => item.id === id);
    if (!relay) throw new Error("Unknown relay");
    relay.desiredState = desiredState;
    relay.pendingCommand = desiredState;
    relay.pendingSince = nowIso();
    this.commit();
  }

  confirmRelay(id: number, confirmedState: Exclude<RelayState, "UNKNOWN">) {
    const relay = this.snapshot.relays.find((item) => item.id === id);
    if (!relay) return;
    relay.confirmedState = confirmedState;
    relay.pendingCommand = null;
    relay.pendingSince = null;
    relay.lastConfirmedAt = nowIso();
    this.commit();
  }

  updateHeartbeat(online = true, rtcIso?: string | null) {
    const time = nowIso();
    this.snapshot.esp8266.lastHeartbeatAt = time;
    this.snapshot.esp8266.heartbeatAgeMs = 0;
    this.snapshot.esp8266.status = online ? "Online" : "Offline";
    if (rtcIso) this.snapshot.rtc = { iso: rtcIso, status: "OK" };
    this.commit();
  }

  updateSensor(values: { temperature?: number; humidity?: number }) {
    const capturedAt = nowIso();
    if (typeof values.temperature === "number") this.snapshot.dht22.temperature = values.temperature;
    if (typeof values.humidity === "number") this.snapshot.dht22.humidity = values.humidity;
    this.snapshot.dht22.capturedAt = capturedAt;
    this.snapshot.dht22.ageMs = 0;
    this.snapshot.dht22.status = Number.isFinite(this.snapshot.dht22.temperature) && Number.isFinite(this.snapshot.dht22.humidity) ? "OK" : "SENSOR ERROR";
    this.commit();
  }

  updateRtc(iso: string | null) {
    this.snapshot.rtc = iso ? { iso, status: "OK" } : { iso: null, status: "RTC ERROR" };
    this.commit();
  }

  setRelayName(id: number, name: string) {
    const relay = this.snapshot.relays.find((item) => item.id === id);
    if (relay && name.trim()) relay.name = name.trim();
    this.commit();
  }

  refreshDerivedState() {
    const now = Date.now();
    const heartbeatAgeMs = this.snapshot.esp8266.lastHeartbeatAt ? now - Date.parse(this.snapshot.esp8266.lastHeartbeatAt) : null;
    const sensorAgeMs = this.snapshot.dht22.capturedAt ? now - Date.parse(this.snapshot.dht22.capturedAt) : null;
    this.snapshot.esp8266.heartbeatAgeMs = heartbeatAgeMs;
    this.snapshot.esp8266.status = heartbeatAgeMs !== null && heartbeatAgeMs <= this.heartbeatTimeoutMs ? "Online" : "Offline";
    this.snapshot.dht22.ageMs = sensorAgeMs;
    if (sensorAgeMs === null || sensorAgeMs > this.sensorFreshnessMs) this.snapshot.dht22.status = "DHT22 OFFLINE";
    for (const relay of this.snapshot.relays) {
      if (relay.pendingSince && now - Date.parse(relay.pendingSince) > this.commandTimeoutMs) {
        relay.pendingCommand = null;
        relay.pendingSince = null;
      }
    }
    this.commit();
  }

  private commit() {
    this.snapshot.updatedAt = nowIso();
    const event: ServerEvent = { type: "snapshot", snapshot: this.getSnapshot() };
    this.emit("update", event);
  }
}

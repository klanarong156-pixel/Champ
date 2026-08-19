import mqtt, { type IClientOptions, type MqttClient } from "mqtt";

export const MQTT_WS_URL = "wss://650188a0ee2b4367b7c131fb385590a9.s1.eu.hivemq.cloud:8884/mqtt";
export const RELAYS = ["pump", "zone1", "lighthome", "lightsala"] as const;
export type RelayId = typeof RELAYS[number];
export type MqttSnapshot = {
  connected: boolean;
  deviceOnline: boolean;
  lastSeen: number;
  mode: "MANUAL" | "AUTO";
  temperature: number | null;
  humidity: number | null;
  relays: Record<RelayId, "ON" | "OFF">;
  lastError: string;
};

const USER_KEY = "smartfarm.mqtt.username";
const PASS_KEY = "smartfarm.mqtt.password";
const REMEMBER_KEY = "smartfarm.mqtt.remember";
const emptyRelays = (): Record<RelayId, "ON" | "OFF"> => ({ pump: "OFF", zone1: "OFF", lighthome: "OFF", lightsala: "OFF" });

export function getStoredCredentials() {
  const remembered = localStorage.getItem(REMEMBER_KEY) === "true";
  const store = remembered ? localStorage : sessionStorage;
  return { username: store.getItem(USER_KEY) ?? "", password: store.getItem(PASS_KEY) ?? "", remembered };
}

export function saveCredentials(username: string, password: string, remember: boolean) {
  clearCredentials(false);
  const store = remember ? localStorage : sessionStorage;
  store.setItem(USER_KEY, username.trim());
  store.setItem(PASS_KEY, password);
  if (remember) localStorage.setItem(REMEMBER_KEY, "true");
}

export function clearCredentials(announce = true) {
  [localStorage, sessionStorage].forEach((store) => { store.removeItem(USER_KEY); store.removeItem(PASS_KEY); });
  localStorage.removeItem(REMEMBER_KEY);
  if (announce) window.dispatchEvent(new CustomEvent("smartfarm:credentials-cleared"));
}

export class BrowserMqttClient {
  private client: MqttClient | null = null;
  private timer: number | null = null;
  private listeners = new Set<(snapshot: MqttSnapshot) => void>();
  private snapshot: MqttSnapshot = { connected: false, deviceOnline: false, lastSeen: 0, mode: "MANUAL", temperature: null, humidity: null, relays: emptyRelays(), lastError: "" };

  subscribe(listener: (snapshot: MqttSnapshot) => void) { this.listeners.add(listener); listener(this.snapshot); return () => this.listeners.delete(listener); }
  private emit() { this.listeners.forEach((listener) => listener(this.snapshot)); }
  private update(patch: Partial<MqttSnapshot>) { this.snapshot = { ...this.snapshot, ...patch }; this.emit(); }

  connect() {
    const credentials = getStoredCredentials();
    if (!credentials.username || !credentials.password) { this.update({ lastError: "กรุณากรอก MQTT username และ password" }); return false; }
    this.disconnect(false);
    const options: IClientOptions = { clientId: `SmartFarmWeb-${crypto.getRandomValues(new Uint32Array(1))[0].toString(16)}`, username: credentials.username, password: credentials.password, clean: true, reconnectPeriod: 5000, connectTimeout: 30000, keepalive: 30 };
    try { this.client = mqtt.connect(MQTT_WS_URL, options); }
    catch (error) { this.update({ lastError: error instanceof Error ? error.message : "เชื่อมต่อ MQTT ไม่สำเร็จ" }); return false; }
    this.client.on("connect", () => { this.update({ connected: true, lastError: "" }); this.subscribeTopics(); });
    this.client.on("message", (topic, message) => this.handleMessage(topic, message.toString()));
    this.client.on("error", (error) => this.update({ lastError: error.message || "MQTT error" }));
    this.client.on("close", () => this.update({ connected: false }));
    return true;
  }

  private subscribeTopics() {
    const topics = ["smartfarm/relay/+/status", "smartfarm/relay/+/timer/status", "smartfarm/sensor/dht11", "smartfarm/status/online", "smartfarm/device/status", "smartfarm/mode/status", "smartfarm/schedule/+/status"];
    this.client?.subscribe(topics, { qos: 0 });
  }

  private handleMessage(topic: string, payload: string) {
    const value = payload.trim();
    if (topic.startsWith("smartfarm/relay/") && topic.endsWith("/status")) {
      const relay = topic.split("/")[2] as RelayId;
      if (RELAYS.includes(relay) && (value === "ON" || value === "OFF")) this.update({ relays: { ...this.snapshot.relays, [relay]: value }, deviceOnline: true, lastSeen: Date.now() });
    } else if (topic === "smartfarm/sensor/dht11") {
      try { const sensor = JSON.parse(value) as { temperature?: number; humidity?: number }; this.update({ temperature: Number.isFinite(sensor.temperature) ? sensor.temperature! : this.snapshot.temperature, humidity: Number.isFinite(sensor.humidity) ? sensor.humidity! : this.snapshot.humidity, deviceOnline: true, lastSeen: Date.now() }); } catch { /* ignore malformed packet */ }
    } else if (topic === "smartfarm/status/online") {
      this.update({ deviceOnline: ["true", "online", "1", "yes"].includes(value.toLowerCase()), lastSeen: Date.now() });
    } else if (topic === "smartfarm/device/status") {
      try { const device = JSON.parse(value) as { online?: boolean; mode?: string }; this.update({ deviceOnline: device.online !== false, mode: device.mode === "AUTO" ? "AUTO" : device.mode === "MANUAL" ? "MANUAL" : this.snapshot.mode, lastSeen: Date.now() }); } catch { this.update({ deviceOnline: true, lastSeen: Date.now() }); }
    } else if (topic === "smartfarm/mode/status" && (value === "AUTO" || value === "MANUAL")) this.update({ mode: value, deviceOnline: true, lastSeen: Date.now() });
  }

  publish(topic: string, payload: string) { if (!this.client?.connected) { this.update({ lastError: "MQTT ยังไม่เชื่อมต่อ" }); return false; } this.client.publish(topic, payload, { qos: 0, retain: false }); return true; }
  setRelay(relay: RelayId, state: "ON" | "OFF") { return this.publish(`smartfarm/relay/${relay}/set`, state); }
  setTimer(relay: RelayId, seconds: number) { return this.publish(`smartfarm/relay/${relay}/timer/set`, String(seconds)); }
  disconnect(emit = true) { if (this.timer) window.clearInterval(this.timer); this.timer = null; this.client?.end(true); this.client = null; if (emit) this.update({ connected: false }); }
  destroy() { this.disconnect(); this.listeners.clear(); }
}

import mqtt, { type MqttClient } from "mqtt";
import { config, mqttUrl } from "./config";
import { relayIdFromSegment, normalizeRelayState, topics } from "./mqtt-contract";
import { FarmStateStore } from "./state-store";

export class MqttService {
  private client: MqttClient | null = null;
  private reconnectTimer: NodeJS.Timeout | null = null;
  private started = false;
  private subscribed = false;
  private readonly topicSet: Set<string>;
  private readonly mqttTopics;

  constructor(private readonly store: FarmStateStore) {
    this.mqttTopics = topics(config.mqtt.base);
    this.topicSet = new Set([
      this.mqttTopics.relayStatus,
      this.mqttTopics.temperature,
      this.mqttTopics.humidity,
      this.mqttTopics.sensorJson,
      this.mqttTopics.legacySensorJson,
      this.mqttTopics.online,
      this.mqttTopics.heartbeat,
      this.mqttTopics.legacyHeartbeat,
      this.mqttTopics.rtcTime,
      this.mqttTopics.rtcDate,
    ]);
  }

  start() {
    if (this.started) return;
    this.started = true;
    this.connect(1000);
  }

  stop() {
    this.started = false;
    if (this.reconnectTimer) clearTimeout(this.reconnectTimer);
    this.reconnectTimer = null;
    this.client?.end(true);
    this.client = null;
    this.store.setMqttStatus("DISCONNECTED");
  }

  publishRelay(relayId: number, desired: "ON" | "OFF") {
    if (!this.client?.connected) throw new Error("MQTT is DISCONNECTED");
    if (relayId < 1 || relayId > 4) throw new Error("Invalid relay id");
    this.client.publish(this.mqttTopics.relaySet(relayId), desired, { qos: 1 }, (error) => {
      if (error) console.error(`[mqtt] publish failed for relay ${relayId}`);
    });
    this.store.setRelayDesired(relayId, desired);
  }

  private connect(delayMs: number) {
    if (!this.started) return;
    if (this.reconnectTimer) clearTimeout(this.reconnectTimer);
    this.reconnectTimer = setTimeout(() => {
      this.reconnectTimer = null;
      this.client?.end(true);
      this.subscribed = false;
      const client = mqtt.connect(mqttUrl(), {
        username: config.mqtt.username,
        password: config.mqtt.password,
        protocol: "mqtts",
        rejectUnauthorized: true,
        clean: true,
        keepalive: 30,
        reconnectPeriod: 0,
        connectTimeout: 15_000,
        clientId: `smartfarm-backend-${process.pid}`,
      });
      this.client = client;
      client.once("connect", () => {
        this.store.setMqttStatus("CONNECTED");
        this.subscribeOnce(client);
      });
      client.on("message", (topic, payload) => this.handleMessage(topic, payload.toString()));
      client.on("error", () => this.store.setMqttStatus("DISCONNECTED"));
      client.on("close", () => {
        this.store.setMqttStatus("DISCONNECTED");
        if (this.started) this.connect(Math.min(delayMs * 2, 60_000));
      });
    }, delayMs);
  }

  private subscribeOnce(client: MqttClient) {
    if (this.subscribed) return;
    this.subscribed = true;
    client.subscribe(Array.from(this.topicSet), { qos: 1 }, (error) => {
      if (error) {
        this.subscribed = false;
        console.error("[mqtt] subscription failed");
      }
    });
  }

  private handleMessage(topic: string, payload: string) {
    this.store.noteMqttMessage();
    const parts = topic.split("/");
    if (parts.length >= 4 && parts[1] === "relay" && parts[3] === "status") {
      const relayId = relayIdFromSegment(parts[2]);
      const state = normalizeRelayState(payload);
      if (relayId && state && state !== "UNKNOWN") this.store.confirmRelay(relayId, state);
      return;
    }
    if (topic === this.mqttTopics.temperature) {
      const value = Number(payload);
      if (Number.isFinite(value)) this.store.updateSensor({ temperature: value });
      return;
    }
    if (topic === this.mqttTopics.humidity) {
      const value = Number(payload);
      if (Number.isFinite(value)) this.store.updateSensor({ humidity: value });
      return;
    }
    if (topic === this.mqttTopics.sensorJson || topic === this.mqttTopics.legacySensorJson) {
      try {
        const value = JSON.parse(payload) as { temperature?: number; humidity?: number };
        this.store.updateSensor({ temperature: Number(value.temperature), humidity: Number(value.humidity) });
      } catch {
        this.store.updateSensor({});
      }
      return;
    }
    if (topic === this.mqttTopics.online) {
      this.store.updateHeartbeat(["true", "online", "1", "yes"].includes(payload.trim().toLowerCase()));
      return;
    }
    if (topic === this.mqttTopics.heartbeat || topic === this.mqttTopics.legacyHeartbeat) {
      try {
        const value = JSON.parse(payload) as { online?: boolean; time?: string; rtc?: string };
        this.store.updateHeartbeat(value.online !== false, value.time ?? value.rtc);
      } catch {
        this.store.updateHeartbeat(true);
      }
      return;
    }
    if (topic === this.mqttTopics.rtcTime) this.store.updateRtc(new Date(payload).toISOString());
  }
}

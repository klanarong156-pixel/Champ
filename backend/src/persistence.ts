import fs from "node:fs";
import path from "node:path";
import { DatabaseSync } from "node:sqlite";
import type { FarmSnapshot } from "./types";

export class FarmPersistence {
  private readonly db: DatabaseSync;

  constructor(filePath = process.env.SMARTFARM_DB_PATH ?? path.resolve("data", "smartfarm.sqlite")) {
    fs.mkdirSync(path.dirname(filePath), { recursive: true });
    this.db = new DatabaseSync(filePath);
    this.db.exec(`
      PRAGMA journal_mode = WAL;
      CREATE TABLE IF NOT EXISTS telemetry (id INTEGER PRIMARY KEY AUTOINCREMENT, captured_at TEXT NOT NULL, temperature REAL, humidity REAL, sensor_status TEXT NOT NULL);
      CREATE TABLE IF NOT EXISTS device_heartbeats (id INTEGER PRIMARY KEY AUTOINCREMENT, captured_at TEXT NOT NULL, online INTEGER NOT NULL, rtc_iso TEXT, heartbeat_age_ms INTEGER);
      CREATE TABLE IF NOT EXISTS relay_events (id INTEGER PRIMARY KEY AUTOINCREMENT, relay_id INTEGER NOT NULL, event_type TEXT NOT NULL, desired_state TEXT, confirmed_state TEXT, captured_at TEXT NOT NULL);
      CREATE INDEX IF NOT EXISTS idx_telemetry_captured_at ON telemetry(captured_at);
      CREATE INDEX IF NOT EXISTS idx_heartbeat_captured_at ON device_heartbeats(captured_at);
      CREATE INDEX IF NOT EXISTS idx_relay_events_captured_at ON relay_events(captured_at);
    `);
  }

  recordSnapshot(snapshot: FarmSnapshot) {
    const timestamp = snapshot.updatedAt;
    const telemetry = this.db.prepare("INSERT INTO telemetry (captured_at, temperature, humidity, sensor_status) VALUES (?, ?, ?, ?)");
    telemetry.run(timestamp, snapshot.dht22.temperature, snapshot.dht22.humidity, snapshot.dht22.status);
    const heartbeat = this.db.prepare("INSERT INTO device_heartbeats (captured_at, online, rtc_iso, heartbeat_age_ms) VALUES (?, ?, ?, ?)");
    heartbeat.run(timestamp, snapshot.esp8266.status === "Online" ? 1 : 0, snapshot.rtc.iso, snapshot.esp8266.heartbeatAgeMs);
    const relay = this.db.prepare("INSERT INTO relay_events (relay_id, event_type, desired_state, confirmed_state, captured_at) VALUES (?, ?, ?, ?, ?)");
    for (const item of snapshot.relays) {
      if (item.pendingCommand) relay.run(item.id, "desired", item.pendingCommand, item.confirmedState, timestamp);
      else if (item.lastConfirmedAt === timestamp) relay.run(item.id, "confirmed", item.desiredState, item.confirmedState, timestamp);
    }
  }

  close() { this.db.close(); }
}

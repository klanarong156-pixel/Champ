import type { RelayState } from "./types";

export const relayAliases: Record<number, string[]> = {
  1: ["1", "pump"],
  2: ["2", "zone1"],
  3: ["3", "lighthome", "zone2"],
  4: ["4", "lightsala", "light"],
};

export function topics(base: string) {
  return {
    relaySet: (relay: number) => `${base}/relay/${relay}/set`,
    relayStatus: `${base}/relay/+/status`,
    temperature: `${base}/sensor/temperature`,
    humidity: `${base}/sensor/humidity`,
    sensorJson: `${base}/sensor/dht22`,
    legacySensorJson: `${base}/sensor/dht11`,
    online: `${base}/status/online`,
    heartbeat: `${base}/status/heartbeat`,
    legacyHeartbeat: `${base}/device/status`,
    rtcTime: `${base}/rtc/time`,
    rtcDate: `${base}/rtc/date`,
  };
}

export function relayIdFromSegment(segment: string): number | null {
  const numeric = Number(segment);
  if (Number.isInteger(numeric) && numeric >= 1 && numeric <= 4) return numeric;
  const found = Object.entries(relayAliases).find(([, aliases]) => aliases.includes(segment));
  return found ? Number(found[0]) : null;
}

export function normalizeRelayState(payload: string): RelayState | null {
  const value = payload.trim().toUpperCase();
  return value === "ON" || value === "OFF" ? value : null;
}

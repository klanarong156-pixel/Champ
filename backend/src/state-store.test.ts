import { describe, expect, it, vi } from "vitest";
import { FarmStateStore } from "./state-store";

describe("FarmStateStore", () => {
  it("does not change confirmed state when only a desired command is recorded", () => {
    const store = new FarmStateStore({ heartbeatTimeoutMs: 90_000, sensorFreshnessMs: 120_000, commandTimeoutMs: 15_000, brokerConfigured: true });
    store.setRelayDesired(1, "ON");
    const relay = store.getSnapshot().relays[0];
    expect(relay?.desiredState).toBe("ON");
    expect(relay?.confirmedState).toBe("UNKNOWN");
    expect(relay?.pendingCommand).toBe("ON");
  });

  it("moves a relay to confirmed state only after device acknowledgment", () => {
    const store = new FarmStateStore({ heartbeatTimeoutMs: 90_000, sensorFreshnessMs: 120_000, commandTimeoutMs: 15_000, brokerConfigured: true });
    store.setRelayDesired(2, "OFF");
    store.confirmRelay(2, "OFF");
    const relay = store.getSnapshot().relays[1];
    expect(relay?.confirmedState).toBe("OFF");
    expect(relay?.pendingCommand).toBeNull();
    expect(relay?.lastConfirmedAt).toEqual(expect.any(String));
  });

  it("marks heartbeat and sensor freshness correctly", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-08-18T00:00:00.000Z"));
    const store = new FarmStateStore({ heartbeatTimeoutMs: 90_000, sensorFreshnessMs: 120_000, commandTimeoutMs: 15_000, brokerConfigured: true });
    store.updateHeartbeat(true, "2026-08-18T00:00:00.000Z");
    store.updateSensor({ temperature: 29.4, humidity: 71.2 });
    vi.setSystemTime(new Date("2026-08-18T00:03:00.000Z"));
    store.refreshDerivedState();
    const snapshot = store.getSnapshot();
    expect(snapshot.esp8266.status).toBe("Offline");
    expect(snapshot.dht22.status).toBe("DHT22 OFFLINE");
    vi.useRealTimers();
  });
});

export type RelayState = "ON" | "OFF" | "UNKNOWN";

export type DeviceStatus = "Online" | "Offline" | "Unknown";

export type RelaySnapshot = {
  id: number;
  name: string;
  desiredState: "ON" | "OFF" | null;
  confirmedState: RelayState;
  pendingCommand: "ON" | "OFF" | null;
  pendingSince: string | null;
  lastConfirmedAt: string | null;
};

export type FarmSnapshot = {
  mqtt: {
    status: "CONNECTED" | "DISCONNECTED";
    lastMessageAt: string | null;
    brokerConfigured: boolean;
  };
  esp8266: {
    status: DeviceStatus;
    lastHeartbeatAt: string | null;
    heartbeatAgeMs: number | null;
  };
  dht22: {
    temperature: number | null;
    humidity: number | null;
    status: "OK" | "DHT22 OFFLINE" | "SENSOR ERROR";
    capturedAt: string | null;
    ageMs: number | null;
  };
  rtc: {
    iso: string | null;
    status: "OK" | "RTC ERROR" | "UNKNOWN";
  };
  relays: RelaySnapshot[];
  updatedAt: string;
};

export type ServerEvent = {
  type: "snapshot" | "event";
  snapshot: FarmSnapshot;
  message?: string;
};

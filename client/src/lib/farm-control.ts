export type RelayState = "ON" | "OFF" | "UNKNOWN";
export type FarmDevice = {
  id: number;
  name: string;
  desiredState: "ON" | "OFF" | null;
  confirmedState: RelayState;
  pendingCommand: "ON" | "OFF" | null;
  pendingSince: string | null;
  lastConfirmedAt: string | null;
};

export type FarmControlState = {
  mqtt: { status: "CONNECTED" | "DISCONNECTED"; lastMessageAt: string | null; brokerConfigured: boolean };
  esp8266: { status: "Online" | "Offline" | "Unknown"; lastHeartbeatAt: string | null; heartbeatAgeMs: number | null };
  dht22: { temperature: number | null; humidity: number | null; status: "OK" | "DHT22 OFFLINE" | "SENSOR ERROR"; capturedAt: string | null; ageMs: number | null };
  rtc: { iso: string | null; status: "OK" | "RTC ERROR" | "UNKNOWN" };
  relays: FarmDevice[];
  updatedAt: string;
};

const API_BASE = (import.meta.env.VITE_API_BASE_URL ?? "").replace(/\/$/, "");

function apiUrl(path: string) {
  return `${API_BASE}${path}`;
}

export async function fetchFarmState(): Promise<FarmControlState> {
  const response = await fetch(apiUrl("/api/state"), { headers: { Accept: "application/json" } });
  if (!response.ok) throw new Error("Backend state unavailable");
  return response.json() as Promise<FarmControlState>;
}

export async function sendRelayCommand(id: number, desiredState: "ON" | "OFF") {
  const response = await fetch(apiUrl(`/api/relays/${id}/command`), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ desiredState }),
  });
  const body = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(body.error ?? "Command rejected");
  return body;
}

export async function renameRelay(id: number, name: string) {
  const response = await fetch(apiUrl(`/api/relays/${id}`), {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name }),
  });
  if (!response.ok) throw new Error("Unable to rename relay");
  return response.json() as Promise<FarmDevice>;
}

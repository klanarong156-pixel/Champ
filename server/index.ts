import express from "express";
import { createServer } from "node:http";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { config } from "../backend/src/config";
import { registerHttpApi } from "../backend/src/http-api";
import { MqttService } from "../backend/src/mqtt-service";
import { FarmPersistence } from "../backend/src/persistence";
import { FarmStateStore } from "../backend/src/state-store";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const server = createServer(app);
  const store = new FarmStateStore({
    heartbeatTimeoutMs: config.mqtt.heartbeatTimeoutMs,
    sensorFreshnessMs: config.mqtt.sensorFreshnessMs,
    commandTimeoutMs: config.mqtt.commandTimeoutMs,
    brokerConfigured: Boolean(process.env.MQTT_HOST && process.env.MQTT_USERNAME && process.env.MQTT_PASSWORD),
  });
  const mqttService = new MqttService(store);
  const persistence = new FarmPersistence();
  store.on("update", (event) => persistence.recordSnapshot(event.snapshot));

  app.use(express.json({ limit: "32kb" }));
  registerHttpApi(app, store, mqttService);

  const staticPath = process.env.NODE_ENV === "production" ? path.resolve(__dirname, "public") : path.resolve(__dirname, "..", "dist", "public");
  app.use(express.static(staticPath));
  app.get("*", (_req, res) => res.sendFile(path.join(staticPath, "index.html")));

  setInterval(() => store.refreshDerivedState(), 5_000).unref();
  mqttService.start();
  process.on("SIGTERM", () => { mqttService.stop(); persistence.close(); server.close(); });

  server.listen(config.port, () => {
    console.log(`[server] Smart Farm API listening on port ${config.port}`);
  });
}

startServer().catch((error) => {
  console.error("[server] startup failed", error instanceof Error ? error.message : "unknown error");
  process.exitCode = 1;
});

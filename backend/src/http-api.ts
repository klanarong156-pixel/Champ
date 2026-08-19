import type { Express, Request, Response } from "express";
import { z } from "zod";
import type { MqttService } from "./mqtt-service";
import { FarmStateStore } from "./state-store";

const relayCommand = z.object({ desiredState: z.enum(["ON", "OFF"]) });
const relayRename = z.object({ name: z.string().trim().min(1).max(80) });

export function registerHttpApi(app: Express, store: FarmStateStore, mqttService: MqttService) {
  app.get("/api/health", (_req, res) => res.json({ ok: true, mqtt: store.getSnapshot().mqtt.status }));
  app.get("/api/state", (_req, res) => res.json(store.getSnapshot()));

  app.get("/api/events", (req: Request, res: Response) => {
    res.status(200).set({ "Content-Type": "text/event-stream", "Cache-Control": "no-cache", Connection: "keep-alive", "X-Accel-Buffering": "no" });
    res.flushHeaders();
    const send = (event: { snapshot: unknown }) => res.write(`event: snapshot\ndata: ${JSON.stringify(event.snapshot)}\n\n`);
    send({ snapshot: store.getSnapshot() });
    store.on("update", send);
    const keepAlive = setInterval(() => res.write(": keep-alive\n\n"), 20_000);
    req.on("close", () => {
      clearInterval(keepAlive);
      store.off("update", send);
    });
  });

  app.post("/api/relays/:id/command", (req, res) => {
    const id = Number(req.params.id);
    const parsed = relayCommand.safeParse(req.body);
    if (!Number.isInteger(id) || id < 1 || id > 4 || !parsed.success) return res.status(400).json({ error: "Invalid relay command" });
    try {
      mqttService.publishRelay(id, parsed.data.desiredState);
      return res.status(202).json({ accepted: true, relayId: id, desiredState: parsed.data.desiredState });
    } catch (error) {
      return res.status(409).json({ error: error instanceof Error ? error.message : "Command rejected" });
    }
  });

  app.patch("/api/relays/:id", (req, res) => {
    const id = Number(req.params.id);
    const parsed = relayRename.safeParse(req.body);
    if (!Number.isInteger(id) || id < 1 || id > 4 || !parsed.success) return res.status(400).json({ error: "Invalid relay name" });
    store.setRelayName(id, parsed.data.name);
    return res.json(store.getSnapshot().relays.find((relay) => relay.id === id));
  });
}

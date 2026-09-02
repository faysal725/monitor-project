const crypto = require("crypto");
const { monitors } = require("../data/mockData");
const express = require("express");
const router = express.Router();
const { webhookEvents } = require("../data/mockData");

function verifySignature(rawBody, signatureHeader) {
  if (!signatureHeader) return false;
  const secret = process.env.WEBHOOK_SECRET;
  const expected = crypto.createHmac("sha256", secret).update(rawBody).digest("hex");
  return signatureHeader === expected;
}

function detectAnomalies(body) {
  const flags = [];
  if (!body || typeof body !== "object") return ["schema_drift"];
  if (!body.event && !body.type) flags.push("schema_drift");
  if (body.user_id === undefined && body.userId === undefined && !body.event?.includes?.("ping")) {
    // only flag if it looks like it should have one — keep it loose for demo purposes
  }
  return flags;
}

// GET /api/webhooks
router.get("/", (req, res) => {
  res.json(webhookEvents);
});

// POST /api/webhooks/:id/replay
router.post("/:id/replay", (req, res) => {
  const event = webhookEvents.find((e) => e.id === req.params.id);
  if (!event) return res.status(404).json({ error: "Webhook event not found" });

  // Stub: no real re-send yet, just simulate success
  res.json({ status: "replayed", eventId: event.id, replayedAt: new Date().toISOString() });
});


// POST /api/webhooks/incoming/:monitorId — real webhook receiver
router.post("/incoming/:monitorId", (req, res) => {
  const { monitorId } = req.params;
  const monitor = monitors.find((m) => m.id === monitorId);
  if (!monitor) return res.status(404).json({ error: "Unknown monitor" });

  const signatureHeader = req.headers["x-signature"];
  const signatureValid = verifySignature(req.rawBody, signatureHeader);
  const anomalyFlags = detectAnomalies(req.body);

  const newEvent = {
    id: `whk_${Date.now()}`,
    monitorSlug: monitorId,
    method: req.method,
    headers: req.headers,
    body: req.body,
    signatureValid,
    receivedAt: new Date().toISOString(),
    anomalyFlags,
  };

  webhookEvents.unshift(newEvent);
  if (webhookEvents.length > 50) webhookEvents.pop();

  const io = req.app.get("io");
  if (io) io.emit("new_webhook", newEvent);

  res.status(201).json({ status: "received", eventId: newEvent.id });
});

module.exports = router;
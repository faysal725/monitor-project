const express = require("express");
const router = express.Router();
const crypto = require("crypto");
const prisma = require("../lib/prisma");

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
  return flags;
}

router.get("/", async (req, res) => {
  const events = await prisma.webhookEvent.findMany({
    orderBy: { receivedAt: "desc" },
    take: 50,
  });
  res.json(events);
});

router.post("/incoming/:monitorId", async (req, res) => {
  const { monitorId } = req.params;
  const monitor = await prisma.monitor.findUnique({ where: { id: monitorId } });
  if (!monitor) return res.status(404).json({ error: "Unknown monitor" });

  const signatureHeader = req.headers["x-signature"];
  const signatureValid = verifySignature(req.rawBody, signatureHeader);
  const anomalyFlags = detectAnomalies(req.body);

  const newEvent = await prisma.webhookEvent.create({
    data: {
      monitorSlug: monitorId,
      method: req.method,
      headers: req.headers,
      body: req.body,
      signatureValid,
      anomalyFlags,
    },
  });

  const io = req.app.get("io");
  if (io) io.emit("new_webhook", newEvent);

  res.status(201).json({ status: "received", eventId: newEvent.id });
});

router.post("/:id/replay", async (req, res) => {
  const event = await prisma.webhookEvent.findUnique({ where: { id: req.params.id } });
  if (!event) return res.status(404).json({ error: "Webhook event not found" });
  res.json({ status: "replayed", eventId: event.id, replayedAt: new Date().toISOString() });
});

module.exports = router;
const express = require("express");
const router = express.Router();
const { webhookEvents } = require("../data/mockData");

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

module.exports = router;
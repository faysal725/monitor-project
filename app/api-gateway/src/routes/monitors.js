const express = require("express");
const router = express.Router();
const { monitors, genPingLogs } = require("../data/mockData");

// GET /api/monitors
router.get("/", (req, res) => {
  res.json(monitors);
});

// GET /api/monitors/:id
router.get("/:id", (req, res) => {
  const monitor = monitors.find((m) => m.id === req.params.id);
  if (!monitor) return res.status(404).json({ error: "Monitor not found" });
  res.json(monitor);
});

// POST /api/monitors
router.post("/", (req, res) => {
  const { url, method, intervalSeconds } = req.body;

  if (!url || !method || !intervalSeconds) {
    return res.status(400).json({ error: "url, method, and intervalSeconds are required" });
  }

  const newMonitor = {
    id: `mon_${Date.now()}`,
    url,
    method,
    intervalSeconds,
    status: "up",
    uptimePercent: 100,
    pingLogs: genPingLogs(20, 100, 0.05, 0),
  };

  monitors.push(newMonitor);
  res.status(201).json(newMonitor);
});

// PATCH /api/monitors/:id
router.patch("/:id", (req, res) => {
  const monitor = monitors.find((m) => m.id === req.params.id);
  if (!monitor) return res.status(404).json({ error: "Monitor not found" });

  Object.assign(monitor, req.body);
  res.json(monitor);
});

// DELETE /api/monitors/:id
router.delete("/:id", (req, res) => {
  const index = monitors.findIndex((m) => m.id === req.params.id);
  if (index === -1) return res.status(404).json({ error: "Monitor not found" });

  const [deleted] = monitors.splice(index, 1);
  res.json(deleted);
});

module.exports = router;
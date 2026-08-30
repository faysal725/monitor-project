const express = require("express");
const router = express.Router();
const { monitors, genPingLogs } = require("../data/mockData");
const { startMonitorPing, stopMonitorPing } = require("../services/pinger");

router.get("/", (req, res) => {
  res.json(monitors);
});

router.get("/:id", (req, res) => {
  const monitor = monitors.find((m) => m.id === req.params.id);
  if (!monitor) return res.status(404).json({ error: "Monitor not found" });
  res.json(monitor);
});

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
    pingLogs: [],
  };

  monitors.push(newMonitor);

  const io = req.app.get("io");
  startMonitorPing(newMonitor, io);

  res.status(201).json(newMonitor);
});

router.patch("/:id", (req, res) => {
  const monitor = monitors.find((m) => m.id === req.params.id);
  if (!monitor) return res.status(404).json({ error: "Monitor not found" });

  Object.assign(monitor, req.body);

  // If interval or URL changed, restart the ping loop with new settings
  const io = req.app.get("io");
  startMonitorPing(monitor, io);

  res.json(monitor);
});

router.delete("/:id", (req, res) => {
  const index = monitors.findIndex((m) => m.id === req.params.id);
  if (index === -1) return res.status(404).json({ error: "Monitor not found" });

  stopMonitorPing(req.params.id);
  const [deleted] = monitors.splice(index, 1);
  res.json(deleted);
});

module.exports = router;
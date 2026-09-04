const express = require("express");
const router = express.Router();
const prisma = require("../lib/prisma");
const { startMonitorPing, stopMonitorPing } = require("../services/pinger");

router.get("/", async (req, res) => {
  const monitors = await prisma.monitor.findMany({
    include: { pingLogs: { orderBy: { timestamp: "asc" }, take: 20 } },
  });
  res.json(monitors);
});

router.get("/:id", async (req, res) => {
  const monitor = await prisma.monitor.findUnique({
    where: { id: req.params.id },
    include: { pingLogs: { orderBy: { timestamp: "asc" }, take: 20 } },
  });
  if (!monitor) return res.status(404).json({ error: "Monitor not found" });
  res.json(monitor);
});

router.post("/", async (req, res) => {
  const { url, method, intervalSeconds } = req.body;
  if (!url || !method || !intervalSeconds) {
    return res.status(400).json({ error: "url, method, and intervalSeconds are required" });
  }

  const newMonitor = await prisma.monitor.create({
    data: { url, method, intervalSeconds, status: "up", uptimePercent: 100 },
    include: { pingLogs: true },
  });

  const io = req.app.get("io");
  startMonitorPing(newMonitor, io);

  res.status(201).json(newMonitor);
});

router.patch("/:id", async (req, res) => {
  const existing = await prisma.monitor.findUnique({ where: { id: req.params.id } });
  if (!existing) return res.status(404).json({ error: "Monitor not found" });

  const updated = await prisma.monitor.update({
    where: { id: req.params.id },
    data: req.body,
    include: { pingLogs: { orderBy: { timestamp: "asc" }, take: 20 } },
  });

  const io = req.app.get("io");
  startMonitorPing(updated, io);

  res.json(updated);
});

router.delete("/:id", async (req, res) => {
  const existing = await prisma.monitor.findUnique({ where: { id: req.params.id } });
  if (!existing) return res.status(404).json({ error: "Monitor not found" });

  stopMonitorPing(req.params.id);
  const deleted = await prisma.monitor.delete({ where: { id: req.params.id } });
  res.json(deleted);
});

module.exports = router;
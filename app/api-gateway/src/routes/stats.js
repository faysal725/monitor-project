const express = require("express");
const router = express.Router();
const { monitors, webhookEvents } = require("../data/mockData");

// GET /api/stats
router.get("/", (req, res) => {
  const total = monitors.length;

  const avgLatency = Math.round(
    monitors.reduce((sum, m) => {
      const last = m.pingLogs[m.pingLogs.length - 1];
      return sum + (last?.latencyMs || 0);
    }, 0) / total
  );

  const globalUptime = (
    monitors.reduce((sum, m) => sum + m.uptimePercent, 0) / total
  ).toFixed(1);

  res.json({
    totalMonitors: total,
    avgLatency,
    globalUptime: Number(globalUptime),
    totalWebhooksCaptured: webhookEvents.length,
  });
});

module.exports = router;
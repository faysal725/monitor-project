const express = require("express");
const router = express.Router();
const prisma = require("../lib/prisma");

router.get("/", async (req, res) => {
  const monitors = await prisma.monitor.findMany({
    include: { pingLogs: { orderBy: { timestamp: "desc" }, take: 1 } },
  });
  const totalWebhooks = await prisma.webhookEvent.count();

  const total = monitors.length;
  const avgLatency = Math.round(
    monitors.reduce((sum, m) => sum + (m.pingLogs[0]?.latencyMs || 0), 0) / (total || 1)
  );
  const globalUptime = (
    monitors.reduce((sum, m) => sum + m.uptimePercent, 0) / (total || 1)
  ).toFixed(1);

  res.json({
    totalMonitors: total,
    avgLatency,
    globalUptime: Number(globalUptime),
    totalWebhooksCaptured: totalWebhooks,
  });
});

module.exports = router;
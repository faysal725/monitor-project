const express = require("express");
const router = express.Router();
const prisma = require("../lib/prisma");

const AI_SERVICE_URL = process.env.AI_SERVICE_URL || "http://localhost:8000";

router.get("/:monitorId", async (req, res) => {
  const { monitorId } = req.params;
  console.log("Looking up monitorId:", JSON.stringify(monitorId));

  const allIds = await prisma.monitor.findMany({ select: { id: true } });
  console.log("All monitor IDs Prisma can see:", allIds);

  const monitor = await prisma.monitor.findUnique({
    where: { id: monitorId },
  });
  console.log("Bare findUnique result:", monitor);
  console.log("Monitor found:", monitor ? monitor.id : "NULL");

  const relatedEvent = await prisma.webhookEvent.findFirst({
    where: { monitorSlug: monitorId },
    orderBy: { receivedAt: "desc" },
  });

  const payload = {
    monitor: monitor
      ? {
        url: monitor.url,
        status: monitor.status,
        statusCode: monitor.pingLogs[0]?.statusCode ?? null,
        latencyMs: monitor.pingLogs[0]?.latencyMs ?? null,
      }
      : null,
    webhookEvent: relatedEvent
      ? {
        signatureValid: relatedEvent.signatureValid,
        anomalyFlags: relatedEvent.anomalyFlags,
        body: relatedEvent.body,
      }
      : null,
  };

  console.log("Payload sent to AI service:", JSON.stringify(payload, null, 2));

  try {
    const aiRes = await fetch(`${AI_SERVICE_URL}/analyze`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (!aiRes.ok) throw new Error("AI service returned an error");

    const analysis = await aiRes.json();
    return res.json(analysis);
  } catch (err) {
    console.error("AI service unreachable, falling back:", err.message);
    return res.json({
      summary: "This endpoint is showing elevated error rates or latency outside its normal baseline.",
      probableCause: "Likely a downstream dependency slowdown or intermittent network instability affecting response times.",
      steps: [
        "Check upstream/downstream service status pages for active incidents.",
        "Review recent deploys or config changes around the time issues began.",
        "Inspect connection pool and timeout settings for this endpoint.",
        "Add alerting thresholds to catch this earlier next time.",
      ],
      codeFix: null,
    });
  }
});

module.exports = router;
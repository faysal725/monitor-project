const express = require("express");
const router = express.Router();
const { webhookEvents, aiAnalyses } = require("../data/mockData");

// GET /api/diagnostics/:monitorId
router.get("/:monitorId", (req, res) => {
  const { monitorId } = req.params;

  const relatedEvent = webhookEvents.find(
    (e) => e.monitorSlug === monitorId && aiAnalyses.some((a) => a.relatedEventId === e.id)
  );
  const found = relatedEvent ? aiAnalyses.find((a) => a.relatedEventId === relatedEvent.id) : null;

  if (found) return res.json(found);

  // Fallback generic analysis
  res.json({
    id: `ai_generic_${monitorId}`,
    relatedEventId: null,
    summary: "This endpoint is showing elevated error rates or latency outside its normal baseline.",
    probableCause: "Likely a downstream dependency slowdown or intermittent network instability.",
    steps: [
      "Check upstream/downstream service status pages for active incidents.",
      "Review recent deploys or config changes.",
      "Inspect connection pool and timeout settings.",
      "Add alerting thresholds to catch this earlier.",
    ],
    codeFix: `const response = await fetchWithTimeout(url, { timeoutMs: 3000 }).catch(() => fallbackResponse());`,
  });
});

module.exports = router;
const express = require("express");
const router = express.Router();

const AI_SERVICE_URL = process.env.AI_SERVICE_URL || "http://localhost:8000";

router.get("/", async (req, res) => {
  res.set("Cache-Control", "no-store, no-cache, must-revalidate");

  let aiServiceStatus = "not-ready";

  try {
    const aiRes = await fetch(`${AI_SERVICE_URL}/health`, {
      signal: AbortSignal.timeout(8000),
    });
    aiServiceStatus = aiRes.ok ? "ready" : "not-ready";
  } catch (err) {
    aiServiceStatus = "not-ready";
  }

  res.json({
    gateway: "ready",
    aiService: aiServiceStatus,
  });
});

module.exports = router;
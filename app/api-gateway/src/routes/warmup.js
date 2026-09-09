const express = require("express");
const router = express.Router();

const AI_SERVICE_URL = process.env.AI_SERVICE_URL || "http://localhost:8000";

router.get("/", async (req, res) => {
  let aiServiceStatus = "unreachable";

  try {
    const aiRes = await fetch(`${AI_SERVICE_URL}/health`, {
      signal: AbortSignal.timeout(60000), // allow up to 60s for cold start
    });
    aiServiceStatus = aiRes.ok ? "ready" : "error";
  } catch (err) {
    aiServiceStatus = "unreachable";
  }

  res.json({
    gateway: "ready",
    aiService: aiServiceStatus,
  });
});

module.exports = router;
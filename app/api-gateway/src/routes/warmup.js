const express = require("express");
const router = express.Router();

const AI_SERVICE_URL = process.env.AI_SERVICE_URL || "http://localhost:8000";

async function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function pingWithRetries(url, maxAttempts = 4, delayMs = 5000) {
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      const res = await fetch(url, { signal: AbortSignal.timeout(20000) });
      if (res.ok) return "ready";
    } catch (err) {
      // fall through to retry
    }
    if (attempt < maxAttempts) await sleep(delayMs);
  }
  return "unreachable";
}

router.get("/", async (req, res) => {
  const aiServiceStatus = await pingWithRetries(`${AI_SERVICE_URL}/health`);

  res.json({
    gateway: "ready",
    aiService: aiServiceStatus,
  });
});

module.exports = router;
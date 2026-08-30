// In-memory data store — mutated directly by routes. Resets on server restart.

let monitors = [
  {
    id: "mon_1",
    url: "https://jsonplaceholder.typicode.com/posts/1",
    method: "GET",
    intervalSeconds: 30,
    status: "up",
    uptimePercent: 99.9,
    pingLogs: []
  },
  {
    id: "mon_2",
    url: "https://jsonplaceholder.typicode.com/posts/2",
    method: "POST",
    intervalSeconds: 60,
    status: "degraded",
    uptimePercent: 97.2,
    pingLogs: []
  },
  {
    id: "mon_3",
    url: "https://jsonplaceholder.typicode.com/posts/3",
    method: "POST",
    intervalSeconds: 30,
    status: "down",
    uptimePercent: 82.5,
    pingLogs: []
  },
  {
    id: "mon_4",
    url: "https://jsonplaceholder.typicode.com/posts/4",
    method: "POST",
    intervalSeconds: 300,
    status: "up",
    uptimePercent: 99.98,
    pingLogs: []
  },
  {
    id: "mon_5",
    url: "https://jsonplaceholder.typicode.com/posts/5",
    method: "GET",
    intervalSeconds: 60,
    status: "up",
    uptimePercent: 99.5,
    pingLogs: []
  },
  {
    id: "mon_6",
    url: "https://jsonplaceholder.typicode.com/posts/6",
    method: "POST",
    intervalSeconds: 30,
    status: "degraded",
    uptimePercent: 94.1,
    pingLogs: []
  },
];

function genPingLogs(count, baseLatency, spikeChance, downChance) {
  const logs = [];
  const now = Date.now();
  for (let i = count - 1; i >= 0; i--) {
    const isDown = Math.random() < downChance;
    const isSpike = !isDown && Math.random() < spikeChance;
    logs.push({
      timestamp: new Date(now - i * 60000).toISOString(),
      latencyMs: isDown ? 0 : Math.round(baseLatency + (isSpike ? baseLatency * 3 : Math.random() * 40)),
      statusCode: isDown ? 500 : 200,
    });
  }
  return logs;
}

let webhookEvents = [
  {
    id: "whk_1",
    monitorSlug: "mon_3",
    method: "POST",
    headers: { "Content-Type": "application/json", "X-Signature": "sha256=abc123", "User-Agent": "Stripe/1.0" },
    body: { type: "payment_intent.succeeded", amount: 4999, currency: "usd" },
    signatureValid: true,
    receivedAt: new Date(Date.now() - 1 * 60000).toISOString(),
    anomalyFlags: [],
  },
  {
    id: "whk_2",
    monitorSlug: "mon_2",
    method: "POST",
    headers: { "Content-Type": "application/json", "X-Signature": "sha256=def456", "User-Agent": "GitHub-Hookshot/abc" },
    body: { action: "opened", pull_request: { id: 101, title: "Fix bug" } },
    signatureValid: true,
    receivedAt: new Date(Date.now() - 3 * 60000).toISOString(),
    anomalyFlags: [],
  },
  {
    id: "whk_3",
    monitorSlug: "mon_3",
    method: "POST",
    headers: { "Content-Type": "application/json", "X-Signature": "sha256=bad999", "User-Agent": "Generic/1.0" },
    body: { event: "user.created" },
    signatureValid: false,
    receivedAt: new Date(Date.now() - 5 * 60000).toISOString(),
    anomalyFlags: ["missing_param: user_id"],
  },
  {
    id: "whk_4",
    monitorSlug: "mon_6",
    method: "POST",
    headers: { "Content-Type": "application/json", "X-Signature": "sha256=ghi789", "User-Agent": "Stripe/1.0" },
    body: { type: "invoice.paid", amount: 1200 },
    signatureValid: true,
    receivedAt: new Date(Date.now() - 8 * 60000).toISOString(),
    anomalyFlags: [],
  },
];

let aiAnalyses = [
  {
    id: "ai_1",
    relatedEventId: "whk_3",
    summary: "The endpoint is rejecting webhook events due to an invalid signature and a missing required field.",
    probableCause: "Signature verification failure combined with an incomplete payload from the sender — likely a misconfigured webhook secret or a client sending an outdated payload schema.",
    steps: [
      "Verify the webhook secret configured on the sender side matches the one stored in your environment.",
      "Check recent sender-side changes to the payload schema.",
      "Add validation middleware to reject and log malformed payloads before processing.",
      "Contact the webhook provider to confirm they're sending the user_id field.",
    ],
    codeFix: `if (!payload.user_id) {\n  return res.status(400).json({ error: "missing_param: user_id" });\n}`,
  },
  {
    id: "ai_2",
    relatedEventId: "whk_4",
    summary: "Notification delivery is timing out intermittently, causing degraded status on this monitor.",
    probableCause: "Downstream notification service is experiencing elevated latency, possibly due to rate limiting.",
    steps: [
      "Check the notification provider's status page for ongoing incidents.",
      "Review your rate limit configuration.",
      "Implement exponential backoff and retry logic.",
      "Add a circuit breaker for provider outages.",
    ],
    codeFix: `async function sendWithRetry(fn, retries = 3) {\n  for (let i = 0; i < retries; i++) {\n    try { return await fn(); }\n    catch (e) { if (i === retries - 1) throw e; }\n  }\n}`,
  },
];

module.exports = { monitors, webhookEvents, aiAnalyses, genPingLogs };
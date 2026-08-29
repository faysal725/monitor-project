// Shapes (JSDoc only, no TS enforcement):
// Monitor: { id, url, method, intervalSeconds, status, uptimePercent, pingLogs[] }
// pingLogs[]: { timestamp, latencyMs, statusCode }
// WebhookEvent: { id, monitorSlug, method, headers, body, signatureValid, receivedAt, anomalyFlags[] }
// AIAnalysis: { id, relatedEventId, summary, probableCause, steps[] }

// Deterministic PRNG (mulberry32) so SSR and client produce identical mock data
function mulberry32(seed) {
  return function () {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// Fixed base time so both server + client render the same "now" — avoids hydration mismatch
const BASE_TIME = new Date("2026-08-29T10:00:00Z").getTime();

function genPingLogs(count, baseLatency, spikeChance, downChance, seed) {
  const rand = mulberry32(seed);
  const logs = [];
  for (let i = count - 1; i >= 0; i--) {
    const isDown = rand() < downChance;
    const isSpike = !isDown && rand() < spikeChance;
    logs.push({
      timestamp: new Date(BASE_TIME - i * 60000).toISOString(),
      latencyMs: isDown ? 0 : Math.round(baseLatency + (isSpike ? baseLatency * 3 : rand() * 40)),
      statusCode: isDown ? 500 : 200,
    });
  }
  return logs;
}

export const monitors = [
  {
    id: "mon_1",
    url: "https://api.example.com/v1/users",
    method: "GET",
    intervalSeconds: 30,
    status: "up",
    uptimePercent: 99.9,
    pingLogs: genPingLogs(20, 80, 0.05, 0, 1),
  },
  {
    id: "mon_2",
    url: "https://api.example.com/v1/payments",
    method: "POST",
    intervalSeconds: 60,
    status: "degraded",
    uptimePercent: 97.2,
    pingLogs: genPingLogs(20, 250, 0.3, 0.05, 2),
  },
  {
    id: "mon_3",
    url: "https://api.example.com/v1/webhooks/incoming",
    method: "POST",
    intervalSeconds: 30,
    status: "down",
    uptimePercent: 82.5,
    pingLogs: genPingLogs(20, 100, 0.1, 0.4, 3),
  },
  {
    id: "mon_4",
    url: "https://api.example.com/v1/auth/token",
    method: "POST",
    intervalSeconds: 300,
    status: "up",
    uptimePercent: 99.98,
    pingLogs: genPingLogs(20, 60, 0.02, 0, 4),
  },
  {
    id: "mon_5",
    url: "https://api.example.com/v1/inventory",
    method: "GET",
    intervalSeconds: 60,
    status: "up",
    uptimePercent: 99.5,
    pingLogs: genPingLogs(20, 120, 0.08, 0, 5),
  },
  {
    id: "mon_6",
    url: "https://api.example.com/v1/notifications/send",
    method: "POST",
    intervalSeconds: 30,
    status: "degraded",
    uptimePercent: 94.1,
    pingLogs: genPingLogs(20, 180, 0.35, 0.1, 6),
  },
];

export const webhookEvents = [
  {
    id: "whk_1",
    monitorSlug: "mon_3",
    method: "POST",
    headers: { "Content-Type": "application/json", "X-Signature": "sha256=abc123", "User-Agent": "Stripe/1.0" },
    body: { type: "payment_intent.succeeded", amount: 4999, currency: "usd" },
    signatureValid: true,
    receivedAt: new Date(BASE_TIME - 1 * 60000).toISOString(),
    anomalyFlags: [],
  },
  {
    id: "whk_2",
    monitorSlug: "mon_2",
    method: "POST",
    headers: { "Content-Type": "application/json", "X-Signature": "sha256=def456", "User-Agent": "GitHub-Hookshot/abc" },
    body: { action: "opened", pull_request: { id: 101, title: "Fix bug" } },
    signatureValid: true,
    receivedAt: new Date(BASE_TIME - 3 * 60000).toISOString(),
    anomalyFlags: [],
  },
  {
    id: "whk_3",
    monitorSlug: "mon_3",
    method: "POST",
    headers: { "Content-Type": "application/json", "X-Signature": "sha256=bad999", "User-Agent": "Generic/1.0" },
    body: { event: "user.created" },
    signatureValid: false,
    receivedAt: new Date(BASE_TIME - 5 * 60000).toISOString(),
    anomalyFlags: ["missing_param: user_id"],
  },
  {
    id: "whk_4",
    monitorSlug: "mon_6",
    method: "POST",
    headers: { "Content-Type": "application/json", "X-Signature": "sha256=ghi789", "User-Agent": "Stripe/1.0" },
    body: { type: "invoice.paid", amount: 1200 },
    signatureValid: true,
    receivedAt: new Date(BASE_TIME - 8 * 60000).toISOString(),
    anomalyFlags: [],
  },
  {
    id: "whk_5",
    monitorSlug: "mon_1",
    method: "GET",
    headers: { "Content-Type": "application/json", "User-Agent": "InternalBot/2.0" },
    body: { ping: true },
    signatureValid: true,
    receivedAt: new Date(BASE_TIME - 10 * 60000).toISOString(),
    anomalyFlags: [],
  },
  {
    id: "whk_6",
    monitorSlug: "mon_3",
    method: "POST",
    headers: { "Content-Type": "application/json", "X-Signature": "sha256=jkl012", "User-Agent": "Generic/1.0" },
    body: { event: "order.updated", status: "shipped" },
    signatureValid: true,
    receivedAt: new Date(BASE_TIME - 12 * 60000).toISOString(),
    anomalyFlags: ["schema_drift"],
  },
  {
    id: "whk_7",
    monitorSlug: "mon_2",
    method: "POST",
    headers: { "Content-Type": "application/json", "X-Signature": "sha256=mno345", "User-Agent": "Stripe/1.0" },
    body: { type: "charge.failed", reason: "card_declined" },
    signatureValid: true,
    receivedAt: new Date(BASE_TIME - 15 * 60000).toISOString(),
    anomalyFlags: [],
  },
  {
    id: "whk_8",
    monitorSlug: "mon_5",
    method: "POST",
    headers: { "Content-Type": "application/json", "User-Agent": "Generic/1.0" },
    body: { sku: "ABC-123", qty: 5 },
    signatureValid: true,
    receivedAt: new Date(BASE_TIME - 18 * 60000).toISOString(),
    anomalyFlags: [],
  },
  {
    id: "whk_9",
    monitorSlug: "mon_6",
    method: "POST",
    headers: { "Content-Type": "application/json", "X-Signature": "sha256=badsig", "User-Agent": "Generic/1.0" },
    body: { event: "notification.sent" },
    signatureValid: false,
    receivedAt: new Date(BASE_TIME - 20 * 60000).toISOString(),
    anomalyFlags: ["missing_param: recipient_id"],
  },
  {
    id: "whk_10",
    monitorSlug: "mon_4",
    method: "POST",
    headers: { "Content-Type": "application/json", "X-Signature": "sha256=pqr678", "User-Agent": "InternalBot/2.0" },
    body: { token_refresh: true },
    signatureValid: true,
    receivedAt: new Date(BASE_TIME - 22 * 60000).toISOString(),
    anomalyFlags: [],
  },
  {
    id: "whk_11",
    monitorSlug: "mon_3",
    method: "POST",
    headers: { "Content-Type": "application/json", "X-Signature": "sha256=stu901", "User-Agent": "Generic/1.0" },
    body: { event: "user.deleted" },
    signatureValid: true,
    receivedAt: new Date(BASE_TIME - 25 * 60000).toISOString(),
    anomalyFlags: [],
  },
  {
    id: "whk_12",
    monitorSlug: "mon_2",
    method: "POST",
    headers: { "Content-Type": "application/json", "X-Signature": "sha256=vwx234", "User-Agent": "Stripe/1.0" },
    body: { type: "refund.created", amount: 500 },
    signatureValid: true,
    receivedAt: new Date(BASE_TIME - 28 * 60000).toISOString(),
    anomalyFlags: [],
  },
  {
    id: "whk_13",
    monitorSlug: "mon_1",
    method: "GET",
    headers: { "Content-Type": "application/json", "User-Agent": "InternalBot/2.0" },
    body: { ping: true },
    signatureValid: true,
    receivedAt: new Date(BASE_TIME - 30 * 60000).toISOString(),
    anomalyFlags: [],
  },
  {
    id: "whk_14",
    monitorSlug: "mon_6",
    method: "POST",
    headers: { "Content-Type": "application/json", "X-Signature": "sha256=yz1234", "User-Agent": "Generic/1.0" },
    body: { event: "notification.failed", error_code: "TIMEOUT" },
    signatureValid: true,
    receivedAt: new Date(BASE_TIME - 33 * 60000).toISOString(),
    anomalyFlags: ["schema_drift"],
  },
  {
    id: "whk_15",
    monitorSlug: "mon_5",
    method: "POST",
    headers: { "Content-Type": "application/json", "User-Agent": "Generic/1.0" },
    body: { sku: "XYZ-789", qty: 2 },
    signatureValid: true,
    receivedAt: new Date(BASE_TIME - 36 * 60000).toISOString(),
    anomalyFlags: [],
  },
  {
    id: "whk_16",
    monitorSlug: "mon_3",
    method: "POST",
    headers: { "Content-Type": "application/json", "X-Signature": "sha256=aa4567", "User-Agent": "Generic/1.0" },
    body: { event: "order.cancelled" },
    signatureValid: false,
    receivedAt: new Date(BASE_TIME - 40 * 60000).toISOString(),
    anomalyFlags: ["missing_param: order_id", "schema_drift"],
  },
  {
    id: "whk_17",
    monitorSlug: "mon_4",
    method: "POST",
    headers: { "Content-Type": "application/json", "X-Signature": "sha256=bb7890", "User-Agent": "InternalBot/2.0" },
    body: { token_refresh: true },
    signatureValid: true,
    receivedAt: new Date(BASE_TIME - 44 * 60000).toISOString(),
    anomalyFlags: [],
  },
  {
    id: "whk_18",
    monitorSlug: "mon_2",
    method: "POST",
    headers: { "Content-Type": "application/json", "X-Signature": "sha256=cc0123", "User-Agent": "Stripe/1.0" },
    body: { type: "payment_intent.failed", reason: "insufficient_funds" },
    signatureValid: true,
    receivedAt: new Date(BASE_TIME - 48 * 60000).toISOString(),
    anomalyFlags: [],
  },
];

export const aiAnalyses = [
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
    codeFix: `// Reject payloads missing required fields before processing
    if (!payload.user_id) {
      return res.status(400).json({ error: "missing_param: user_id" });
    }
    if (!verifySignature(req.headers["x-signature"], payload, WEBHOOK_SECRET)) {
      return res.status(401).json({ error: "invalid_signature" });
    }`,
  },
  {
    id: "ai_2",
    relatedEventId: "whk_6",
    summary: "Schema drift detected — the incoming payload structure no longer matches the expected format.",
    probableCause: "The upstream service likely shipped an API version update that changed field names or nesting without a corresponding update on your end.",
    steps: [
      "Compare the current payload structure against your last known-good schema.",
      "Check the upstream provider's changelog for recent breaking changes.",
      "Update your payload parser to handle both old and new schema versions temporarily.",
      "Add schema validation with alerting for future drift detection.",
    ],
    // ai_2
    codeFix: `// Support both old and new schema shapes during migration
    const orderId = payload.order?.id ?? payload.orderId;
    const status = payload.order?.status ?? payload.status;`,
  },
  {
    id: "ai_3",
    relatedEventId: "whk_14",
    summary: "Notification delivery is timing out intermittently, causing degraded status on this monitor.",
    probableCause: "Downstream notification service is experiencing elevated latency, possibly due to rate limiting or resource exhaustion on their end.",
    steps: [
      "Check the notification provider's status page for ongoing incidents.",
      "Review your rate limit configuration against the provider's current limits.",
      "Implement exponential backoff and retry logic for failed notification sends.",
      "Add a circuit breaker to prevent cascading failures during provider outages.",
    ],
    // ai_3
    codeFix: `// Add retry with exponential backoff
    async function sendWithRetry(fn, retries = 3) {
      for (let i = 0; i < retries; i++) {
        try { return await fn(); }
        catch (e) {
          if (i === retries - 1) throw e;
          await new Promise(r => setTimeout(r, 2 ** i * 500));
        }
      }
    }`,
  },
  {
    id: "ai_4",
    relatedEventId: "whk_16",
    summary: "Multiple validation failures on incoming order events — both signature and required fields are failing.",
    probableCause: "The sending system may have rotated its signing secret without notifying you, and simultaneously changed its payload structure.",
    steps: [
      "Confirm with the sending team whether the signing secret was recently rotated.",
      "Request updated API documentation for the current payload schema.",
      "Temporarily flag and quarantine events from this source for manual review.",
      "Re-enable strict validation once the schema and secret are confirmed in sync.",
    ],
    // ai_4
    codeFix: `// Quarantine unverifiable events instead of dropping silently
    if (!signatureValid || !payload.order_id) {
      await quarantineQueue.push({ event, reason: "validation_failed" });
      return res.status(202).json({ status: "queued_for_review" });
    }`,
  },
];


export const globalStats = {
  totalWebhooksCaptured: 1420,
};
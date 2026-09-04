from app.schemas import AnalyzeRequest, AnalyzeResponse


def analyze(request: AnalyzeRequest) -> AnalyzeResponse:
    monitor = request.monitor
    webhook = request.webhookEvent

    # Rule 1: server error (5xx)
    if monitor and monitor.statusCode and monitor.statusCode >= 500:
        return AnalyzeResponse(
            summary=f"The endpoint at {monitor.url} is returning server errors.",
            probableCause=f"Received a {monitor.statusCode} status code, indicating the server itself is failing to process the request — likely an unhandled exception, dependency failure, or resource exhaustion on their end.",
            steps=[
                "Check the target service's status page or logs for active incidents.",
                "Verify the request payload matches what the server expects.",
                "Retry with exponential backoff in case it's a transient failure.",
                "Contact the service owner if errors persist beyond a few minutes.",
            ],
            codeFix="async function fetchWithRetry(url, retries = 3) {\n  for (let i = 0; i < retries; i++) {\n    const res = await fetch(url);\n    if (res.ok) return res;\n    await new Promise(r => setTimeout(r, 2 ** i * 500));\n  }\n  throw new Error('Max retries exceeded');\n}",
        )

    # Rule 2: not found (404)
    if monitor and monitor.statusCode == 404:
        return AnalyzeResponse(
            summary=f"The endpoint at {monitor.url} could not be found.",
            probableCause="The URL path is likely incorrect, the resource has moved, or the method (GET/POST) doesn't match what the route supports.",
            steps=[
                "Double-check the exact URL path and HTTP method against the API documentation.",
                "Confirm the resource still exists and hasn't been deprecated or renamed.",
                "Test the endpoint manually with curl or Postman to isolate the issue.",
            ],
            codeFix=None,
        )

    # Rule 3: high latency / timeout
    if monitor and monitor.latencyMs and monitor.latencyMs > 2000:
        return AnalyzeResponse(
            summary=f"The endpoint at {monitor.url} is responding slowly.",
            probableCause="Elevated latency suggests the downstream service is under load, experiencing network congestion, or has a slow database query in its critical path.",
            steps=[
                "Check if the slowdown correlates with a traffic spike or deploy.",
                "Review database query performance if the endpoint touches a DB.",
                "Add a client-side timeout to avoid cascading slowness in your own app.",
                "Consider caching if the response data doesn't change frequently.",
            ],
            codeFix="const response = await fetchWithTimeout(url, { timeoutMs: 3000 })\n  .catch(() => fallbackResponse());",
        )

    # Rule 4: invalid webhook signature
    if webhook and webhook.signatureValid is False:
        return AnalyzeResponse(
            summary="An incoming webhook failed signature verification.",
            probableCause="The signing secret may not match between sender and receiver, or the request body was altered in transit (e.g. by a proxy re-serializing JSON).",
            steps=[
                "Confirm both sides are using the exact same webhook secret.",
                "Ensure the raw request body (not a re-parsed/re-stringified version) is used for HMAC verification.",
                "Check for any middleware that might be modifying the payload before it reaches your verification step.",
            ],
            codeFix="if (!verifySignature(req.rawBody, req.headers['x-signature'], WEBHOOK_SECRET)) {\n  return res.status(401).json({ error: 'invalid_signature' });\n}",
        )

    # Rule 5: schema drift
    if webhook and webhook.anomalyFlags and "schema_drift" in webhook.anomalyFlags:
        return AnalyzeResponse(
            summary="The incoming webhook payload structure doesn't match the expected schema.",
            probableCause="The sending service likely changed its payload format — renamed fields, changed nesting, or shipped an API version update without notice.",
            steps=[
                "Compare the current payload against your last known-good schema.",
                "Check the sender's changelog or API version headers for recent changes.",
                "Add backward-compatible parsing to handle both old and new formats temporarily.",
                "Set up schema validation with alerting to catch drift earlier next time.",
            ],
            codeFix="const orderId = payload.order?.id ?? payload.orderId;",
        )

    # Fallback: no specific rule matched
    return AnalyzeResponse(
        summary="This endpoint or event is showing abnormal behavior outside its expected baseline.",
        probableCause="Not enough specific signal to pinpoint an exact cause — could be a transient issue, partial outage, or an edge case not covered by standard checks.",
        steps=[
            "Review recent logs around the time of the incident.",
            "Check for any recent deploys or configuration changes.",
            "Monitor for recurrence — a single anomaly may just be noise.",
            "Escalate if the pattern repeats within a short window.",
        ],
        codeFix=None,
    )
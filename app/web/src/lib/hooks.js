"use client";
import { useState, useEffect, useRef } from "react";
import { monitors, webhookEvents, aiAnalyses } from "./mockData";

export function useMonitors() {
  const [data, setData] = useState(monitors);
  return { monitors: data, loading: false };
}

export function useMonitor(id) {
  return monitors.find((m) => m.id === id) || null;
}

export function useAIAnalysis(eventId) {
  return aiAnalyses.find((a) => a.relatedEventId === eventId) || null;
}

// Simulates live webhook feed by pushing a new fake event every N seconds.
export function useWebhookEvents() {
  const [events, setEvents] = useState(webhookEvents);
  const counter = useRef(webhookEvents.length + 1);

  useEffect(() => {
    const interval = setInterval(() => {
      const randomMonitor = monitors[Math.floor(Math.random() * monitors.length)];
      const isAnomaly = Math.random() < 0.2;
      const newEvent = {
        id: `whk_${counter.current++}`,
        monitorSlug: randomMonitor.id,
        method: "POST",
        headers: { "Content-Type": "application/json", "X-Signature": "sha256=live" + Date.now(), "User-Agent": "Generic/1.0" },
        body: { event: "live.event", ts: Date.now() },
        signatureValid: !isAnomaly,
        receivedAt: new Date().toISOString(),
        anomalyFlags: isAnomaly ? ["schema_drift"] : [],
      };
      setEvents((prev) => [newEvent, ...prev].slice(0, 50));
    }, 8000);

    return () => clearInterval(interval);
  }, []);

  return { events, loading: false };
}



export function useAnalysisForMonitor(monitorId) {
  const relatedEvent = webhookEvents.find((e) => e.monitorSlug === monitorId && aiAnalyses.some((a) => a.relatedEventId === e.id));
  const found = relatedEvent ? aiAnalyses.find((a) => a.relatedEventId === relatedEvent.id) : null;

  if (found) return found;

  // fallback generic analysis when no specific event/analysis is linked
  return {
    id: `ai_generic_${monitorId}`,
    relatedEventId: null,
    summary: "This endpoint is showing elevated error rates or latency outside its normal baseline.",
    probableCause: "Likely a downstream dependency slowdown or intermittent network instability affecting response times.",
    steps: [
      "Check upstream/downstream service status pages for active incidents.",
      "Review recent deploys or config changes around the time issues began.",
      "Inspect connection pool and timeout settings for this endpoint.",
      "Add alerting thresholds to catch this earlier next time.",
    ],
    codeFix: `// Add a timeout + fallback to prevent cascading slowness
    const response = await fetchWithTimeout(url, { timeoutMs: 3000 })
      .catch(() => fallbackResponse());`,
  };
}
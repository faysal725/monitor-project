"use client";
import { useState, useEffect } from "react";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export function useMonitors() {
  const [monitors, setMonitors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetch(`${API_URL}/api/monitors`)
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch monitors");
        return res.json();
      })
      .then((data) => setMonitors(data))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  const addMonitor = async (newMonitorInput) => {
    const res = await fetch(`${API_URL}/api/monitors`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newMonitorInput),
    });
    if (!res.ok) throw new Error("Failed to create monitor");
    const created = await res.json();
    setMonitors((prev) => [...prev, created]);
    return created;
  };

  return { monitors, loading, error, addMonitor };
}

export function useMonitor(id) {
  const [monitor, setMonitor] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    fetch(`${API_URL}/api/monitors/${id}`)
      .then((res) => res.json())
      .then((data) => setMonitor(data))
      .finally(() => setLoading(false));
  }, [id]);

  return { monitor, loading };
}

export function useAnalysisForMonitor(monitorId) {
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!monitorId) return;
    fetch(`${API_URL}/api/diagnostics/${monitorId}`)
      .then((res) => res.json())
      .then((data) => setAnalysis(data))
      .finally(() => setLoading(false));
  }, [monitorId]);

  return analysis;
}

// No more setInterval fake-live simulation — fetch once on load.
// Real-time updates come later via Socket.io.
export function useWebhookEvents() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${API_URL}/api/webhooks`)
      .then((res) => res.json())
      .then((data) => setEvents(data))
      .finally(() => setLoading(false));
  }, []);

  return { events, loading };
}
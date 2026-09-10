"use client";
import { createContext, useContext, useEffect, useState } from "react";

const AIServiceContext = createContext({ status: "checking" });

const API_URL = process.env.NEXT_PUBLIC_API_URL;
const POLL_INTERVAL_MS = 5000;
const MAX_POLL_TIME_MS = 90000;

export function AIServiceProvider({ children }) {
  const [status, setStatus] = useState("checking");

  useEffect(() => {
    let cancelled = false;
    let intervalId;
    const startTime = Date.now();

    const poll = async () => {
      try {
        const res = await fetch(`${API_URL}/api/warmup`);
        const data = await res.json();

        if (cancelled) return;

        if (data.aiService === "ready") {
          setStatus("ready");
          clearInterval(intervalId);
          return;
        }

        if (Date.now() - startTime > MAX_POLL_TIME_MS) {
          setStatus("error");
          clearInterval(intervalId);
        }
      } catch (err) {
        if (!cancelled && Date.now() - startTime > MAX_POLL_TIME_MS) {
          setStatus("error");
          clearInterval(intervalId);
        }
      }
    };

    poll();
    intervalId = setInterval(poll, POLL_INTERVAL_MS);

    return () => {
      cancelled = true;
      clearInterval(intervalId);
    };
  }, []);

  return (
    <AIServiceContext.Provider value={{ status }}>
      {children}
    </AIServiceContext.Provider>
  );
}

export function useAIServiceStatus() {
  return useContext(AIServiceContext);
}
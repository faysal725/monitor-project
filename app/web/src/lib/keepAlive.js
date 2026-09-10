"use client";
import { useEffect } from "react";

const API_URL = process.env.NEXT_PUBLIC_API_URL;
const AI_SERVICE_URL = process.env.NEXT_PUBLIC_AI_SERVICE_URL;
const PING_INTERVAL_MS = 10 * 60 * 1000; // every 10 minutes, under Render's 15-min sleep window

export function useKeepAlive() {
  useEffect(() => {
    const ping = () => {
      fetch(`${API_URL}/health`).catch(() => {});
      if (AI_SERVICE_URL) {
        fetch(`${AI_SERVICE_URL}/health`).catch(() => {});
      }
    };

    ping(); // fire immediately on mount, don't wait for the first interval tick
    const intervalId = setInterval(ping, PING_INTERVAL_MS);
    return () => clearInterval(intervalId);
  }, []);
}
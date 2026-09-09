"use client";
import { createContext, useContext, useEffect, useState } from "react";

const AIServiceContext = createContext({ status: "checking" });

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export function AIServiceProvider({ children }) {
  const [status, setStatus] = useState("checking");

  useEffect(() => {
    let cancelled = false;

    const checkWarmup = async () => {
      try {
        const res = await fetch(`${API_URL}/api/warmup`);
        const data = await res.json();
        if (!cancelled) {
          setStatus(data.aiService === "ready" ? "ready" : "error");
        }
      } catch (err) {
        if (!cancelled) setStatus("error");
      }
    };

    checkWarmup();
    return () => {
      cancelled = true;
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
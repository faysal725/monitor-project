"use client";
import { useEffect } from "react";
import { toast } from "sonner";
import Sidebar from "@/components/Sidebar";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export default function AppLayout({ children }) {
  useEffect(() => {
    const warmup = async () => {
      const toastId = toast.loading("Waking up backend services...");
      try {
        const res = await fetch(`${API_URL}/api/warmup`);
        const data = await res.json();
        if (data.aiService === "ready") {
          toast.success("All services ready", { id: toastId });
        } else {
          toast.error("AI service is still waking up, first diagnostic may be slow", { id: toastId });
        }
      } catch (err) {
        toast.error("Could not reach backend", { id: toastId });
      }
    };
    warmup();
  }, []);

  return (
    <div className="flex flex-col lg:flex-row">
      <Sidebar />
      <div className="flex-1">{children}</div>
    </div>
  );
}
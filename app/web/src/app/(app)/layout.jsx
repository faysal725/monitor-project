"use client";
import Sidebar from "@/components/Sidebar";
import { AIServiceProvider } from "@/lib/aiServiceContext";
import { useKeepAlive } from "@/lib/keepAlive";

export default function AppLayout({ children }) {
  useKeepAlive();

  return (
    <AIServiceProvider>
      <div className="flex flex-col lg:flex-row">
        <Sidebar />
        <div className="flex-1">{children}</div>
      </div>
    </AIServiceProvider>
  );
}
"use client";
import { useMonitors } from "@/lib/hooks";
import { globalStats } from "@/lib/mockData";
import MonitorCard from "@/components/MonitorCard";
import StatsBar from "@/components/StatsBar";

export default function DashboardPage() {
  const { monitors } = useMonitors();

  return (
    <main className="p-6 max-w-6xl mx-auto">
      <h1 className="text-2xl font-bold text-slate-100 mb-6">Monitored Endpoints</h1>

      <StatsBar monitors={monitors} totalWebhooksCaptured={globalStats.totalWebhooksCaptured} />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {monitors.map((m) => (
          <MonitorCard key={m.id} monitor={m} />
        ))}
      </div>
    </main>
  );
}
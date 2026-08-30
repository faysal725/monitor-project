"use client";
import { useMonitors } from "@/lib/hooks";
import { globalStats } from "@/lib/mockData";
import MonitorCard from "@/components/MonitorCard";
import StatsBar from "@/components/StatsBar";
import AddMonitorDialog from "@/components/AddMonitorDialog";

export default function DashboardPage() {
  const { monitors, addMonitor, updateMonitor, deleteMonitor } = useMonitors();

  return (
    <main className="p-6 max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-slate-100">Monitored Endpoints</h1>
        <AddMonitorDialog onAdd={addMonitor} />
      </div>

      <StatsBar monitors={monitors} totalWebhooksCaptured={globalStats.totalWebhooksCaptured} />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {monitors.map((m) => (
          <MonitorCard key={m.id} monitor={m} onUpdate={updateMonitor} onDelete={deleteMonitor} />
        ))}
      </div>
    </main>
  );
}
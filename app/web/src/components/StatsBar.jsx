import { Card, CardContent } from "@/components/ui/card";
import { Activity, Gauge, TrendingUp, Webhook } from "lucide-react";

function StatCard({ icon: Icon, label, value }) {
  return (
    <Card className="bg-slate-900 border-slate-800">
      <CardContent className="p-4 flex items-center gap-3">
        <div className="rounded-md bg-slate-800/60 p-2">
          <Icon className="h-4 w-4 text-slate-400" />
        </div>
        <div>
          <p className="text-xs text-slate-500">{label}</p>
          <p className="text-lg font-semibold text-slate-100">{value}</p>
        </div>
      </CardContent>
    </Card>
  );
}

export default function StatsBar({ monitors, totalWebhooksCaptured }) {
  const total = monitors.length;

  const avgLatency = Math.round(
    monitors.reduce((sum, m) => {
      const last = m.pingLogs[m.pingLogs.length - 1];
      return sum + (last?.latencyMs || 0);
    }, 0) / total
  );

  const globalUptime = (
    monitors.reduce((sum, m) => sum + m.uptimePercent, 0) / total
  ).toFixed(1);

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
      <StatCard icon={Activity} label="Monitored Endpoints" value={total} />
      <StatCard icon={Gauge} label="Average Latency" value={`${avgLatency} ms`} />
      <StatCard icon={TrendingUp} label="Global Uptime" value={`${globalUptime}%`} />
      <StatCard icon={Webhook} label="Webhooks Captured" value={totalWebhooksCaptured.toLocaleString()} />
    </div>
  );
}
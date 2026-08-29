"use client";
import { useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Sparkles } from "lucide-react";
import LatencyChart from "./LatencyChart";
import AIDiagnosticDrawer from "./AIDiagnosticDrawer";
import { useAnalysisForMonitor } from "@/lib/hooks";

const statusStyles = {
  up: { badge: "bg-emerald-500/10 text-emerald-400 border-emerald-500/30", dot: "bg-emerald-400 shadow-[0_0_6px_2px_rgba(52,211,153,0.5)]" },
  degraded: { badge: "bg-amber-500/10 text-amber-400 border-amber-500/30", dot: "bg-amber-400 shadow-[0_0_6px_2px_rgba(251,191,36,0.5)]" },
  down: { badge: "bg-red-500/10 text-red-400 border-red-500/30", dot: "bg-red-400 shadow-[0_0_6px_2px_rgba(248,113,113,0.5)]" },
};

export default function MonitorCard({ monitor }) {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const analysis = useAnalysisForMonitor(monitor.id);
  const styles = statusStyles[monitor.status];
  const lastLatency = monitor.pingLogs[monitor.pingLogs.length - 1]?.latencyMs ?? 0;
  const needsDiagnostic = monitor.status === "degraded" || monitor.status === "down";

  return (
    <Card className="bg-slate-900 border-slate-800 hover:border-slate-700 transition-colors">
      <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
        <div>
          <CardTitle className="text-sm font-mono text-slate-200 truncate max-w-[220px]">{monitor.url}</CardTitle>
          <p className="text-xs text-slate-500 mt-1">{monitor.method} · every {monitor.intervalSeconds}s</p>
        </div>
        <Badge variant="outline" className={`gap-1.5 ${styles.badge}`}>
          <span className={`h-1.5 w-1.5 rounded-full ${styles.dot}`} />
          {monitor.status}
        </Badge>
      </CardHeader>

      <CardContent>
        <div className="flex items-center justify-between mb-2">
          <span className="text-2xl font-semibold text-slate-100">{monitor.uptimePercent}%</span>
          <span className="text-xs text-slate-500">uptime</span>
        </div>

        <LatencyChart pingLogs={monitor.pingLogs} status={monitor.status} />

        <div className="flex items-center justify-between mt-3 pt-3 border-t border-slate-800">
          <span className="text-xs text-slate-500">
            Latency: <span className="text-slate-300 font-medium">{lastLatency}ms</span>
          </span>
          {needsDiagnostic && (
            <Button size="sm" variant="secondary" className="h-7 text-xs gap-1 bg-slate-800 hover:bg-slate-700 text-slate-200" onClick={() => setDrawerOpen(true)}>
              <Sparkles className="h-3 w-3" />
              Run AI Diagnostic
            </Button>
          )}
        </div>
      </CardContent>

      <AIDiagnosticDrawer analysis={analysis} open={drawerOpen} onOpenChange={setDrawerOpen} />
    </Card>
  );
}
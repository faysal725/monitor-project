"use client";
import { useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Sparkles, Pencil, Trash2, Check, X } from "lucide-react";
import LatencyChart from "./LatencyChart";
import AIDiagnosticDrawer from "./AIDiagnosticDrawer";
import { useAnalysisForMonitor, useMonitors } from "@/lib/hooks";
import { toast } from "sonner";

const statusStyles = {
  up: { badge: "bg-emerald-500/10 text-emerald-400 border-emerald-500/30", dot: "bg-emerald-400 shadow-[0_0_6px_2px_rgba(52,211,153,0.5)]" },
  degraded: { badge: "bg-amber-500/10 text-amber-400 border-amber-500/30", dot: "bg-amber-400 shadow-[0_0_6px_2px_rgba(251,191,36,0.5)]" },
  down: { badge: "bg-red-500/10 text-red-400 border-red-500/30", dot: "bg-red-400 shadow-[0_0_6px_2px_rgba(248,113,113,0.5)]" },
};

export default function MonitorCard({ monitor, onUpdate, onDelete }) {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editing, setEditing] = useState(false);
  const [urlDraft, setUrlDraft] = useState(monitor.url);
  const [intervalDraft, setIntervalDraft] = useState(monitor.intervalSeconds);
  const [saving, setSaving] = useState(false);

  const analysis = useAnalysisForMonitor(monitor.id);
  const styles = statusStyles[monitor.status];
  const lastLatency = monitor.pingLogs[monitor.pingLogs.length - 1]?.latencyMs ?? 0;
  const needsDiagnostic = monitor.status === "degraded" || monitor.status === "down";

  const handleSave = async () => {
    setSaving(true);
    try {
      await onUpdate(monitor.id, { url: urlDraft.trim(), intervalSeconds: Number(intervalDraft) });
      setEditing(false);
      toast.success("Monitor updated");
    } catch (err) {
      toast.error("Failed to update monitor");
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setUrlDraft(monitor.url);
    setIntervalDraft(monitor.intervalSeconds);
    setEditing(false);
  };

  return (
    <Card className="bg-slate-900 border-slate-800 hover:border-slate-700 transition-colors">
      <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
        <div className="flex-1 min-w-0">
          {editing ? (
            <Input
              value={urlDraft}
              onChange={(e) => setUrlDraft(e.target.value)}
              className="bg-slate-950 border-slate-800 text-sm font-mono h-7"
            />
          ) : (
            <CardTitle className="text-sm font-mono text-slate-200 truncate max-w-[220px]">{monitor.url}</CardTitle>
          )}
          <div className="flex items-center gap-2 mt-1">
            <p className="text-xs text-slate-500">{monitor.method} · every</p>
            {editing ? (
              <Input
                type="number"
                value={intervalDraft}
                onChange={(e) => setIntervalDraft(e.target.value)}
                className="bg-slate-950 border-slate-800 text-xs h-6 w-16 px-1.5"
              />
            ) : (
              <p className="text-xs text-slate-500">{monitor.intervalSeconds}s</p>
            )}
          </div>
        </div>

        <div className="flex items-center gap-1.5 shrink-0 ml-2">
          {editing ? (
            <>
              <Button size="icon" variant="ghost" className="h-6 w-6 text-emerald-400" onClick={handleSave} disabled={saving}>
                <Check className="h-3.5 w-3.5" />
              </Button>
              <Button size="icon" variant="ghost" className="h-6 w-6 text-slate-500" onClick={handleCancel}>
                <X className="h-3.5 w-3.5" />
              </Button>
            </>
          ) : (
            <>
              <Badge variant="outline" className={`gap-1.5 ${styles.badge}`}>
                <span className={`h-1.5 w-1.5 rounded-full ${styles.dot}`} />
                {monitor.status}
              </Badge>
              <Button size="icon" variant="ghost" className="h-6 w-6 text-slate-500 hover:text-slate-200" onClick={() => setEditing(true)}>
                <Pencil className="h-3.5 w-3.5" />
              </Button>

              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button size="icon" variant="ghost" className="h-6 w-6 text-slate-500 hover:text-red-400">
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent className="bg-slate-900 border-slate-800 text-slate-200">
                  <AlertDialogHeader>
                    <AlertDialogTitle>Delete this monitor?</AlertDialogTitle>
                    <AlertDialogDescription className="text-slate-400">
                      This will permanently remove {monitor.url} from monitoring. This can't be undone.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel className="bg-slate-800 border-slate-700 text-slate-200 hover:bg-slate-700">Cancel</AlertDialogCancel>
                    <AlertDialogAction className="bg-red-600 hover:bg-red-700" onClick={async () => {
                      try {
                        await onDelete(monitor.id);
                        toast.success("Monitor deleted");
                      } catch (err) {
                        toast.error("Failed to delete monitor");
                      }
                    }}>
                      Delete
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </>
          )}
        </div>
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
"use client";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { ChevronDown, RefreshCw, ShieldCheck, ShieldX } from "lucide-react";
import AnomalyBadge from "./AnomalyBadge";
import AIDiagnostic from "./AIDiagnostic";
import { useAIAnalysis } from "@/lib/hooks";

export default function WebhookFeedItem({ event }) {
  const [open, setOpen] = useState(false);
  const [showAI, setShowAI] = useState(false);
  const analysis = useAIAnalysis(event.id);

  const handleReplay = (e) => {
    e.stopPropagation();
    console.log("Replaying event:", event.id);
  };

  return (
    <Collapsible open={open} onOpenChange={setOpen} className="border rounded-lg">
      <CollapsibleTrigger className="w-full flex items-center justify-between p-3 hover:bg-muted/50 transition-colors">
        <div className="flex items-center gap-2 text-left">
          <Badge variant="outline">{event.method}</Badge>
          <span className="text-sm font-mono text-muted-foreground">{event.monitorSlug}</span>
          {event.signatureValid ? (
            <ShieldCheck className="h-4 w-4 text-green-500" />
          ) : (
            <ShieldX className="h-4 w-4 text-red-500" />
          )}
          {event.anomalyFlags.map((flag) => (
            <AnomalyBadge key={flag} flag={flag} />
          ))}
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-muted-foreground">{new Date(event.receivedAt).toLocaleTimeString()}</span>
          <ChevronDown className={`h-4 w-4 transition-transform ${open ? "rotate-180" : ""}`} />
        </div>
      </CollapsibleTrigger>

      <CollapsibleContent className="p-3 pt-0 space-y-3">
        <div>
          <h5 className="text-xs font-semibold text-muted-foreground mb-1">Headers</h5>
          <pre className="text-xs bg-muted rounded p-2 overflow-x-auto">{JSON.stringify(event.headers, null, 2)}</pre>
        </div>
        <div>
          <h5 className="text-xs font-semibold text-muted-foreground mb-1">Body</h5>
          <pre className="text-xs bg-muted rounded p-2 overflow-x-auto">{JSON.stringify(event.body, null, 2)}</pre>
        </div>
        <div className="flex gap-2">
          <Button size="sm" variant="outline" onClick={handleReplay}>
            <RefreshCw className="h-3 w-3 mr-1" /> Replay
          </Button>
          {analysis && (
            <Button size="sm" variant="secondary" onClick={(e) => { e.stopPropagation(); setShowAI(true); }}>
              View AI Diagnosis
            </Button>
          )}
        </div>
      </CollapsibleContent>

      {analysis && <AIDiagnostic analysis={analysis} open={showAI} onOpenChange={setShowAI} />}
    </Collapsible>
  );
}
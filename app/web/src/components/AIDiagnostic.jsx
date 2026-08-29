import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";

export default function AIDiagnostic({ analysis, open, onOpenChange }) {
  if (!analysis) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>AI Root Cause Analysis</DialogTitle>
          <DialogDescription>{analysis.summary}</DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <h4 className="text-sm font-semibold mb-1">Probable Cause</h4>
            <p className="text-sm text-muted-foreground">{analysis.probableCause}</p>
          </div>
          <div>
            <h4 className="text-sm font-semibold mb-2">Suggested Fix</h4>
            <ol className="space-y-1.5">
              {analysis.steps.map((step, i) => (
                <li key={i} className="text-sm text-muted-foreground flex gap-2">
                  <span className="font-mono text-xs text-primary">{i + 1}.</span>
                  {step}
                </li>
              ))}
            </ol>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
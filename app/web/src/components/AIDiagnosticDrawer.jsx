import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";

export default function AIDiagnosticDrawer({ analysis, open, onOpenChange }) {
  if (!analysis) return null;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="bg-slate-950 border-slate-800 text-slate-200 w-full sm:max-w-md overflow-y-auto">
        <SheetHeader>
          <SheetTitle className="text-slate-100">AI Root Cause Analysis</SheetTitle>
          <SheetDescription className="text-slate-400">{analysis.summary}</SheetDescription>
        </SheetHeader>

        <div className="px-4 space-y-5 mt-2">
          <div>
            <h4 className="text-sm font-semibold text-slate-300 mb-1">Probable Cause</h4>
            <p className="text-sm text-slate-400">{analysis.probableCause}</p>
          </div>

          <div>
            <h4 className="text-sm font-semibold text-slate-300 mb-2">Suggested Fix</h4>
            <ol className="space-y-1.5">
              {analysis.steps.map((step, i) => (
                <li key={i} className="text-sm text-slate-400 flex gap-2">
                  <span className="font-mono text-xs text-emerald-400">{i + 1}.</span>
                  {step}
                </li>
              ))}
            </ol>
          </div>

          {analysis.codeFix && (
            <div>
              <h4 className="text-sm font-semibold text-slate-300 mb-2">Suggested Code Fix</h4>
              <pre className="text-xs bg-slate-900 border border-slate-800 rounded-md p-3 overflow-x-auto text-emerald-300">
                <code>{analysis.codeFix}</code>
              </pre>
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
export default function MonitorCardSkeleton() {
  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 animate-pulse">
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <div className="h-4 bg-slate-800 rounded w-3/4 mb-2" />
          <div className="h-3 bg-slate-800 rounded w-1/2" />
        </div>
        <div className="h-5 w-14 bg-slate-800 rounded-full" />
      </div>

      <div className="flex items-center justify-between mb-2">
        <div className="h-8 bg-slate-800 rounded w-16" />
        <div className="h-3 bg-slate-800 rounded w-12" />
      </div>

      <div className="h-28 bg-slate-800 rounded mb-3" />

      <div className="flex items-center justify-between pt-3 border-t border-slate-800">
        <div className="h-3 bg-slate-800 rounded w-20" />
        <div className="h-7 bg-slate-800 rounded w-24" />
      </div>
    </div>
  );
}
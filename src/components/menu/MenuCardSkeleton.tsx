export function MenuCardSkeleton() {
  return (
    <div className="relative flex items-stretch gap-3 rounded-2xl border border-slate-200 bg-white p-3 shadow-sm">
      <div className="h-24 w-24 shrink-0 rounded-xl bg-slate-200 animate-pulse sm:h-28 sm:w-28" />

      <div className="min-w-0 grow">
        <div className="mb-1 h-5 w-2/3 rounded bg-slate-200 animate-pulse sm:h-6" />
        <div className="space-y-1.5 pt-0.5">
          <div className="h-3.5 w-full rounded bg-slate-200 animate-pulse" />
          <div className="h-3.5 w-5/6 rounded bg-slate-200 animate-pulse" />
        </div>
      </div>
    </div>
  );
}

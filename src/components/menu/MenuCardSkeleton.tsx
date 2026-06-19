export function MenuCardSkeleton() {
  return (
    <div className="relative flex items-stretch gap-2 rounded-2xl border border-slate-200 bg-white p-2 shadow-sm">
      <div className="h-[72px] w-[72px] shrink-0 rounded-xl bg-slate-200 animate-pulse sm:h-20 sm:w-20" />

      <div className="min-w-0 grow">
        <div className="mb-0.5 h-4 w-2/3 rounded bg-slate-200 animate-pulse sm:h-5" />
        <div className="space-y-1 pt-0.5">
          <div className="h-2.5 w-full rounded bg-slate-200 animate-pulse sm:h-3" />
          <div className="h-2.5 w-5/6 rounded bg-slate-200 animate-pulse sm:h-3" />
        </div>
      </div>
    </div>
  );
}

export function MenuCardSkeleton() {
  return (
    <div className="relative flex items-stretch gap-1.5 rounded-2xl border border-emerald-200/70 bg-linear-to-br from-white via-emerald-50/70 to-emerald-100/60 p-1.5 shadow-[0_6px_16px_rgba(6,78,59,0.10)]">
      <div className="h-16 w-16 shrink-0 rounded-xl bg-emerald-100/90 animate-pulse sm:h-[72px] sm:w-[72px]" />

      <div className="min-w-0 grow">
        <div className="mb-0.5 h-3.5 w-2/3 rounded bg-emerald-100/90 animate-pulse sm:h-4" />
        <div className="space-y-0.5 pt-0.5">
          <div className="h-2.5 w-full rounded bg-emerald-100/90 animate-pulse sm:h-3" />
          <div className="h-2.5 w-5/6 rounded bg-emerald-100/90 animate-pulse sm:h-3" />
        </div>
      </div>
    </div>
  );
}

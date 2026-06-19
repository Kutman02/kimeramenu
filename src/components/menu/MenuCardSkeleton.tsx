export function MenuCardSkeleton() {
  return (
    <div className="relative flex items-stretch gap-2 rounded-2xl border border-emerald-100 bg-linear-to-br from-white to-emerald-50/50 p-2 shadow-[0_4px_14px_rgba(16,185,129,0.08)]">
      <div className="h-[72px] w-[72px] shrink-0 rounded-xl bg-emerald-100/90 animate-pulse sm:h-20 sm:w-20" />

      <div className="min-w-0 grow">
        <div className="mb-0.5 h-4 w-2/3 rounded bg-emerald-100/90 animate-pulse sm:h-5" />
        <div className="space-y-1 pt-0.5">
          <div className="h-2.5 w-full rounded bg-emerald-100/90 animate-pulse sm:h-3" />
          <div className="h-2.5 w-5/6 rounded bg-emerald-100/90 animate-pulse sm:h-3" />
        </div>
      </div>
    </div>
  );
}

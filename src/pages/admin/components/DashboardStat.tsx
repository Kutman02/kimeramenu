import type { DashboardStatProps } from '../types';

export function DashboardStat({ label, value, hint }: DashboardStatProps) {
  return (
    <article className="rounded-2xl border border-white/20 bg-white/10 p-4 backdrop-blur-sm">
      <p className="text-xs uppercase tracking-[0.16em] text-slate-200">{label}</p>
      <p className="mt-2 text-2xl font-semibold text-white">{value}</p>
      {hint && <p className="mt-1 text-xs text-slate-200">{hint}</p>}
    </article>
  );
}

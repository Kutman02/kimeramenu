import type { AdminSectionId, AdminSectionMeta } from '../types';

interface AdminOverviewSectionProps {
  sections: AdminSectionMeta[];
  onSectionSelect: (sectionId: AdminSectionId) => void;
}

export function AdminOverviewSection({ sections, onSectionSelect }: AdminOverviewSectionProps) {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <h2 className="text-lg font-semibold text-slate-900">Разделы админки</h2>
      <p className="mt-1 text-sm text-slate-500">
        Выберите экран как в профессиональной CMS: профиль, категории, товары или данные.
      </p>
      <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
        {sections
          .filter((section) => section.id !== 'overview')
          .map((section) => (
            <article
              key={section.id}
              className="rounded-xl border border-slate-200 bg-slate-50 p-4 transition hover:border-slate-300"
            >
              <h3 className="text-base font-semibold text-slate-900">{section.label}</h3>
              <p className="mt-1 text-sm text-slate-600">{section.hint}</p>
              <button
                type="button"
                onClick={() => onSectionSelect(section.id)}
                className="mt-3 rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50"
              >
                Открыть раздел
              </button>
            </article>
          ))}
      </div>
    </section>
  );
}

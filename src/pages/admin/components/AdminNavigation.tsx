import type { AdminSectionId, AdminSectionMeta } from '../types';

interface AdminSectionButtonsProps {
  sections: AdminSectionMeta[];
  activeSection: AdminSectionId;
  onSectionSelect: (sectionId: AdminSectionId) => void;
}

function AdminSectionButtons({ sections, activeSection, onSectionSelect }: AdminSectionButtonsProps) {
  return (
    <div className="space-y-1.5">
      {sections.map((section) => {
        const isActive = section.id === activeSection;
        return (
          <button
            key={section.id}
            type="button"
            onClick={() => onSectionSelect(section.id)}
            className={`w-full rounded-xl border px-3 py-2.5 text-left transition ${
              isActive
                ? 'border-slate-900 bg-slate-900 text-white'
                : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
            }`}
          >
            <p className="text-sm font-semibold">{section.label}</p>
            <p className={`mt-0.5 text-xs ${isActive ? 'text-slate-200' : 'text-slate-500'}`}>
              {section.hint}
            </p>
          </button>
        );
      })}
    </div>
  );
}

interface AdminNavigationProps {
  sections: AdminSectionMeta[];
  activeSection: AdminSectionId;
  isNavOpen: boolean;
  onCloseNav: () => void;
  onSectionSelect: (sectionId: AdminSectionId) => void;
}

export function AdminNavigation({
  sections,
  activeSection,
  isNavOpen,
  onCloseNav,
  onSectionSelect,
}: AdminNavigationProps) {
  return (
    <>
      {isNavOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <button
            type="button"
            aria-label="Close navigation"
            onClick={onCloseNav}
            className="absolute inset-0 bg-slate-950/60"
          />
          <aside className="absolute left-0 top-0 h-full w-[84%] max-w-xs border-r border-slate-200 bg-white p-4 shadow-xl">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-semibold text-slate-900">Разделы админки</h2>
              <button
                type="button"
                onClick={onCloseNav}
                className="rounded-lg border border-slate-300 px-2.5 py-1.5 text-sm text-slate-700"
              >
                Закрыть
              </button>
            </div>
            <div className="mt-4">
              <AdminSectionButtons
                sections={sections}
                activeSection={activeSection}
                onSectionSelect={onSectionSelect}
              />
            </div>
          </aside>
        </div>
      )}

      <aside className="hidden w-72 shrink-0 lg:block">
        <section className="sticky top-6 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <h2 className="text-base font-semibold text-slate-900">Навигация</h2>
          <p className="mt-1 text-xs text-slate-500">Откройте нужный экран админ-панели.</p>
          <div className="mt-4">
            <AdminSectionButtons
              sections={sections}
              activeSection={activeSection}
              onSectionSelect={onSectionSelect}
            />
          </div>

          <div className="mt-5 rounded-xl border border-slate-200 bg-slate-50 p-3">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-700">Dev режим</p>
            <p className="mt-1 text-xs text-slate-600">Изменения применяются после нажатия кнопки «Сохранить».</p>
          </div>
        </section>
      </aside>
    </>
  );
}

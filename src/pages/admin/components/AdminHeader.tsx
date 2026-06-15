import type { AdminSectionId, AdminSectionMeta } from '../types';
import { DashboardStat } from './DashboardStat';

interface AdminHeaderProps {
  activeSectionMeta: AdminSectionMeta;
  activeSection: AdminSectionId;
  canEdit: boolean;
  hasCategories: boolean;
  activeCategoryLabel: string | null;
  categoriesCount: number;
  totalItems: number;
  availableItems: number;
  hiddenItems: number;
  onToggleNav: () => void;
  onOpenCreateCategory: () => void;
  onOpenCreateItem: () => void;
}

export function AdminHeader({
  activeSectionMeta,
  activeSection,
  canEdit,
  hasCategories,
  activeCategoryLabel,
  categoriesCount,
  totalItems,
  availableItems,
  hiddenItems,
  onToggleNav,
  onOpenCreateCategory,
  onOpenCreateItem,
}: AdminHeaderProps) {
  return (
    <section className="rounded-3xl bg-linear-to-br from-slate-900 via-slate-800 to-indigo-900 p-6 text-white shadow-xl">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="flex items-start gap-3">
          <button
            type="button"
            onClick={onToggleNav}
            className="mt-0.5 inline-flex h-10 w-10 items-center justify-center rounded-lg border border-white/25 bg-white/10 lg:hidden"
            aria-label="Toggle navigation"
          >
            <span className="text-lg leading-none text-white">☰</span>
          </button>

          <div>
            <span className="inline-flex rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs uppercase tracking-[0.14em] text-slate-100">
              Professional Admin Flow
            </span>
            <h1 className="mt-3 text-3xl font-bold tracking-tight">Админ-панель меню</h1>
            <p className="mt-2 max-w-2xl text-sm text-slate-200">
              Сейчас открыт раздел: <span className="font-semibold">{activeSectionMeta.label}</span>.{' '}
              {activeSectionMeta.hint}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          <a
            href="/"
            className="rounded-lg border border-white/25 bg-white/10 px-4 py-2 text-sm font-medium text-white hover:bg-white/20"
          >
            Открыть гостевое меню
          </a>
          {activeSection === 'categories' && (
            <button
              type="button"
              disabled={!canEdit}
              onClick={onOpenCreateCategory}
              className="rounded-lg border border-transparent bg-white px-4 py-2 text-sm font-semibold text-slate-900 hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-60"
            >
              + Категория
            </button>
          )}
          {activeSection === 'items' && (
            <button
              type="button"
              disabled={!canEdit || !hasCategories}
              onClick={onOpenCreateItem}
              className="rounded-lg border border-transparent bg-white px-4 py-2 text-sm font-semibold text-slate-900 hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-60"
            >
              + Товар
            </button>
          )}
        </div>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <DashboardStat
          label="Категорий"
          value={categoriesCount}
          hint={activeCategoryLabel ? `Активная: ${activeCategoryLabel}` : 'Выберите категорию'}
        />
        <DashboardStat label="Товаров всего" value={totalItems} />
        <DashboardStat label="Доступных" value={availableItems} hint="Показываются гостям" />
        <DashboardStat label="Скрытых позиций" value={hiddenItems} hint="Недоступны для гостей" />
      </div>
    </section>
  );
}

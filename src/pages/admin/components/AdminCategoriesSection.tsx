import type { Language, MenuCategory, RestaurantConfig } from '../../../types/menu';

interface AdminCategoriesSectionProps {
  restaurant: RestaurantConfig;
  activeCategory: MenuCategory | null;
  supportedLanguages: Language[];
  canEdit: boolean;
  isSaving: boolean;
  onOpenCreateCategory: () => void;
  onOpenEditCategory: () => void;
  onSave: () => void;
  onDeleteActiveCategory: () => void;
  onSetActiveCategoryId: (categoryId: string) => void;
  onOpenItemsForCategory: (categoryId: string) => void;
  getCategoryLabel: (category: MenuCategory) => string;
}

export function AdminCategoriesSection({
  restaurant,
  activeCategory,
  supportedLanguages,
  canEdit,
  isSaving,
  onOpenCreateCategory,
  onOpenEditCategory,
  onSave,
  onDeleteActiveCategory,
  onSetActiveCategoryId,
  onOpenItemsForCategory,
  getCategoryLabel,
}: AdminCategoriesSectionProps) {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold text-slate-900">Категории</h2>
          <p className="text-sm text-slate-500">
            Добавляйте, редактируйте и удаляйте категории на отдельном экране.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            disabled={!canEdit}
            onClick={onOpenCreateCategory}
            className="rounded-lg bg-slate-900 px-3 py-2 text-sm font-semibold text-white hover:bg-slate-700 disabled:cursor-not-allowed disabled:bg-slate-300"
          >
            + Добавить категорию
          </button>
          <button
            type="button"
            disabled={!canEdit || !activeCategory}
            onClick={onOpenEditCategory}
            className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-50"
          >
            Изменить категорию
          </button>
          <button
            type="button"
            onClick={onSave}
            disabled={!canEdit || isSaving}
            className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:bg-slate-100"
          >
            {isSaving ? 'Сохраняем...' : 'Сохранить изменения'}
          </button>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-[320px_minmax(0,1fr)]">
        <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
          {restaurant.categories.length ? (
            <div className="max-h-[520px] space-y-2 overflow-y-auto pr-1">
              {restaurant.categories.map((category) => {
                const isActive = category.id === activeCategory?.id;

                return (
                  <button
                    key={category.id}
                    type="button"
                    onClick={() => onSetActiveCategoryId(category.id)}
                    className={`w-full rounded-xl border px-3 py-3 text-left transition ${
                      isActive
                        ? 'border-slate-900 bg-slate-900 text-white'
                        : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <p className="line-clamp-1 text-sm font-semibold">
                        {category.icon ? `${category.icon} ` : ''}
                        {getCategoryLabel(category)}
                      </p>
                      <span
                        className={`rounded-full px-2 py-0.5 text-xs ${
                          isActive ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-700'
                        }`}
                      >
                        {category.items.length}
                      </span>
                    </div>
                    <p className={`mt-1 text-xs ${isActive ? 'text-slate-200' : 'text-slate-500'}`}>
                      ID: {category.id}
                    </p>
                  </button>
                );
              })}
            </div>
          ) : (
            <div className="rounded-xl border border-dashed border-slate-300 bg-white p-5 text-center text-sm text-slate-500">
              Нет категорий. Создайте первую.
            </div>
          )}
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-4">
          {activeCategory ? (
            <>
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div>
                  <h3 className="text-base font-semibold text-slate-900">{getCategoryLabel(activeCategory)}</h3>
                  <p className="text-xs text-slate-500">Подробности выбранной категории</p>
                </div>
                <button
                  type="button"
                  disabled={!canEdit || restaurant.categories.length <= 1}
                  onClick={onDeleteActiveCategory}
                  className="rounded-lg border border-red-200 bg-red-50 px-3 py-1.5 text-xs font-semibold text-red-700 disabled:opacity-50"
                >
                  Удалить категорию
                </button>
              </div>

              <div className="mt-3 space-y-2 text-sm text-slate-600">
                <p>
                  <span className="font-medium text-slate-900">ID:</span> {activeCategory.id}
                </p>
                <p>
                  <span className="font-medium text-slate-900">Оригинал:</span> {activeCategory.name}
                </p>
                <p>
                  <span className="font-medium text-slate-900">Иконка:</span> {activeCategory.icon || '—'}
                </p>
                <p>
                  <span className="font-medium text-slate-900">Группа:</span>{' '}
                  {activeCategory.group || 'your_selections'}
                </p>
                <p>
                  <span className="font-medium text-slate-900">Скрыта:</span> {activeCategory.hidden ? 'Да' : 'Нет'}
                </p>
                <p>
                  <span className="font-medium text-slate-900">Комплимент:</span>{' '}
                  {activeCategory.isComplimentary ? 'Да' : 'Нет'}
                </p>
                {supportedLanguages.map((lang) => (
                  <p key={lang}>
                    <span className="font-medium text-slate-900">{lang.toUpperCase()}:</span>{' '}
                    {activeCategory.displayName[lang] || '—'}
                  </p>
                ))}
              </div>

              <div className="mt-4 flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={onOpenEditCategory}
                  disabled={!canEdit}
                  className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-50"
                >
                  Редактировать
                </button>
                <button
                  type="button"
                  onClick={() => onOpenItemsForCategory(activeCategory.id)}
                  className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                >
                  Открыть товары категории
                </button>
              </div>
            </>
          ) : (
            <div className="rounded-xl border border-dashed border-slate-300 p-8 text-center text-sm text-slate-500">
              Выберите категорию слева, чтобы увидеть детали.
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

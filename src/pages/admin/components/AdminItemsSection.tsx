import type { MenuCategory } from '../../../types/menu';
import { ALL_CATEGORIES_VALUE } from '../constants';
import type { ItemListEntry } from '../types';
import { FALLBACK_DISH_IMAGE } from '../utils';

interface AdminItemsSectionProps {
  categories: MenuCategory[];
  itemsCategory: MenuCategory | null;
  itemsCategoryId: string;
  itemSearch: string;
  filteredItems: ItemListEntry[];
  canEdit: boolean;
  isSaving: boolean;
  onItemsCategoryChange: (categoryId: string) => void;
  onItemSearchChange: (value: string) => void;
  onOpenCreateItem: () => void;
  onSave: () => void;
  onOpenEditItem: (categoryIndex: number, itemIndex: number) => void;
  onDeleteItem: (categoryIndex: number, itemIndex: number) => void;
  getCategoryLabel: (category: MenuCategory) => string;
  getItemDescription: (item: ItemListEntry['item']) => string;
}

export function AdminItemsSection({
  categories,
  itemsCategory,
  itemsCategoryId,
  itemSearch,
  filteredItems,
  canEdit,
  isSaving,
  onItemsCategoryChange,
  onItemSearchChange,
  onOpenCreateItem,
  onSave,
  onOpenEditItem,
  onDeleteItem,
  getCategoryLabel,
  getItemDescription,
}: AdminItemsSectionProps) {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold text-slate-900">
            {itemsCategory ? `Товары: ${getCategoryLabel(itemsCategory)}` : 'Товары: все категории'}
          </h2>
          <p className="text-sm text-slate-500">
            Здесь видны все позиции из JSON. Можно фильтровать по категории и редактировать прямо из общего списка.
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <select
            value={itemsCategoryId}
            onChange={(e) => onItemsCategoryChange(e.target.value)}
            className="h-10 rounded-lg border border-slate-300 bg-white px-3 text-sm outline-none focus:border-slate-500"
          >
            <option value={ALL_CATEGORIES_VALUE}>Все категории</option>
            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {getCategoryLabel(category)}
              </option>
            ))}
          </select>
          <input
            value={itemSearch}
            onChange={(e) => onItemSearchChange(e.target.value)}
            placeholder="Поиск по ID, названию, описанию, категории..."
            className="h-10 w-64 rounded-lg border border-slate-300 px-3 text-sm outline-none focus:border-slate-500 disabled:bg-slate-100"
          />
          <button
            type="button"
            disabled={!canEdit || !categories.length}
            onClick={onOpenCreateItem}
            className="h-10 rounded-lg bg-slate-900 px-4 text-sm font-semibold text-white hover:bg-slate-700 disabled:cursor-not-allowed disabled:bg-slate-300"
          >
            + Добавить товар
          </button>
          <button
            type="button"
            onClick={onSave}
            disabled={!canEdit || isSaving}
            className="h-10 rounded-lg border border-slate-300 bg-white px-4 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:bg-slate-100"
          >
            {isSaving ? 'Сохраняем...' : 'Сохранить'}
          </button>
        </div>
      </div>

      {filteredItems.length ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {filteredItems.map(({ item, itemIndex, category, categoryIndex }) => (
            <article
              key={`${category.id}:${item.id}`}
              className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
            >
              <div className="relative h-44 bg-slate-100">
                <img
                  src={item.image || FALLBACK_DISH_IMAGE}
                  alt={item.name || item.id}
                  className="h-full w-full object-cover"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = FALLBACK_DISH_IMAGE;
                  }}
                />
                <div className="absolute inset-x-0 bottom-0 bg-linear-to-t from-black/65 to-transparent px-3 py-2">
                  <div className="flex flex-wrap gap-1">
                    {!item.available && (
                      <span className="rounded-full bg-red-500/90 px-2 py-0.5 text-xs font-semibold text-white">
                        Скрыт
                      </span>
                    )}
                    {item.isComplimentary && (
                      <span className="rounded-full bg-emerald-500/90 px-2 py-0.5 text-xs font-semibold text-white">
                        Комплимент
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <div className="space-y-3 p-4">
                <h3 className="line-clamp-1 text-base font-semibold text-slate-900">
                  {item.name || 'Без названия'}
                </h3>

                <p className="line-clamp-2 text-sm text-slate-600">{getItemDescription(item)}</p>

                <div className="flex flex-wrap gap-1.5 text-xs text-slate-500">
                  <span className="rounded-full bg-slate-100 px-2 py-1">ID: {item.id}</span>
                  <span className="rounded-full bg-indigo-50 px-2 py-1 text-indigo-700">
                    {getCategoryLabel(category)}
                  </span>
                  <span className="rounded-full bg-slate-100 px-2 py-1">Цена: {item.price ?? 0}</span>
                  {item.vegetarian && (
                    <span className="rounded-full bg-lime-100 px-2 py-1 text-lime-800">Vegetarian</span>
                  )}
                  {item.vegan && (
                    <span className="rounded-full bg-green-100 px-2 py-1 text-green-800">Vegan</span>
                  )}
                </div>

                <div className="flex gap-2">
                  <button
                    type="button"
                    disabled={!canEdit}
                    onClick={() => onOpenEditItem(categoryIndex, itemIndex)}
                    className="flex-1 rounded-lg bg-slate-900 px-3 py-2 text-xs font-semibold text-white hover:bg-slate-700 disabled:cursor-not-allowed disabled:bg-slate-300"
                  >
                    Редактировать
                  </button>
                  <button
                    type="button"
                    disabled={!canEdit}
                    onClick={() => onDeleteItem(categoryIndex, itemIndex)}
                    className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs font-semibold text-red-700 hover:bg-red-100 disabled:opacity-50"
                  >
                    Удалить
                  </button>
                </div>
              </div>
            </article>
          ))}
        </div>
      ) : (
        <div className="rounded-xl border border-dashed border-slate-300 p-10 text-center text-sm text-slate-500">
          {itemSearch
            ? 'По запросу ничего не найдено.'
            : itemsCategory
              ? 'В выбранной категории пока нет товаров.'
              : 'В меню пока нет товаров.'}
        </div>
      )}
    </section>
  );
}

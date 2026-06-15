import type { ChangeEvent } from 'react';
import type { Language, MenuCategory, MenuItem, RestaurantConfig } from '../../../types/menu';
import type { ItemEditorState } from '../types';
import { FALLBACK_DISH_IMAGE } from '../utils';

interface ItemEditorModalProps {
  editor: ItemEditorState;
  restaurant: RestaurantConfig;
  canEdit: boolean;
  supportedLanguages: Language[];
  onClose: () => void;
  onPatchDraft: (patch: Partial<MenuItem>) => void;
  onSetItemDescription: (lang: Language, value: string) => void;
  onToggleItemAllergen: (allergenId: string) => void;
  onSetIncludedItemIdsFromText: (value: string) => void;
  onUploadImage: (e: ChangeEvent<HTMLInputElement>) => void;
  onSave: () => void;
  getCategoryLabel: (category: MenuCategory) => string;
}

export function ItemEditorModal({
  editor,
  restaurant,
  canEdit,
  supportedLanguages,
  onClose,
  onPatchDraft,
  onSetItemDescription,
  onToggleItemAllergen,
  onSetIncludedItemIdsFromText,
  onUploadImage,
  onSave,
  getCategoryLabel,
}: ItemEditorModalProps) {
  if (!editor) return null;

  const currentCategory = restaurant.categories[editor.categoryIndex];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <button
        type="button"
        aria-label="Close item editor"
        onClick={onClose}
        className="absolute inset-0 bg-slate-950/65"
      />

      <div className="relative z-10 max-h-[92vh] w-full max-w-4xl overflow-y-auto rounded-2xl bg-white p-6 shadow-2xl">
        <div className="mb-5 flex flex-wrap items-start justify-between gap-3">
          <div>
            <h2 className="text-xl font-semibold text-slate-900">
              {editor.mode === 'create' ? 'Создание товара' : 'Редактирование товара'}
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              Категория: {currentCategory ? getCategoryLabel(currentCategory) : 'Не найдена'}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-slate-300 px-3 py-1.5 text-sm text-slate-700 hover:bg-slate-50"
          >
            Закрыть
          </button>
        </div>

        <div className="grid grid-cols-1 gap-5 lg:grid-cols-[280px_minmax(0,1fr)]">
          <section className="space-y-3">
            <div className="overflow-hidden rounded-2xl border border-slate-200 bg-slate-50">
              <img
                src={editor.draft.image || FALLBACK_DISH_IMAGE}
                alt={editor.draft.name || 'Preview'}
                className="h-56 w-full object-cover"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = FALLBACK_DISH_IMAGE;
                }}
              />
            </div>

            <label className="block text-sm">
              <span className="mb-1 block font-medium text-slate-700">URL изображения</span>
              <input
                value={editor.draft.image}
                disabled={!canEdit}
                onChange={(e) => onPatchDraft({ image: e.target.value })}
                className="h-10 w-full rounded-lg border border-slate-300 px-3 outline-none focus:border-slate-500 disabled:bg-slate-100"
              />
            </label>

            <label className="block text-sm">
              <span className="mb-1 block font-medium text-slate-700">Загрузить файл</span>
              <input
                type="file"
                accept="image/*"
                disabled={!canEdit}
                onChange={onUploadImage}
                className="block w-full rounded-lg border border-slate-300 bg-white p-2 text-sm disabled:bg-slate-100"
              />
            </label>
          </section>

          <section className="space-y-4">
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
              <label className="text-sm">
                <span className="mb-1 block font-medium text-slate-700">ID товара</span>
                <input
                  value={editor.draft.id}
                  disabled={!canEdit}
                  onChange={(e) => onPatchDraft({ id: e.target.value })}
                  className="h-10 w-full rounded-lg border border-slate-300 px-3 outline-none focus:border-slate-500 disabled:bg-slate-100"
                />
              </label>

              <label className="text-sm">
                <span className="mb-1 block font-medium text-slate-700">Название</span>
                <input
                  value={editor.draft.name}
                  disabled={!canEdit}
                  onChange={(e) => onPatchDraft({ name: e.target.value })}
                  className="h-10 w-full rounded-lg border border-slate-300 px-3 outline-none focus:border-slate-500 disabled:bg-slate-100"
                />
              </label>

              <label className="text-sm">
                <span className="mb-1 block font-medium text-slate-700">Цена</span>
                <input
                  type="number"
                  min={0}
                  step="0.01"
                  value={editor.draft.price ?? 0}
                  disabled={!canEdit}
                  onChange={(e) => onPatchDraft({ price: Number(e.target.value) || 0 })}
                  className="h-10 w-full rounded-lg border border-slate-300 px-3 outline-none focus:border-slate-500 disabled:bg-slate-100"
                />
              </label>
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
              <label className="text-sm">
                <span className="mb-1 block font-medium text-slate-700">Порция</span>
                <input
                  value={editor.draft.portion ?? ''}
                  disabled={!canEdit}
                  onChange={(e) => onPatchDraft({ portion: e.target.value })}
                  placeholder="Например: 300g"
                  className="h-10 w-full rounded-lg border border-slate-300 px-3 outline-none focus:border-slate-500 disabled:bg-slate-100"
                />
              </label>
              <label className="text-sm">
                <span className="mb-1 block font-medium text-slate-700">Калории</span>
                <input
                  type="number"
                  min={0}
                  value={editor.draft.calories ?? 0}
                  disabled={!canEdit}
                  onChange={(e) => onPatchDraft({ calories: Number(e.target.value) || 0 })}
                  className="h-10 w-full rounded-lg border border-slate-300 px-3 outline-none focus:border-slate-500 disabled:bg-slate-100"
                />
              </label>
              <label className="text-sm">
                <span className="mb-1 block font-medium text-slate-700">Острота (0-5)</span>
                <input
                  type="number"
                  min={0}
                  max={5}
                  value={editor.draft.spicy ?? 0}
                  disabled={!canEdit}
                  onChange={(e) =>
                    onPatchDraft({
                      spicy: Math.max(0, Math.min(5, Number(e.target.value) || 0)),
                    })
                  }
                  className="h-10 w-full rounded-lg border border-slate-300 px-3 outline-none focus:border-slate-500 disabled:bg-slate-100"
                />
              </label>
            </div>

            <div className="flex flex-wrap gap-4 rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={editor.draft.available}
                  disabled={!canEdit}
                  onChange={(e) => onPatchDraft({ available: e.target.checked })}
                />
                Доступен
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={Boolean(editor.draft.vegetarian)}
                  disabled={!canEdit}
                  onChange={(e) => onPatchDraft({ vegetarian: e.target.checked })}
                />
                Vegetarian
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={Boolean(editor.draft.vegan)}
                  disabled={!canEdit}
                  onChange={(e) => onPatchDraft({ vegan: e.target.checked })}
                />
                Vegan
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={Boolean(editor.draft.isComplimentary)}
                  disabled={!canEdit}
                  onChange={(e) => onPatchDraft({ isComplimentary: e.target.checked })}
                />
                Комплимент
              </label>
            </div>

            <label className="block text-sm">
              <span className="mb-1 block font-medium text-slate-700">includedItemIds (через запятую)</span>
              <input
                value={(editor.draft.includedItemIds ?? []).join(', ')}
                disabled={!canEdit}
                onChange={(e) => onSetIncludedItemIdsFromText(e.target.value)}
                placeholder="item_a, item_b, item_c"
                className="h-10 w-full rounded-lg border border-slate-300 px-3 outline-none focus:border-slate-500 disabled:bg-slate-100"
              />
            </label>

            <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
              <p className="mb-2 text-sm font-medium text-slate-700">Аллергены</p>
              {restaurant.allergens.length ? (
                <div className="flex flex-wrap gap-2">
                  {restaurant.allergens.map((allergen) => {
                    const checked = (editor.draft.allergens ?? []).includes(allergen.id);

                    return (
                      <label
                        key={allergen.id}
                        className={`inline-flex cursor-pointer items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs ${
                          checked
                            ? 'border-slate-900 bg-slate-900 text-white'
                            : 'border-slate-300 bg-white text-slate-700'
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={checked}
                          disabled={!canEdit}
                          onChange={() => onToggleItemAllergen(allergen.id)}
                          className="sr-only"
                        />
                        <span>{allergen.icon ?? '•'}</span>
                        <span>{allergen.name}</span>
                      </label>
                    );
                  })}
                </div>
              ) : (
                <p className="text-xs text-slate-500">В ресторане не настроены аллергены.</p>
              )}
            </div>

            <div className="grid grid-cols-1 gap-3">
              {supportedLanguages.map((lang) => (
                <label key={lang} className="text-sm">
                  <span className="mb-1 block font-medium text-slate-700">Описание {lang.toUpperCase()}</span>
                  <textarea
                    value={editor.draft.description[lang] ?? ''}
                    disabled={!canEdit}
                    onChange={(e) => onSetItemDescription(lang, e.target.value)}
                    className="h-24 w-full rounded-lg border border-slate-300 p-2 outline-none focus:border-slate-500 disabled:bg-slate-100"
                  />
                </label>
              ))}
            </div>
          </section>
        </div>

        <div className="mt-6 flex flex-wrap justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
          >
            Отмена
          </button>
          <button
            type="button"
            disabled={!canEdit}
            onClick={onSave}
            className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-700 disabled:cursor-not-allowed disabled:bg-slate-300"
          >
            {editor.mode === 'create' ? 'Создать товар' : 'Сохранить товар'}
          </button>
        </div>
      </div>
    </div>
  );
}

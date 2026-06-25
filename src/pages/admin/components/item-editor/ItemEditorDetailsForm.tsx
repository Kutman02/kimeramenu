import type { Language, MenuItem, RestaurantConfig } from '../../../../types/menu';

interface ItemEditorDetailsFormProps {
  draft: MenuItem;
  restaurant: RestaurantConfig;
  canEdit: boolean;
  supportedLanguages: Language[];
  onPatchDraft: (patch: Partial<MenuItem>) => void;
  onSetItemDescription: (lang: Language, value: string) => void;
  onToggleItemAllergen: (allergenId: string) => void;
  onSetIncludedItemIdsFromText: (value: string) => void;
}

function ItemFlags({
  draft,
  canEdit,
  onPatchDraft,
}: Pick<ItemEditorDetailsFormProps, 'draft' | 'canEdit' | 'onPatchDraft'>) {
  return (
    <div className="flex flex-wrap gap-4 rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm">
      <label className="flex items-center gap-2">
        <input
          type="checkbox"
          checked={draft.available}
          disabled={!canEdit}
          onChange={(e) => onPatchDraft({ available: e.target.checked })}
        />
        Доступен
      </label>
      <label className="flex items-center gap-2">
        <input
          type="checkbox"
          checked={Boolean(draft.vegetarian)}
          disabled={!canEdit}
          onChange={(e) => onPatchDraft({ vegetarian: e.target.checked })}
        />
        Vegetarian
      </label>
      <label className="flex items-center gap-2">
        <input
          type="checkbox"
          checked={Boolean(draft.vegan)}
          disabled={!canEdit}
          onChange={(e) => onPatchDraft({ vegan: e.target.checked })}
        />
        Vegan
      </label>
      <label className="flex items-center gap-2">
        <input
          type="checkbox"
          checked={Boolean(draft.isComplimentary)}
          disabled={!canEdit}
          onChange={(e) => onPatchDraft({ isComplimentary: e.target.checked })}
        />
        Комплимент
      </label>
    </div>
  );
}

function ItemAllergens({
  draft,
  restaurant,
  canEdit,
  onToggleItemAllergen,
}: Pick<ItemEditorDetailsFormProps, 'draft' | 'restaurant' | 'canEdit' | 'onToggleItemAllergen'>) {
  return (
    <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
      <p className="mb-2 text-sm font-medium text-slate-700">Аллергены</p>
      {restaurant.allergens.length ? (
        <div className="flex flex-wrap gap-2">
          {restaurant.allergens.map((allergen) => {
            const checked = (draft.allergens ?? []).includes(allergen.id);

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
  );
}

function ItemDescriptions({
  draft,
  supportedLanguages,
  canEdit,
  onSetItemDescription,
}: Pick<ItemEditorDetailsFormProps, 'draft' | 'supportedLanguages' | 'canEdit' | 'onSetItemDescription'>) {
  return (
    <div className="grid grid-cols-1 gap-3">
      {supportedLanguages.map((lang) => (
        <label key={lang} className="text-sm">
          <span className="mb-1 block font-medium text-slate-700">Описание {lang.toUpperCase()}</span>
          <textarea
            value={draft.description[lang] ?? ''}
            disabled={!canEdit}
            onChange={(e) => onSetItemDescription(lang, e.target.value)}
            className="h-24 w-full rounded-lg border border-slate-300 p-2 outline-none focus:border-slate-500 disabled:bg-slate-100"
          />
        </label>
      ))}
    </div>
  );
}

export function ItemEditorDetailsForm({
  draft,
  restaurant,
  canEdit,
  supportedLanguages,
  onPatchDraft,
  onSetItemDescription,
  onToggleItemAllergen,
  onSetIncludedItemIdsFromText,
}: ItemEditorDetailsFormProps) {
  return (
    <section className="space-y-4">
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <label className="text-sm">
          <span className="mb-1 block font-medium text-slate-700">ID товара</span>
          <input
            value={draft.id}
            disabled={!canEdit}
            onChange={(e) => onPatchDraft({ id: e.target.value })}
            className="h-10 w-full rounded-lg border border-slate-300 px-3 outline-none focus:border-slate-500 disabled:bg-slate-100"
          />
        </label>

        <label className="text-sm">
          <span className="mb-1 block font-medium text-slate-700">Название</span>
          <input
            value={draft.name}
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
            value={draft.price ?? 0}
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
            value={draft.portion ?? ''}
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
            value={draft.calories ?? 0}
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
            value={draft.spicy ?? 0}
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

      <ItemFlags draft={draft} canEdit={canEdit} onPatchDraft={onPatchDraft} />

      <label className="block text-sm">
        <span className="mb-1 block font-medium text-slate-700">includedItemIds (через запятую)</span>
        <input
          value={(draft.includedItemIds ?? []).join(', ')}
          disabled={!canEdit}
          onChange={(e) => onSetIncludedItemIdsFromText(e.target.value)}
          placeholder="item_a, item_b, item_c"
          className="h-10 w-full rounded-lg border border-slate-300 px-3 outline-none focus:border-slate-500 disabled:bg-slate-100"
        />
      </label>

      <ItemAllergens
        draft={draft}
        restaurant={restaurant}
        canEdit={canEdit}
        onToggleItemAllergen={onToggleItemAllergen}
      />

      <ItemDescriptions
        draft={draft}
        supportedLanguages={supportedLanguages}
        canEdit={canEdit}
        onSetItemDescription={onSetItemDescription}
      />
    </section>
  );
}

import type { Language, RestaurantConfig } from '../../../types/menu';

interface AdminProfileSectionProps {
  restaurant: RestaurantConfig;
  supportedLanguages: Language[];
  canEdit: boolean;
  isSaving: boolean;
  onSave: () => void;
  onRestaurantChange: (updater: (prev: RestaurantConfig) => RestaurantConfig) => void;
}

export function AdminProfileSection({
  restaurant,
  supportedLanguages,
  canEdit,
  isSaving,
  onSave,
  onRestaurantChange,
}: AdminProfileSectionProps) {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold text-slate-900">Профиль ресторана</h2>
          <p className="mt-1 text-sm text-slate-500">
            Основные параметры бренда и контакты, которые видит клиент.
          </p>
        </div>
        <button
          type="button"
          onClick={onSave}
          disabled={!canEdit || isSaving}
          className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-700 disabled:cursor-not-allowed disabled:bg-slate-300"
        >
          {isSaving ? 'Сохраняем...' : 'Сохранить профиль'}
        </button>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        <label className="text-sm">
          <span className="mb-1 block font-medium text-slate-700">Название ресторана</span>
          <input
            value={restaurant.name}
            disabled={!canEdit}
            onChange={(e) => onRestaurantChange((prev) => ({ ...prev, name: e.target.value }))}
            className="h-10 w-full rounded-lg border border-slate-300 px-3 outline-none focus:border-slate-500 disabled:bg-slate-100"
          />
        </label>

        <label className="text-sm">
          <span className="mb-1 block font-medium text-slate-700">Телефон</span>
          <input
            value={restaurant.phone ?? ''}
            disabled={!canEdit}
            onChange={(e) => onRestaurantChange((prev) => ({ ...prev, phone: e.target.value }))}
            className="h-10 w-full rounded-lg border border-slate-300 px-3 outline-none focus:border-slate-500 disabled:bg-slate-100"
          />
        </label>

        <label className="text-sm">
          <span className="mb-1 block font-medium text-slate-700">Email</span>
          <input
            value={restaurant.email ?? ''}
            disabled={!canEdit}
            onChange={(e) => onRestaurantChange((prev) => ({ ...prev, email: e.target.value }))}
            className="h-10 w-full rounded-lg border border-slate-300 px-3 outline-none focus:border-slate-500 disabled:bg-slate-100"
          />
        </label>

        <label className="text-sm">
          <span className="mb-1 block font-medium text-slate-700">Сайт</span>
          <input
            value={restaurant.website ?? ''}
            disabled={!canEdit}
            onChange={(e) => onRestaurantChange((prev) => ({ ...prev, website: e.target.value }))}
            className="h-10 w-full rounded-lg border border-slate-300 px-3 outline-none focus:border-slate-500 disabled:bg-slate-100"
          />
        </label>

        <label className="text-sm">
          <span className="mb-1 block font-medium text-slate-700">Язык по умолчанию</span>
          <select
            value={restaurant.settings.defaultLanguage}
            disabled={!canEdit}
            onChange={(e) =>
              onRestaurantChange((prev) => ({
                ...prev,
                settings: {
                  ...prev.settings,
                  defaultLanguage: e.target.value as Language,
                },
              }))
            }
            className="h-10 w-full rounded-lg border border-slate-300 px-3 outline-none focus:border-slate-500 disabled:bg-slate-100"
          >
            {supportedLanguages.map((lang) => (
              <option key={lang} value={lang}>
                {lang.toUpperCase()}
              </option>
            ))}
          </select>
        </label>
      </div>
    </section>
  );
}

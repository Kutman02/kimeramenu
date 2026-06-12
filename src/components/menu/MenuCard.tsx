import type { MenuItem, Language, Allergen } from '../../types/menu';

export interface MenuCardProps {
  item: MenuItem;
  language: Language;
  allergens: Allergen[];
  onClick?: (item: MenuItem) => void;
  isPopular?: boolean;
}

export function MenuCard({
  item,
  language,
  allergens,
  onClick,
  isPopular = false,
}: MenuCardProps) {
  const description = item.description[language] || item.description.en || '';
  const labels = {
    popular: { en: 'Popular', ru: 'Популярное', tr: 'Populer' },
    notAvailable: { en: 'Not Available', ru: 'Недоступно', tr: 'Mevcut Degil' },
    vegetarian: { en: 'Vegetarian', ru: 'Вегетарианское', tr: 'Vejetaryen' },
    vegan: { en: 'Vegan', ru: 'Веганское', tr: 'Vegan' },
    details: { en: 'Details', ru: 'Подробнее', tr: 'Detaylar' },
    allergenHint: { en: 'Contains allergen', ru: 'Содержит аллерген', tr: 'Alerjen icerir' },
  } as const;

  // Get allergen icons
  const allergenIcons = item.allergens
    ?.map((allergenId) => {
      const allergen = allergens.find((a) => a.id === allergenId);
      return allergen?.icon;
    })
    .filter(Boolean) as string[];

  return (
    <div
      onClick={() => onClick?.(item)}
      className={`group relative flex cursor-pointer items-stretch gap-3 rounded-2xl border border-slate-200 bg-white p-3 shadow-sm transition-all duration-200 hover:border-slate-300 hover:shadow-md ${
        isPopular ? 'ring-2 ring-yellow-200 border-yellow-300' : ''
      }`}
    >
      {/* Badge for Popular */}
      {isPopular && (
        <div className="absolute top-3 right-3 z-10 bg-yellow-400 text-yellow-900 px-3 py-1 rounded-full text-xs font-bold">
          ⭐ {labels.popular[language]}
        </div>
      )}

      {/* Image Container */}
      <div className="relative h-24 w-24 shrink-0 overflow-hidden rounded-xl bg-gray-200 sm:h-28 sm:w-28">
        <img
          src={item.image}
          alt={item.name}
          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
          onError={(e) => {
            (e.target as HTMLImageElement).src =
              'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"%3E%3Cpath stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"/%3E%3C/svg%3E';
          }}
        />

        {/* Availability Badge */}
        {!item.available && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/50">
            <span className="px-2 text-center text-xs font-bold text-white">
              {labels.notAvailable[language]}
            </span>
          </div>
        )}

        {/* Dietary Badges */}
        <div className="absolute bottom-1 left-1 flex flex-wrap gap-1">
          {item.vegetarian && (
            <span className="rounded bg-green-500 px-1.5 py-0.5 text-[10px] font-semibold text-white">
              🌱
            </span>
          )}
          {item.vegan && (
            <span className="rounded bg-green-600 px-1.5 py-0.5 text-[10px] font-semibold text-white">
              🌿
            </span>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="min-w-0 grow">
        {/* Name */}
        <h3 className="mb-1 line-clamp-2 text-base font-bold text-slate-900 sm:text-lg">
          {item.name}
        </h3>

        {/* Description */}
        <p className="mb-2 line-clamp-2 text-sm text-slate-600">
          {description}
        </p>

        {/* Info Row: Portion, Calories, Spicy */}
        <div className="mb-2 flex flex-wrap gap-1.5 text-xs text-gray-500">
          {item.portion && (
            <span className="rounded-full bg-gray-100 px-2 py-0.5">📏 {item.portion}</span>
          )}
          {item.calories && (
            <span className="rounded-full bg-gray-100 px-2 py-0.5">🔥 {item.calories} kcal</span>
          )}
          {item.spicy && item.spicy > 0 && (
            <span className="rounded-full bg-red-100 px-2 py-0.5 text-red-700">
              🌶️ {item.spicy}/5
            </span>
          )}
        </div>

        {/* Allergens */}
        {allergenIcons && allergenIcons.length > 0 && (
          <div className="mb-2 flex flex-wrap gap-1.5">
            {allergenIcons.map((icon, idx) => (
              <span key={idx} className="text-lg" title={labels.allergenHint[language]}>
                {icon}
              </span>
            ))}
          </div>
        )}

        {/* No price for QR info mode */}
        <div className="mt-1 flex items-center justify-end">
            {item.available && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onClick?.(item);
                }}
                className="rounded-lg bg-slate-900 px-3 py-1.5 text-xs font-medium text-white transition-colors duration-200 hover:bg-slate-700 sm:text-sm"
              >
                {labels.details[language]}
              </button>
            )}
        </div>
      </div>
    </div>
  );
}

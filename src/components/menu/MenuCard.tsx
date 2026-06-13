import type { MenuItem, Language } from '../../types/menu';
import fallbackDishImage from '../../assets/zag.png';

const FALLBACK_MENU_IMAGE = fallbackDishImage;

export interface MenuCardProps {
  item: MenuItem;
  language: Language;
  onClick?: (item: MenuItem) => void;
  isPopular?: boolean;
}

export function MenuCard({
  item,
  language,
  onClick,
  isPopular = false,
}: MenuCardProps) {
  const description = item.description[language] || item.description.en || '';
  const imageSrc = item.image?.trim() ? item.image : FALLBACK_MENU_IMAGE;
  const labels = {
    popular: { en: 'Popular', ru: 'Популярное', tr: 'Populer' },
    notAvailable: { en: 'Not Available', ru: 'Недоступно', tr: 'Mevcut Degil' },
  } as const;

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
          src={imageSrc}
          alt={item.name}
          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
          onError={(e) => {
            (e.target as HTMLImageElement).src = FALLBACK_MENU_IMAGE;
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

      </div>

      {/* Content */}
      <div className="min-w-0 grow">
        {/* Name */}
        <h3 className="mb-1 line-clamp-2 text-base font-bold text-slate-900 sm:text-lg">
          {item.name}
        </h3>

        {/* Description */}
        <p className="line-clamp-2 text-sm text-slate-600">
          {description}
        </p>
      </div>
    </div>
  );
}

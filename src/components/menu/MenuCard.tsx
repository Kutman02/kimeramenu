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
      className={`group relative flex cursor-pointer items-stretch gap-2 rounded-2xl border border-emerald-100 bg-linear-to-br from-white to-emerald-50/50 p-2 shadow-[0_4px_14px_rgba(16,185,129,0.08)] transition-all duration-220 hover:-translate-y-0.5 hover:border-emerald-300 hover:shadow-[0_10px_24px_rgba(16,185,129,0.14)] active:scale-[0.995] ${
        isPopular ? 'ring-2 ring-emerald-200 border-emerald-300' : ''
      }`}
    >
      {/* Badge for Popular */}
      {isPopular && (
        <div className="absolute top-2 right-2 z-10 rounded-full border border-emerald-300 bg-emerald-100 px-2 py-0.5 text-xs font-bold text-emerald-800">
          ⭐ {labels.popular[language]}
        </div>
      )}

      {/* Image Container */}
      <div className="relative h-[72px] w-[72px] shrink-0 overflow-hidden rounded-xl bg-emerald-100/70 ring-1 ring-emerald-200/80 sm:h-20 sm:w-20">
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
          <div className="absolute inset-0 flex items-center justify-center bg-emerald-950/45">
            <span className="px-2 text-center text-xs font-bold text-white">
              {labels.notAvailable[language]}
            </span>
          </div>
        )}

      </div>

      {/* Content */}
      <div className="min-w-0 grow">
        {/* Name */}
        <h3 className="mb-0.5 line-clamp-2 text-[15px] leading-tight font-bold text-slate-800 transition-colors duration-200 group-hover:text-emerald-900 sm:text-base">
          {item.name}
        </h3>

        {/* Description */}
        <p className="line-clamp-2 text-[13px] leading-snug text-slate-600 sm:text-sm">
          {description}
        </p>
      </div>
    </div>
  );
}

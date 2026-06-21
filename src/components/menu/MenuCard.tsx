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
      className={`group relative flex cursor-pointer items-stretch gap-1.5 rounded-2xl border border-emerald-200/70 bg-linear-to-br from-white via-emerald-50/70 to-emerald-100/60 p-1.5 shadow-[0_6px_16px_rgba(6,78,59,0.10)] transition-all duration-220 hover:-translate-y-0.5 hover:border-emerald-300 hover:shadow-[0_12px_24px_rgba(6,78,59,0.16)] active:scale-[0.995] ${
        isPopular ? 'ring-2 ring-emerald-200/90 border-emerald-300' : ''
      }`}
    >
      {/* Badge for Popular */}
      {isPopular && (
        <div className="absolute top-1.5 right-1.5 z-10 rounded-full border border-emerald-700/60 bg-emerald-900 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-emerald-50">
          ⭐ {labels.popular[language]}
        </div>
      )}

      {/* Image Container */}
      <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-xl bg-emerald-100/70 ring-1 ring-emerald-300/70 sm:h-[72px] sm:w-[72px]">
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
        <h3 className="mb-0.5 line-clamp-2 text-[14px] leading-tight font-semibold text-emerald-950 transition-colors duration-200 group-hover:text-emerald-900 sm:text-[15px]">
          {item.name}
        </h3>

        {/* Description */}
        <p className="line-clamp-2 text-[12px] leading-snug text-slate-600 sm:text-[13px]">
          {description}
        </p>
      </div>
    </div>
  );
}

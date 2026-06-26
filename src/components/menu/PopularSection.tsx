import { memo } from 'react';
import { MenuCard } from './MenuCard';
import type { MenuItem, Language } from '../../types/menu';

export interface PopularSectionProps {
  items: MenuItem[];
  language: Language;
  onItemClick?: (item: MenuItem) => void;
}

export const PopularSection = memo(function PopularSection({
  items,
  language,
  onItemClick,
}: PopularSectionProps) {
  if (items.length === 0) return null;
  const labels = {
    title: { en: 'Most Popular', ru: 'Популярные блюда', tr: 'En Populerler' },
    subtitle: {
      en: "Guest favorites you shouldn't miss",
      ru: 'Часто выбирают гости',
      tr: 'Misafirlerin en cok sectigi urunler',
    },
  } as const;

  // Display top 3-4 popular items
  const displayItems = items.slice(0, Math.min(4, items.length));

  return (
    <section className="mb-12 rounded-2xl border border-amber-100 bg-linear-to-r from-yellow-50 to-orange-50 p-6 sm:p-8">
      {/* Section Header */}
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-2">
          <span className="text-4xl">⭐</span>
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-800">
            {labels.title[language]}
          </h2>
        </div>
        <p className="text-sm text-gray-600">
          {labels.subtitle[language]}
        </p>
      </div>

      {/* Popular Items Grid - Mobile First */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {displayItems.map((item) => (
          <MenuCard
            key={item.id}
            item={item}
            language={language}
            onClick={onItemClick}
            isPopular={true}
          />
        ))}
      </div>
    </section>
  );
});

PopularSection.displayName = 'PopularSection';

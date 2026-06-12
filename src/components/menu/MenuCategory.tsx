import { MenuCard } from './MenuCard';
import type { MenuCategory as MenuCategoryType, MenuItem, Language, Allergen } from '../../types/menu';

export interface MenuCategoryProps {
  category: MenuCategoryType;
  language: Language;
  allergens: Allergen[];
  onItemClick?: (item: MenuItem) => void;
}

export function MenuCategory({
  category,
  language,
  allergens,
  onItemClick,
}: MenuCategoryProps) {
  // Filter available items
  const availableItems = category.items.filter((item) => item.available);
  const labels = {
    count: {
      en: (n: number) => `${n} ${n === 1 ? 'dish' : 'dishes'} available`,
      ru: (n: number) => `${n} ${n === 1 ? 'блюдо' : 'блюд'} доступно`,
      tr: (n: number) => `${n} ${n === 1 ? 'urun' : 'urun'} mevcut`,
    },
    empty: {
      en: 'No dishes available in this category',
      ru: 'В этой категории пока нет доступных блюд',
      tr: 'Bu kategoride su an urun yok',
    },
  } as const;

  return (
    <section id={`cat-${category.id}`} className="mb-10 scroll-mt-24 sm:scroll-mt-28 sm:mb-12">
      {/* Category Header */}
      <div className="mb-4">
        <div className="flex items-center gap-3 mb-2">
          {category.icon && <span className="text-4xl">{category.icon}</span>}
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-800">
            {category.displayName[language] || category.displayName.en}
          </h2>
        </div>
        <p className="text-sm text-gray-500">{labels.count[language](availableItems.length)}</p>
      </div>

      {/* Compact list for faster scanning */}
      <div className="space-y-3">
        {availableItems.map((item) => (
          <MenuCard
            key={item.id}
            item={item}
            language={language}
            allergens={allergens}
            onClick={onItemClick}
          />
        ))}
      </div>

      {availableItems.length === 0 && (
        <div className="text-center py-12 bg-gray-50 rounded-xl border border-gray-100">
          <p className="text-gray-500 text-lg">{labels.empty[language]}</p>
        </div>
      )}
    </section>
  );
}

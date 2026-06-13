import { MenuCard } from './MenuCard';
import type { MenuCategory as MenuCategoryType, MenuItem, Language } from '../../types/menu';

export interface MenuCategoryProps {
  category: MenuCategoryType;
  language: Language;
  onItemClick?: (item: MenuItem) => void;
}

const getRussianPluralForm = (
  value: number,
  forms: readonly [one: string, few: string, many: string]
) => {
  const normalizedValue = Math.abs(value) % 100;
  const lastDigit = normalizedValue % 10;

  if (normalizedValue >= 11 && normalizedValue <= 14) return forms[2];
  if (lastDigit === 1) return forms[0];
  if (lastDigit >= 2 && lastDigit <= 4) return forms[1];
  return forms[2];
};

const getCountLabel = (count: number, language: Language, group?: MenuCategoryType['group']) => {
  const isBeverageCategory = group === 'beverages';

  if (language === 'ru') {
    const word = isBeverageCategory
      ? getRussianPluralForm(count, ['напиток', 'напитка', 'напитков'])
      : getRussianPluralForm(count, ['позиция', 'позиции', 'позиций']);
    return `${count} ${word} доступно`;
  }

  if (language === 'en') {
    if (isBeverageCategory) return `${count} ${count === 1 ? 'drink' : 'drinks'} available`;
    return `${count} ${count === 1 ? 'item' : 'items'} available`;
  }

  if (isBeverageCategory) return `${count} icecek mevcut`;
  return `${count} urun mevcut`;
};

const getEmptyLabel = (language: Language, group?: MenuCategoryType['group']) => {
  const isBeverageCategory = group === 'beverages';

  if (language === 'ru') {
    return isBeverageCategory
      ? 'В этой категории пока нет доступных напитков'
      : 'В этой категории пока нет доступных позиций';
  }

  if (language === 'en') {
    return isBeverageCategory
      ? 'No drinks available in this category'
      : 'No items available in this category';
  }

  return isBeverageCategory
    ? 'Bu kategoride su an icecek yok'
    : 'Bu kategoride su an urun yok';
};

export function MenuCategory({
  category,
  language,
  onItemClick,
}: MenuCategoryProps) {
  // Filter available items
  const availableItems = category.items.filter((item) => item.available);

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
        <p className="text-sm text-gray-500">
          {getCountLabel(availableItems.length, language, category.group)}
        </p>
      </div>

      {/* Compact list for faster scanning */}
      <div className="space-y-3">
        {availableItems.map((item) => (
          <MenuCard
            key={item.id}
            item={item}
            language={language}
            onClick={onItemClick}
          />
        ))}
      </div>

      {availableItems.length === 0 && (
        <div className="text-center py-12 bg-gray-50 rounded-xl border border-gray-100">
          <p className="text-gray-500 text-lg">{getEmptyLabel(language, category.group)}</p>
        </div>
      )}
    </section>
  );
}

import { memo, useMemo } from 'react';
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

export const MenuCategory = memo(function MenuCategory({
  category,
  language,
  onItemClick,
}: MenuCategoryProps) {
  const availableItems = useMemo(() => category.items.filter((item) => item.available), [category.items]);

  return (
    <section
      id={`cat-${category.id}`}
      className="mb-8 scroll-mt-24 sm:scroll-mt-28 sm:mb-10"
      style={{ contentVisibility: 'auto' }}
    >
      {/* Category Header */}
      <div className="mb-3 rounded-2xl border border-emerald-100/80 bg-linear-to-r from-white via-emerald-50/70 to-amber-50/45 p-3 shadow-[0_4px_12px_rgba(6,78,59,0.08)]">
        <div className="mb-1.5 flex items-center gap-2.5">
          {category.icon && (
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-emerald-100/90 text-2xl ring-1 ring-emerald-200/80">
              {category.icon}
            </span>
          )}
          <h2 className="line-clamp-2 text-xl font-semibold tracking-tight text-emerald-950 sm:text-2xl">
            {category.displayName[language] || category.displayName.en}
          </h2>
        </div>
        <p className="text-xs font-medium uppercase tracking-wide text-emerald-700/85 sm:text-sm">
          {getCountLabel(availableItems.length, language, category.group)}
        </p>
      </div>

      {/* Compact list for faster scanning */}
      <div className="space-y-2">
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
        <div className="rounded-2xl border border-emerald-100 bg-linear-to-br from-white to-emerald-50/60 py-10 text-center shadow-sm">
          <p className="text-lg text-emerald-800/80">{getEmptyLabel(language, category.group)}</p>
        </div>
      )}
    </section>
  );
});

MenuCategory.displayName = 'MenuCategory';

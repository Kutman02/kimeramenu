import { memo } from 'react';
import { MenuCategory } from '../../../components/menu/MenuCategory';
import type { Language, MenuCategory as MenuCategoryType, MenuItem } from '../../../types/menu';

interface MenuCategoryGroupSectionProps {
  title: string;
  categories: MenuCategoryType[];
  language: Language;
  onItemClick: (item: MenuItem) => void;
}

export const MenuCategoryGroupSection = memo(function MenuCategoryGroupSection({
  title,
  categories,
  language,
  onItemClick,
}: MenuCategoryGroupSectionProps) {
  if (!categories.length) return null;

  return (
    <>
      <div className="mb-4 flex items-center gap-3">
        <p className="shrink-0 text-xs font-semibold uppercase tracking-[0.18em] text-emerald-700">
          {title}
        </p>
        <span className="h-px w-full bg-linear-to-r from-emerald-200 via-emerald-100 to-transparent" />
      </div>

      {categories.map((category) => (
        <MenuCategory
          key={category.id}
          category={category}
          language={language}
          onItemClick={onItemClick}
        />
      ))}
    </>
  );
});

MenuCategoryGroupSection.displayName = 'MenuCategoryGroupSection';

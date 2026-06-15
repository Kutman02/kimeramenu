import { MenuCategory } from '../../../components/menu/MenuCategory';
import type { Language, MenuCategory as MenuCategoryType, MenuItem } from '../../../types/menu';

interface MenuCategoryGroupSectionProps {
  title: string;
  categories: MenuCategoryType[];
  language: Language;
  onItemClick: (item: MenuItem) => void;
}

export function MenuCategoryGroupSection({
  title,
  categories,
  language,
  onItemClick,
}: MenuCategoryGroupSectionProps) {
  if (!categories.length) return null;

  return (
    <>
      <p className="mb-4 text-sm font-semibold uppercase tracking-wide text-slate-500">{title}</p>

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
}

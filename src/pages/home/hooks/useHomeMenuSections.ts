import { useMemo } from 'react';
import type { MenuCategory, MenuItem } from '../../../types/menu';

interface HomeMenuSections {
  servedToTableItems: MenuItem[];
  yourSelectionCategories: MenuCategory[];
  beverageCategories: MenuCategory[];
  navigationCategories: MenuCategory[];
}

const isServedToTableCategory = (category: MenuCategory) =>
  category.group === 'served_to_table' || Boolean(category.isComplimentary);

const isYourSelectionCategory = (category: MenuCategory) => {
  if (category.group === 'your_selections') return true;

  // Backward compatibility for previously saved local JSON without category groups.
  const hasExplicitGroup = Boolean(category.group);
  if (!hasExplicitGroup && !category.isComplimentary) return true;

  return false;
};

export function useHomeMenuSections(filteredCategories: MenuCategory[]): HomeMenuSections {
  return useMemo(() => {
    const servedToTableCategories = filteredCategories.filter(isServedToTableCategory);
    const yourSelectionCategories = filteredCategories.filter(isYourSelectionCategory);
    const beverageCategories = filteredCategories.filter(
      (category) => category.group === 'beverages'
    );

    return {
      servedToTableItems: servedToTableCategories.flatMap((category) => category.items),
      yourSelectionCategories,
      beverageCategories,
      navigationCategories: [...yourSelectionCategories, ...beverageCategories],
    };
  }, [filteredCategories]);
}

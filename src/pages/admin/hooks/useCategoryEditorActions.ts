import type { Dispatch, SetStateAction } from 'react';
import type { Language, MenuCategory, MenuData, RestaurantConfig } from '../../../types/menu';
import { ALL_CATEGORIES_VALUE } from '../constants';
import type { CategoryEditorState } from '../types';
import { clone, createCategory, getCategoryLabel, prepareCategory } from '../utils';

interface UseCategoryEditorActionsArgs {
  canEdit: boolean;
  restaurant: RestaurantConfig | null;
  activeCategory: MenuCategory | null;
  safeActiveCategoryIndex: number;
  itemsCategoryId: string;
  categoryEditor: CategoryEditorState;
  setCategoryEditor: Dispatch<SetStateAction<CategoryEditorState>>;
  setData: Dispatch<SetStateAction<MenuData>>;
  setStatus: Dispatch<SetStateAction<string>>;
  setActiveCategoryId: (categoryId: string) => void;
  setItemsCategoryId: (categoryId: string) => void;
}

export function useCategoryEditorActions({
  canEdit,
  restaurant,
  activeCategory,
  safeActiveCategoryIndex,
  itemsCategoryId,
  categoryEditor,
  setCategoryEditor,
  setData,
  setStatus,
  setActiveCategoryId,
  setItemsCategoryId,
}: UseCategoryEditorActionsArgs) {
  const patchCategoryDraft = (patch: Partial<MenuCategory>) => {
    setCategoryEditor((prev) =>
      prev
        ? {
            ...prev,
            draft: {
              ...prev.draft,
              ...patch,
            },
          }
        : prev
    );
  };

  const setCategoryTranslation = (lang: Language, value: string) => {
    setCategoryEditor((prev) =>
      prev
        ? {
            ...prev,
            draft: {
              ...prev.draft,
              displayName: {
                ...prev.draft.displayName,
                [lang]: value,
              },
            },
          }
        : prev
    );
  };

  const openCreateCategory = () => {
    if (!canEdit) return;

    setCategoryEditor({
      mode: 'create',
      categoryIndex: null,
      draft: createCategory(),
    });
  };

  const openEditCategory = () => {
    if (!canEdit || !activeCategory) return;

    setCategoryEditor({
      mode: 'edit',
      categoryIndex: safeActiveCategoryIndex,
      draft: clone(activeCategory),
    });
  };

  const saveCategoryEditor = () => {
    if (!categoryEditor || !canEdit || !restaurant) return;

    const preparedCategory = prepareCategory(categoryEditor.draft);

    const idAlreadyUsed = restaurant.categories.some((category, index) => {
      if (categoryEditor.mode === 'edit' && categoryEditor.categoryIndex === index) {
        return false;
      }
      return category.id === preparedCategory.id;
    });

    if (idAlreadyUsed) {
      setStatus('ID категории уже используется. Выберите другой ID.');
      return;
    }

    setData((prev) => {
      if (!prev.restaurants[0]) return prev;

      const next = clone(prev);
      const categories = next.restaurants[0].categories;

      if (categoryEditor.mode === 'create') {
        categories.push({ ...preparedCategory, items: [] });
      } else if (
        categoryEditor.categoryIndex != null &&
        categoryEditor.categoryIndex >= 0 &&
        categories[categoryEditor.categoryIndex]
      ) {
        const currentItems = categories[categoryEditor.categoryIndex].items;
        categories[categoryEditor.categoryIndex] = {
          ...preparedCategory,
          items: currentItems,
        };
      }

      return next;
    });

    setActiveCategoryId(preparedCategory.id);
    setCategoryEditor(null);
    setStatus(categoryEditor.mode === 'create' ? 'Категория создана.' : 'Категория обновлена.');
  };

  const handleDeleteActiveCategory = () => {
    if (!canEdit || !restaurant || !activeCategory || restaurant.categories.length <= 1) return;

    const confirmed = window.confirm(`Удалить категорию "${getCategoryLabel(activeCategory)}"?`);
    if (!confirmed) return;

    setData((prev) => {
      if (!prev.restaurants[0]) return prev;

      const next = clone(prev);
      next.restaurants[0].categories.splice(safeActiveCategoryIndex, 1);
      return next;
    });

    const fallback = restaurant.categories.find((_, idx) => idx !== safeActiveCategoryIndex);
    setActiveCategoryId(fallback?.id ?? '');
    if (itemsCategoryId === activeCategory.id) {
      setItemsCategoryId(fallback?.id ?? ALL_CATEGORIES_VALUE);
    }
    setStatus('Категория удалена.');
  };

  return {
    patchCategoryDraft,
    setCategoryTranslation,
    openCreateCategory,
    openEditCategory,
    saveCategoryEditor,
    handleDeleteActiveCategory,
  };
}

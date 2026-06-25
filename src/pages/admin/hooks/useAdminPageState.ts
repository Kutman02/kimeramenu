import { useMemo, useState } from 'react';
import dataService from '../../../services/dataService';
import type { MenuData } from '../../../types/menu';
import { ADMIN_SECTIONS, ALL_CATEGORIES_VALUE, ALL_LANGUAGES } from '../constants';
import type { AdminSectionId, CategoryEditorState, ItemEditorState, ItemListEntry } from '../types';
import { getCategoryLabel, normalizeText } from '../utils';

export function useAdminPageState() {
  const canEdit = import.meta.env.DEV && typeof window !== 'undefined';
  const initialData = useMemo(() => dataService.getRawData(), []);

  const [data, setData] = useState<MenuData>(initialData);
  const [status, setStatus] = useState('Готово к редактированию.');
  const [isSaving, setIsSaving] = useState(false);
  const [activeCategoryId, setActiveCategoryId] = useState(
    initialData.restaurants[0]?.categories[0]?.id ?? ''
  );
  const [itemsCategoryId, setItemsCategoryId] = useState<string>(ALL_CATEGORIES_VALUE);
  const [itemSearch, setItemSearch] = useState('');
  const [categoryEditor, setCategoryEditor] = useState<CategoryEditorState>(null);
  const [itemEditor, setItemEditor] = useState<ItemEditorState>(null);
  const [activeSection, setActiveSection] = useState<AdminSectionId>('overview');
  const [isNavOpen, setIsNavOpen] = useState(false);
  const [jsonEditorText, setJsonEditorText] = useState(() =>
    JSON.stringify(initialData, null, 2)
  );

  const restaurant = data.restaurants[0] ?? null;
  const categories = useMemo(() => restaurant?.categories ?? [], [restaurant]);
  const supportedLanguages = data.supportedLanguages.length ? data.supportedLanguages : ALL_LANGUAGES;

  const activeCategoryIndex = categories.findIndex((category) => category.id === activeCategoryId);
  const safeActiveCategoryIndex = activeCategoryIndex >= 0 ? activeCategoryIndex : 0;
  const activeCategory = categories[safeActiveCategoryIndex] ?? null;
  const itemsCategoryIndex =
    itemsCategoryId === ALL_CATEGORIES_VALUE
      ? -1
      : categories.findIndex((category) => category.id === itemsCategoryId);
  const itemsCategory = itemsCategoryIndex >= 0 ? categories[itemsCategoryIndex] : null;
  const createItemCategoryIndex = itemsCategoryIndex >= 0 ? itemsCategoryIndex : safeActiveCategoryIndex;

  const totalItems = useMemo(
    () => (restaurant ? restaurant.categories.reduce((sum, category) => sum + category.items.length, 0) : 0),
    [restaurant]
  );

  const hiddenItems = useMemo(
    () =>
      restaurant
        ? restaurant.categories.reduce(
            (sum, category) => sum + category.items.filter((item) => !item.available).length,
            0
          )
        : 0,
    [restaurant]
  );

  const availableItems = totalItems - hiddenItems;

  const filteredItems = useMemo(() => {
    const query = normalizeText(itemSearch).toLowerCase();
    const source = categories.flatMap((category, categoryIndex) => {
      if (itemsCategoryId !== ALL_CATEGORIES_VALUE && category.id !== itemsCategoryId) {
        return [] as ItemListEntry[];
      }

      return category.items.map((item, itemIndex) => ({
        item,
        itemIndex,
        category,
        categoryIndex,
      }));
    });

    if (!query) {
      return source;
    }

    return source.filter(({ item, category }) =>
      [
        item.id,
        item.name,
        item.description.en,
        item.description.ru,
        item.description.tr,
        category.id,
        getCategoryLabel(category),
      ]
        .join(' ')
        .toLowerCase()
        .includes(query)
    );
  }, [categories, itemSearch, itemsCategoryId]);

  const activeSectionMeta = useMemo(
    () => ADMIN_SECTIONS.find((section) => section.id === activeSection) ?? ADMIN_SECTIONS[0],
    [activeSection]
  );

  const handleSectionSelect = (sectionId: AdminSectionId) => {
    setActiveSection(sectionId);
    setIsNavOpen(false);
  };

  return {
    canEdit,
    data,
    setData,
    status,
    setStatus,
    isSaving,
    setIsSaving,
    setActiveCategoryId,
    itemsCategoryId,
    setItemsCategoryId,
    itemSearch,
    setItemSearch,
    categoryEditor,
    setCategoryEditor,
    itemEditor,
    setItemEditor,
    activeSection,
    isNavOpen,
    setIsNavOpen,
    jsonEditorText,
    setJsonEditorText,
    restaurant,
    categories,
    supportedLanguages,
    safeActiveCategoryIndex,
    activeCategory,
    itemsCategory,
    createItemCategoryIndex,
    totalItems,
    hiddenItems,
    availableItems,
    filteredItems,
    activeSectionMeta,
    handleSectionSelect,
  };
}

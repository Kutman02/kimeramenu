import fallbackDishImage from '../../assets/zag.png';
import type { FieldTranslations, MenuCategory, MenuData, MenuItem } from '../../types/menu';

export const FALLBACK_DISH_IMAGE = fallbackDishImage;

export const emptyTranslations = (): FieldTranslations => ({ en: '', ru: '', tr: '' });

export const createMenuItem = (): MenuItem => ({
  id: `item_${Date.now()}`,
  name: '',
  description: emptyTranslations(),
  price: 0,
  image: '',
  available: true,
  isComplimentary: false,
  includedItemIds: [],
  vegetarian: false,
  vegan: false,
  spicy: 0,
  portion: '',
  allergens: [],
  calories: 0,
});

export const createCategory = (): MenuCategory => ({
  id: `category_${Date.now()}`,
  name: 'New Category',
  displayName: { en: 'New Category', ru: 'Новая категория', tr: 'Yeni kategori' },
  icon: '🍽️',
  group: 'your_selections',
  hidden: false,
  isComplimentary: false,
  items: [],
});

export const clone = <T,>(value: T): T => JSON.parse(JSON.stringify(value)) as T;

export const exportData = (menuData: MenuData) => {
  const blob = new Blob([JSON.stringify(menuData, null, 2)], { type: 'application/json' });
  const href = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = href;
  link.download = 'menu-data-export.json';
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(href);
};

export const normalizeText = (value?: string) => value?.trim() ?? '';

export const normalizeTranslations = (value: FieldTranslations): FieldTranslations => ({
  en: normalizeText(value.en),
  ru: normalizeText(value.ru),
  tr: normalizeText(value.tr),
});

export const getBestTranslation = (value: FieldTranslations) =>
  normalizeText(value.en) || normalizeText(value.ru) || normalizeText(value.tr);

export const getCategoryLabel = (category: MenuCategory) =>
  getBestTranslation(category.displayName) || normalizeText(category.name) || normalizeText(category.id);

export const getItemDescription = (item: MenuItem) =>
  getBestTranslation(item.description) || 'Описание пока не добавлено';

export const toSafeNumber = (value: unknown, fallback = 0) => {
  if (typeof value === 'number' && Number.isFinite(value)) return value;
  if (typeof value === 'string' && value.trim().length) {
    const parsed = Number(value);
    if (Number.isFinite(parsed)) return parsed;
  }
  return fallback;
};

export const normalizeStringList = (value?: string[]) =>
  (value ?? []).map((entry) => normalizeText(entry)).filter(Boolean);

export const prepareMenuItem = (item: MenuItem): MenuItem => ({
  ...item,
  id: normalizeText(item.id) || `item_${Date.now()}`,
  name: normalizeText(item.name) || 'New Item',
  image: normalizeText(item.image),
  description: normalizeTranslations(item.description),
  price: Math.max(0, toSafeNumber(item.price)),
  isComplimentary: Boolean(item.isComplimentary),
  includedItems: (item.includedItems ?? [])
    .map((includedItem) => normalizeTranslations(includedItem))
    .filter((includedItem) => Boolean(getBestTranslation(includedItem))),
  includedItemIds: normalizeStringList(item.includedItemIds),
  vegetarian: Boolean(item.vegetarian),
  vegan: Boolean(item.vegan),
  spicy: Math.min(5, Math.max(0, Math.round(toSafeNumber(item.spicy)))),
  portion: normalizeText(item.portion),
  allergens: normalizeStringList(item.allergens),
  calories: Math.max(0, Math.round(toSafeNumber(item.calories))),
});

export const prepareCategory = (category: MenuCategory): MenuCategory => {
  const name = normalizeText(category.name) || 'New Category';

  return {
    ...category,
    id: normalizeText(category.id) || `category_${Date.now()}`,
    name,
    icon: normalizeText(category.icon),
    group: category.group ?? 'your_selections',
    hidden: Boolean(category.hidden),
    isComplimentary: Boolean(category.isComplimentary),
    displayName: {
      en: normalizeText(category.displayName.en) || name,
      ru: normalizeText(category.displayName.ru) || name,
      tr: normalizeText(category.displayName.tr) || name,
    },
    items: category.items ?? [],
  };
};

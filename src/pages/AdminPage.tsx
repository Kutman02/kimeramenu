import { useMemo, useState, type ChangeEvent } from 'react';
import dataService from '../services/dataService';
import type { FieldTranslations, Language, MenuCategory, MenuData, MenuItem } from '../types/menu';
import fallbackDishImage from '../assets/zag.png';

const ALL_LANGUAGES: Language[] = ['en', 'ru', 'tr'];
const FALLBACK_DISH_IMAGE = fallbackDishImage;
const ALL_CATEGORIES_VALUE = '__all_categories__';

const emptyTranslations = (): FieldTranslations => ({ en: '', ru: '', tr: '' });

const createMenuItem = (): MenuItem => ({
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

const createCategory = (): MenuCategory => ({
  id: `category_${Date.now()}`,
  name: 'New Category',
  displayName: { en: 'New Category', ru: 'Новая категория', tr: 'Yeni kategori' },
  icon: '🍽️',
  group: 'your_selections',
  hidden: false,
  isComplimentary: false,
  items: [],
});

const clone = <T,>(value: T): T => JSON.parse(JSON.stringify(value)) as T;

const exportData = (menuData: MenuData) => {
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

const normalizeText = (value?: string) => value?.trim() ?? '';

const normalizeTranslations = (value: FieldTranslations): FieldTranslations => ({
  en: normalizeText(value.en),
  ru: normalizeText(value.ru),
  tr: normalizeText(value.tr),
});

const getBestTranslation = (value: FieldTranslations) =>
  normalizeText(value.en) || normalizeText(value.ru) || normalizeText(value.tr);

const getCategoryLabel = (category: MenuCategory) =>
  getBestTranslation(category.displayName) || normalizeText(category.name) || normalizeText(category.id);

const getItemDescription = (item: MenuItem) =>
  getBestTranslation(item.description) || 'Описание пока не добавлено';

const toSafeNumber = (value: unknown, fallback = 0) => {
  if (typeof value === 'number' && Number.isFinite(value)) return value;
  if (typeof value === 'string' && value.trim().length) {
    const parsed = Number(value);
    if (Number.isFinite(parsed)) return parsed;
  }
  return fallback;
};

const normalizeStringList = (value?: string[]) =>
  (value ?? []).map((entry) => normalizeText(entry)).filter(Boolean);

const prepareMenuItem = (item: MenuItem): MenuItem => ({
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

const prepareCategory = (category: MenuCategory): MenuCategory => {
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

type CategoryEditorState = {
  mode: 'create' | 'edit';
  categoryIndex: number | null;
  draft: MenuCategory;
} | null;

type ItemEditorState = {
  mode: 'create' | 'edit';
  categoryIndex: number;
  itemIndex: number | null;
  draft: MenuItem;
} | null;

type ItemListEntry = {
  item: MenuItem;
  itemIndex: number;
  category: MenuCategory;
  categoryIndex: number;
};

type DashboardStatProps = {
  label: string;
  value: string | number;
  hint?: string;
};

type AdminSectionId = 'overview' | 'profile' | 'categories' | 'items' | 'data';

const ADMIN_SECTIONS: Array<{ id: AdminSectionId; label: string; hint: string }> = [
  { id: 'overview', label: 'Обзор', hint: 'Краткая статистика и быстрые действия' },
  { id: 'profile', label: 'Профиль ресторана', hint: 'Контакты и основные данные' },
  { id: 'categories', label: 'Категории', hint: 'Создание и управление категориями' },
  { id: 'items', label: 'Товары', hint: 'Карточки блюд и редактирование' },
  { id: 'data', label: 'Данные', hint: 'Сохранение, сброс и экспорт JSON' },
];

function DashboardStat({ label, value, hint }: DashboardStatProps) {
  return (
    <article className="rounded-2xl border border-white/20 bg-white/10 p-4 backdrop-blur-sm">
      <p className="text-xs uppercase tracking-[0.16em] text-slate-200">{label}</p>
      <p className="mt-2 text-2xl font-semibold text-white">{value}</p>
      {hint && <p className="mt-1 text-xs text-slate-200">{hint}</p>}
    </article>
  );
}

export function AdminPage() {
  const canEdit = import.meta.env.DEV && typeof window !== 'undefined';
  const initialData = useMemo(() => dataService.getRawData(), []);

  const [data, setData] = useState<MenuData>(initialData);
  const [status, setStatus] = useState('Готово к редактированию.');
  const [isSaving, setIsSaving] = useState(false);
  const [activeCategoryId, setActiveCategoryId] = useState(initialData.restaurants[0]?.categories[0]?.id ?? '');
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

  if (!restaurant) {
    return (
      <div className="min-h-screen bg-slate-100 px-4 py-10">
        <div className="mx-auto max-w-2xl rounded-2xl border border-slate-200 bg-white p-6 text-center shadow-sm">
          <h1 className="text-2xl font-bold text-slate-900">Админ-панель недоступна</h1>
          <p className="mt-2 text-sm text-slate-600">В JSON нет данных о ресторане для редактирования.</p>
          <a
            href="/"
            className="mt-4 inline-flex rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
          >
            Вернуться в меню
          </a>
        </div>
      </div>
    );
  }

  const setRestaurant = (updater: (prev: typeof restaurant) => typeof restaurant) => {
    setData((prev) => {
      if (!prev.restaurants[0]) return prev;

      const next = clone(prev);
      next.restaurants[0] = updater(next.restaurants[0]);
      return next;
    });
  };

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
    if (!categoryEditor || !canEdit) return;

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
    if (!canEdit || !activeCategory || restaurant.categories.length <= 1) return;

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

  const patchItemDraft = (patch: Partial<MenuItem>) => {
    setItemEditor((prev) =>
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

  const setItemDescription = (lang: Language, value: string) => {
    setItemEditor((prev) =>
      prev
        ? {
            ...prev,
            draft: {
              ...prev.draft,
              description: {
                ...prev.draft.description,
                [lang]: value,
              },
            },
          }
        : prev
    );
  };

  const toggleItemAllergen = (allergenId: string) => {
    setItemEditor((prev) => {
      if (!prev) return prev;

      const current = prev.draft.allergens ?? [];
      const nextAllergens = current.includes(allergenId)
        ? current.filter((id) => id !== allergenId)
        : [...current, allergenId];

      return {
        ...prev,
        draft: {
          ...prev.draft,
          allergens: nextAllergens,
        },
      };
    });
  };

  const setIncludedItemIdsFromText = (value: string) => {
    const parsedIds = value
      .split(',')
      .map((part) => normalizeText(part))
      .filter(Boolean);

    patchItemDraft({ includedItemIds: parsedIds });
  };

  const openCreateItem = () => {
    if (!canEdit) return;

    const targetCategory = restaurant.categories[createItemCategoryIndex];
    if (!targetCategory) return;

    setItemEditor({
      mode: 'create',
      categoryIndex: createItemCategoryIndex,
      itemIndex: null,
      draft: createMenuItem(),
    });
  };

  const openEditItem = (categoryIndex: number, itemIndex: number) => {
    if (!canEdit) return;

    const category = restaurant.categories[categoryIndex];
    const item = category?.items[itemIndex];
    if (!item) return;

    setItemEditor({
      mode: 'edit',
      categoryIndex,
      itemIndex,
      draft: clone(item),
    });
  };

  const saveItemEditor = () => {
    if (!itemEditor || !canEdit) return;

    const preparedItem = prepareMenuItem(itemEditor.draft);
    const category = restaurant.categories[itemEditor.categoryIndex];

    if (!category) {
      setStatus('Не удалось найти категорию для сохранения товара.');
      return;
    }

    const idAlreadyUsed = category.items.some((item, index) => {
      if (itemEditor.mode === 'edit' && itemEditor.itemIndex === index) {
        return false;
      }
      return item.id === preparedItem.id;
    });

    if (idAlreadyUsed) {
      setStatus('ID товара уже используется в этой категории.');
      return;
    }

    setData((prev) => {
      if (!prev.restaurants[0]) return prev;

      const next = clone(prev);
      const targetCategory = next.restaurants[0].categories[itemEditor.categoryIndex];
      if (!targetCategory) return prev;

      if (itemEditor.mode === 'create') {
        targetCategory.items.push(preparedItem);
      } else if (
        itemEditor.itemIndex != null &&
        itemEditor.itemIndex >= 0 &&
        targetCategory.items[itemEditor.itemIndex]
      ) {
        targetCategory.items[itemEditor.itemIndex] = preparedItem;
      }

      return next;
    });

    setItemEditor(null);
    setStatus(itemEditor.mode === 'create' ? 'Товар создан.' : 'Товар обновлён.');
  };

  const handleDeleteProduct = (categoryIndex: number, itemIndex: number) => {
    if (!canEdit) return;

    const category = restaurant.categories[categoryIndex];
    const item = category?.items[itemIndex];
    if (!item) return;

    const confirmed = window.confirm(`Удалить товар "${item.name || item.id}"?`);
    if (!confirmed) return;

    setData((prev) => {
      if (!prev.restaurants[0]) return prev;

      const next = clone(prev);
      const category = next.restaurants[0].categories[categoryIndex];
      if (!category) return prev;
      category.items.splice(itemIndex, 1);
      return next;
    });

    setStatus('Товар удалён.');
  };

  const handleUploadImage = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !itemEditor) return;

    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result !== 'string') return;
      patchItemDraft({ image: reader.result });
      setStatus('Изображение добавлено в форму товара.');
    };

    reader.readAsDataURL(file);
    e.currentTarget.value = '';
  };

  const handleSave = async () => {
    if (!canEdit || isSaving) return;

    setIsSaving(true);
    setStatus('Сохраняем изменения в JSON-файлы проекта...');

    try {
      const result = await dataService.saveToProjectFiles(data);
      setJsonEditorText(JSON.stringify(data, null, 2));
      setStatus(result.message);
    } catch (error) {
      setStatus(
        error instanceof Error
          ? `Ошибка сохранения JSON: ${error.message}`
          : 'Ошибка сохранения JSON-файлов проекта.'
      );
    } finally {
      setIsSaving(false);
    }
  };

  const handleReset = () => {
    if (!canEdit || isSaving) return;

    const baseData = dataService.getBaseData();
    setData(baseData);
    setJsonEditorText(JSON.stringify(baseData, null, 2));
    setActiveCategoryId(baseData.restaurants[0]?.categories[0]?.id ?? '');
    setItemsCategoryId(ALL_CATEGORIES_VALUE);
    setCategoryEditor(null);
    setItemEditor(null);
    setItemSearch('');
    dataService.resetToBaseData();
    setStatus('Сброшено к базовым JSON-файлам.');
  };

  const refreshJsonEditorFromData = () => {
    setJsonEditorText(JSON.stringify(data, null, 2));
    setStatus('JSON-редактор обновлён из текущего состояния админки.');
  };

  const applyJsonEditor = () => {
    if (!canEdit) return;

    try {
      const parsed = JSON.parse(jsonEditorText) as MenuData;
      const sanitized = clone(parsed);

      setData(sanitized);
      setActiveCategoryId(sanitized.restaurants[0]?.categories[0]?.id ?? '');
      setItemsCategoryId(ALL_CATEGORIES_VALUE);
      setCategoryEditor(null);
      setItemEditor(null);
      setItemSearch('');
      setStatus('JSON применён. Нажмите «Сохранить», чтобы записать в JSON-файлы проекта.');
    } catch {
      setStatus('Ошибка JSON: проверьте синтаксис перед применением.');
    }
  };

  return (
    <div className="min-h-screen bg-slate-100">
      {isNavOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <button
            type="button"
            aria-label="Close navigation"
            onClick={() => setIsNavOpen(false)}
            className="absolute inset-0 bg-slate-950/60"
          />
          <aside className="absolute left-0 top-0 h-full w-[84%] max-w-xs border-r border-slate-200 bg-white p-4 shadow-xl">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-semibold text-slate-900">Разделы админки</h2>
              <button
                type="button"
                onClick={() => setIsNavOpen(false)}
                className="rounded-lg border border-slate-300 px-2.5 py-1.5 text-sm text-slate-700"
              >
                Закрыть
              </button>
            </div>
            <div className="mt-4 space-y-1.5">
              {ADMIN_SECTIONS.map((section) => {
                const isActive = section.id === activeSection;
                return (
                  <button
                    key={section.id}
                    type="button"
                    onClick={() => handleSectionSelect(section.id)}
                    className={`w-full rounded-xl border px-3 py-2.5 text-left transition ${
                      isActive
                        ? 'border-slate-900 bg-slate-900 text-white'
                        : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <p className="text-sm font-semibold">{section.label}</p>
                    <p className={`mt-0.5 text-xs ${isActive ? 'text-slate-200' : 'text-slate-500'}`}>
                      {section.hint}
                    </p>
                  </button>
                );
              })}
            </div>
          </aside>
        </div>
      )}

      <div className="mx-auto flex max-w-7xl gap-6 px-4 py-8 sm:px-6">
        <aside className="hidden w-72 shrink-0 lg:block">
          <section className="sticky top-6 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <h2 className="text-base font-semibold text-slate-900">Навигация</h2>
            <p className="mt-1 text-xs text-slate-500">Откройте нужный экран админ-панели.</p>
            <div className="mt-4 space-y-1.5">
              {ADMIN_SECTIONS.map((section) => {
                const isActive = section.id === activeSection;
                return (
                  <button
                    key={section.id}
                    type="button"
                    onClick={() => handleSectionSelect(section.id)}
                    className={`w-full rounded-xl border px-3 py-2.5 text-left transition ${
                      isActive
                        ? 'border-slate-900 bg-slate-900 text-white'
                        : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <p className="text-sm font-semibold">{section.label}</p>
                    <p className={`mt-0.5 text-xs ${isActive ? 'text-slate-200' : 'text-slate-500'}`}>
                      {section.hint}
                    </p>
                  </button>
                );
              })}
            </div>

            <div className="mt-5 rounded-xl border border-slate-200 bg-slate-50 p-3">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-700">Dev режим</p>
              <p className="mt-1 text-xs text-slate-600">
                Изменения применяются после нажатия кнопки «Сохранить».
              </p>
            </div>
          </section>
        </aside>

        <main className="min-w-0 flex-1 space-y-6">
          <section className="rounded-3xl bg-linear-to-br from-slate-900 via-slate-800 to-indigo-900 p-6 text-white shadow-xl">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div className="flex items-start gap-3">
                <button
                  type="button"
                  onClick={() => setIsNavOpen((prev) => !prev)}
                  className="mt-0.5 inline-flex h-10 w-10 items-center justify-center rounded-lg border border-white/25 bg-white/10 lg:hidden"
                  aria-label="Toggle navigation"
                >
                  <span className="text-lg leading-none text-white">☰</span>
                </button>

                <div>
                  <span className="inline-flex rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs uppercase tracking-[0.14em] text-slate-100">
                    Professional Admin Flow
                  </span>
                  <h1 className="mt-3 text-3xl font-bold tracking-tight">Админ-панель меню</h1>
                  <p className="mt-2 max-w-2xl text-sm text-slate-200">
                    Сейчас открыт раздел: <span className="font-semibold">{activeSectionMeta.label}</span>.{' '}
                    {activeSectionMeta.hint}
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap gap-2">
                <a
                  href="/"
                  className="rounded-lg border border-white/25 bg-white/10 px-4 py-2 text-sm font-medium text-white hover:bg-white/20"
                >
                  Открыть гостевое меню
                </a>
                {activeSection === 'categories' && (
                  <button
                    type="button"
                    disabled={!canEdit}
                    onClick={openCreateCategory}
                    className="rounded-lg border border-transparent bg-white px-4 py-2 text-sm font-semibold text-slate-900 hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    + Категория
                  </button>
                )}
                {activeSection === 'items' && (
                  <button
                    type="button"
                    disabled={!canEdit || !categories.length}
                    onClick={openCreateItem}
                    className="rounded-lg border border-transparent bg-white px-4 py-2 text-sm font-semibold text-slate-900 hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    + Товар
                  </button>
                )}
              </div>
            </div>

            <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
              <DashboardStat
                label="Категорий"
                value={restaurant.categories.length}
                hint={activeCategory ? `Активная: ${getCategoryLabel(activeCategory)}` : 'Выберите категорию'}
              />
              <DashboardStat label="Товаров всего" value={totalItems} />
              <DashboardStat label="Доступных" value={availableItems} hint="Показываются гостям" />
              <DashboardStat label="Скрытых позиций" value={hiddenItems} hint="Недоступны для гостей" />
            </div>
          </section>

          {!canEdit && (
            <p className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
              Редактирование отключено в production-сборке.
            </p>
          )}

          {activeSection === 'overview' && (
            <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <h2 className="text-lg font-semibold text-slate-900">Разделы админки</h2>
              <p className="mt-1 text-sm text-slate-500">
                Выберите экран как в профессиональной CMS: профиль, категории, товары или данные.
              </p>
              <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
                {ADMIN_SECTIONS.filter((section) => section.id !== 'overview').map((section) => (
                  <article
                    key={section.id}
                    className="rounded-xl border border-slate-200 bg-slate-50 p-4 transition hover:border-slate-300"
                  >
                    <h3 className="text-base font-semibold text-slate-900">{section.label}</h3>
                    <p className="mt-1 text-sm text-slate-600">{section.hint}</p>
                    <button
                      type="button"
                      onClick={() => handleSectionSelect(section.id)}
                      className="mt-3 rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                    >
                      Открыть раздел
                    </button>
                  </article>
                ))}
              </div>
            </section>
          )}

          {activeSection === 'profile' && (
            <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h2 className="text-lg font-semibold text-slate-900">Профиль ресторана</h2>
                  <p className="mt-1 text-sm text-slate-500">
                    Основные параметры бренда и контакты, которые видит клиент.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleSave}
                  disabled={!canEdit || isSaving}
                  className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-700 disabled:cursor-not-allowed disabled:bg-slate-300"
                >
                  {isSaving ? 'Сохраняем...' : 'Сохранить профиль'}
                </button>
              </div>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                <label className="text-sm">
                  <span className="mb-1 block font-medium text-slate-700">Название ресторана</span>
                  <input
                    value={restaurant.name}
                    disabled={!canEdit}
                    onChange={(e) => setRestaurant((prev) => ({ ...prev, name: e.target.value }))}
                    className="h-10 w-full rounded-lg border border-slate-300 px-3 outline-none focus:border-slate-500 disabled:bg-slate-100"
                  />
                </label>

                <label className="text-sm">
                  <span className="mb-1 block font-medium text-slate-700">Телефон</span>
                  <input
                    value={restaurant.phone ?? ''}
                    disabled={!canEdit}
                    onChange={(e) => setRestaurant((prev) => ({ ...prev, phone: e.target.value }))}
                    className="h-10 w-full rounded-lg border border-slate-300 px-3 outline-none focus:border-slate-500 disabled:bg-slate-100"
                  />
                </label>

                <label className="text-sm">
                  <span className="mb-1 block font-medium text-slate-700">Email</span>
                  <input
                    value={restaurant.email ?? ''}
                    disabled={!canEdit}
                    onChange={(e) => setRestaurant((prev) => ({ ...prev, email: e.target.value }))}
                    className="h-10 w-full rounded-lg border border-slate-300 px-3 outline-none focus:border-slate-500 disabled:bg-slate-100"
                  />
                </label>

                <label className="text-sm">
                  <span className="mb-1 block font-medium text-slate-700">Сайт</span>
                  <input
                    value={restaurant.website ?? ''}
                    disabled={!canEdit}
                    onChange={(e) => setRestaurant((prev) => ({ ...prev, website: e.target.value }))}
                    className="h-10 w-full rounded-lg border border-slate-300 px-3 outline-none focus:border-slate-500 disabled:bg-slate-100"
                  />
                </label>

                <label className="text-sm">
                  <span className="mb-1 block font-medium text-slate-700">Язык по умолчанию</span>
                  <select
                    value={restaurant.settings.defaultLanguage}
                    disabled={!canEdit}
                    onChange={(e) =>
                      setRestaurant((prev) => ({
                        ...prev,
                        settings: {
                          ...prev.settings,
                          defaultLanguage: e.target.value as Language,
                        },
                      }))
                    }
                    className="h-10 w-full rounded-lg border border-slate-300 px-3 outline-none focus:border-slate-500 disabled:bg-slate-100"
                  >
                    {supportedLanguages.map((lang) => (
                      <option key={lang} value={lang}>
                        {lang.toUpperCase()}
                      </option>
                    ))}
                  </select>
                </label>
              </div>
            </section>
          )}

          {activeSection === 'categories' && (
            <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h2 className="text-lg font-semibold text-slate-900">Категории</h2>
                  <p className="text-sm text-slate-500">
                    Добавляйте, редактируйте и удаляйте категории на отдельном экране.
                  </p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    disabled={!canEdit}
                    onClick={openCreateCategory}
                    className="rounded-lg bg-slate-900 px-3 py-2 text-sm font-semibold text-white hover:bg-slate-700 disabled:cursor-not-allowed disabled:bg-slate-300"
                  >
                    + Добавить категорию
                  </button>
                  <button
                    type="button"
                    disabled={!canEdit || !activeCategory}
                    onClick={openEditCategory}
                    className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-50"
                  >
                    Изменить категорию
                  </button>
                  <button
                    type="button"
                    onClick={handleSave}
                    disabled={!canEdit || isSaving}
                    className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:bg-slate-100"
                  >
                    {isSaving ? 'Сохраняем...' : 'Сохранить изменения'}
                  </button>
                </div>
              </div>

              <div className="grid gap-4 lg:grid-cols-[320px_minmax(0,1fr)]">
                <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                  {restaurant.categories.length ? (
                    <div className="max-h-[520px] space-y-2 overflow-y-auto pr-1">
                      {restaurant.categories.map((category) => {
                        const isActive = category.id === activeCategory?.id;

                        return (
                          <button
                            key={category.id}
                            type="button"
                            onClick={() => setActiveCategoryId(category.id)}
                            className={`w-full rounded-xl border px-3 py-3 text-left transition ${
                              isActive
                                ? 'border-slate-900 bg-slate-900 text-white'
                                : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:bg-slate-50'
                            }`}
                          >
                            <div className="flex items-center justify-between gap-2">
                              <p className="line-clamp-1 text-sm font-semibold">
                                {category.icon ? `${category.icon} ` : ''}
                                {getCategoryLabel(category)}
                              </p>
                              <span
                                className={`rounded-full px-2 py-0.5 text-xs ${
                                  isActive ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-700'
                                }`}
                              >
                                {category.items.length}
                              </span>
                            </div>
                            <p className={`mt-1 text-xs ${isActive ? 'text-slate-200' : 'text-slate-500'}`}>
                              ID: {category.id}
                            </p>
                          </button>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="rounded-xl border border-dashed border-slate-300 bg-white p-5 text-center text-sm text-slate-500">
                      Нет категорий. Создайте первую.
                    </div>
                  )}
                </div>

                <div className="rounded-xl border border-slate-200 bg-white p-4">
                  {activeCategory ? (
                    <>
                      <div className="flex flex-wrap items-start justify-between gap-2">
                        <div>
                          <h3 className="text-base font-semibold text-slate-900">{getCategoryLabel(activeCategory)}</h3>
                          <p className="text-xs text-slate-500">Подробности выбранной категории</p>
                        </div>
                        <button
                          type="button"
                          disabled={!canEdit || restaurant.categories.length <= 1}
                          onClick={handleDeleteActiveCategory}
                          className="rounded-lg border border-red-200 bg-red-50 px-3 py-1.5 text-xs font-semibold text-red-700 disabled:opacity-50"
                        >
                          Удалить категорию
                        </button>
                      </div>

                      <div className="mt-3 space-y-2 text-sm text-slate-600">
                        <p>
                          <span className="font-medium text-slate-900">ID:</span> {activeCategory.id}
                        </p>
                        <p>
                          <span className="font-medium text-slate-900">Оригинал:</span> {activeCategory.name}
                        </p>
                        <p>
                          <span className="font-medium text-slate-900">Иконка:</span> {activeCategory.icon || '—'}
                        </p>
                        <p>
                          <span className="font-medium text-slate-900">Группа:</span>{' '}
                          {activeCategory.group || 'your_selections'}
                        </p>
                        <p>
                          <span className="font-medium text-slate-900">Скрыта:</span>{' '}
                          {activeCategory.hidden ? 'Да' : 'Нет'}
                        </p>
                        <p>
                          <span className="font-medium text-slate-900">Комплимент:</span>{' '}
                          {activeCategory.isComplimentary ? 'Да' : 'Нет'}
                        </p>
                        {supportedLanguages.map((lang) => (
                          <p key={lang}>
                            <span className="font-medium text-slate-900">{lang.toUpperCase()}:</span>{' '}
                            {activeCategory.displayName[lang] || '—'}
                          </p>
                        ))}
                      </div>

                      <div className="mt-4 flex flex-wrap gap-2">
                        <button
                          type="button"
                          onClick={openEditCategory}
                          disabled={!canEdit}
                          className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-50"
                        >
                          Редактировать
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setItemsCategoryId(activeCategory.id);
                            handleSectionSelect('items');
                          }}
                          className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                        >
                          Открыть товары категории
                        </button>
                      </div>
                    </>
                  ) : (
                    <div className="rounded-xl border border-dashed border-slate-300 p-8 text-center text-sm text-slate-500">
                      Выберите категорию слева, чтобы увидеть детали.
                    </div>
                  )}
                </div>
              </div>
            </section>
          )}

          {activeSection === 'items' && (
            <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h2 className="text-lg font-semibold text-slate-900">
                    {itemsCategory
                      ? `Товары: ${getCategoryLabel(itemsCategory)}`
                      : 'Товары: все категории'}
                  </h2>
                  <p className="text-sm text-slate-500">
                    Здесь видны все позиции из JSON. Можно фильтровать по категории и редактировать прямо из общего списка.
                  </p>
                </div>

                <div className="flex flex-wrap gap-2">
                  <select
                    value={itemsCategoryId}
                    onChange={(e) => setItemsCategoryId(e.target.value)}
                    className="h-10 rounded-lg border border-slate-300 bg-white px-3 text-sm outline-none focus:border-slate-500"
                  >
                    <option value={ALL_CATEGORIES_VALUE}>Все категории</option>
                    {categories.map((category) => (
                      <option key={category.id} value={category.id}>
                        {getCategoryLabel(category)}
                      </option>
                    ))}
                  </select>
                  <input
                    value={itemSearch}
                    onChange={(e) => setItemSearch(e.target.value)}
                    placeholder="Поиск по ID, названию, описанию, категории..."
                    className="h-10 w-64 rounded-lg border border-slate-300 px-3 text-sm outline-none focus:border-slate-500 disabled:bg-slate-100"
                  />
                  <button
                    type="button"
                    disabled={!canEdit || !categories.length}
                    onClick={openCreateItem}
                    className="h-10 rounded-lg bg-slate-900 px-4 text-sm font-semibold text-white hover:bg-slate-700 disabled:cursor-not-allowed disabled:bg-slate-300"
                  >
                    + Добавить товар
                  </button>
                  <button
                    type="button"
                    onClick={handleSave}
                    disabled={!canEdit || isSaving}
                    className="h-10 rounded-lg border border-slate-300 bg-white px-4 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:bg-slate-100"
                  >
                    {isSaving ? 'Сохраняем...' : 'Сохранить'}
                  </button>
                </div>
              </div>

              {filteredItems.length ? (
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
                  {filteredItems.map(({ item, itemIndex, category, categoryIndex }) => (
                    <article
                      key={`${category.id}:${item.id}`}
                      className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
                    >
                      <div className="relative h-44 bg-slate-100">
                        <img
                          src={item.image || FALLBACK_DISH_IMAGE}
                          alt={item.name || item.id}
                          className="h-full w-full object-cover"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = FALLBACK_DISH_IMAGE;
                          }}
                        />
                        <div className="absolute inset-x-0 bottom-0 bg-linear-to-t from-black/65 to-transparent px-3 py-2">
                          <div className="flex flex-wrap gap-1">
                            {!item.available && (
                              <span className="rounded-full bg-red-500/90 px-2 py-0.5 text-xs font-semibold text-white">
                                Скрыт
                              </span>
                            )}
                            {item.isComplimentary && (
                              <span className="rounded-full bg-emerald-500/90 px-2 py-0.5 text-xs font-semibold text-white">
                                Комплимент
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="space-y-3 p-4">
                        <h3 className="line-clamp-1 text-base font-semibold text-slate-900">
                          {item.name || 'Без названия'}
                        </h3>

                        <p className="line-clamp-2 text-sm text-slate-600">{getItemDescription(item)}</p>

                        <div className="flex flex-wrap gap-1.5 text-xs text-slate-500">
                          <span className="rounded-full bg-slate-100 px-2 py-1">ID: {item.id}</span>
                          <span className="rounded-full bg-indigo-50 px-2 py-1 text-indigo-700">
                            {getCategoryLabel(category)}
                          </span>
                          <span className="rounded-full bg-slate-100 px-2 py-1">
                            Цена: {item.price ?? 0}
                          </span>
                          {item.vegetarian && (
                            <span className="rounded-full bg-lime-100 px-2 py-1 text-lime-800">
                              Vegetarian
                            </span>
                          )}
                          {item.vegan && (
                            <span className="rounded-full bg-green-100 px-2 py-1 text-green-800">
                              Vegan
                            </span>
                          )}
                        </div>

                        <div className="flex gap-2">
                          <button
                            type="button"
                            disabled={!canEdit}
                            onClick={() => openEditItem(categoryIndex, itemIndex)}
                            className="flex-1 rounded-lg bg-slate-900 px-3 py-2 text-xs font-semibold text-white hover:bg-slate-700 disabled:cursor-not-allowed disabled:bg-slate-300"
                          >
                            Редактировать
                          </button>
                          <button
                            type="button"
                            disabled={!canEdit}
                            onClick={() => handleDeleteProduct(categoryIndex, itemIndex)}
                            className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs font-semibold text-red-700 hover:bg-red-100 disabled:opacity-50"
                          >
                            Удалить
                          </button>
                        </div>
                      </div>
                    </article>
                  ))}
                </div>
              ) : (
                <div className="rounded-xl border border-dashed border-slate-300 p-10 text-center text-sm text-slate-500">
                  {itemSearch
                    ? 'По запросу ничего не найдено.'
                    : itemsCategory
                      ? 'В выбранной категории пока нет товаров.'
                      : 'В меню пока нет товаров.'}
                </div>
              )}
            </section>
          )}

          {activeSection === 'data' && (
            <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <h2 className="text-lg font-semibold text-slate-900">Управление данными</h2>
              <p className="mt-1 text-sm text-slate-500">
                Сохранение изменений, сброс к базовым JSON-файлам и экспорт.
              </p>

              <div className="mt-4 flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={handleSave}
                  disabled={!canEdit || isSaving}
                  className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-700 disabled:cursor-not-allowed disabled:bg-slate-300"
                >
                  {isSaving ? 'Сохраняем...' : 'Сохранить в JSON проекта'}
                </button>
                <button
                  type="button"
                  onClick={handleReset}
                  disabled={!canEdit || isSaving}
                  className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:bg-slate-100"
                >
                  Сбросить к JSON
                </button>
                <button
                  type="button"
                  onClick={() => {
                    exportData(data);
                    setStatus('Экспортирован файл menu-data-export.json');
                  }}
                  className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
                >
                  Экспорт JSON
                </button>
              </div>

              <div className="mt-5 rounded-xl border border-slate-200 bg-slate-50 p-3">
                <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <h3 className="text-sm font-semibold text-slate-800">Raw JSON редактор</h3>
                    <p className="text-xs text-slate-500">
                      Полный контроль над данными. После применения нажмите «Сохранить в JSON проекта».
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={refreshJsonEditorFromData}
                      className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                    >
                      Обновить из UI
                    </button>
                    <button
                      type="button"
                      onClick={applyJsonEditor}
                      disabled={!canEdit}
                      className="rounded-lg bg-slate-900 px-3 py-1.5 text-xs font-semibold text-white hover:bg-slate-700 disabled:cursor-not-allowed disabled:bg-slate-300"
                    >
                      Применить JSON
                    </button>
                  </div>
                </div>
                <textarea
                  value={jsonEditorText}
                  onChange={(e) => setJsonEditorText(e.target.value)}
                  spellCheck={false}
                  className="h-80 w-full rounded-lg border border-slate-300 bg-white p-3 font-mono text-xs leading-relaxed text-slate-800 outline-none focus:border-slate-500"
                />
              </div>

              {status && (
                <p className="mt-3 rounded-lg bg-slate-50 px-3 py-2 text-sm text-slate-600">{status}</p>
              )}
            </section>
          )}

          {status && activeSection !== 'data' && (
            <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
              <p className="rounded-lg bg-slate-50 px-3 py-2 text-sm text-slate-600">{status}</p>
            </section>
          )}
        </main>
      </div>

      {categoryEditor && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <button
            type="button"
            aria-label="Close category editor"
            onClick={() => setCategoryEditor(null)}
            className="absolute inset-0 bg-slate-950/65"
          />

          <div className="relative z-10 w-full max-w-2xl rounded-2xl bg-white p-6 shadow-2xl">
            <div className="mb-5 flex items-start justify-between gap-3">
              <div>
                <h2 className="text-xl font-semibold text-slate-900">
                  {categoryEditor.mode === 'create' ? 'Создание категории' : 'Редактирование категории'}
                </h2>
                <p className="mt-1 text-sm text-slate-500">
                  Отдельное окно для управления структурой категории и переводами.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setCategoryEditor(null)}
                className="rounded-lg border border-slate-300 px-3 py-1.5 text-sm text-slate-700 hover:bg-slate-50"
              >
                Закрыть
              </button>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                <label className="text-sm">
                  <span className="mb-1 block font-medium text-slate-700">ID категории</span>
                  <input
                    value={categoryEditor.draft.id}
                    disabled={!canEdit}
                    onChange={(e) => patchCategoryDraft({ id: e.target.value })}
                    className="h-10 w-full rounded-lg border border-slate-300 px-3 outline-none focus:border-slate-500 disabled:bg-slate-100"
                  />
                </label>

                <label className="text-sm">
                  <span className="mb-1 block font-medium text-slate-700">Оригинальное имя</span>
                  <input
                    value={categoryEditor.draft.name}
                    disabled={!canEdit}
                    onChange={(e) => patchCategoryDraft({ name: e.target.value })}
                    className="h-10 w-full rounded-lg border border-slate-300 px-3 outline-none focus:border-slate-500 disabled:bg-slate-100"
                  />
                </label>

                <label className="text-sm">
                  <span className="mb-1 block font-medium text-slate-700">Иконка</span>
                  <input
                    value={categoryEditor.draft.icon ?? ''}
                    disabled={!canEdit}
                    onChange={(e) => patchCategoryDraft({ icon: e.target.value })}
                    className="h-10 w-full rounded-lg border border-slate-300 px-3 outline-none focus:border-slate-500 disabled:bg-slate-100"
                  />
                </label>
              </div>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                <label className="text-sm">
                  <span className="mb-1 block font-medium text-slate-700">Группа</span>
                  <select
                    value={categoryEditor.draft.group ?? 'your_selections'}
                    disabled={!canEdit}
                    onChange={(e) =>
                      patchCategoryDraft({
                        group: e.target.value as MenuCategory['group'],
                      })
                    }
                    className="h-10 w-full rounded-lg border border-slate-300 px-3 outline-none focus:border-slate-500 disabled:bg-slate-100"
                  >
                    <option value="served_to_table">served_to_table</option>
                    <option value="your_selections">your_selections</option>
                    <option value="beverages">beverages</option>
                  </select>
                </label>

                <label className="flex items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-700">
                  <input
                    type="checkbox"
                    checked={Boolean(categoryEditor.draft.hidden)}
                    disabled={!canEdit}
                    onChange={(e) => patchCategoryDraft({ hidden: e.target.checked })}
                  />
                  Скрыть категорию
                </label>

                <label className="flex items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-700">
                  <input
                    type="checkbox"
                    checked={Boolean(categoryEditor.draft.isComplimentary)}
                    disabled={!canEdit}
                    onChange={(e) =>
                      patchCategoryDraft({
                        isComplimentary: e.target.checked,
                      })
                    }
                  />
                  Комплимент для гостя
                </label>
              </div>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                {supportedLanguages.map((lang) => (
                  <label key={lang} className="text-sm">
                    <span className="mb-1 block font-medium text-slate-700">
                      Название {lang.toUpperCase()}
                    </span>
                    <input
                      value={categoryEditor.draft.displayName[lang] ?? ''}
                      disabled={!canEdit}
                      onChange={(e) => setCategoryTranslation(lang, e.target.value)}
                      className="h-10 w-full rounded-lg border border-slate-300 px-3 outline-none focus:border-slate-500 disabled:bg-slate-100"
                    />
                  </label>
                ))}
              </div>
            </div>

            <div className="mt-6 flex flex-wrap justify-end gap-2">
              <button
                type="button"
                onClick={() => setCategoryEditor(null)}
                className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
              >
                Отмена
              </button>
              <button
                type="button"
                disabled={!canEdit}
                onClick={saveCategoryEditor}
                className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-700 disabled:cursor-not-allowed disabled:bg-slate-300"
              >
                {categoryEditor.mode === 'create' ? 'Создать категорию' : 'Сохранить категорию'}
              </button>
            </div>
          </div>
        </div>
      )}

      {itemEditor && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <button
            type="button"
            aria-label="Close item editor"
            onClick={() => setItemEditor(null)}
            className="absolute inset-0 bg-slate-950/65"
          />

          <div className="relative z-10 max-h-[92vh] w-full max-w-4xl overflow-y-auto rounded-2xl bg-white p-6 shadow-2xl">
            <div className="mb-5 flex flex-wrap items-start justify-between gap-3">
              <div>
                <h2 className="text-xl font-semibold text-slate-900">
                  {itemEditor.mode === 'create' ? 'Создание товара' : 'Редактирование товара'}
                </h2>
                <p className="mt-1 text-sm text-slate-500">
                  Категория:{' '}
                  {restaurant.categories[itemEditor.categoryIndex]
                    ? getCategoryLabel(restaurant.categories[itemEditor.categoryIndex])
                    : 'Не найдена'}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setItemEditor(null)}
                className="rounded-lg border border-slate-300 px-3 py-1.5 text-sm text-slate-700 hover:bg-slate-50"
              >
                Закрыть
              </button>
            </div>

            <div className="grid grid-cols-1 gap-5 lg:grid-cols-[280px_minmax(0,1fr)]">
              <section className="space-y-3">
                <div className="overflow-hidden rounded-2xl border border-slate-200 bg-slate-50">
                  <img
                    src={itemEditor.draft.image || FALLBACK_DISH_IMAGE}
                    alt={itemEditor.draft.name || 'Preview'}
                    className="h-56 w-full object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = FALLBACK_DISH_IMAGE;
                    }}
                  />
                </div>

                <label className="block text-sm">
                  <span className="mb-1 block font-medium text-slate-700">URL изображения</span>
                  <input
                    value={itemEditor.draft.image}
                    disabled={!canEdit}
                    onChange={(e) => patchItemDraft({ image: e.target.value })}
                    className="h-10 w-full rounded-lg border border-slate-300 px-3 outline-none focus:border-slate-500 disabled:bg-slate-100"
                  />
                </label>

                <label className="block text-sm">
                  <span className="mb-1 block font-medium text-slate-700">Загрузить файл</span>
                  <input
                    type="file"
                    accept="image/*"
                    disabled={!canEdit}
                    onChange={handleUploadImage}
                    className="block w-full rounded-lg border border-slate-300 bg-white p-2 text-sm disabled:bg-slate-100"
                  />
                </label>
              </section>

              <section className="space-y-4">
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                  <label className="text-sm">
                    <span className="mb-1 block font-medium text-slate-700">ID товара</span>
                    <input
                      value={itemEditor.draft.id}
                      disabled={!canEdit}
                      onChange={(e) => patchItemDraft({ id: e.target.value })}
                      className="h-10 w-full rounded-lg border border-slate-300 px-3 outline-none focus:border-slate-500 disabled:bg-slate-100"
                    />
                  </label>

                  <label className="text-sm">
                    <span className="mb-1 block font-medium text-slate-700">Название</span>
                    <input
                      value={itemEditor.draft.name}
                      disabled={!canEdit}
                      onChange={(e) => patchItemDraft({ name: e.target.value })}
                      className="h-10 w-full rounded-lg border border-slate-300 px-3 outline-none focus:border-slate-500 disabled:bg-slate-100"
                    />
                  </label>

                  <label className="text-sm">
                    <span className="mb-1 block font-medium text-slate-700">Цена</span>
                    <input
                      type="number"
                      min={0}
                      step="0.01"
                      value={itemEditor.draft.price ?? 0}
                      disabled={!canEdit}
                      onChange={(e) => patchItemDraft({ price: Number(e.target.value) || 0 })}
                      className="h-10 w-full rounded-lg border border-slate-300 px-3 outline-none focus:border-slate-500 disabled:bg-slate-100"
                    />
                  </label>
                </div>

                <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                  <label className="text-sm">
                    <span className="mb-1 block font-medium text-slate-700">Порция</span>
                    <input
                      value={itemEditor.draft.portion ?? ''}
                      disabled={!canEdit}
                      onChange={(e) => patchItemDraft({ portion: e.target.value })}
                      placeholder="Например: 300g"
                      className="h-10 w-full rounded-lg border border-slate-300 px-3 outline-none focus:border-slate-500 disabled:bg-slate-100"
                    />
                  </label>
                  <label className="text-sm">
                    <span className="mb-1 block font-medium text-slate-700">Калории</span>
                    <input
                      type="number"
                      min={0}
                      value={itemEditor.draft.calories ?? 0}
                      disabled={!canEdit}
                      onChange={(e) => patchItemDraft({ calories: Number(e.target.value) || 0 })}
                      className="h-10 w-full rounded-lg border border-slate-300 px-3 outline-none focus:border-slate-500 disabled:bg-slate-100"
                    />
                  </label>
                  <label className="text-sm">
                    <span className="mb-1 block font-medium text-slate-700">Острота (0-5)</span>
                    <input
                      type="number"
                      min={0}
                      max={5}
                      value={itemEditor.draft.spicy ?? 0}
                      disabled={!canEdit}
                      onChange={(e) =>
                        patchItemDraft({
                          spicy: Math.max(0, Math.min(5, Number(e.target.value) || 0)),
                        })
                      }
                      className="h-10 w-full rounded-lg border border-slate-300 px-3 outline-none focus:border-slate-500 disabled:bg-slate-100"
                    />
                  </label>
                </div>

                <div className="flex flex-wrap gap-4 rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm">
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={itemEditor.draft.available}
                      disabled={!canEdit}
                      onChange={(e) => patchItemDraft({ available: e.target.checked })}
                    />
                    Доступен
                  </label>
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={Boolean(itemEditor.draft.vegetarian)}
                      disabled={!canEdit}
                      onChange={(e) => patchItemDraft({ vegetarian: e.target.checked })}
                    />
                    Vegetarian
                  </label>
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={Boolean(itemEditor.draft.vegan)}
                      disabled={!canEdit}
                      onChange={(e) => patchItemDraft({ vegan: e.target.checked })}
                    />
                    Vegan
                  </label>
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={Boolean(itemEditor.draft.isComplimentary)}
                      disabled={!canEdit}
                      onChange={(e) => patchItemDraft({ isComplimentary: e.target.checked })}
                    />
                    Комплимент
                  </label>
                </div>

                <label className="block text-sm">
                  <span className="mb-1 block font-medium text-slate-700">
                    includedItemIds (через запятую)
                  </span>
                  <input
                    value={(itemEditor.draft.includedItemIds ?? []).join(', ')}
                    disabled={!canEdit}
                    onChange={(e) => setIncludedItemIdsFromText(e.target.value)}
                    placeholder="item_a, item_b, item_c"
                    className="h-10 w-full rounded-lg border border-slate-300 px-3 outline-none focus:border-slate-500 disabled:bg-slate-100"
                  />
                </label>

                <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                  <p className="mb-2 text-sm font-medium text-slate-700">Аллергены</p>
                  {restaurant.allergens.length ? (
                    <div className="flex flex-wrap gap-2">
                      {restaurant.allergens.map((allergen) => {
                        const checked = (itemEditor.draft.allergens ?? []).includes(allergen.id);

                        return (
                          <label
                            key={allergen.id}
                            className={`inline-flex cursor-pointer items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs ${
                              checked
                                ? 'border-slate-900 bg-slate-900 text-white'
                                : 'border-slate-300 bg-white text-slate-700'
                            }`}
                          >
                            <input
                              type="checkbox"
                              checked={checked}
                              disabled={!canEdit}
                              onChange={() => toggleItemAllergen(allergen.id)}
                              className="sr-only"
                            />
                            <span>{allergen.icon ?? '•'}</span>
                            <span>{allergen.name}</span>
                          </label>
                        );
                      })}
                    </div>
                  ) : (
                    <p className="text-xs text-slate-500">В ресторане не настроены аллергены.</p>
                  )}
                </div>

                <div className="grid grid-cols-1 gap-3">
                  {supportedLanguages.map((lang) => (
                    <label key={lang} className="text-sm">
                      <span className="mb-1 block font-medium text-slate-700">
                        Описание {lang.toUpperCase()}
                      </span>
                      <textarea
                        value={itemEditor.draft.description[lang] ?? ''}
                        disabled={!canEdit}
                        onChange={(e) => setItemDescription(lang, e.target.value)}
                        className="h-24 w-full rounded-lg border border-slate-300 p-2 outline-none focus:border-slate-500 disabled:bg-slate-100"
                      />
                    </label>
                  ))}
                </div>
              </section>
            </div>

            <div className="mt-6 flex flex-wrap justify-end gap-2">
              <button
                type="button"
                onClick={() => setItemEditor(null)}
                className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
              >
                Отмена
              </button>
              <button
                type="button"
                disabled={!canEdit}
                onClick={saveItemEditor}
                className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-700 disabled:cursor-not-allowed disabled:bg-slate-300"
              >
                {itemEditor.mode === 'create' ? 'Создать товар' : 'Сохранить товар'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

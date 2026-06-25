import { useMemo, useState } from 'react';
import dataService from '../services/dataService';
import type { Language, MenuCategory, MenuData, MenuItem } from '../types/menu';
import { AdminCategoriesSection } from './admin/components/AdminCategoriesSection';
import { AdminDataSection } from './admin/components/AdminDataSection';
import { AdminHeader } from './admin/components/AdminHeader';
import { AdminItemsSection } from './admin/components/AdminItemsSection';
import { AdminNavigation } from './admin/components/AdminNavigation';
import { AdminOverviewSection } from './admin/components/AdminOverviewSection';
import { AdminProfileSection } from './admin/components/AdminProfileSection';
import { CategoryEditorModal } from './admin/components/CategoryEditorModal';
import { ItemEditorModal } from './admin/components/ItemEditorModal';
import { ADMIN_SECTIONS, ALL_CATEGORIES_VALUE, ALL_LANGUAGES } from './admin/constants';
import type { AdminSectionId, CategoryEditorState, ItemEditorState, ItemListEntry } from './admin/types';
import {
  clampSquareImageSize,
  clone,
  createSquareImageDataUrl,
  createCategory,
  createMenuItem,
  exportData,
  getCategoryLabel,
  getItemDescription,
  loadImageFromFile,
  normalizeText,
  prepareCategory,
  prepareMenuItem,
  type SquareCropControls,
} from './admin/utils';

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

  const handleUploadImage = async ({
    file,
    squareSize,
    controls,
  }: {
    file: File;
    squareSize: number;
    controls: SquareCropControls;
  }) => {
    if (!itemEditor) return;
    if (!file.type.startsWith('image/')) {
      setStatus('Выберите корректный файл изображения.');
      return;
    }

    const targetSize = clampSquareImageSize(squareSize);
    setStatus(`Подготавливаем квадратный кадр ${targetSize}x${targetSize}...`);

    try {
      const image = await loadImageFromFile(file);
      const dataUrl = createSquareImageDataUrl({
        image,
        size: targetSize,
        controls,
      });
      patchItemDraft({ image: dataUrl });
      setStatus(`Кадр применён и сохранён как квадрат ${targetSize}x${targetSize}.`);
    } catch (error) {
      setStatus(
        error instanceof Error
          ? `Не удалось обработать изображение: ${error.message}`
          : 'Не удалось обработать изображение.'
      );
      throw error;
    }
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
      <div className="mx-auto flex max-w-7xl gap-6 px-4 py-8 sm:px-6">
        <AdminNavigation
          sections={ADMIN_SECTIONS}
          activeSection={activeSection}
          isNavOpen={isNavOpen}
          onCloseNav={() => setIsNavOpen(false)}
          onSectionSelect={handleSectionSelect}
        />

        <main className="min-w-0 flex-1 space-y-6">
          <AdminHeader
            activeSectionMeta={activeSectionMeta}
            activeSection={activeSection}
            canEdit={canEdit}
            hasCategories={Boolean(categories.length)}
            activeCategoryLabel={activeCategory ? getCategoryLabel(activeCategory) : null}
            categoriesCount={restaurant.categories.length}
            totalItems={totalItems}
            availableItems={availableItems}
            hiddenItems={hiddenItems}
            onToggleNav={() => setIsNavOpen((prev) => !prev)}
            onOpenCreateCategory={openCreateCategory}
            onOpenCreateItem={openCreateItem}
          />

          {!canEdit && (
            <p className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
              Редактирование отключено в production-сборке.
            </p>
          )}

          {activeSection === 'overview' && (
            <AdminOverviewSection sections={ADMIN_SECTIONS} onSectionSelect={handleSectionSelect} />
          )}

          {activeSection === 'profile' && (
            <AdminProfileSection
              restaurant={restaurant}
              supportedLanguages={supportedLanguages}
              canEdit={canEdit}
              isSaving={isSaving}
              onSave={handleSave}
              onRestaurantChange={setRestaurant}
            />
          )}

          {activeSection === 'categories' && (
            <AdminCategoriesSection
              restaurant={restaurant}
              activeCategory={activeCategory}
              supportedLanguages={supportedLanguages}
              canEdit={canEdit}
              isSaving={isSaving}
              onOpenCreateCategory={openCreateCategory}
              onOpenEditCategory={openEditCategory}
              onSave={handleSave}
              onDeleteActiveCategory={handleDeleteActiveCategory}
              onSetActiveCategoryId={setActiveCategoryId}
              onOpenItemsForCategory={(categoryId) => {
                setItemsCategoryId(categoryId);
                handleSectionSelect('items');
              }}
              getCategoryLabel={getCategoryLabel}
            />
          )}

          {activeSection === 'items' && (
            <AdminItemsSection
              categories={categories}
              itemsCategory={itemsCategory}
              itemsCategoryId={itemsCategoryId}
              itemSearch={itemSearch}
              filteredItems={filteredItems}
              canEdit={canEdit}
              isSaving={isSaving}
              onItemsCategoryChange={setItemsCategoryId}
              onItemSearchChange={setItemSearch}
              onOpenCreateItem={openCreateItem}
              onSave={handleSave}
              onOpenEditItem={openEditItem}
              onDeleteItem={handleDeleteProduct}
              getCategoryLabel={getCategoryLabel}
              getItemDescription={getItemDescription}
            />
          )}

          {activeSection === 'data' && (
            <AdminDataSection
              canEdit={canEdit}
              isSaving={isSaving}
              status={status}
              jsonEditorText={jsonEditorText}
              onSave={handleSave}
              onReset={handleReset}
              onExport={() => {
                exportData(data);
                setStatus('Экспортирован файл menu-data-export.json');
              }}
              onRefreshJsonEditor={refreshJsonEditorFromData}
              onApplyJsonEditor={applyJsonEditor}
              onJsonEditorTextChange={setJsonEditorText}
            />
          )}

          {status && activeSection !== 'data' && (
            <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
              <p className="rounded-lg bg-slate-50 px-3 py-2 text-sm text-slate-600">{status}</p>
            </section>
          )}
        </main>
      </div>

      <CategoryEditorModal
        editor={categoryEditor}
        canEdit={canEdit}
        supportedLanguages={supportedLanguages}
        onClose={() => setCategoryEditor(null)}
        onPatchDraft={patchCategoryDraft}
        onSetCategoryTranslation={setCategoryTranslation}
        onSave={saveCategoryEditor}
      />

      <ItemEditorModal
        editor={itemEditor}
        restaurant={restaurant}
        canEdit={canEdit}
        supportedLanguages={supportedLanguages}
        onClose={() => setItemEditor(null)}
        onPatchDraft={patchItemDraft}
        onSetItemDescription={setItemDescription}
        onToggleItemAllergen={toggleItemAllergen}
        onSetIncludedItemIdsFromText={setIncludedItemIdsFromText}
        onUploadImage={handleUploadImage}
        onSave={saveItemEditor}
        getCategoryLabel={getCategoryLabel}
      />
    </div>
  );
}

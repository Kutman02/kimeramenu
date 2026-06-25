import type { Dispatch, SetStateAction } from 'react';
import type { Language, MenuData, MenuItem, RestaurantConfig } from '../../../types/menu';
import type { ItemEditorState } from '../types';
import {
  clampSquareImageSize,
  clone,
  createMenuItem,
  createSquareImageDataUrl,
  loadImageFromFile,
  normalizeText,
  prepareMenuItem,
  type SquareCropControls,
} from '../utils';

interface UseItemEditorActionsArgs {
  canEdit: boolean;
  restaurant: RestaurantConfig | null;
  createItemCategoryIndex: number;
  itemEditor: ItemEditorState;
  setItemEditor: Dispatch<SetStateAction<ItemEditorState>>;
  setData: Dispatch<SetStateAction<MenuData>>;
  setStatus: Dispatch<SetStateAction<string>>;
}

export function useItemEditorActions({
  canEdit,
  restaurant,
  createItemCategoryIndex,
  itemEditor,
  setItemEditor,
  setData,
  setStatus,
}: UseItemEditorActionsArgs) {
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
    if (!canEdit || !restaurant) return;

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
    if (!canEdit || !restaurant) return;

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
    if (!itemEditor || !canEdit || !restaurant) return;

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
    if (!canEdit || !restaurant) return;

    const category = restaurant.categories[categoryIndex];
    const item = category?.items[itemIndex];
    if (!item) return;

    const confirmed = window.confirm(`Удалить товар "${item.name || item.id}"?`);
    if (!confirmed) return;

    setData((prev) => {
      if (!prev.restaurants[0]) return prev;

      const next = clone(prev);
      const nextCategory = next.restaurants[0].categories[categoryIndex];
      if (!nextCategory) return prev;
      nextCategory.items.splice(itemIndex, 1);
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

  return {
    patchItemDraft,
    setItemDescription,
    toggleItemAllergen,
    setIncludedItemIdsFromText,
    openCreateItem,
    openEditItem,
    saveItemEditor,
    handleDeleteProduct,
    handleUploadImage,
  };
}

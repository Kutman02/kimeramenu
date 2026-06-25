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

export interface SquareCropControls {
  zoom: number;
  offsetX: number;
  offsetY: number;
}

export const DEFAULT_SQUARE_IMAGE_SIZE = 1024;

export const DEFAULT_SQUARE_CROP_CONTROLS: SquareCropControls = {
  zoom: 1,
  offsetX: 0,
  offsetY: 0,
};

export const clampSquareImageSize = (value: number) => {
  if (!Number.isFinite(value)) return DEFAULT_SQUARE_IMAGE_SIZE;
  return Math.min(1536, Math.max(256, Math.round(value)));
};

export const clampSquareCropControls = (controls: SquareCropControls): SquareCropControls => ({
  zoom: Math.min(3, Math.max(1, Number.isFinite(controls.zoom) ? controls.zoom : 1)),
  offsetX: Math.min(1, Math.max(-1, Number.isFinite(controls.offsetX) ? controls.offsetX : 0)),
  offsetY: Math.min(1, Math.max(-1, Number.isFinite(controls.offsetY) ? controls.offsetY : 0)),
});

export const loadImageFromFile = (file: File) =>
  new Promise<HTMLImageElement>((resolve, reject) => {
    const objectUrl = URL.createObjectURL(file);
    const image = new Image();

    image.onload = () => {
      URL.revokeObjectURL(objectUrl);
      resolve(image);
    };

    image.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      reject(new Error('Файл изображения не удалось открыть.'));
    };

    image.src = objectUrl;
  });

interface DrawSquareCropToCanvasOptions {
  context: CanvasRenderingContext2D;
  image: HTMLImageElement;
  size: number;
  controls: SquareCropControls;
}

export const drawSquareCropToCanvas = ({
  context,
  image,
  size,
  controls,
}: DrawSquareCropToCanvasOptions) => {
  const safeSize = clampSquareImageSize(size);
  const safeControls = clampSquareCropControls(controls);
  const sourceWidth = image.naturalWidth || image.width;
  const sourceHeight = image.naturalHeight || image.height;

  if (!sourceWidth || !sourceHeight) {
    throw new Error('Изображение пустое или повреждено.');
  }

  const coverScale = Math.max(safeSize / sourceWidth, safeSize / sourceHeight);
  const zoomScale = coverScale * safeControls.zoom;
  const drawWidth = sourceWidth * zoomScale;
  const drawHeight = sourceHeight * zoomScale;
  const maxOffsetX = Math.max(0, (drawWidth - safeSize) / 2);
  const maxOffsetY = Math.max(0, (drawHeight - safeSize) / 2);
  const drawX = (safeSize - drawWidth) / 2 - safeControls.offsetX * maxOffsetX;
  const drawY = (safeSize - drawHeight) / 2 - safeControls.offsetY * maxOffsetY;

  context.clearRect(0, 0, safeSize, safeSize);
  context.imageSmoothingEnabled = true;
  context.imageSmoothingQuality = 'high';
  context.drawImage(image, drawX, drawY, drawWidth, drawHeight);
};

interface CreateSquareImageDataUrlOptions {
  image: HTMLImageElement;
  size: number;
  controls: SquareCropControls;
}

export const createSquareImageDataUrl = ({ image, size, controls }: CreateSquareImageDataUrlOptions) => {
  const safeSize = clampSquareImageSize(size);
  const canvas = document.createElement('canvas');
  canvas.width = safeSize;
  canvas.height = safeSize;

  const context = canvas.getContext('2d');
  if (!context) {
    throw new Error('Браузер не поддерживает canvas для обработки изображения.');
  }

  drawSquareCropToCanvas({ context, image, size: safeSize, controls });

  const webpImage = canvas.toDataURL('image/webp', 0.92);
  if (webpImage.startsWith('data:image/webp')) {
    return webpImage;
  }

  return canvas.toDataURL('image/jpeg', 0.92);
};

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

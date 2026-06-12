import { useMemo, useState, type ChangeEvent } from 'react';
import dataService from '../services/dataService';
import type { FieldTranslations, Language, MenuCategory, MenuData, MenuItem } from '../types/menu';

const ALL_LANGUAGES: Language[] = ['en', 'ru', 'tr'];

const emptyTranslations = (): FieldTranslations => ({ en: '', ru: '', tr: '' });

const createMenuItem = (): MenuItem => ({
  id: `item_${Date.now()}`,
  name: '',
  description: emptyTranslations(),
  price: 0,
  image: '',
  available: true,
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

type EditingRef = { categoryIndex: number; itemIndex: number } | null;

export function AdminPage() {
  const canEdit = typeof window !== 'undefined';
  const initialData = useMemo(() => dataService.getRawData(), []);
  const [data, setData] = useState<MenuData>(initialData);
  const [status, setStatus] = useState('');
  const [activeCategoryId, setActiveCategoryId] = useState(initialData.restaurants[0]?.categories[0]?.id ?? '');
  const [editingItem, setEditingItem] = useState<EditingRef>(null);

  const restaurant = data.restaurants[0];
  const activeCategoryIndex = Math.max(
    0,
    restaurant.categories.findIndex((category) => category.id === activeCategoryId)
  );
  const activeCategory = restaurant.categories[activeCategoryIndex];

  const setRestaurant = (updater: (prev: typeof restaurant) => typeof restaurant) => {
    setData((prev) => {
      const next = clone(prev);
      next.restaurants[0] = updater(next.restaurants[0]);
      return next;
    });
  };

  const setItemField = (categoryIndex: number, itemIndex: number, patch: Partial<MenuItem>) => {
    setRestaurant((prev) => {
      const next = clone(prev);
      next.categories[categoryIndex].items[itemIndex] = {
        ...next.categories[categoryIndex].items[itemIndex],
        ...patch,
      };
      return next;
    });
  };

  const handleAddCategory = () => {
    const category = createCategory();
    setData((prev) => {
      const next = clone(prev);
      next.restaurants[0].categories.push(category);
      return next;
    });
    setActiveCategoryId(category.id);
    setStatus('Category added.');
  };

  const handleDeleteActiveCategory = () => {
    if (restaurant.categories.length <= 1) return;

    setData((prev) => {
      const next = clone(prev);
      next.restaurants[0].categories.splice(activeCategoryIndex, 1);
      return next;
    });

    const fallback = restaurant.categories.find((_, idx) => idx !== activeCategoryIndex);
    setActiveCategoryId(fallback?.id ?? '');
    setStatus('Category deleted.');
  };

  const handleAddProduct = () => {
    if (!activeCategory) return;

    const newItem = createMenuItem();
    setData((prev) => {
      const next = clone(prev);
      next.restaurants[0].categories[activeCategoryIndex].items.push(newItem);
      return next;
    });
    setEditingItem({
      categoryIndex: activeCategoryIndex,
      itemIndex: activeCategory.items.length,
    });
    setStatus('Product added.');
  };

  const handleDeleteProduct = (categoryIndex: number, itemIndex: number) => {
    setData((prev) => {
      const next = clone(prev);
      next.restaurants[0].categories[categoryIndex].items.splice(itemIndex, 1);
      return next;
    });
    setStatus('Product deleted.');
  };

  const handleUploadImage = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !editingItem) return;

    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result !== 'string') return;
      setItemField(editingItem.categoryIndex, editingItem.itemIndex, { image: reader.result });
      setStatus('Image uploaded.');
    };
    reader.readAsDataURL(file);
    e.currentTarget.value = '';
  };

  const handleSave = () => {
    if (!canEdit) return;
    dataService.replaceData(data);
    setStatus('Saved. Menu is updated in local dev storage.');
  };

  const handleReset = () => {
    if (!canEdit) return;
    const baseData = dataService.getBaseData();
    setData(baseData);
    setActiveCategoryId(baseData.restaurants[0]?.categories[0]?.id ?? '');
    dataService.resetToBaseData();
    setStatus('Reset to base JSON files.');
  };

  const editingItemData =
    editingItem == null
      ? null
      : restaurant.categories[editingItem.categoryIndex]?.items[editingItem.itemIndex] ?? null;

  return (
    <div className="min-h-screen bg-slate-100">
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
        <section className="mb-6 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
            <div>
              <h1 className="text-2xl font-bold text-slate-900">Admin Catalog</h1>
              <p className="text-sm text-slate-600">
                Real showcase admin: products as posters with edit actions.
              </p>
            </div>
            <a
              href="/"
              className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
            >
              Open Guest Menu
            </a>
          </div>

          {!canEdit && (
            <p className="mb-3 rounded-lg bg-amber-50 px-3 py-2 text-sm text-amber-700">
              Editing is disabled in production build.
            </p>
          )}

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <label className="text-sm">
              <span className="mb-1 block font-medium text-slate-700">Restaurant Name</span>
              <input
                value={restaurant.name}
                disabled={!canEdit}
                onChange={(e) => setRestaurant((prev) => ({ ...prev, name: e.target.value }))}
                className="h-10 w-full rounded-lg border border-slate-300 px-3 outline-none disabled:bg-slate-100"
              />
            </label>
            <label className="text-sm">
              <span className="mb-1 block font-medium text-slate-700">Phone</span>
              <input
                value={restaurant.phone ?? ''}
                disabled={!canEdit}
                onChange={(e) => setRestaurant((prev) => ({ ...prev, phone: e.target.value }))}
                className="h-10 w-full rounded-lg border border-slate-300 px-3 outline-none disabled:bg-slate-100"
              />
            </label>
          </div>
        </section>

        <section className="mb-5 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-slate-900">Categories</h2>
            <button
              type="button"
              disabled={!canEdit}
              onClick={handleAddCategory}
              className="rounded-lg bg-slate-900 px-3 py-2 text-sm font-medium text-white disabled:cursor-not-allowed disabled:bg-slate-300"
            >
              + Add Category
            </button>
          </div>

          <div className="flex flex-wrap gap-2">
            {restaurant.categories.map((category, index) => (
              <button
                key={category.id}
                type="button"
                onClick={() => setActiveCategoryId(category.id)}
                className={`rounded-full border px-3 py-1.5 text-sm font-medium transition ${
                  index === activeCategoryIndex
                    ? 'border-slate-900 bg-slate-900 text-white'
                    : 'border-slate-300 bg-white text-slate-700 hover:bg-slate-50'
                }`}
              >
                {category.icon ? `${category.icon} ` : ''}
                {category.displayName.en || category.name}
              </button>
            ))}
          </div>
        </section>

        {activeCategory && (
          <section className="mb-5 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <div className="mb-3 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-slate-900">Active Category Settings</h2>
              <button
                type="button"
                disabled={!canEdit || restaurant.categories.length <= 1}
                onClick={handleDeleteActiveCategory}
                className="rounded-lg border border-red-200 bg-red-50 px-3 py-1.5 text-sm font-medium text-red-700 disabled:opacity-50"
              >
                Delete Category
              </button>
            </div>

            <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
              <input
                value={activeCategory.id}
                disabled={!canEdit}
                onChange={(e) =>
                  setRestaurant((prev) => {
                    const next = clone(prev);
                    next.categories[activeCategoryIndex].id = e.target.value;
                    return next;
                  })
                }
                placeholder="category id"
                className="h-10 rounded-lg border border-slate-300 px-3 text-sm outline-none disabled:bg-slate-100"
              />
              <input
                value={activeCategory.name}
                disabled={!canEdit}
                onChange={(e) =>
                  setRestaurant((prev) => {
                    const next = clone(prev);
                    next.categories[activeCategoryIndex].name = e.target.value;
                    return next;
                  })
                }
                placeholder="original name"
                className="h-10 rounded-lg border border-slate-300 px-3 text-sm outline-none disabled:bg-slate-100"
              />
              <input
                value={activeCategory.icon ?? ''}
                disabled={!canEdit}
                onChange={(e) =>
                  setRestaurant((prev) => {
                    const next = clone(prev);
                    next.categories[activeCategoryIndex].icon = e.target.value;
                    return next;
                  })
                }
                placeholder="icon"
                className="h-10 rounded-lg border border-slate-300 px-3 text-sm outline-none disabled:bg-slate-100"
              />
            </div>
          </section>
        )}

        <section className="mb-5 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-slate-900">Product Posters</h2>
            <button
              type="button"
              disabled={!canEdit || !activeCategory}
              onClick={handleAddProduct}
              className="rounded-lg bg-slate-900 px-3 py-2 text-sm font-medium text-white disabled:cursor-not-allowed disabled:bg-slate-300"
            >
              + Add Product
            </button>
          </div>

          {activeCategory?.items.length ? (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {activeCategory.items.map((item, itemIndex) => (
                <article
                  key={item.id}
                  className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm"
                >
                  <div className="relative h-40 w-full bg-slate-100">
                    <img
                      src={item.image || '/images/dishes/menemen.jpg'}
                      alt={item.name}
                      className="h-full w-full object-cover"
                    />
                    {!item.available && (
                      <span className="absolute left-2 top-2 rounded-full bg-black/70 px-2 py-1 text-xs font-semibold text-white">
                        Hidden
                      </span>
                    )}
                  </div>
                  <div className="p-4">
                    <h3 className="line-clamp-1 text-base font-bold text-slate-900">{item.name || 'Untitled'}</h3>
                    <p className="mt-1 line-clamp-2 text-sm text-slate-600">
                      {item.description.en || item.description.ru || item.description.tr || 'No description'}
                    </p>
                    <div className="mt-3 flex items-center justify-between">
                      <span className="text-xs text-slate-500">{item.id}</span>
                      <div className="flex gap-2">
                        <button
                          type="button"
                          disabled={!canEdit}
                          onClick={() =>
                            setEditingItem({ categoryIndex: activeCategoryIndex, itemIndex })
                          }
                          className="rounded-lg bg-slate-900 px-3 py-1.5 text-xs font-medium text-white disabled:bg-slate-300"
                        >
                          Edit
                        </button>
                        <button
                          type="button"
                          disabled={!canEdit}
                          onClick={() => handleDeleteProduct(activeCategoryIndex, itemIndex)}
                          className="rounded-lg border border-red-200 bg-red-50 px-3 py-1.5 text-xs font-medium text-red-700 disabled:opacity-50"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <div className="rounded-xl border border-dashed border-slate-300 p-8 text-center text-sm text-slate-500">
              No products in this category yet.
            </div>
          )}
        </section>

        <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={handleSave}
              disabled={!canEdit}
              className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-700 disabled:cursor-not-allowed disabled:bg-slate-300"
            >
              Save (Dev Local)
            </button>
            <button
              type="button"
              onClick={handleReset}
              disabled={!canEdit}
              className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:bg-slate-100"
            >
              Reset to Base Files
            </button>
            <button
              type="button"
              onClick={() => {
                exportData(data);
                setStatus('Exported menu-data-export.json');
              }}
              className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
            >
              Export JSON
            </button>
          </div>
          {status && <p className="mt-3 text-sm text-slate-600">{status}</p>}
        </section>
      </main>

      {editingItemData && editingItem && (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/45">
          <button
            type="button"
            className="h-full w-full"
            aria-label="Close editor"
            onClick={() => setEditingItem(null)}
          />
          <aside className="relative h-full w-full max-w-xl overflow-y-auto bg-white p-5 shadow-2xl">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-xl font-bold text-slate-900">Edit Product</h2>
              <button
                type="button"
                onClick={() => setEditingItem(null)}
                className="rounded-lg border border-slate-300 px-3 py-1.5 text-sm"
              >
                Close
              </button>
            </div>

            <div className="space-y-3">
              <label className="block text-sm">
                <span className="mb-1 block font-medium text-slate-700">Item ID</span>
                <input
                  value={editingItemData.id}
                  disabled={!canEdit}
                  onChange={(e) => setItemField(editingItem.categoryIndex, editingItem.itemIndex, { id: e.target.value })}
                  className="h-10 w-full rounded-lg border border-slate-300 px-3 outline-none disabled:bg-slate-100"
                />
              </label>
              <label className="block text-sm">
                <span className="mb-1 block font-medium text-slate-700">Name</span>
                <input
                  value={editingItemData.name}
                  disabled={!canEdit}
                  onChange={(e) => setItemField(editingItem.categoryIndex, editingItem.itemIndex, { name: e.target.value })}
                  className="h-10 w-full rounded-lg border border-slate-300 px-3 outline-none disabled:bg-slate-100"
                />
              </label>
              <label className="block text-sm">
                <span className="mb-1 block font-medium text-slate-700">Image URL</span>
                <input
                  value={editingItemData.image}
                  disabled={!canEdit}
                  onChange={(e) => setItemField(editingItem.categoryIndex, editingItem.itemIndex, { image: e.target.value })}
                  className="h-10 w-full rounded-lg border border-slate-300 px-3 outline-none disabled:bg-slate-100"
                />
              </label>
              <label className="block text-sm">
                <span className="mb-1 block font-medium text-slate-700">Upload Image</span>
                <input
                  type="file"
                  accept="image/*"
                  disabled={!canEdit}
                  onChange={handleUploadImage}
                  className="block w-full rounded-lg border border-slate-300 bg-white p-2 text-sm disabled:bg-slate-100"
                />
              </label>

              <div className="grid grid-cols-2 gap-2">
                <input
                  value={editingItemData.portion ?? ''}
                  disabled={!canEdit}
                  onChange={(e) => setItemField(editingItem.categoryIndex, editingItem.itemIndex, { portion: e.target.value })}
                  placeholder="portion"
                  className="h-10 rounded-lg border border-slate-300 px-3 text-sm outline-none disabled:bg-slate-100"
                />
                <input
                  type="number"
                  value={editingItemData.calories ?? 0}
                  disabled={!canEdit}
                  onChange={(e) =>
                    setItemField(editingItem.categoryIndex, editingItem.itemIndex, {
                      calories: Number.isNaN(Number(e.target.value)) ? 0 : Number(e.target.value),
                    })
                  }
                  placeholder="calories"
                  className="h-10 rounded-lg border border-slate-300 px-3 text-sm outline-none disabled:bg-slate-100"
                />
              </div>

              <input
                value={(editingItemData.allergens ?? []).join(', ')}
                disabled={!canEdit}
                onChange={(e) =>
                  setItemField(editingItem.categoryIndex, editingItem.itemIndex, {
                    allergens: e.target.value
                      .split(',')
                      .map((token) => token.trim())
                      .filter(Boolean),
                  })
                }
                placeholder="allergen ids, comma separated"
                className="h-10 w-full rounded-lg border border-slate-300 px-3 text-sm outline-none disabled:bg-slate-100"
              />

              <div className="flex flex-wrap gap-4 text-sm">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={editingItemData.available}
                    disabled={!canEdit}
                    onChange={(e) => setItemField(editingItem.categoryIndex, editingItem.itemIndex, { available: e.target.checked })}
                  />
                  Available
                </label>
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={Boolean(editingItemData.vegetarian)}
                    disabled={!canEdit}
                    onChange={(e) => setItemField(editingItem.categoryIndex, editingItem.itemIndex, { vegetarian: e.target.checked })}
                  />
                  Vegetarian
                </label>
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={Boolean(editingItemData.vegan)}
                    disabled={!canEdit}
                    onChange={(e) => setItemField(editingItem.categoryIndex, editingItem.itemIndex, { vegan: e.target.checked })}
                  />
                  Vegan
                </label>
              </div>

              <div className="space-y-2">
                {ALL_LANGUAGES.map((lang) => (
                  <label key={lang} className="block text-sm">
                    <span className="mb-1 block font-medium text-slate-700">Description {lang.toUpperCase()}</span>
                    <textarea
                      value={editingItemData.description[lang] ?? ''}
                      disabled={!canEdit}
                      onChange={(e) =>
                        setItemField(editingItem.categoryIndex, editingItem.itemIndex, {
                          description: { ...editingItemData.description, [lang]: e.target.value },
                        })
                      }
                      className="h-20 w-full rounded-lg border border-slate-300 p-2 outline-none disabled:bg-slate-100"
                    />
                  </label>
                ))}
              </div>
            </div>
          </aside>
        </div>
      )}
    </div>
  );
}

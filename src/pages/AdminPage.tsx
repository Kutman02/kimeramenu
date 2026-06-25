import type { RestaurantConfig } from '../types/menu';
import { AdminCategoriesSection } from './admin/components/AdminCategoriesSection';
import { AdminDataSection } from './admin/components/AdminDataSection';
import { AdminHeader } from './admin/components/AdminHeader';
import { AdminItemsSection } from './admin/components/AdminItemsSection';
import { AdminNavigation } from './admin/components/AdminNavigation';
import { AdminOverviewSection } from './admin/components/AdminOverviewSection';
import { AdminProfileSection } from './admin/components/AdminProfileSection';
import { AdminUnavailableState } from './admin/components/AdminUnavailableState';
import { CategoryEditorModal } from './admin/components/CategoryEditorModal';
import { ItemEditorModal } from './admin/components/ItemEditorModal';
import { ADMIN_SECTIONS } from './admin/constants';
import { useAdminDataActions } from './admin/hooks/useAdminDataActions';
import { useAdminPageState } from './admin/hooks/useAdminPageState';
import { useCategoryEditorActions } from './admin/hooks/useCategoryEditorActions';
import { useItemEditorActions } from './admin/hooks/useItemEditorActions';
import { clone, getCategoryLabel, getItemDescription } from './admin/utils';

export function AdminPage() {
  const {
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
  } = useAdminPageState();

  const setRestaurant = (updater: (prev: RestaurantConfig) => RestaurantConfig) => {
    setData((prev) => {
      if (!prev.restaurants[0]) return prev;

      const next = clone(prev);
      next.restaurants[0] = updater(next.restaurants[0]);
      return next;
    });
  };

  const {
    patchCategoryDraft,
    setCategoryTranslation,
    openCreateCategory,
    openEditCategory,
    saveCategoryEditor,
    handleDeleteActiveCategory,
  } = useCategoryEditorActions({
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
  });

  const {
    patchItemDraft,
    setItemDescription,
    toggleItemAllergen,
    setIncludedItemIdsFromText,
    openCreateItem,
    openEditItem,
    saveItemEditor,
    handleDeleteProduct,
    handleUploadImage,
  } = useItemEditorActions({
    canEdit,
    restaurant,
    createItemCategoryIndex,
    itemEditor,
    setItemEditor,
    setData,
    setStatus,
  });

  const { handleSave, handleReset, refreshJsonEditorFromData, applyJsonEditor, handleExport } =
    useAdminDataActions({
      canEdit,
      isSaving,
      data,
      jsonEditorText,
      setData,
      setStatus,
      setIsSaving,
      setJsonEditorText,
      setActiveCategoryId,
      setItemsCategoryId,
      setCategoryEditor,
      setItemEditor,
      setItemSearch,
    });

  if (!restaurant) {
    return <AdminUnavailableState />;
  }

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
              onExport={handleExport}
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

import { useMemo } from 'react';
import { Header } from '../components/common/Header';
import { MenuCard } from '../components/menu/MenuCard';
import { MenuCategory } from '../components/menu/MenuCategory';
import { useRestaurant } from '../hooks/useMenuData';
import { CategoryTabs } from './home/components/CategoryTabs';
import { HomeFooter } from './home/components/HomeFooter';
import { HomePageSkeleton } from './home/components/HomePageSkeleton';
import { ItemDetailsModal } from './home/components/ItemDetailsModal';
import { LanguageSelectionPrompt } from './home/components/LanguageSelectionPrompt';
import { NoResultsState } from './home/components/NoResultsState';
import { HOME_PAGE_TEXT } from './home/constants/homePageText';
import { useCategoryNavigation } from './home/hooks/useCategoryNavigation';
import { useFilteredCategories } from './home/hooks/useFilteredCategories';
import { useItemDetailsModal } from './home/hooks/useItemDetailsModal';
import { usePreferredLanguage } from './home/hooks/usePreferredLanguage';
import type { MenuItem } from '../types/menu';

const RESTAURANT_ID = 'breakfast_place';

export function HomePage() {
  const { currentLanguage, setCurrentLanguage, hasSelectedLanguage, selectLanguage } =
    usePreferredLanguage();
  const { restaurant, isLoading: isRestaurantLoading, error: restaurantError } =
    useRestaurant(RESTAURANT_ID);

  const filteredCategories = useFilteredCategories({
    restaurant,
    searchQuery: '',
    dietFilter: 'all',
    currentLanguage,
  });

  const servedToTableCategories = useMemo(
    () =>
      filteredCategories.filter(
        (category) => category.group === 'served_to_table' || Boolean(category.isComplimentary)
      ),
    [filteredCategories]
  );

  const beverageCategories = useMemo(
    () => filteredCategories.filter((category) => category.group === 'beverages'),
    [filteredCategories]
  );

  const yourSelectionCategories = useMemo(
    () =>
      filteredCategories.filter((category) => {
        if (category.group === 'your_selections') return true;

        // Backward compatibility for previously saved local JSON without category groups.
        const hasExplicitGroup = Boolean(category.group);
        if (!hasExplicitGroup && !category.isComplimentary) return true;

        return false;
      }),
    [filteredCategories]
  );

  const navigationCategories = useMemo(
    () => [...yourSelectionCategories, ...beverageCategories],
    [yourSelectionCategories, beverageCategories]
  );

  const servedToTableItems = useMemo(
    () => servedToTableCategories.flatMap((category) => category.items),
    [servedToTableCategories]
  );

  const {
    currentActiveCategoryId,
    categoryTabRefs,
    categoryTabsContainerRef,
    onCategorySelect,
  } = useCategoryNavigation(navigationCategories);

  const {
    selectedItem,
    sheetTranslateY,
    isDraggingSheet,
    isOpeningSheet,
    modalBodyRef,
    openItemDetails,
    openRelatedItemDetails,
    closeItemDetails,
    handleModalTouchStart,
    handleModalTouchMove,
    handleModalTouchEnd,
  } = useItemDetailsModal();

  const allItemsById = useMemo(() => {
    const map = new Map<string, MenuItem>();
    restaurant?.categories.forEach((category) => {
      category.items.forEach((item) => {
        map.set(item.id, item);
      });
    });
    return map;
  }, [restaurant]);

  const relatedItemsForSelected = useMemo(() => {
    if (!selectedItem) return [];

    const includedItemIds = selectedItem.includedItemIds ?? [];
    if (includedItemIds.length) {
      const itemsFromIds = includedItemIds
        .map((itemId) => allItemsById.get(itemId))
        .filter((item): item is MenuItem => Boolean(item));

      if (itemsFromIds.length) {
        return itemsFromIds;
      }
    }

    const includedItems = selectedItem.includedItems ?? [];
    if (!includedItems.length) return [];

    return includedItems.map((includedItem, index) => {
      const localizedText =
        includedItem[currentLanguage] || includedItem.en || includedItem.ru || includedItem.tr || '';

      return {
        id: `${selectedItem.id}_included_${index}`,
        name: localizedText,
        description: {
          en: includedItem.en || localizedText,
          ru: includedItem.ru || includedItem.en || localizedText,
          tr: includedItem.tr || includedItem.en || localizedText,
        },
        price: 0,
        image: selectedItem.image,
        available: true,
        isComplimentary: true,
      };
    });
  }, [selectedItem, allItemsById, currentLanguage]);

  if (isRestaurantLoading) {
    return <HomePageSkeleton />;
  }

  if (!restaurant) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-center">
          <p className="text-gray-700 text-lg">
            {restaurantError ?? 'Menu is temporarily unavailable'}
          </p>
        </div>
      </div>
    );
  }

  if (!hasSelectedLanguage) {
    return <LanguageSelectionPrompt onSelectLanguage={selectLanguage} />;
  }

  return (
    <div className="min-h-screen bg-white">
      <Header
        restaurant={restaurant}
        currentLanguage={currentLanguage}
        onLanguageChange={setCurrentLanguage}
      />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-2 pb-8 sm:pt-4 sm:pb-12">
        {navigationCategories.length > 0 && (
          <CategoryTabs
            categories={navigationCategories}
            currentLanguage={currentLanguage}
            activeCategoryId={currentActiveCategoryId}
            categoryTabRefs={categoryTabRefs}
            categoryTabsContainerRef={categoryTabsContainerRef}
            onCategorySelect={onCategorySelect}
          />
        )}

        {servedToTableItems.length > 0 && (
          <section className="mb-8 rounded-2xl border border-emerald-200 bg-emerald-50/70 p-4 shadow-sm sm:p-5">
            <p className="text-sm font-semibold uppercase tracking-wide text-emerald-800">
              {HOME_PAGE_TEXT.standardBreakfastTitle[currentLanguage]}
            </p>

            <div className="mt-4 space-y-3">
              {servedToTableItems.map((item) => (
                <MenuCard
                  key={item.id}
                  item={item}
                  language={currentLanguage}
                  onClick={openItemDetails}
                />
              ))}
            </div>
          </section>
        )}

        {yourSelectionCategories.length > 0 && (
          <p className="mb-4 text-sm font-semibold uppercase tracking-wide text-slate-500">
            {HOME_PAGE_TEXT.yourSelectionsTitle[currentLanguage]}
          </p>
        )}

        {yourSelectionCategories.map((category) => (
          <MenuCategory
            key={category.id}
            category={category}
            language={currentLanguage}
            onItemClick={openItemDetails}
          />
        ))}

        {beverageCategories.length > 0 && (
          <p className="mb-4 text-sm font-semibold uppercase tracking-wide text-slate-500">
            {HOME_PAGE_TEXT.beveragesTitle[currentLanguage]}
          </p>
        )}

        {beverageCategories.map((category) => (
          <MenuCategory
            key={category.id}
            category={category}
            language={currentLanguage}
            onItemClick={openItemDetails}
          />
        ))}

        {navigationCategories.length === 0 && servedToTableItems.length === 0 && (
          <NoResultsState currentLanguage={currentLanguage} />
        )}

        <ItemDetailsModal
          selectedItem={selectedItem}
          currentLanguage={currentLanguage}
          relatedItems={relatedItemsForSelected}
          modalBodyRef={modalBodyRef}
          sheetTranslateY={sheetTranslateY}
          isDraggingSheet={isDraggingSheet}
          isOpeningSheet={isOpeningSheet}
          onClose={closeItemDetails}
          onRelatedItemClick={openRelatedItemDetails}
          onTouchStart={handleModalTouchStart}
          onTouchMove={handleModalTouchMove}
          onTouchEnd={handleModalTouchEnd}
        />
      </main>

      <HomeFooter restaurant={restaurant} currentLanguage={currentLanguage} />
    </div>
  );
}

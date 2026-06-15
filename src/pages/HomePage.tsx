import { Header } from '../components/common/Header';
import { useRestaurant } from '../hooks/useMenuData';
import { CategoryTabs } from './home/components/CategoryTabs';
import { HomeFooter } from './home/components/HomeFooter';
import { HomePageSkeleton } from './home/components/HomePageSkeleton';
import { ItemDetailsModal } from './home/components/ItemDetailsModal';
import { LanguageSelectionPrompt } from './home/components/LanguageSelectionPrompt';
import { MenuCategoryGroupSection } from './home/components/MenuCategoryGroupSection';
import { NoResultsState } from './home/components/NoResultsState';
import { ServedToTableSection } from './home/components/ServedToTableSection';
import { HOME_PAGE_TEXT } from './home/constants/homePageText';
import { useCategoryNavigation } from './home/hooks/useCategoryNavigation';
import { useFilteredCategories } from './home/hooks/useFilteredCategories';
import { useHomeMenuSections } from './home/hooks/useHomeMenuSections';
import { useItemDetailsModal } from './home/hooks/useItemDetailsModal';
import { usePreferredLanguage } from './home/hooks/usePreferredLanguage';
import { useRelatedItemsForSelected } from './home/hooks/useRelatedItemsForSelected';

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

  const { servedToTableItems, yourSelectionCategories, beverageCategories, navigationCategories } =
    useHomeMenuSections(filteredCategories);

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
    isClosingSheet,
    isPreparingOpenPosition,
    modalBodyRef,
    openItemDetails,
    openRelatedItemDetails,
    closeItemDetails,
    handleModalTouchStart,
    handleModalTouchMove,
    handleModalTouchEnd,
  } = useItemDetailsModal();

  const relatedItemsForSelected = useRelatedItemsForSelected({
    selectedItem,
    restaurant,
    currentLanguage,
  });

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

        <ServedToTableSection
          items={servedToTableItems}
          language={currentLanguage}
          onItemClick={openItemDetails}
        />

        <MenuCategoryGroupSection
          title={HOME_PAGE_TEXT.yourSelectionsTitle[currentLanguage]}
          categories={yourSelectionCategories}
          language={currentLanguage}
          onItemClick={openItemDetails}
        />

        <MenuCategoryGroupSection
          title={HOME_PAGE_TEXT.beveragesTitle[currentLanguage]}
          categories={beverageCategories}
          language={currentLanguage}
          onItemClick={openItemDetails}
        />

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
          isClosingSheet={isClosingSheet}
          isPreparingOpenPosition={isPreparingOpenPosition}
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

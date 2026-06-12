import { useEffect, useMemo, useRef, useState, type TouchEvent } from 'react';
import { Header } from '../components/common/Header';
import { MenuCategory } from '../components/menu/MenuCategory';
import { useRestaurant } from '../hooks/useMenuData';
import type { MenuItem, Language } from '../types/menu';

const RESTAURANT_ID = 'breakfast_place';

export function HomePage() {
  // State for language
  const [currentLanguage, setCurrentLanguage] = useState<Language>(() => {
    // Load from localStorage or default to 'en'
    const saved = localStorage.getItem('preferredLanguage');
    return (saved as Language) || 'en';
  });
  const [hasSelectedLanguage, setHasSelectedLanguage] = useState(() => {
    const saved = localStorage.getItem('preferredLanguage');
    return Boolean(saved);
  });

  // State for selected item (for detail view)
  const [selectedItem, setSelectedItem] = useState<MenuItem | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [dietFilter, setDietFilter] = useState<'all' | 'vegetarian' | 'vegan'>('all');
  const [activeCategoryId, setActiveCategoryId] = useState<string>('');
  const [sheetTranslateY, setSheetTranslateY] = useState(0);
  const [isDraggingSheet, setIsDraggingSheet] = useState(false);
  const categoryTabRefs = useRef<Record<string, HTMLButtonElement | null>>({});
  const categoryTabsContainerRef = useRef<HTMLDivElement | null>(null);
  const suppressObserverUntilRef = useRef(0);
  const modalBodyRef = useRef<HTMLDivElement | null>(null);
  const touchStartYRef = useRef<number | null>(null);
  const touchStartScrollTopRef = useRef(0);

  // Load restaurant data
  const { restaurant } = useRestaurant(RESTAURANT_ID);
  const uiText = {
    loading: {
      en: 'Loading menu...',
      ru: 'Загружаем меню...',
      tr: 'Menu yukleniyor...',
    },
    searchPlaceholder: {
      en: 'Search by dish name...',
      ru: 'Поиск по названию блюда...',
      tr: 'Urun adina gore ara...',
    },
    filtersTitle: {
      en: 'Filters',
      ru: 'Фильтры',
      tr: 'Filtreler',
    },
    filterAll: {
      en: 'All',
      ru: 'Все',
      tr: 'Tum',
    },
    filterVegetarian: {
      en: 'Vegetarian',
      ru: 'Вегетарианское',
      tr: 'Vejetaryen',
    },
    filterVegan: {
      en: 'Vegan',
      ru: 'Веганское',
      tr: 'Vegan',
    },
    noResultsTitle: {
      en: 'Nothing found',
      ru: 'Ничего не найдено',
      tr: 'Sonuc bulunamadi',
    },
    noResultsBody: {
      en: 'Try another name or disable filters.',
      ru: 'Попробуйте другое название или отключите фильтры.',
      tr: 'Baska isim deneyin veya filtreleri kaldirin.',
    },
    detailsTitle: {
      en: 'Dish details',
      ru: 'Информация о блюде',
      tr: 'Urun bilgisi',
    },
    close: {
      en: 'Close',
      ru: 'Закрыть',
      tr: 'Kapat',
    },
    portion: {
      en: 'Portion',
      ru: 'Порция',
      tr: 'Porsiyon',
    },
    calories: {
      en: 'Calories',
      ru: 'Калории',
      tr: 'Kalori',
    },
    spicy: {
      en: 'Spicy level',
      ru: 'Острота',
      tr: 'Acilik',
    },
    allergens: {
      en: 'Allergens',
      ru: 'Аллергены',
      tr: 'Alerjenler',
    },
  } as const;

  // Save language preference
  useEffect(() => {
    localStorage.setItem('preferredLanguage', currentLanguage);
  }, [currentLanguage]);

  const filteredCategories = useMemo(() => {
    if (!restaurant) return [];

    const query = searchQuery.trim().toLowerCase();

    return restaurant.categories
      .map((category) => {
        const items = category.items.filter((item) => {
          if (!item.available) return false;

          if (dietFilter === 'vegetarian' && !item.vegetarian) return false;
          if (dietFilter === 'vegan' && !item.vegan) return false;

          if (!query) return true;

          const nameMatch = item.name.toLowerCase().includes(query);
          const localizedDescription = item.description[currentLanguage] || item.description.en || '';
          const descriptionMatch = localizedDescription.toLowerCase().includes(query);

          return nameMatch || descriptionMatch;
        });

        return {
          ...category,
          items,
        };
      })
      .filter((category) => category.items.length > 0);
  }, [restaurant, searchQuery, dietFilter, currentLanguage]);

  const totalVisibleItems = useMemo(
    () => filteredCategories.reduce((sum, category) => sum + category.items.length, 0),
    [filteredCategories]
  );
  const fallbackCategoryId = filteredCategories[0]?.id ?? '';
  const currentActiveCategoryId = filteredCategories.some((category) => category.id === activeCategoryId)
    ? activeCategoryId
    : fallbackCategoryId;

  useEffect(() => {
    if (!filteredCategories.length) return;

    const elements = filteredCategories
      .map((category) => document.getElementById(`cat-${category.id}`))
      .filter((el): el is HTMLElement => Boolean(el));

    if (!elements.length) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (Date.now() < suppressObserverUntilRef.current) return;

        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];

        if (visible?.target?.id) {
          setActiveCategoryId(visible.target.id.replace('cat-', ''));
        }
      },
      { rootMargin: '-110px 0px -62% 0px', threshold: [0.25, 0.5, 0.8] }
    );

    elements.forEach((element) => observer.observe(element));
    return () => observer.disconnect();
  }, [filteredCategories]);

  useEffect(() => {
    if (!currentActiveCategoryId) return;
    const activeTab = categoryTabRefs.current[currentActiveCategoryId];
    const container = categoryTabsContainerRef.current;
    if (!activeTab || !container) return;

    const targetLeft =
      activeTab.offsetLeft - container.clientWidth / 2 + activeTab.clientWidth / 2;
    container.scrollTo({
      left: Math.max(0, targetLeft),
      behavior: 'smooth',
    });
  }, [currentActiveCategoryId]);

  const scrollToCategory = (categoryId: string) => {
    const element = document.getElementById(`cat-${categoryId}`);
    if (!element) return;

    const y = element.getBoundingClientRect().top + window.scrollY - 108;
    window.scrollTo({
      top: Math.max(0, y),
      behavior: 'smooth',
    });
  };

  const openItemDetails = (item: MenuItem) => {
    setSheetTranslateY(0);
    setIsDraggingSheet(false);
    setSelectedItem(item);
  };

  const closeItemDetails = () => {
    setSheetTranslateY(0);
    setIsDraggingSheet(false);
    setSelectedItem(null);
  };

  const handleModalTouchStart = (e: TouchEvent<HTMLDivElement>) => {
    const body = modalBodyRef.current;
    if (!body) return;
    touchStartYRef.current = e.touches[0].clientY;
    touchStartScrollTopRef.current = body.scrollTop;
  };

  const handleModalTouchMove = (e: TouchEvent<HTMLDivElement>) => {
    const body = modalBodyRef.current;
    if (!body || touchStartYRef.current == null) return;

    const deltaY = e.touches[0].clientY - touchStartYRef.current;
    const canSwipeClose = touchStartScrollTopRef.current <= 0 && body.scrollTop <= 0 && deltaY > 0;

    if (!canSwipeClose) {
      if (isDraggingSheet || sheetTranslateY !== 0) {
        setIsDraggingSheet(false);
        setSheetTranslateY(0);
      }
      return;
    }

    setIsDraggingSheet(true);
    setSheetTranslateY(Math.min(deltaY * 0.85, 260));
  };

  const handleModalTouchEnd = () => {
    touchStartYRef.current = null;
    touchStartScrollTopRef.current = 0;

    if (!isDraggingSheet) return;

    if (sheetTranslateY > 150) {
      closeItemDetails();
      return;
    }

    setSheetTranslateY(0);
    setIsDraggingSheet(false);
  };

  if (!restaurant) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-center">
          <p className="text-gray-600 text-lg">{uiText.loading[currentLanguage]}</p>
        </div>
      </div>
    );
  }

  if (!hasSelectedLanguage) {
    return (
      <div className="min-h-screen bg-slate-100 flex items-center justify-center px-4">
        <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-lg">
          <h1 className="mb-2 text-2xl font-bold text-slate-900">Choose language</h1>
          <p className="mb-5 text-sm text-slate-600">Пожалуйста, выберите язык меню</p>

          <div className="space-y-2">
            <button
              type="button"
              onClick={() => {
                setCurrentLanguage('en');
                localStorage.setItem('preferredLanguage', 'en');
                setHasSelectedLanguage(true);
              }}
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-left text-base font-semibold text-slate-800 transition hover:bg-slate-100"
            >
              🇬🇧 English
            </button>
            <button
              type="button"
              onClick={() => {
                setCurrentLanguage('ru');
                localStorage.setItem('preferredLanguage', 'ru');
                setHasSelectedLanguage(true);
              }}
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-left text-base font-semibold text-slate-800 transition hover:bg-slate-100"
            >
              🇷🇺 Русский
            </button>
            <button
              type="button"
              onClick={() => {
                setCurrentLanguage('tr');
                localStorage.setItem('preferredLanguage', 'tr');
                setHasSelectedLanguage(true);
              }}
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-left text-base font-semibold text-slate-800 transition hover:bg-slate-100"
            >
              🇹🇷 Türkçe
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <Header
        restaurant={restaurant}
        currentLanguage={currentLanguage}
        onLanguageChange={setCurrentLanguage}
      />

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-2 pb-8 sm:pt-4 sm:pb-12">
        <section className="sticky top-3 z-40 mb-4 ml-12 bg-transparent p-0 sm:ml-14 sm:mb-6">
          <div className="relative">
            <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-4 bg-gradient-to-r from-white to-transparent" />
            <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-5 bg-gradient-to-l from-white to-transparent" />
            <div
              ref={categoryTabsContainerRef}
              className="flex min-h-10 snap-x snap-mandatory items-center gap-1.5 overflow-x-auto px-1 py-0.5 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
            >
            {filteredCategories.map((category) => (
              <button
                key={category.id}
                ref={(el) => {
                  categoryTabRefs.current[category.id] = el;
                }}
                type="button"
                onClick={() => {
                  suppressObserverUntilRef.current = Date.now() + 900;
                  setActiveCategoryId(category.id);
                  scrollToCategory(category.id);
                }}
                className={`h-10 shrink-0 snap-start whitespace-nowrap rounded-full border px-3 text-sm font-medium transition duration-200 ${
                  currentActiveCategoryId === category.id
                    ? 'border-slate-900 bg-slate-900 text-white shadow-[0_0_0_3px_rgba(15,23,42,0.14)]'
                    : 'border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100'
                }`}
              >
                {category.icon ? `${category.icon} ` : ''}
                {category.displayName[currentLanguage] || category.displayName.en}
                <span className="ml-1 text-xs opacity-80">({category.items.length})</span>
              </button>
            ))}
            </div>
          </div>
        </section>

        <section className="mb-5 rounded-2xl border border-slate-200 bg-white p-3 shadow-sm sm:p-4">
          <div className="mb-3 flex flex-col gap-3 sm:flex-row">
            <input
              type="search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={uiText.searchPlaceholder[currentLanguage]}
              className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-slate-400 focus:bg-white"
            />
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => setDietFilter('all')}
                className={`h-11 rounded-xl px-4 text-sm font-medium transition ${
                  dietFilter === 'all'
                    ? 'bg-slate-900 text-white'
                    : 'border border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                }`}
              >
                {uiText.filterAll[currentLanguage]}
              </button>
              <button
                type="button"
                onClick={() => setDietFilter('vegetarian')}
                className={`h-11 rounded-xl px-4 text-sm font-medium transition ${
                  dietFilter === 'vegetarian'
                    ? 'bg-emerald-600 text-white'
                    : 'border border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                }`}
              >
                🌱 {uiText.filterVegetarian[currentLanguage]}
              </button>
              <button
                type="button"
                onClick={() => setDietFilter('vegan')}
                className={`h-11 rounded-xl px-4 text-sm font-medium transition ${
                  dietFilter === 'vegan'
                    ? 'bg-emerald-700 text-white'
                    : 'border border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                }`}
              >
                🌿 {uiText.filterVegan[currentLanguage]}
              </button>
            </div>
          </div>
          <p className="text-xs text-slate-500">
            {uiText.filtersTitle[currentLanguage]}: {totalVisibleItems}
          </p>
        </section>

        {/* Categories Sections */}
        {filteredCategories.map((category) => (
          <MenuCategory
            key={category.id}
            category={category}
            language={currentLanguage}
            allergens={restaurant.allergens}
            onItemClick={openItemDetails}
          />
        ))}

        {filteredCategories.length === 0 && (
          <section className="rounded-2xl border border-slate-200 bg-slate-50 p-8 text-center">
            <h3 className="mb-2 text-xl font-bold text-slate-900">
              {uiText.noResultsTitle[currentLanguage]}
            </h3>
            <p className="text-slate-600">{uiText.noResultsBody[currentLanguage]}</p>
          </section>
        )}

        {/* Selected Item Info */}
        {selectedItem && (
          <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-slate-900/35 backdrop-blur-md">
            <div
              ref={modalBodyRef}
              onTouchStart={handleModalTouchStart}
              onTouchMove={handleModalTouchMove}
              onTouchEnd={handleModalTouchEnd}
              onTouchCancel={handleModalTouchEnd}
              style={{
                transform: `translateY(${sheetTranslateY}px)`,
                transition: isDraggingSheet ? 'none' : 'transform 220ms ease',
              }}
              className="relative h-[96vh] w-screen overflow-y-auto rounded-t-3xl border border-white/40 bg-white/78 p-4 shadow-[0_20px_60px_rgba(15,23,42,0.28)] sm:h-[92vh] sm:max-w-3xl sm:rounded-3xl sm:p-6"
            >
              <div className="mb-4 flex justify-center">
                <span className="h-1.5 w-14 rounded-full bg-slate-400/70" />
              </div>
              <div className="mb-4">
                <p className="text-xs uppercase tracking-wider text-slate-500 font-semibold mb-1">
                  {uiText.detailsTitle[currentLanguage]}
                </p>
                <h2 className="text-2xl font-bold text-slate-900">{selectedItem.name}</h2>
              </div>

              <div className="absolute right-5 top-5">
                <button
                  onClick={closeItemDetails}
                  className="text-gray-500 hover:text-gray-700 text-2xl"
                >
                  ✕
                </button>
              </div>

              <img
                src={selectedItem.image}
                alt={selectedItem.name}
                className="mb-4 h-64 w-full rounded-2xl object-cover shadow-sm"
              />

              <p className="mb-4 rounded-2xl bg-white/70 p-4 text-slate-700 backdrop-blur-sm">
                {selectedItem.description[currentLanguage] || selectedItem.description.en}
              </p>

              <div className="grid grid-cols-2 gap-4 mb-4">
                {selectedItem.portion && (
                  <div className="rounded-2xl bg-white/75 p-3 shadow-sm">
                    <p className="text-sm text-gray-600">{uiText.portion[currentLanguage]}</p>
                    <p className="font-semibold">{selectedItem.portion}</p>
                  </div>
                )}
                {selectedItem.calories && (
                  <div className="rounded-2xl bg-white/75 p-3 shadow-sm">
                    <p className="text-sm text-gray-600">{uiText.calories[currentLanguage]}</p>
                    <p className="font-semibold">{selectedItem.calories} kcal</p>
                  </div>
                )}
                {selectedItem.spicy && selectedItem.spicy > 0 && (
                  <div className="rounded-2xl bg-white/75 p-3 shadow-sm">
                    <p className="text-sm text-gray-600">{uiText.spicy[currentLanguage]}</p>
                    <p className="font-semibold">🌶️ {selectedItem.spicy}/5</p>
                  </div>
                )}
              </div>

              {selectedItem.allergens && selectedItem.allergens.length > 0 && (
                <div className="mb-4">
                  <p className="font-semibold mb-2">{uiText.allergens[currentLanguage]}:</p>
                  <div className="flex flex-wrap gap-2">
                    {selectedItem.allergens.map((allergenId) => {
                      const allergen = restaurant.allergens.find(
                        (a) => a.id === allergenId
                      );
                      return allergen ? (
                        <span
                          key={allergenId}
                          className="rounded-full bg-red-100/85 px-3 py-1 text-sm text-red-700 shadow-sm"
                        >
                          {allergen.icon} {allergen.name}
                        </span>
                      ) : null;
                    })}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-gray-800 text-white py-6 sm:py-8 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h3 className="font-bold mb-2">{restaurant.displayName[currentLanguage]}</h3>
            {restaurant.address && <p className="text-gray-400 text-sm">{restaurant.address}</p>}
            {restaurant.phone && <p className="text-gray-400 text-sm">{restaurant.phone}</p>}
          </div>
        </div>
      </footer>
    </div>
  );
}

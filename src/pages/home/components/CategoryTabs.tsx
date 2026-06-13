import type { MutableRefObject } from 'react';
import type { Language, MenuCategory } from '../../../types/menu';

interface CategoryTabsProps {
  categories: MenuCategory[];
  currentLanguage: Language;
  activeCategoryId: string;
  categoryTabRefs: MutableRefObject<Record<string, HTMLButtonElement | null>>;
  categoryTabsContainerRef: MutableRefObject<HTMLDivElement | null>;
  onCategorySelect: (categoryId: string) => void;
}

export function CategoryTabs({
  categories,
  currentLanguage,
  activeCategoryId,
  categoryTabRefs,
  categoryTabsContainerRef,
  onCategorySelect,
}: CategoryTabsProps) {
  return (
    <section className="sticky top-3 z-40 mb-4 ml-12 bg-transparent p-0 sm:ml-14 sm:mb-6">
      <div className="relative">
        <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-5 bg-gradient-to-l from-white to-transparent" />
        <div
          ref={categoryTabsContainerRef}
          className="flex min-h-10 snap-x snap-mandatory items-center gap-1.5 overflow-x-auto px-1 py-0.5 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        >
          {categories.map((category) => (
            <button
              key={category.id}
              ref={(el) => {
                categoryTabRefs.current[category.id] = el;
              }}
              type="button"
              onClick={() => onCategorySelect(category.id)}
              className={`h-10 shrink-0 snap-start whitespace-nowrap rounded-full border px-3 text-sm font-medium transition duration-200 ${
                activeCategoryId === category.id
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
  );
}

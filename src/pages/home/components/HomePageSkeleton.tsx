import { MenuCardSkeleton } from '../../../components/menu/MenuCardSkeleton';

const SKELETON_CARD_COUNT = 6;

export function HomePageSkeleton() {
  return (
    <div className="min-h-screen bg-white">
      <main className="mx-auto max-w-7xl px-4 pb-8 pt-2 sm:px-6 sm:pb-12 sm:pt-4 lg:px-8">
        <div className="mb-4 flex gap-2 overflow-hidden">
          {Array.from({ length: 5 }, (_, index) => (
            <div
              key={`tab-skeleton-${index}`}
              className="h-10 w-28 shrink-0 rounded-full bg-slate-200 animate-pulse"
            />
          ))}
        </div>

        <section className="mb-10 sm:mb-12">
          <div className="mb-4">
            <div className="mb-2 flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-slate-200 animate-pulse" />
              <div className="h-8 w-56 rounded-lg bg-slate-200 animate-pulse" />
            </div>
            <div className="h-4 w-48 rounded bg-slate-200 animate-pulse" />
          </div>

          <div className="space-y-3">
            {Array.from({ length: SKELETON_CARD_COUNT }, (_, index) => (
              <MenuCardSkeleton key={`menu-card-skeleton-${index}`} />
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}

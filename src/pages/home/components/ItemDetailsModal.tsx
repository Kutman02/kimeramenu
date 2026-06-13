import type { MutableRefObject, TouchEvent } from 'react';
import type { Language, MenuItem } from '../../../types/menu';
import fallbackDishImage from '../../../assets/zag.png';
import { MenuCard } from '../../../components/menu/MenuCard';
import { HOME_PAGE_TEXT } from '../constants/homePageText';

interface ItemDetailsModalProps {
  selectedItem: MenuItem | null;
  currentLanguage: Language;
  relatedItems: MenuItem[];
  modalBodyRef: MutableRefObject<HTMLDivElement | null>;
  sheetTranslateY: number;
  isDraggingSheet: boolean;
  onClose: () => void;
  onRelatedItemClick: (item: MenuItem) => void;
  onTouchStart: (e: TouchEvent<HTMLDivElement>) => void;
  onTouchMove: (e: TouchEvent<HTMLDivElement>) => void;
  onTouchEnd: () => void;
}

export function ItemDetailsModal({
  selectedItem,
  currentLanguage,
  relatedItems,
  modalBodyRef,
  sheetTranslateY,
  isDraggingSheet,
  onClose,
  onRelatedItemClick,
  onTouchStart,
  onTouchMove,
  onTouchEnd,
}: ItemDetailsModalProps) {
  if (!selectedItem) return null;

  const imageSrc = selectedItem.image?.trim() ? selectedItem.image : fallbackDishImage;
  const sheetOpacity = isDraggingSheet ? Math.max(0.84, 1 - sheetTranslateY / 450) : 1;
  const backdropOpacity = isDraggingSheet ? Math.max(0.2, 0.35 - sheetTranslateY / 700) : 0.35;

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center backdrop-blur-sm animate-fade-in"
      style={{ backgroundColor: `rgba(15, 23, 42, ${backdropOpacity})` }}
    >
      <div
        ref={modalBodyRef}
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
        onTouchCancel={onTouchEnd}
        style={{
          transform: `translateY(${sheetTranslateY}px)`,
          opacity: sheetOpacity,
          transition: isDraggingSheet
            ? 'none'
            : 'transform 280ms cubic-bezier(0.2, 0.8, 0.2, 1)',
        }}
        className="relative h-[96vh] w-screen overflow-y-auto overscroll-contain rounded-t-3xl border border-white/40 bg-white/78 p-4 shadow-[0_20px_60px_rgba(15,23,42,0.28)] sm:h-[92vh] sm:max-w-3xl sm:rounded-3xl sm:p-6"
      >
        <div className="mb-4 flex justify-center">
          <span className="h-1.5 w-14 rounded-full bg-slate-400/70 animate-handle-breathe" />
        </div>
        <div className="mb-4">
          <p className="text-xs uppercase tracking-wider text-slate-500 font-semibold mb-1">
            {HOME_PAGE_TEXT.detailsTitle[currentLanguage]}
          </p>
          <h2 className="text-2xl font-bold text-slate-900">{selectedItem.name}</h2>
        </div>

        <div className="absolute right-5 top-5">
          <button
            type="button"
            onClick={onClose}
            aria-label={HOME_PAGE_TEXT.close[currentLanguage]}
            className="text-gray-500 hover:text-gray-700 text-2xl"
          >
            ✕
          </button>
        </div>

        <img
          src={imageSrc}
          alt={selectedItem.name}
          className="mb-4 h-64 w-full rounded-2xl object-cover shadow-sm animate-modal-image-in"
          onError={(e) => {
            (e.target as HTMLImageElement).src = fallbackDishImage;
          }}
        />

        <p className="mb-4 rounded-2xl bg-white/70 p-4 text-slate-700 backdrop-blur-sm">
          {selectedItem.description[currentLanguage] || selectedItem.description.en}
        </p>

        {relatedItems.length > 0 && (
          <section className="mb-4 rounded-2xl border border-sky-200/80 bg-sky-100/45 p-3 sm:p-4">
            <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-sky-800">
              {HOME_PAGE_TEXT.includedItemsTitle[currentLanguage]}
            </h3>
            <div className="space-y-3">
              {relatedItems.map((relatedItem, index) => (
                <div
                  key={relatedItem.id}
                  className="animate-soft-rise-in rounded-2xl bg-sky-200/35 p-1.5"
                  style={{ animationDelay: `${Math.min(index * 45, 220)}ms` }}
                >
                  <MenuCard
                    item={relatedItem}
                    language={currentLanguage}
                    onClick={onRelatedItemClick}
                  />
                </div>
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}

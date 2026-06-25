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
  isOpeningSheet: boolean;
  isClosingSheet: boolean;
  isPreparingOpenPosition: boolean;
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
  isOpeningSheet,
  isClosingSheet,
  isPreparingOpenPosition,
  onClose,
  onRelatedItemClick,
  onTouchStart,
  onTouchMove,
  onTouchEnd,
}: ItemDetailsModalProps) {
  if (!selectedItem) return null;

  const imageSrc = selectedItem.image?.trim() ? selectedItem.image : fallbackDishImage;
  const maxBackdropOpacity = 0.35;
  const maxOpenTranslate = 560;
  const normalizedTranslate = Math.min(Math.max(sheetTranslateY / maxOpenTranslate, 0), 1);
  const openProgress = 1 - normalizedTranslate;
  const openingBackdropProgress = Math.pow(openProgress, 1.8);
  const closingBackdropProgress = Math.pow(openProgress, 1.2);
  const staticBackdropProgress = Math.max(openProgress, 0.88);
  const sheetOpacity = isDraggingSheet
    ? Math.max(0.84, 1 - sheetTranslateY / 450)
    : isClosingSheet
      ? Math.max(0.78, 1 - sheetTranslateY / 420)
    : Math.max(0.94, 1 - sheetTranslateY / 900);
  const backdropOpacity = isDraggingSheet
    ? Math.max(0.2, maxBackdropOpacity - sheetTranslateY / 700)
    : maxBackdropOpacity *
      (isOpeningSheet
        ? openingBackdropProgress
        : isClosingSheet
          ? closingBackdropProgress
          : staticBackdropProgress);
  const modalTopInset = 'calc(env(safe-area-inset-top, 0px) + 8px)';
  const modalBottomInset = 'calc(env(safe-area-inset-bottom, 0px) + 8px)';
  const modalMaxHeight =
    'calc(100dvh - env(safe-area-inset-top, 0px) - env(safe-area-inset-bottom, 0px) - 16px)';

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center backdrop-blur-sm sm:items-center"
      style={{
        backgroundColor: `rgba(4, 36, 29, ${backdropOpacity})`,
        paddingTop: modalTopInset,
        paddingBottom: modalBottomInset,
        transition: isDraggingSheet
          ? 'none'
          : isOpeningSheet
            ? 'background-color 360ms cubic-bezier(0.22, 1, 0.36, 1) 55ms'
            : isClosingSheet
              ? 'background-color 240ms ease-in'
            : 'background-color 240ms ease-out',
      }}
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
          maxHeight: modalMaxHeight,
          transition: isDraggingSheet || isPreparingOpenPosition
            ? 'none'
            : 'transform 300ms cubic-bezier(0.22, 1, 0.36, 1), opacity 300ms cubic-bezier(0.22, 1, 0.36, 1)',
        }}
        className="relative h-[96vh] w-screen overflow-y-auto overscroll-contain rounded-t-3xl border border-emerald-200/80 bg-linear-to-b from-white via-emerald-50/65 to-amber-50/40 p-3 shadow-[0_22px_60px_rgba(2,44,34,0.30)] sm:h-[92vh] sm:max-w-3xl sm:rounded-3xl sm:p-6"
      >
        <div className="mb-3 flex justify-center">
          <span className="h-1.5 w-14 rounded-full bg-emerald-500/45 animate-handle-breathe" />
        </div>
        <div className="mb-3 pr-10">
          <p className="mb-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-emerald-700/85">
            {HOME_PAGE_TEXT.detailsTitle[currentLanguage]}
          </p>
          <h2 className="text-2xl font-semibold tracking-tight text-emerald-950">{selectedItem.name}</h2>
        </div>

        <div className="absolute right-3 top-3 sm:right-5 sm:top-5">
          <button
            type="button"
            onClick={onClose}
            aria-label={HOME_PAGE_TEXT.close[currentLanguage]}
            className="flex h-9 w-9 items-center justify-center rounded-full border border-emerald-200 bg-white/80 text-xl text-emerald-800 shadow-sm transition hover:border-emerald-300 hover:bg-white hover:text-emerald-900"
          >
            ✕
          </button>
        </div>

        <div className="mx-auto mb-3 w-full max-w-md overflow-hidden rounded-2xl border border-emerald-200/80 bg-emerald-50/40 shadow-[0_10px_24px_rgba(2,44,34,0.14)]">
          <img
            src={imageSrc}
            alt={selectedItem.name}
            loading="eager"
            decoding="sync"
            fetchPriority="high"
            className="aspect-square w-full object-cover"
            onError={(e) => {
              (e.target as HTMLImageElement).src = fallbackDishImage;
            }}
          />
        </div>

        <p className="mb-3 rounded-2xl border border-emerald-100/90 bg-white/75 p-3 text-slate-700 shadow-sm backdrop-blur-sm sm:p-4">
          {selectedItem.description[currentLanguage] || selectedItem.description.en}
        </p>

        {relatedItems.length > 0 && (
          <section className="mb-4 rounded-2xl border border-emerald-200/80 bg-linear-to-br from-white to-emerald-50/80 p-3 shadow-sm sm:p-4">
            <h3 className="mb-3 text-xs font-semibold uppercase tracking-[0.14em] text-emerald-700 sm:text-sm">
              {HOME_PAGE_TEXT.includedItemsTitle[currentLanguage]}
            </h3>
            <div className="space-y-2.5">
              {relatedItems.map((relatedItem, index) => (
                <div
                  key={relatedItem.id}
                  className="animate-soft-rise-in rounded-2xl bg-emerald-100/40 p-1.5"
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

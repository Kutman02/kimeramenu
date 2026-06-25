import type { Language, MenuCategory, MenuItem, RestaurantConfig } from '../../../types/menu';
import { useItemImageCrop } from '../hooks/useItemImageCrop';
import type { ItemEditorState } from '../types';
import type { SquareCropControls } from '../utils';
import { ItemEditorDetailsForm } from './item-editor/ItemEditorDetailsForm';
import { ItemEditorImagePanel } from './item-editor/ItemEditorImagePanel';

interface ItemEditorModalProps {
  editor: ItemEditorState;
  restaurant: RestaurantConfig;
  canEdit: boolean;
  supportedLanguages: Language[];
  onClose: () => void;
  onPatchDraft: (patch: Partial<MenuItem>) => void;
  onSetItemDescription: (lang: Language, value: string) => void;
  onToggleItemAllergen: (allergenId: string) => void;
  onSetIncludedItemIdsFromText: (value: string) => void;
  onUploadImage: (payload: {
    file: File;
    squareSize: number;
    controls: SquareCropControls;
  }) => Promise<void>;
  onSave: () => void;
  getCategoryLabel: (category: MenuCategory) => string;
}

export function ItemEditorModal({
  editor,
  restaurant,
  canEdit,
  supportedLanguages,
  onClose,
  onPatchDraft,
  onSetItemDescription,
  onToggleItemAllergen,
  onSetIncludedItemIdsFromText,
  onUploadImage,
  onSave,
  getCategoryLabel,
}: ItemEditorModalProps) {
  const {
    squareSize,
    setSquareSize,
    cropFile,
    cropImage,
    cropError,
    isApplyingCrop,
    cropControls,
    setCropControls,
    previewCanvasRef,
    handleSelectImageForCrop,
    handleApplyCrop,
    handleCancelCrop,
  } = useItemImageCrop({
    editor,
    onUploadImage,
  });

  if (!editor) return null;

  const currentCategory = restaurant.categories[editor.categoryIndex];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <button
        type="button"
        aria-label="Close item editor"
        onClick={onClose}
        className="absolute inset-0 bg-slate-950/65"
      />

      <div className="relative z-10 max-h-[92vh] w-full max-w-4xl overflow-y-auto rounded-2xl bg-white p-6 shadow-2xl">
        <div className="mb-5 flex flex-wrap items-start justify-between gap-3">
          <div>
            <h2 className="text-xl font-semibold text-slate-900">
              {editor.mode === 'create' ? 'Создание товара' : 'Редактирование товара'}
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              Категория: {currentCategory ? getCategoryLabel(currentCategory) : 'Не найдена'}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-slate-300 px-3 py-1.5 text-sm text-slate-700 hover:bg-slate-50"
          >
            Закрыть
          </button>
        </div>

        <div className="grid grid-cols-1 gap-5 lg:grid-cols-[280px_minmax(0,1fr)]">
          <ItemEditorImagePanel
            draft={editor.draft}
            canEdit={canEdit}
            cropImage={cropImage}
            previewCanvasRef={previewCanvasRef}
            squareSize={squareSize}
            cropFile={cropFile}
            cropControls={cropControls}
            cropError={cropError}
            isApplyingCrop={isApplyingCrop}
            onImageUrlChange={(value) => onPatchDraft({ image: value })}
            onSquareSizeChange={setSquareSize}
            onSelectImageForCrop={handleSelectImageForCrop}
            onCropControlsChange={setCropControls}
            onApplyCrop={handleApplyCrop}
            onCancelCrop={handleCancelCrop}
          />

          <ItemEditorDetailsForm
            draft={editor.draft}
            restaurant={restaurant}
            canEdit={canEdit}
            supportedLanguages={supportedLanguages}
            onPatchDraft={onPatchDraft}
            onSetItemDescription={onSetItemDescription}
            onToggleItemAllergen={onToggleItemAllergen}
            onSetIncludedItemIdsFromText={onSetIncludedItemIdsFromText}
          />
        </div>

        <div className="mt-6 flex flex-wrap justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
          >
            Отмена
          </button>
          <button
            type="button"
            disabled={!canEdit}
            onClick={onSave}
            className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-700 disabled:cursor-not-allowed disabled:bg-slate-300"
          >
            {editor.mode === 'create' ? 'Создать товар' : 'Сохранить товар'}
          </button>
        </div>
      </div>
    </div>
  );
}

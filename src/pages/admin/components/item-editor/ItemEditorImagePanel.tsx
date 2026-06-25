import type { ChangeEvent, RefObject } from 'react';
import type { MenuItem } from '../../../../types/menu';
import { FALLBACK_DISH_IMAGE, type SquareCropControls } from '../../utils';

const PREVIEW_CANVAS_SIZE = 640;

interface ItemEditorImagePanelProps {
  draft: MenuItem;
  canEdit: boolean;
  cropImage: HTMLImageElement | null;
  previewCanvasRef: RefObject<HTMLCanvasElement | null>;
  squareSize: number;
  cropFile: File | null;
  cropControls: SquareCropControls;
  cropError: string;
  isApplyingCrop: boolean;
  onImageUrlChange: (value: string) => void;
  onSquareSizeChange: (value: number) => void;
  onSelectImageForCrop: (event: ChangeEvent<HTMLInputElement>) => void;
  onCropControlsChange: (value: SquareCropControls) => void;
  onApplyCrop: () => void;
  onCancelCrop: () => void;
}

export function ItemEditorImagePanel({
  draft,
  canEdit,
  cropImage,
  previewCanvasRef,
  squareSize,
  cropFile,
  cropControls,
  cropError,
  isApplyingCrop,
  onImageUrlChange,
  onSquareSizeChange,
  onSelectImageForCrop,
  onCropControlsChange,
  onApplyCrop,
  onCancelCrop,
}: ItemEditorImagePanelProps) {
  return (
    <section className="space-y-3">
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-slate-50">
        {cropImage ? (
          <canvas
            ref={previewCanvasRef}
            width={PREVIEW_CANVAS_SIZE}
            height={PREVIEW_CANVAS_SIZE}
            className="aspect-square w-full"
          />
        ) : (
          <img
            src={draft.image || FALLBACK_DISH_IMAGE}
            alt={draft.name || 'Preview'}
            className="aspect-square w-full object-cover"
            onError={(e) => {
              (e.target as HTMLImageElement).src = FALLBACK_DISH_IMAGE;
            }}
          />
        )}
      </div>

      <label className="block text-sm">
        <span className="mb-1 block font-medium text-slate-700">URL изображения</span>
        <input
          value={draft.image}
          disabled={!canEdit}
          onChange={(e) => onImageUrlChange(e.target.value)}
          className="h-10 w-full rounded-lg border border-slate-300 px-3 outline-none focus:border-slate-500 disabled:bg-slate-100"
        />
      </label>

      <label className="block text-sm">
        <span className="mb-1 block font-medium text-slate-700">Квадратный размер</span>
        <select
          value={squareSize}
          disabled={!canEdit}
          onChange={(e) => onSquareSizeChange(Number(e.target.value) || 1024)}
          className="h-10 w-full rounded-lg border border-slate-300 bg-white px-3 outline-none focus:border-slate-500 disabled:bg-slate-100"
        >
          <option value={512}>512 x 512 (быстрее загрузка)</option>
          <option value={768}>768 x 768 (баланс)</option>
          <option value={1024}>1024 x 1024 (четче)</option>
        </select>
      </label>

      <label className="block text-sm">
        <span className="mb-1 block font-medium text-slate-700">Выберите файл для квадратного кадра</span>
        <input
          type="file"
          accept="image/*"
          disabled={!canEdit}
          onChange={onSelectImageForCrop}
          className="block w-full rounded-lg border border-slate-300 bg-white p-2 text-sm disabled:bg-slate-100"
        />
      </label>

      {cropFile && (
        <div className="space-y-3 rounded-xl border border-emerald-200 bg-emerald-50/70 p-3">
          <p className="text-xs font-medium text-emerald-900">Настройте кадр и нажмите «Применить кадр»</p>
          <p className="truncate text-xs text-emerald-800/90">{cropFile.name}</p>

          <label className="block text-xs">
            <span className="mb-1 block font-medium text-emerald-900">
              Масштаб: {cropControls.zoom.toFixed(2)}x
            </span>
            <input
              type="range"
              min={1}
              max={3}
              step={0.01}
              value={cropControls.zoom}
              onChange={(e) =>
                onCropControlsChange({
                  ...cropControls,
                  zoom: Number(e.target.value) || 1,
                })
              }
              className="w-full accent-emerald-700"
            />
          </label>

          <label className="block text-xs">
            <span className="mb-1 block font-medium text-emerald-900">
              Горизонталь: {Math.round(cropControls.offsetX * 100)}%
            </span>
            <input
              type="range"
              min={-100}
              max={100}
              step={1}
              value={Math.round(cropControls.offsetX * 100)}
              onChange={(e) =>
                onCropControlsChange({
                  ...cropControls,
                  offsetX: Number(e.target.value) / 100,
                })
              }
              className="w-full accent-emerald-700"
            />
          </label>

          <label className="block text-xs">
            <span className="mb-1 block font-medium text-emerald-900">
              Вертикаль: {Math.round(cropControls.offsetY * 100)}%
            </span>
            <input
              type="range"
              min={-100}
              max={100}
              step={1}
              value={Math.round(cropControls.offsetY * 100)}
              onChange={(e) =>
                onCropControlsChange({
                  ...cropControls,
                  offsetY: Number(e.target.value) / 100,
                })
              }
              className="w-full accent-emerald-700"
            />
          </label>

          <div className="flex gap-2">
            <button
              type="button"
              disabled={!canEdit || isApplyingCrop}
              onClick={onApplyCrop}
              className="flex-1 rounded-lg bg-emerald-800 px-3 py-2 text-sm font-semibold text-white hover:bg-emerald-700 disabled:cursor-not-allowed disabled:bg-emerald-300"
            >
              {isApplyingCrop ? 'Применяем...' : 'Применить кадр'}
            </button>
            <button
              type="button"
              disabled={!canEdit || isApplyingCrop}
              onClick={onCancelCrop}
              className="rounded-lg border border-emerald-300 bg-white px-3 py-2 text-sm font-medium text-emerald-900 hover:bg-emerald-50 disabled:cursor-not-allowed disabled:bg-slate-100"
            >
              Сброс
            </button>
          </div>
        </div>
      )}

      {cropError && (
        <p className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-xs text-rose-700">{cropError}</p>
      )}
    </section>
  );
}

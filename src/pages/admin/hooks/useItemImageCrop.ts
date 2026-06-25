import { useEffect, useRef, useState, type ChangeEvent } from 'react';
import type { ItemEditorState } from '../types';
import {
  clampSquareImageSize,
  DEFAULT_SQUARE_CROP_CONTROLS,
  drawSquareCropToCanvas,
  loadImageFromFile,
  type SquareCropControls,
} from '../utils';

interface UseItemImageCropArgs {
  editor: ItemEditorState;
  onUploadImage: (payload: {
    file: File;
    squareSize: number;
    controls: SquareCropControls;
  }) => Promise<void>;
}

export function useItemImageCrop({ editor, onUploadImage }: UseItemImageCropArgs) {
  const [squareSize, setSquareSize] = useState(1024);
  const [cropFile, setCropFile] = useState<File | null>(null);
  const [cropImage, setCropImage] = useState<HTMLImageElement | null>(null);
  const [cropError, setCropError] = useState('');
  const [isApplyingCrop, setIsApplyingCrop] = useState(false);
  const [cropControls, setCropControls] = useState<SquareCropControls>(DEFAULT_SQUARE_CROP_CONTROLS);
  const previewCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const editorSessionKey = editor
    ? `${editor.mode}:${editor.categoryIndex}:${editor.itemIndex ?? 'create'}`
    : 'closed';

  useEffect(() => {
    setSquareSize(1024);
    setCropFile(null);
    setCropImage(null);
    setCropError('');
    setIsApplyingCrop(false);
    setCropControls(DEFAULT_SQUARE_CROP_CONTROLS);
  }, [editorSessionKey]);

  useEffect(() => {
    const canvas = previewCanvasRef.current;
    if (!canvas || !cropImage) return;

    const context = canvas.getContext('2d');
    if (!context) return;

    drawSquareCropToCanvas({
      context,
      image: cropImage,
      size: canvas.width,
      controls: cropControls,
    });
  }, [cropControls, cropImage]);

  const handleSelectImageForCrop = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.currentTarget.value = '';
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setCropError('Выберите корректный файл изображения.');
      return;
    }

    setCropError('');
    setCropControls(DEFAULT_SQUARE_CROP_CONTROLS);
    setCropFile(file);

    try {
      const image = await loadImageFromFile(file);
      setCropImage(image);
    } catch (error) {
      setCropImage(null);
      setCropFile(null);
      setCropError(
        error instanceof Error
          ? `Не удалось открыть изображение: ${error.message}`
          : 'Не удалось открыть изображение.'
      );
    }
  };

  const handleApplyCrop = async () => {
    if (!cropFile) {
      setCropError('Сначала выберите изображение для кадрирования.');
      return;
    }

    setCropError('');
    setIsApplyingCrop(true);

    try {
      await onUploadImage({
        file: cropFile,
        squareSize: clampSquareImageSize(squareSize),
        controls: cropControls,
      });
      setCropFile(null);
      setCropImage(null);
      setCropControls(DEFAULT_SQUARE_CROP_CONTROLS);
    } catch (error) {
      setCropError(
        error instanceof Error ? `Не удалось применить кадр: ${error.message}` : 'Не удалось применить кадр.'
      );
    } finally {
      setIsApplyingCrop(false);
    }
  };

  const handleCancelCrop = () => {
    setCropFile(null);
    setCropImage(null);
    setCropError('');
    setCropControls(DEFAULT_SQUARE_CROP_CONTROLS);
  };

  return {
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
  };
}

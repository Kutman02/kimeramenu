import type { Dispatch, SetStateAction } from 'react';
import dataService from '../../../services/dataService';
import type { MenuData } from '../../../types/menu';
import { ALL_CATEGORIES_VALUE } from '../constants';
import type { CategoryEditorState, ItemEditorState } from '../types';
import { clone, exportData } from '../utils';

interface UseAdminDataActionsArgs {
  canEdit: boolean;
  isSaving: boolean;
  data: MenuData;
  jsonEditorText: string;
  setData: Dispatch<SetStateAction<MenuData>>;
  setStatus: Dispatch<SetStateAction<string>>;
  setIsSaving: Dispatch<SetStateAction<boolean>>;
  setJsonEditorText: Dispatch<SetStateAction<string>>;
  setActiveCategoryId: (categoryId: string) => void;
  setItemsCategoryId: (categoryId: string) => void;
  setCategoryEditor: Dispatch<SetStateAction<CategoryEditorState>>;
  setItemEditor: Dispatch<SetStateAction<ItemEditorState>>;
  setItemSearch: Dispatch<SetStateAction<string>>;
}

export function useAdminDataActions({
  canEdit,
  isSaving,
  data,
  jsonEditorText,
  setData,
  setStatus,
  setIsSaving,
  setJsonEditorText,
  setActiveCategoryId,
  setItemsCategoryId,
  setCategoryEditor,
  setItemEditor,
  setItemSearch,
}: UseAdminDataActionsArgs) {
  const handleSave = async () => {
    if (!canEdit || isSaving) return;

    setIsSaving(true);
    setStatus('Сохраняем изменения в JSON-файлы проекта...');

    try {
      const result = await dataService.saveToProjectFiles(data);
      setJsonEditorText(JSON.stringify(data, null, 2));
      setStatus(result.message);
    } catch (error) {
      setStatus(
        error instanceof Error
          ? `Ошибка сохранения JSON: ${error.message}`
          : 'Ошибка сохранения JSON-файлов проекта.'
      );
    } finally {
      setIsSaving(false);
    }
  };

  const handleReset = () => {
    if (!canEdit || isSaving) return;

    const baseData = dataService.getBaseData();
    setData(baseData);
    setJsonEditorText(JSON.stringify(baseData, null, 2));
    setActiveCategoryId(baseData.restaurants[0]?.categories[0]?.id ?? '');
    setItemsCategoryId(ALL_CATEGORIES_VALUE);
    setCategoryEditor(null);
    setItemEditor(null);
    setItemSearch('');
    dataService.resetToBaseData();
    setStatus('Сброшено к базовым JSON-файлам.');
  };

  const refreshJsonEditorFromData = () => {
    setJsonEditorText(JSON.stringify(data, null, 2));
    setStatus('JSON-редактор обновлён из текущего состояния админки.');
  };

  const applyJsonEditor = () => {
    if (!canEdit) return;

    try {
      const parsed = JSON.parse(jsonEditorText) as MenuData;
      const sanitized = clone(parsed);

      setData(sanitized);
      setActiveCategoryId(sanitized.restaurants[0]?.categories[0]?.id ?? '');
      setItemsCategoryId(ALL_CATEGORIES_VALUE);
      setCategoryEditor(null);
      setItemEditor(null);
      setItemSearch('');
      setStatus('JSON применён. Нажмите «Сохранить», чтобы записать в JSON-файлы проекта.');
    } catch {
      setStatus('Ошибка JSON: проверьте синтаксис перед применением.');
    }
  };

  const handleExport = () => {
    exportData(data);
    setStatus('Экспортирован файл menu-data-export.json');
  };

  return {
    handleSave,
    handleReset,
    refreshJsonEditorFromData,
    applyJsonEditor,
    handleExport,
  };
}

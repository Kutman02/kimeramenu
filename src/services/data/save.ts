import type { MenuData } from '../../types/menu';
import { DEV_MENU_SYNC_ENDPOINT, isDevBrowser } from './runtime';
import type { MenuSyncResponse, SaveMenuDataResult } from './types';

export async function saveMenuDataToProjectFiles(
  menuData: MenuData
): Promise<SaveMenuDataResult> {
  if (!isDevBrowser()) {
    return {
      ok: false,
      message: 'Сохранение в JSON-файлы доступно только в dev-режиме.',
    };
  }

  try {
    const response = await fetch(DEV_MENU_SYNC_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(menuData),
    });

    const payload = (await response.json().catch(() => null)) as MenuSyncResponse | null;
    const fallbackMessage = response.ok
      ? 'Изменения сохранены в JSON-файлы проекта.'
      : 'Не удалось сохранить изменения в JSON-файлы проекта.';
    const message = typeof payload?.message === 'string' ? payload.message : fallbackMessage;

    if (!response.ok) {
      return {
        ok: false,
        message,
      };
    }

    return {
      ok: true,
      message,
    };
  } catch (error) {
    return {
      ok: false,
      message:
        error instanceof Error
          ? `Ошибка сохранения JSON: ${error.message}`
          : 'Ошибка сохранения JSON-файлов проекта.',
    };
  }
}

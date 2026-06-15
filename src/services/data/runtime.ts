export const DEV_MENU_SYNC_ENDPOINT = '/__admin/menu-data';

export const clone = <T,>(value: T): T => JSON.parse(JSON.stringify(value)) as T;

export const isDevBrowser = () => import.meta.env.DEV && typeof window !== 'undefined';

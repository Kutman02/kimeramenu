import type { MenuCategory, MenuItem } from '../../types/menu';

export type CategoryEditorState = {
  mode: 'create' | 'edit';
  categoryIndex: number | null;
  draft: MenuCategory;
} | null;

export type ItemEditorState = {
  mode: 'create' | 'edit';
  categoryIndex: number;
  itemIndex: number | null;
  draft: MenuItem;
} | null;

export type ItemListEntry = {
  item: MenuItem;
  itemIndex: number;
  category: MenuCategory;
  categoryIndex: number;
};

export type DashboardStatProps = {
  label: string;
  value: string | number;
  hint?: string;
};

export type AdminSectionId = 'overview' | 'profile' | 'categories' | 'items' | 'data';

export type AdminSectionMeta = {
  id: AdminSectionId;
  label: string;
  hint: string;
};

import { ListCategory } from './supabase/types';

export const DEFAULT_LISTS: ListCategory[] = [
  { id: 'list_work', name: 'Work', color: '#3b82f6' },      // Blue
  { id: 'list_personal', name: 'Personal', color: '#f59e0b' },// Amber
  { id: 'list_health', name: 'Health', color: '#10b981' },    // Emerald
  { id: 'list_study', name: 'Study', color: '#8b5cf6' },     // Purple
];

export function getListColor(listNameOrId?: string | null, customLists: ListCategory[] = DEFAULT_LISTS): string {
  if (!listNameOrId) return '#6b7280'; // Gray default

  const found = customLists.find(
    (l) => l.id.toLowerCase() === listNameOrId.toLowerCase() || l.name.toLowerCase() === listNameOrId.toLowerCase()
  );

  return found ? found.color : '#f59e0b';
}

export function getListName(listIdOrName?: string | null, customLists: ListCategory[] = DEFAULT_LISTS): string {
  if (!listIdOrName) return '';

  const found = customLists.find(
    (l) => l.id.toLowerCase() === listIdOrName.toLowerCase() || l.name.toLowerCase() === listIdOrName.toLowerCase()
  );

  return found ? found.name : listIdOrName;
}

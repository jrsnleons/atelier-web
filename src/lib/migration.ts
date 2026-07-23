import { DataStore } from './store';
import { Task, Event, CalendarFeed, ListCategory } from './supabase/types';

const STORAGE_PREFIX = 'atelier_v1_';
const MIGRATION_DONE_KEY = 'atelier_v1_migrated_to_cloud_';

export async function migrateLocalDataToCloud(userId: string): Promise<boolean> {
  if (typeof window === 'undefined') return false;

  // Prevent migrating multiple times for the same user
  const alreadyMigrated = localStorage.getItem(`${MIGRATION_DONE_KEY}${userId}`);
  if (alreadyMigrated === 'true') return false;

  const store = DataStore.getInstance();
  let itemsMigrated = 0;

  try {
    // 1. Migrate custom lists
    const rawLists = localStorage.getItem(`${STORAGE_PREFIX}lists`);
    if (rawLists) {
      try {
        const localLists: ListCategory[] = JSON.parse(rawLists);
        for (const list of localLists) {
          await store.saveList(list);
          itemsMigrated++;
        }
      } catch (e) {
        console.warn('Error parsing local lists during migration:', e);
      }
    }

    // 2. Migrate calendar feeds
    const rawFeeds = localStorage.getItem(`${STORAGE_PREFIX}calendar_feeds`);
    if (rawFeeds) {
      try {
        const localFeeds: CalendarFeed[] = JSON.parse(rawFeeds);
        for (const feed of localFeeds) {
          await store.saveCalendarFeed(feed);
          itemsMigrated++;
        }
      } catch (e) {
        console.warn('Error parsing local feeds during migration:', e);
      }
    }

    // 3. Scan localStorage keys for tasks, events, and notes
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (!key) continue;

      if (key.startsWith(`${STORAGE_PREFIX}tasks_`)) {
        const raw = localStorage.getItem(key);
        if (raw) {
          try {
            const tasks: Task[] = JSON.parse(raw);
            for (const task of tasks) {
              await store.saveTask(task);
              itemsMigrated++;
            }
          } catch (e) {
            console.warn('Error migrating local tasks:', e);
          }
        }
      } else if (key.startsWith(`${STORAGE_PREFIX}events_`)) {
        const raw = localStorage.getItem(key);
        if (raw) {
          try {
            const events: Event[] = JSON.parse(raw);
            for (const event of events) {
              await store.saveEvent(event);
              itemsMigrated++;
            }
          } catch (e) {
            console.warn('Error migrating local events:', e);
          }
        }
      } else if (key.startsWith(`${STORAGE_PREFIX}note_`)) {
        const dateStr = key.replace(`${STORAGE_PREFIX}note_`, '');
        const raw = localStorage.getItem(key);
        if (raw && dateStr) {
          try {
            const noteObj = JSON.parse(raw);
            await store.saveNote(dateStr, noteObj.content || noteObj);
            itemsMigrated++;
          } catch (e) {
            console.warn('Error migrating local note:', e);
          }
        }
      }
    }

    // Mark migration complete for this user
    localStorage.setItem(`${MIGRATION_DONE_KEY}${userId}`, 'true');
    console.log(`Successfully migrated ${itemsMigrated} local items to Supabase cloud!`);
    return itemsMigrated > 0;
  } catch (e) {
    console.error('Migration error:', e);
    return false;
  }
}

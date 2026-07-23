import { createClient } from './supabase/client';
import { Note, Task, Event, CalendarFeed, ListCategory } from './supabase/types';
import { DEFAULT_LISTS } from './lists';

const STORAGE_PREFIX = 'atelier_v1_';

export class DataStore {
  private static instance: DataStore;

  private constructor() {}

  public static getInstance(): DataStore {
    if (!DataStore.instance) {
      DataStore.instance = new DataStore();
    }
    return DataStore.instance;
  }

  private getSupabase(): any {
    return createClient();
  }

  // --- CALENDAR FEEDS ---
  public async getCalendarFeeds(): Promise<CalendarFeed[]> {
    const supabase = this.getSupabase();
    if (supabase) {
      try {
        const { data, error } = await supabase.from('calendar_feeds').select('*');
        if (!error && data) {
          return data as CalendarFeed[];
        }
      } catch (e) {
        console.warn('Supabase fetch feeds error:', e);
      }
    }

    if (typeof window !== 'undefined') {
      const raw = localStorage.getItem(`${STORAGE_PREFIX}calendar_feeds`);
      if (raw) {
        try {
          return JSON.parse(raw);
        } catch {
          return [];
        }
      }
    }

    return [];
  }

  public async saveCalendarFeed(feed: CalendarFeed): Promise<void> {
    if (typeof window !== 'undefined') {
      const existing = await this.getCalendarFeeds();
      const idx = existing.findIndex((f) => f.id === feed.id);
      let updated: CalendarFeed[];
      if (idx >= 0) {
        updated = [...existing];
        updated[idx] = feed;
      } else {
        updated = [...existing, feed];
      }
      localStorage.setItem(`${STORAGE_PREFIX}calendar_feeds`, JSON.stringify(updated));
    }

    const supabase = this.getSupabase();
    if (supabase) {
      try {
        await supabase.from('calendar_feeds').upsert({
          id: feed.id,
          name: feed.name,
          color: feed.color,
          url: feed.url,
          enabled: feed.enabled,
          category_id: feed.category_id,
        });
      } catch (e) {
        console.warn('Supabase feed save error:', e);
      }
    }
  }

  public async deleteCalendarFeed(id: string): Promise<void> {
    if (typeof window !== 'undefined') {
      const existing = await this.getCalendarFeeds();
      const filtered = existing.filter((f) => f.id !== id);
      localStorage.setItem(`${STORAGE_PREFIX}calendar_feeds`, JSON.stringify(filtered));
    }

    const supabase = this.getSupabase();
    if (supabase) {
      try {
        await supabase.from('calendar_feeds').delete().eq('id', id);
      } catch (e) {
        console.warn('Supabase feed delete error:', e);
      }
    }
  }

  // --- LIST CATEGORIES ---
  public async getLists(): Promise<ListCategory[]> {
    const supabase = this.getSupabase();
    if (supabase) {
      try {
        const { data, error } = await supabase.from('lists').select('*');
        if (!error && data && data.length > 0) {
          return data as ListCategory[];
        }
      } catch (e) {
        console.warn('Supabase fetch lists error:', e);
      }
    }

    if (typeof window !== 'undefined') {
      const raw = localStorage.getItem(`${STORAGE_PREFIX}lists`);
      if (raw) {
        try {
          return JSON.parse(raw);
        } catch {
          return DEFAULT_LISTS;
        }
      }
    }

    return DEFAULT_LISTS;
  }

  public async saveList(list: ListCategory): Promise<void> {
    if (typeof window !== 'undefined') {
      const existing = await this.getLists();
      const idx = existing.findIndex((l) => l.id === list.id);
      let updated: ListCategory[];
      if (idx >= 0) {
        updated = [...existing];
        updated[idx] = list;
      } else {
        updated = [...existing, list];
      }
      localStorage.setItem(`${STORAGE_PREFIX}lists`, JSON.stringify(updated));
    }

    const supabase = this.getSupabase();
    if (supabase) {
      try {
        await supabase.from('lists').upsert({
          id: list.id,
          name: list.name,
          color: list.color,
        });
      } catch (e) {
        console.warn('Supabase list save error:', e);
      }
    }
  }

  public async deleteList(id: string): Promise<void> {
    if (typeof window !== 'undefined') {
      const existing = await this.getLists();
      const filtered = existing.filter((l) => l.id !== id);
      localStorage.setItem(`${STORAGE_PREFIX}lists`, JSON.stringify(filtered));
    }

    const supabase = this.getSupabase();
    if (supabase) {
      try {
        await supabase.from('lists').delete().eq('id', id);
      } catch (e) {
        console.warn('Supabase list delete error:', e);
      }
    }
  }

  // --- NOTES ---
  public async getNote(dateStr: string): Promise<Note | null> {
    const supabase = this.getSupabase();
    if (supabase) {
      try {
        const { data, error } = await supabase
          .from('notes')
          .select('*')
          .eq('date', dateStr)
          .maybeSingle();

        if (!error && data) {
          return data as Note;
        }
      } catch (e) {
        console.warn('Supabase fetch note error, falling back to local:', e);
      }
    }

    if (typeof window !== 'undefined') {
      const raw = localStorage.getItem(`${STORAGE_PREFIX}note_${dateStr}`);
      if (raw) {
        try {
          return JSON.parse(raw);
        } catch {
          return { date: dateStr, content: raw };
        }
      }
    }

    return null;
  }

  public async saveNote(dateStr: string, content: any): Promise<void> {
    const noteObj: Note = {
      date: dateStr,
      content,
      updated_at: new Date().toISOString(),
    };

    if (typeof window !== 'undefined') {
      localStorage.setItem(`${STORAGE_PREFIX}note_${dateStr}`, JSON.stringify(noteObj));
    }

    const supabase = this.getSupabase();
    if (supabase) {
      try {
        await supabase.from('notes').upsert(
          {
            date: dateStr,
            content,
            updated_at: new Date().toISOString(),
          },
          { onConflict: 'date' }
        );
      } catch (e) {
        console.warn('Failed to sync note to Supabase:', e);
      }
    }
  }

  // --- TASKS ---
  public async getTasks(dateStr: string): Promise<Task[]> {
    const supabase = this.getSupabase();
    if (supabase) {
      try {
        const { data, error } = await supabase
          .from('tasks')
          .select('*')
          .eq('date', dateStr)
          .order('priority', { ascending: false })
          .order('created_at', { ascending: true });

        if (!error && data) {
          return data as Task[];
        }
      } catch (e) {
        console.warn('Supabase fetch tasks error:', e);
      }
    }

    if (typeof window !== 'undefined') {
      const raw = localStorage.getItem(`${STORAGE_PREFIX}tasks_${dateStr}`);
      if (raw) {
        try {
          return JSON.parse(raw);
        } catch {
          return [];
        }
      }
    }

    return [];
  }

  public async saveTask(task: Task): Promise<void> {
    if (typeof window !== 'undefined') {
      const existing = await this.getTasks(task.date);
      const idx = existing.findIndex((t) => t.id === task.id);
      let updated: Task[];
      if (idx >= 0) {
        updated = [...existing];
        updated[idx] = task;
      } else {
        updated = [...existing, task];
      }
      localStorage.setItem(`${STORAGE_PREFIX}tasks_${task.date}`, JSON.stringify(updated));
    }

    const supabase = this.getSupabase();
    if (supabase) {
      try {
        await supabase.from('tasks').upsert({
          id: task.id,
          date: task.date,
          text: task.text,
          priority: task.priority,
          list_tag: task.list_tag,
          list_id: task.list_id,
          is_done: task.is_done,
          start_time: task.start_time,
          end_time: task.end_time,
          sort_order: task.sort_order ?? 0,
        });
      } catch (e) {
        console.warn('Supabase task save error:', e);
      }
    }
  }

  public async deleteTask(id: string, dateStr: string): Promise<void> {
    if (typeof window !== 'undefined') {
      const existing = await this.getTasks(dateStr);
      const filtered = existing.filter((t) => t.id !== id);
      localStorage.setItem(`${STORAGE_PREFIX}tasks_${dateStr}`, JSON.stringify(filtered));
    }

    const supabase = this.getSupabase();
    if (supabase) {
      try {
        await supabase.from('tasks').delete().eq('id', id);
      } catch (e) {
        console.warn('Supabase task delete error:', e);
      }
    }
  }

  // --- EVENTS ---
  public async getEvents(dateStr: string): Promise<Event[]> {
    const supabase = this.getSupabase();
    if (supabase) {
      try {
        const { data, error } = await supabase
          .from('events')
          .select('*')
          .eq('date', dateStr)
          .order('start_time', { ascending: true });

        if (!error && data) {
          return data as Event[];
        }
      } catch (e) {
        console.warn('Supabase fetch events error:', e);
      }
    }

    if (typeof window !== 'undefined') {
      const raw = localStorage.getItem(`${STORAGE_PREFIX}events_${dateStr}`);
      if (raw) {
        try {
          return JSON.parse(raw);
        } catch {
          return [];
        }
      }
    }

    return [];
  }

  public async saveEvent(event: Event): Promise<void> {
    if (typeof window !== 'undefined') {
      const existing = await this.getEvents(event.date);
      const idx = existing.findIndex((e) => e.id === event.id);
      let updated: Event[];
      if (idx >= 0) {
        updated = [...existing];
        updated[idx] = event;
      } else {
        updated = [...existing, event];
      }
      updated.sort((a, b) => a.start_time.localeCompare(b.start_time));
      localStorage.setItem(`${STORAGE_PREFIX}events_${event.date}`, JSON.stringify(updated));
    }

    const supabase = this.getSupabase();
    if (supabase) {
      try {
        await supabase.from('events').upsert({
          id: event.id,
          date: event.date,
          text: event.text,
          start_time: event.start_time,
          end_time: event.end_time,
          priority: event.priority,
          list_tag: event.list_tag,
        });
      } catch (e) {
        console.warn('Supabase event save error:', e);
      }
    }
  }

  public async deleteEvent(id: string, dateStr: string): Promise<void> {
    if (typeof window !== 'undefined') {
      const existing = await this.getEvents(dateStr);
      const filtered = existing.filter((e) => e.id !== id);
      localStorage.setItem(`${STORAGE_PREFIX}events_${dateStr}`, JSON.stringify(filtered));
    }

    const supabase = this.getSupabase();
    if (supabase) {
      try {
        await supabase.from('events').delete().eq('id', id);
      } catch (e) {
        console.warn('Supabase event delete error:', e);
      }
    }
  }
}

export const store = DataStore.getInstance();

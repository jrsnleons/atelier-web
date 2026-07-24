import { createClient } from './supabase/client';
import { Note, Task, Event, CalendarFeed, ListCategory } from './supabase/types';
import { DEFAULT_LISTS } from './lists';

const STORAGE_PREFIX = 'atelier_v1_';

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export function isValidUUID(id?: string | null): boolean {
  if (!id) return false;
  return UUID_REGEX.test(id);
}

export function ensureUUID(id?: string | null): string {
  if (id && isValidUUID(id)) return id;
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

function notifyLocalTabSync() {
  if (typeof window !== 'undefined') {
    try {
      window.dispatchEvent(new CustomEvent('atelier_local_sync'));
      if ('BroadcastChannel' in window) {
        const bc = new BroadcastChannel('atelier_sync_channel');
        bc.postMessage({ type: 'DATA_UPDATED' });
        bc.close();
      }
    } catch {
      // Ignore broadcast errors
    }
  }
}

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
        if (!error && data && data.length > 0) {
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
      notifyLocalTabSync();
    }

    const supabase = this.getSupabase();
    if (supabase) {
      try {
        const authRes = await supabase.auth.getUser();
        const userId = authRes?.data?.user?.id;
        await supabase.from('calendar_feeds').upsert({
          id: feed.id,
          user_id: userId,
          name: feed.name,
          color: feed.color,
          url: feed.url,
          enabled: feed.enabled,
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
      notifyLocalTabSync();
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
      notifyLocalTabSync();
    }

    const supabase = this.getSupabase();
    if (supabase) {
      try {
        const authRes = await supabase.auth.getUser();
        const userId = authRes?.data?.user?.id;
        await supabase.from('lists').upsert({
          id: list.id,
          user_id: userId,
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
      notifyLocalTabSync();
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
      notifyLocalTabSync();
    }

    const supabase = this.getSupabase();
    if (supabase) {
      try {
        const authRes = await supabase.auth.getUser();
        const userId = authRes?.data?.user?.id;
        if (userId) {
          await supabase.from('notes').upsert(
            {
              user_id: userId,
              date: dateStr,
              content,
              updated_at: new Date().toISOString(),
            },
            { onConflict: 'user_id, date' }
          );
        } else {
          await supabase.from('notes').upsert({
            date: dateStr,
            content,
            updated_at: new Date().toISOString(),
          });
        }
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
    const validId = ensureUUID(task.id);
    const taskToSave: Task = { ...task, id: validId };

    if (typeof window !== 'undefined') {
      const existing = await this.getTasks(taskToSave.date);
      const idx = existing.findIndex((t) => t.id === taskToSave.id || (task.id && t.id === task.id));
      let updated: Task[];
      if (idx >= 0) {
        updated = [...existing];
        updated[idx] = taskToSave;
      } else {
        updated = [...existing, taskToSave];
      }
      localStorage.setItem(`${STORAGE_PREFIX}tasks_${taskToSave.date}`, JSON.stringify(updated));
      notifyLocalTabSync();
    }

    const supabase = this.getSupabase();
    if (supabase) {
      try {
        const authRes = await supabase.auth.getUser();
        const userId = authRes?.data?.user?.id;
        await supabase.from('tasks').upsert({
          id: taskToSave.id,
          user_id: userId,
          date: taskToSave.date,
          text: taskToSave.text,
          priority: taskToSave.priority,
          list_tag: taskToSave.list_tag,
          list_id: taskToSave.list_id,
          is_done: taskToSave.is_done,
          start_time: taskToSave.start_time,
          end_time: taskToSave.end_time,
          sort_order: taskToSave.sort_order ?? 0,
          subtasks: taskToSave.subtasks || [],
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
      notifyLocalTabSync();
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
    const validId = ensureUUID(event.id);
    const eventToSave: Event = { ...event, id: validId };

    if (typeof window !== 'undefined') {
      const existing = await this.getEvents(eventToSave.date);
      const idx = existing.findIndex((e) => e.id === eventToSave.id || (event.id && e.id === event.id));
      let updated: Event[];
      if (idx >= 0) {
        updated = [...existing];
        updated[idx] = eventToSave;
      } else {
        updated = [...existing, eventToSave];
      }
      updated.sort((a, b) => a.start_time.localeCompare(b.start_time));
      localStorage.setItem(`${STORAGE_PREFIX}events_${eventToSave.date}`, JSON.stringify(updated));
      notifyLocalTabSync();
    }

    const supabase = this.getSupabase();
    if (supabase) {
      try {
        const authRes = await supabase.auth.getUser();
        const userId = authRes?.data?.user?.id;
        await supabase.from('events').upsert({
          id: eventToSave.id,
          user_id: userId,
          date: eventToSave.date,
          text: eventToSave.text,
          start_time: eventToSave.start_time,
          end_time: eventToSave.end_time,
          priority: eventToSave.priority,
          list_tag: eventToSave.list_tag,
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
      notifyLocalTabSync();
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
  // --- WORKSPACE DATA EXPORT ---
  public async exportAllData(): Promise<{
    notes: Note[];
    tasks: Task[];
    events: Event[];
    lists: ListCategory[];
  }> {
    const supabase = this.getSupabase();
    let notes: Note[] = [];
    let tasks: Task[] = [];
    let events: Event[] = [];
    let lists: ListCategory[] = await this.getLists();

    if (supabase) {
      try {
        const [nRes, tRes, eRes] = await Promise.all([
          supabase.from('notes').select('*'),
          supabase.from('tasks').select('*'),
          supabase.from('events').select('*'),
        ]);
        if (nRes.data) notes = nRes.data as Note[];
        if (tRes.data) tasks = tRes.data as Task[];
        if (eRes.data) events = eRes.data as Event[];
      } catch (e) {
        console.warn('Supabase export fetch error, falling back to localStorage:', e);
      }
    }

    if (typeof window !== 'undefined') {
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (!key || !key.startsWith(STORAGE_PREFIX)) continue;

        try {
          const raw = localStorage.getItem(key);
          if (!raw) continue;
          const parsed = JSON.parse(raw);

          if (key.startsWith(`${STORAGE_PREFIX}note_`)) {
            const dateStr = key.replace(`${STORAGE_PREFIX}note_`, '');
            if (!notes.some((n) => n.date === dateStr)) {
              notes.push(typeof parsed === 'object' ? parsed : { date: dateStr, content: parsed });
            }
          } else if (key.startsWith(`${STORAGE_PREFIX}tasks_`)) {
            if (Array.isArray(parsed)) {
              parsed.forEach((t: Task) => {
                if (!tasks.some((existing) => existing.id === t.id)) {
                  tasks.push(t);
                }
              });
            }
          } else if (key.startsWith(`${STORAGE_PREFIX}events_`)) {
            if (Array.isArray(parsed)) {
              parsed.forEach((ev: Event) => {
                if (!events.some((existing) => existing.id === ev.id)) {
                  events.push(ev);
                }
              });
            }
          }
        } catch {
          // Skip unparseable
        }
      }
    }

    return { notes, tasks, events, lists };
  }

  public async exportAsMarkdown(): Promise<string> {
    const data = await this.exportAllData();
    let md = `# Atelier Workspace Journal & Export\n*Exported on ${new Date().toLocaleDateString()}*\n\n`;

    // 1. Daily Notes
    md += `## 📓 Daily Notes\n\n`;
    if (data.notes.length === 0) {
      md += `*No daily notes recorded.*\n\n`;
    } else {
      const sortedNotes = [...data.notes].sort((a, b) => b.date.localeCompare(a.date));
      sortedNotes.forEach((note) => {
        md += `### ${note.date}\n`;
        if (typeof note.content === 'string') {
          md += `${note.content}\n\n`;
        } else if (note.content && typeof note.content === 'object') {
          // Extract text from Tiptap JSON if available
          const text = extractTextFromTiptapJson(note.content);
          md += `${text || '*[Rich Text Content]*'}\n\n`;
        } else {
          md += `*[Empty Note]*\n\n`;
        }
      });
    }

    // 2. Tasks
    md += `## ✅ Tasks Archive\n\n`;
    if (data.tasks.length === 0) {
      md += `*No tasks recorded.*\n\n`;
    } else {
      const sortedTasks = [...data.tasks].sort((a, b) => b.date.localeCompare(a.date));
      sortedTasks.forEach((task) => {
        const checkbox = task.is_done ? '[x]' : '[ ]';
        const category = task.list_tag ? ` #${task.list_tag}` : '';
        const priority = task.priority > 0 ? ` (!${task.priority})` : '';
        const time = task.start_time ? ` @ ${task.start_time}` : '';
        md += `- ${checkbox} **${task.text}** (${task.date}${time})${category}${priority}\n`;
        if (task.subtasks && task.subtasks.length > 0) {
          task.subtasks.forEach((sub) => {
            const subBox = sub.is_done ? '[x]' : '[ ]';
            md += `  - ${subBox} ${sub.text}\n`;
          });
        }
      });
      md += `\n`;
    }

    // 3. Events
    md += `## 📅 Events\n\n`;
    if (data.events.length === 0) {
      md += `*No events recorded.*\n\n`;
    } else {
      const sortedEvents = [...data.events].sort((a, b) => b.date.localeCompare(a.date));
      sortedEvents.forEach((ev) => {
        md += `- **${ev.text}** (${ev.date} at ${ev.start_time}${ev.end_time ? ` - ${ev.end_time}` : ''})\n`;
      });
      md += `\n`;
    }

    return md;
  }
}

// Helper to extract text from Tiptap JSON node structure
function extractTextFromTiptapJson(node: any): string {
  if (!node) return '';
  if (typeof node === 'string') return node;
  if (node.type === 'text') return node.text || '';
  if (Array.isArray(node.content)) {
    return node.content.map(extractTextFromTiptapJson).join('\n');
  }
  return '';
}

export const store = DataStore.getInstance();

export type Priority = 0 | 1 | 2 | 3;

export interface ListCategory {
  id: string;
  name: string;      // e.g. "Work", "Personal", "Health", "Study"
  color: string;     // Hex color token, e.g. "#3b82f6"
  created_at?: string;
}

export interface CalendarFeed {
  id: string;
  name: string;      // "Work 1", "Work 2", "Personal"
  color: string;     // Hex or Tailwind color token, e.g. "#3b82f6"
  url: string;       // Google Calendar iCal secret URL
  enabled: boolean;
  category_id?: string | null; // Linked Category/List ID or Name
  last_synced_at?: string;
}

export interface Note {
  id?: string;
  date: string; // YYYY-MM-DD
  content: any; // Tiptap JSON or string
  created_at?: string;
  updated_at?: string;
}

export interface SubTask {
  id: string;
  text: string;
  is_done: boolean;
}

export interface Task {
  id: string;
  date: string; // YYYY-MM-DD
  text: string;
  priority: Priority;
  list_tag?: string | null;
  list_id?: string | null;
  is_done: boolean;
  start_time?: string | null; // HH:MM (if scheduled)
  end_time?: string | null;   // HH:MM (if scheduled)
  sort_order?: number;
  subtasks?: SubTask[];
  created_at?: string;
  updated_at?: string;
}

export interface Event {
  id: string;
  date: string; // YYYY-MM-DD
  text: string;
  start_time: string; // HH:MM
  end_time?: string | null; // HH:MM
  priority: Priority;
  list_tag?: string | null;
  list_id?: string | null;
  is_done?: boolean;
  // External Calendar Extensions
  calendar_id?: string | null;
  calendar_name?: string | null;
  calendar_color?: string | null;
  is_external?: boolean;
  location?: string | null;
  created_at?: string;
  updated_at?: string;
}

export interface Database {
  public: {
    Tables: {
      notes: {
        Row: Note;
        Insert: Omit<Note, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<Note, 'id'>>;
      };
      tasks: {
        Row: Task;
        Insert: Omit<Task, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<Task, 'id'>>;
      };
      events: {
        Row: Event;
        Insert: Omit<Event, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<Event, 'id'>>;
      };
      calendar_feeds: {
        Row: CalendarFeed;
        Insert: Omit<CalendarFeed, 'id' | 'last_synced_at'>;
        Update: Partial<Omit<CalendarFeed, 'id'>>;
      };
      lists: {
        Row: ListCategory;
        Insert: Omit<ListCategory, 'id' | 'created_at'>;
        Update: Partial<Omit<ListCategory, 'id'>>;
      };
    };
  };
}

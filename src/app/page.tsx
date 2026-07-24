'use client';

import { useState, useEffect, useCallback } from 'react';
import { formatDateISO, ParsedItem } from '@/lib/nlp-parser';
import { store, ensureUUID } from '@/lib/store';
import { createClient } from '@/lib/supabase/client';
import { Task, Event, Note, CalendarFeed, ListCategory } from '@/lib/supabase/types';

import { DateNav } from '@/components/date-nav';
import { UnifiedAgenda } from '@/components/unified-agenda';
import { Scratchpad } from '@/components/scratchpad';
import { NLPModal } from '@/components/nlp-modal';
import { TaskEditSheet } from '@/components/task-edit-sheet';
import { SettingsPanel } from '@/components/settings-panel';
import { ExportModal } from '@/components/export-modal';
import { OfflineIndicator } from '@/components/offline-indicator';
import { PWAInstaller } from '@/components/pwa-installer';
import { LandingPage } from '@/components/landing-page';
import { UserMenu } from '@/components/user-menu';
import { useAuth } from '@/lib/auth-context';
import { migrateLocalDataToCloud } from '@/lib/migration';
import { useGlobalKeyboard } from '@/lib/keyboard';
import { Feather, Plus } from 'lucide-react';

export default function Home() {
  const { user } = useAuth();
  const [isGuestMode, setIsGuestMode] = useState<boolean>(false);
  const [currentDateStr, setCurrentDateStr] = useState<string>(() => formatDateISO(new Date()));
  const [note, setNote] = useState<Note | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [events, setEvents] = useState<Event[]>([]);
  const [feeds, setFeeds] = useState<CalendarFeed[]>([]);
  const [lists, setLists] = useState<ListCategory[]>([]);

  const [isNLPModalOpen, setIsNLPModalOpen] = useState<boolean>(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState<boolean>(false);
  const [isExportOpen, setIsExportOpen] = useState<boolean>(false);
  const [isSyncingFeeds, setIsSyncingFeeds] = useState(false);
  const [loading, setLoading] = useState<boolean>(true);

  // Auto-migrate local guest data to Supabase cloud when user signs in
  useEffect(() => {
    if (user?.id) {
      migrateLocalDataToCloud(user.id).then((migrated) => {
        if (migrated) {
          loadDailyData(currentDateStr);
        }
      });
    }
  }, [user?.id]);

  // Hook global keyboard shortcuts (/ and Cmd+K open Add Modal)
  useGlobalKeyboard({
    currentDateStr,
    onDateChange: setCurrentDateStr,
    onOpenAddModal: () => setIsNLPModalOpen(true),
  });

  // Sync external Google Calendar feeds for a date
  const syncExternalFeeds = async (dateStr: string, currentFeeds: CalendarFeed[]) => {
    const activeFeeds = currentFeeds.filter((f) => f.enabled && f.url);
    if (activeFeeds.length === 0) return [];

    if (typeof navigator !== 'undefined' && !navigator.onLine) {
      return [];
    }

    setIsSyncingFeeds(true);
    try {
      const res = await fetch('/api/calendars/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ feeds: activeFeeds, dateStr }),
      });
      if (res.ok) {
        const data = await res.json();
        return (data.events || []) as Event[];
      }
    } catch (e) {
      console.warn('External calendar sync error:', e);
    } finally {
      setIsSyncingFeeds(false);
    }
    return [];
  };

  // Load data for selected date
  const loadDailyData = useCallback(async (dateStr: string) => {
    setLoading(true);
    try {
      const [fetchedNote, fetchedTasks, fetchedEvents, fetchedFeeds, fetchedLists] = await Promise.all([
        store.getNote(dateStr),
        store.getTasks(dateStr),
        store.getEvents(dateStr),
        store.getCalendarFeeds(),
        store.getLists(),
      ]);

      setLists(fetchedLists);
      let activeFeeds = fetchedFeeds;

      if (fetchedFeeds.length === 0) {
        const demoFeeds: CalendarFeed[] = [
          {
            id: 'feed_work1',
            name: 'Work 1 (Primary)',
            color: '#3b82f6',
            url: '',
            enabled: true,
          },
          {
            id: 'feed_work2',
            name: 'Work 2 (Secondary)',
            color: '#8b5cf6',
            url: '',
            enabled: true,
          },
          {
            id: 'feed_personal',
            name: 'Personal',
            color: '#10b981',
            url: '',
            enabled: true,
          },
        ];
        await Promise.all(demoFeeds.map((f) => store.saveCalendarFeed(f)));
        setFeeds(demoFeeds);
        activeFeeds = demoFeeds;
      } else {
        setFeeds(fetchedFeeds);
      }

      // Check if today and completely empty — seed initial demo data
      const isToday = dateStr === formatDateISO(new Date());
      if (isToday && !fetchedNote && fetchedTasks.length === 0 && fetchedEvents.length === 0) {
        const demoNoteContent = {
          type: 'doc',
          content: [
            {
              type: 'heading',
              attrs: { level: 2 },
              content: [{ type: 'text', text: "Today's Focus & Objectives" }],
            },
            {
              type: 'paragraph',
              content: [
                {
                  type: 'text',
                  text: 'Focus on shipping the Parchment local-first web app release cleanly today. Key priorities include multi-calendar feed parsing, NLP modal entry, and design system polish.',
                },
              ],
            },
          ],
        };

        const demoTasks: Task[] = [
          {
            id: ensureUUID(),
            date: dateStr,
            text: 'Finish Parchment Marketing Materials',
            priority: 0,
            list_tag: 'work',
            is_done: false,
          },
          {
            id: ensureUUID(),
            date: dateStr,
            text: 'Publish New TestFlight Version',
            priority: 1,
            list_tag: 'work',
            is_done: false,
          },
          {
            id: ensureUUID(),
            date: dateStr,
            text: 'Review pull requests',
            priority: 0,
            list_tag: 'work',
            is_done: true,
          },
          {
            id: ensureUUID(),
            date: dateStr,
            text: 'Submit Team Status Report',
            priority: 2,
            list_tag: 'work',
            is_done: false,
            start_time: '15:00',
          },
        ];

        const demoEvents: Event[] = [
          {
            id: ensureUUID(),
            date: dateStr,
            text: 'Austrian GP',
            start_time: '06:00',
            end_time: '08:00',
            priority: 0,
            calendar_name: 'Personal',
            calendar_color: '#10b981',
            is_external: false,
          },
          {
            id: ensureUUID(),
            date: dateStr,
            text: 'Lunch with Family at noon',
            start_time: '12:00',
            end_time: '13:00',
            priority: 0,
            calendar_name: 'Personal',
            calendar_color: '#10b981',
            is_external: false,
          },
          {
            id: ensureUUID(),
            date: dateStr,
            text: 'Take out Trash Can',
            start_time: '16:00',
            end_time: '16:30',
            priority: 0,
            calendar_name: 'Work 1',
            calendar_color: '#3b82f6',
            is_external: false,
          },
        ];

        await Promise.all([
          store.saveNote(dateStr, demoNoteContent),
          ...demoTasks.map((t) => store.saveTask(t)),
          ...demoEvents.map((e) => store.saveEvent(e)),
        ]);

        setNote({ date: dateStr, content: demoNoteContent });
        setTasks(demoTasks);

        const externalEvents = await syncExternalFeeds(dateStr, activeFeeds);
        const combined = [...demoEvents, ...externalEvents].sort((a, b) =>
          a.start_time.localeCompare(b.start_time)
        );
        setEvents(combined);
      } else {
        // Auto-convert any legacy local events to scheduled tasks so they render with Check Circles
        const localUserEvents = fetchedEvents.filter((e) => !e.is_external && !e.calendar_name);
        const externalCalendarEvents = fetchedEvents.filter((e) => e.is_external || !!e.calendar_name);

        const convertedTasks: Task[] = localUserEvents.map((e) => ({
          id: ensureUUID(e.id),
          date: e.date,
          text: e.text,
          priority: e.priority,
          list_tag: e.list_tag,
          is_done: false,
          start_time: e.start_time,
          end_time: e.end_time,
        }));

        setNote(fetchedNote);
        setTasks([...fetchedTasks, ...convertedTasks]);

        const externalEvents = await syncExternalFeeds(dateStr, activeFeeds);
        const combined = [...externalCalendarEvents, ...externalEvents].sort((a, b) =>
          a.start_time.localeCompare(b.start_time)
        );
        setEvents(combined);
      }
    } catch (e) {
      console.error('Error loading daily data:', e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadDailyData(currentDateStr);
  }, [currentDateStr, loadDailyData]);

  // Real-time synchronization across browsers (Supabase Realtime) and tabs (BroadcastChannel / Local Events)
  useEffect(() => {
    const supabase = createClient();
    let channel: any = null;

    if (supabase) {
      channel = supabase
        .channel('atelier_db_changes')
        .on(
          'postgres_changes',
          { event: '*', schema: 'public' },
          () => {
            loadDailyData(currentDateStr);
          }
        )
        .subscribe();
    }

    const handleLocalSync = () => {
      loadDailyData(currentDateStr);
    };

    window.addEventListener('atelier_local_sync', handleLocalSync);

    let bc: BroadcastChannel | null = null;
    if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
      bc = new BroadcastChannel('atelier_sync_channel');
      bc.onmessage = (e) => {
        if (e.data?.type === 'DATA_UPDATED') {
          loadDailyData(currentDateStr);
        }
      };
    }

    return () => {
      if (supabase && channel) {
        supabase.removeChannel(channel);
      }
      window.removeEventListener('atelier_local_sync', handleLocalSync);
      if (bc) {
        bc.close();
      }
    };
  }, [currentDateStr, loadDailyData]);

  // Handlers for Calendar Feeds
  const handleSaveFeed = async (feed: CalendarFeed) => {
    await store.saveCalendarFeed(feed);
    const updated = await store.getCalendarFeeds();
    setFeeds(updated);
    const externalEvents = await syncExternalFeeds(currentDateStr, updated);
    const localEvents = await store.getEvents(currentDateStr);
    setEvents([...localEvents, ...externalEvents].sort((a, b) => a.start_time.localeCompare(b.start_time)));
  };

  const handleDeleteFeed = async (id: string) => {
    await store.deleteCalendarFeed(id);
    const updated = await store.getCalendarFeeds();
    setFeeds(updated);
    const externalEvents = await syncExternalFeeds(currentDateStr, updated);
    const localEvents = await store.getEvents(currentDateStr);
    setEvents([...localEvents, ...externalEvents].sort((a, b) => a.start_time.localeCompare(b.start_time)));
  };

  // Handlers for List Categories
  const handleSaveList = async (list: ListCategory) => {
    await store.saveList(list);
    const updated = await store.getLists();
    setLists(updated);
  };

  const handleDeleteList = async (id: string) => {
    await store.deleteList(id);
    const updated = await store.getLists();
    setLists(updated);
  };

  const handleManualSyncNow = async () => {
    const externalEvents = await syncExternalFeeds(currentDateStr, feeds);
    const localEvents = await store.getEvents(currentDateStr);
    setEvents([...localEvents, ...externalEvents].sort((a, b) => a.start_time.localeCompare(b.start_time)));
  };

  // Handlers for Smart NLP Input Modal: Save items as Tasks or Events based on tab selection
  const handleAddItem = async (item: ParsedItem) => {
    const targetDateStr = item.targetDate || currentDateStr;

    if (item.type === 'event') {
      const activeFeed = feeds.find((f) => f.enabled) || feeds[0];
      const newEvent: Event = {
        id: ensureUUID(),
        date: targetDateStr,
        text: item.text,
        start_time: item.startTime || '09:00',
        end_time: item.endTime || null,
        priority: item.priority,
        list_tag: item.listTag || null,
        list_id: item.listTag || null,
        calendar_name: activeFeed?.name || 'Personal',
        calendar_color: activeFeed?.color || '#10b981',
        is_external: false,
      };

      await store.saveEvent(newEvent);
      if (targetDateStr === currentDateStr) {
        setEvents((prev) =>
          [...prev, newEvent].sort((a, b) => a.start_time.localeCompare(b.start_time))
        );
      }
    } else {
      const newTask: Task = {
        id: ensureUUID(),
        date: targetDateStr,
        text: item.text,
        priority: item.priority,
        list_tag: item.listTag,
        is_done: false,
        start_time: item.startTime || null,
        end_time: item.endTime || null,
      };

      await store.saveTask(newTask);
      if (targetDateStr === currentDateStr) {
        setTasks((prev) => [...prev, newTask]);
      }
    }
  };

  const [editingItem, setEditingItem] = useState<Task | Event | null>(null);

  // Handlers for Task Actions
  const handleToggleTaskDone = async (task: Task) => {
    const updated = { ...task, is_done: !task.is_done };
    setTasks((prev) => prev.map((t) => (t.id === task.id ? updated : t)));
    await store.saveTask(updated);
  };

  const handleDeleteTask = async (id: string, dateStr: string = currentDateStr) => {
    setTasks((prev) => prev.filter((t) => t.id !== id));
    await store.deleteTask(id, dateStr);
  };

  const handleSaveUpdatedTask = async (updatedTask: Task, oldDate?: string) => {
    if (oldDate && oldDate !== updatedTask.date) {
      await store.deleteTask(updatedTask.id, oldDate);
      if (oldDate === currentDateStr) {
        setTasks((prev) => prev.filter((t) => t.id !== updatedTask.id));
      }
    }
    await store.saveTask(updatedTask);
    if (updatedTask.date === currentDateStr) {
      setTasks((prev) => {
        const exists = prev.some((t) => t.id === updatedTask.id);
        if (exists) return prev.map((t) => (t.id === updatedTask.id ? updatedTask : t));
        return [...prev, updatedTask];
      });
    }
  };

  // Handlers for Event Actions
  const handleToggleEventDone = async (event: Event) => {
    const updated = { ...event, is_done: !event.is_done };
    setEvents((prev) => prev.map((e) => (e.id === event.id ? updated : e)));
    await store.saveEvent(updated);
  };

  const handleDeleteEvent = async (id: string, dateStr: string = currentDateStr) => {
    setEvents((prev) => prev.filter((e) => e.id !== id));
    await store.deleteEvent(id, dateStr);
  };

  const handleSaveUpdatedEvent = async (updatedEvent: Event, oldDate?: string) => {
    if (oldDate && oldDate !== updatedEvent.date) {
      await store.deleteEvent(updatedEvent.id, oldDate);
      if (oldDate === currentDateStr) {
        setEvents((prev) => prev.filter((e) => e.id !== updatedEvent.id));
      }
    }
    await store.saveEvent(updatedEvent);
    if (updatedEvent.date === currentDateStr) {
      setEvents((prev) => {
        const exists = prev.some((e) => e.id === updatedEvent.id);
        if (exists) {
          return prev
            .map((e) => (e.id === updatedEvent.id ? updatedEvent : e))
            .sort((a, b) => a.start_time.localeCompare(b.start_time));
        }
        return [...prev, updatedEvent].sort((a, b) => a.start_time.localeCompare(b.start_time));
      });
    }
  };

  // Handler for Scratchpad Note Save
  const handleSaveNoteContent = async (content: any) => {
    setNote({ date: currentDateStr, content });
    await store.saveNote(currentDateStr, content);
  };

  // Render Landing Page for unauthenticated users (unless they explicitly choose Guest Preview)
  if (!user && !isGuestMode) {
    return <LandingPage onGuestAccess={() => setIsGuestMode(true)} />;
  }

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col font-sans transition-colors duration-200">
      {/* Top Application Bar */}
      <nav className="border-b border-border/60 bg-card/60 backdrop-blur-xs sticky top-0 z-30 px-4 sm:px-8 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-accent text-accent-foreground flex items-center justify-center shadow-2xs">
            <Feather className="w-4 h-4 stroke-[2.5]" />
          </div>
          <div>
            <span className="font-serif font-bold text-lg tracking-tight text-foreground">
              Atelier
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* PWA Install Button */}
          <PWAInstaller />

          {/* User Profile & Sign In / Sign Out Menu */}
          <UserMenu />
        </div>
      </nav>

      {/* Main Container: Dual Column Grid on Desktop (lg:grid lg:grid-cols-12) */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 py-6 flex flex-col space-y-6">
        {/* Top Capsule Navigation & Large Date Heading */}
        <DateNav
          currentDateStr={currentDateStr}
          onDateChange={setCurrentDateStr}
          onOpenSettings={() => setIsSettingsOpen(true)}
        />

        {/* Dashboard Layout: Agenda (left, fixed width) & Daily Note (right, flex-1) on Desktop */}
        <div className="flex flex-col lg:flex-row lg:items-start gap-6 w-full">
          <div className="w-full lg:w-[420px] lg:shrink-0 space-y-6">
            {/* Unified 📅 Agenda Card (Untimed Tasks + Timed Events) */}
            <UnifiedAgenda
              tasks={tasks}
              events={events}
              onToggleTaskDone={handleToggleTaskDone}
              onToggleEventDone={handleToggleEventDone}
              onDeleteTask={(id) => handleDeleteTask(id, currentDateStr)}
              onDeleteEvent={(id) => handleDeleteEvent(id, currentDateStr)}
              onEditItem={(item) => setEditingItem(item)}
              onOpenAddModal={() => setIsNLPModalOpen(true)}
              onSaveTask={(updatedTask) => handleSaveUpdatedTask(updatedTask)}
              lists={lists}
            />
          </div>

          <div className="w-full lg:flex-1 lg:min-w-0 h-full">
            {/* 🖋️ Daily Note Card */}
            <Scratchpad
              dateStr={currentDateStr}
              initialContent={note?.content}
              onSaveContent={handleSaveNoteContent}
            />
          </div>
        </div>
      </main>

      {/* Floating Natural Language Entry Modal */}
      <NLPModal
        isOpen={isNLPModalOpen}
        onClose={() => setIsNLPModalOpen(false)}
        currentDateStr={currentDateStr}
        onAddItem={handleAddItem}
      />

      {/* Task & Event Edit Sheet Drawer */}
      <TaskEditSheet
        item={editingItem}
        isOpen={!!editingItem}
        onClose={() => setEditingItem(null)}
        onSaveTask={handleSaveUpdatedTask}
        onSaveEvent={handleSaveUpdatedEvent}
        onDeleteTask={handleDeleteTask}
        onDeleteEvent={handleDeleteEvent}
        lists={lists}
        feeds={feeds}
      />

      {/* Offline Status Indicator */}
      <OfflineIndicator />

      {/* Unified Settings Drawer Panel */}
      <SettingsPanel
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        feeds={feeds}
        onSaveFeed={handleSaveFeed}
        onDeleteFeed={handleDeleteFeed}
        onSyncNow={handleManualSyncNow}
        isSyncing={isSyncingFeeds}
        lists={lists}
        onSaveList={handleSaveList}
        onDeleteList={handleDeleteList}
        onOpenExport={() => setIsExportOpen(true)}
      />

      {/* One-Click Workspace Export Modal */}
      <ExportModal
        isOpen={isExportOpen}
        onClose={() => setIsExportOpen(false)}
      />

      {/* Mobile Quick Floating Action Button (FAB) */}
      <button
        onClick={() => setIsNLPModalOpen(true)}
        className="sm:hidden fixed bottom-6 right-6 z-40 p-4 bg-accent text-accent-foreground rounded-full shadow-[0_10px_25px_-5px_rgba(0,0,0,0.3)] hover:scale-105 active:scale-95 transition-all flex items-center justify-center ring-1 ring-white/20"
        title="Quick Add Item (+)"
      >
        <Plus className="w-6 h-6 stroke-[2.5]" />
      </button>

      {/* Keyboard Shortcuts Footer Bar */}
      <footer className="border-t border-border/40 py-3 px-4 text-center text-xs text-muted-foreground/80 bg-card/30 flex flex-wrap items-center justify-center gap-4 font-mono">
        <span className="inline-flex items-center gap-1">
          <kbd className="px-1.5 py-0.5 bg-muted rounded border border-border">/ or ⌘K</kbd> Add Item
        </span>
        <span>·</span>
        <span className="inline-flex items-center gap-1">
          <kbd className="px-1.5 py-0.5 bg-muted rounded border border-border">← / →</kbd> Shift Days
        </span>
        <span>·</span>
        <span className="inline-flex items-center gap-1">
          <kbd className="px-1.5 py-0.5 bg-muted rounded border border-border">T</kbd> Today
        </span>
      </footer>
    </div>
  );
}

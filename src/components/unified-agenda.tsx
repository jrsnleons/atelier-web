'use client';

import { useState, useEffect, useRef } from 'react';
import { Task, Event, ListCategory, SubTask } from '@/lib/supabase/types';
import { DEFAULT_LISTS, getListColor, getListName } from '@/lib/lists';
import { Calendar, Plus, ChevronsUpDown, Clock, CheckCircle2, Circle, Trash2, Pencil, Tag, ListChecks, CheckSquare, Square, Filter, ChevronDown, Check } from 'lucide-react';

interface UnifiedAgendaProps {
  tasks: Task[];
  events: Event[];
  onToggleTaskDone: (task: Task) => void;
  onToggleEventDone: (event: Event) => void;
  onDeleteTask: (id: string) => void;
  onDeleteEvent: (id: string) => void;
  onEditItem: (item: Task | Event) => void;
  onOpenAddModal: () => void;
  onSaveTask?: (task: Task) => void;
  lists?: ListCategory[];
}

export function UnifiedAgenda({
  tasks,
  events,
  onToggleTaskDone,
  onToggleEventDone,
  onDeleteTask,
  onDeleteEvent,
  onEditItem,
  onOpenAddModal,
  onSaveTask,
  lists = DEFAULT_LISTS,
}: UnifiedAgendaProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [activeListFilter, setActiveListFilter] = useState<string>('all');
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const filterRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (filterRef.current && !filterRef.current.contains(e.target as Node)) {
        setIsFilterOpen(false);
      }
    };
    if (isFilterOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isFilterOpen]);

  // Filter tasks & events by active category list filter
  const matchesFilter = (item: Task | Event) => {
    if (activeListFilter === 'all') return true;
    const tag = item.list_id || item.list_tag;
    if (!tag) return false;
    return tag.toLowerCase() === activeListFilter.toLowerCase();
  };

  const filteredTasks = tasks.filter(matchesFilter);
  const filteredEvents = events.filter(matchesFilter);

  // Untimed Tasks (All Day + No Time)
  const untimedTasks = filteredTasks
    .filter((t) => !t.start_time)
    .sort((a, b) => {
      if (a.is_done !== b.is_done) return a.is_done ? 1 : -1;
      return b.priority - a.priority;
    });

  // Timed Tasks (Scheduled with start_time)
  const timedTasks = filteredTasks.filter((t) => !!t.start_time);

  // Combined Timed Items (Scheduled Tasks + Calendar Events) sorted by start_time
  type TimedItem =
    | { type: 'task'; data: Task; start_time: string }
    | { type: 'event'; data: Event; start_time: string };

  const combinedTimedItems: TimedItem[] = [
    ...timedTasks.map((t) => ({ type: 'task' as const, data: t, start_time: t.start_time! })),
    ...filteredEvents.map((e) => ({ type: 'event' as const, data: e, start_time: e.start_time })),
  ].sort((a, b) => a.start_time.localeCompare(b.start_time));

  if (!mounted) {
    return (
      <div className="bg-card border border-border/80 rounded-2xl p-5 card-hover-effect space-y-4 w-full">
        <div className="flex items-center justify-between pb-2 border-b border-border/40">
          <div className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-foreground stroke-[1.8]" />
            <h2 className="text-lg font-serif font-bold text-foreground tracking-tight">Agenda</h2>
          </div>
        </div>
        <div className="h-24 animate-pulse rounded-xl bg-muted/30" />
      </div>
    );
  }

  return (
    <div className="bg-card border border-border/80 rounded-2xl p-5 card-hover-effect space-y-4 w-full">
      {/* Card Header: 📅 Agenda  [ ⇕ ] [ + ] */}
      <div className="flex items-center justify-between pb-2 border-b border-border/40">
        <div className="flex items-center gap-2">
          <Calendar className="w-5 h-5 text-foreground stroke-[1.8]" />
          <h2 className="text-lg font-serif font-bold text-foreground tracking-tight">
            Agenda
          </h2>
        </div>

        <div className="flex items-center gap-2">
          {/* Clean Category Filter Popover Dropdown Button */}
          <div ref={filterRef} className="relative">
            <button
              type="button"
              onClick={() => setIsFilterOpen(!isFilterOpen)}
              className={`p-1.5 px-2.5 rounded-lg border transition-all flex items-center gap-1.5 text-xs font-semibold active:scale-95 ${
                activeListFilter !== 'all'
                  ? 'bg-accent/15 border-accent/40 text-accent font-bold ring-1 ring-accent/30'
                  : 'bg-muted/40 border-border/60 text-muted-foreground hover:text-foreground hover:bg-muted/70'
              }`}
              title="Filter by Category"
            >
              <Filter className="w-3.5 h-3.5" />
              <span className="capitalize">
                {activeListFilter === 'all'
                  ? 'All'
                  : lists.find((l) => l.name.toLowerCase() === activeListFilter)?.name || activeListFilter}
              </span>
              <ChevronDown className={`w-3 h-3 transition-transform ${isFilterOpen ? 'rotate-180' : ''}`} />
            </button>

            {/* Filter Dropdown Popover */}
            {isFilterOpen && (
              <div className="absolute right-0 top-full mt-1.5 z-40 bg-card dark:bg-[#1E1C1A] border border-border/80 rounded-xl p-1.5 shadow-xl w-48 ring-1 ring-white/10 animate-in zoom-in-95 fade-in duration-150 space-y-0.5 text-xs">
                <button
                  type="button"
                  onClick={() => {
                    setActiveListFilter('all');
                    setIsFilterOpen(false);
                  }}
                  className={`w-full text-left px-2.5 py-1.5 rounded-lg font-medium transition-colors flex items-center justify-between ${
                    activeListFilter === 'all'
                      ? 'bg-accent/20 text-accent font-bold'
                      : 'hover:bg-muted/60 text-foreground'
                  }`}
                >
                  <span>All Categories</span>
                  {activeListFilter === 'all' && <Check className="w-3.5 h-3.5 text-accent" />}
                </button>

                <div className="my-1 border-t border-border/40" />

                {lists.map((l) => {
                  const isActive = activeListFilter.toLowerCase() === l.name.toLowerCase();
                  return (
                    <button
                      key={l.id}
                      type="button"
                      onClick={() => {
                        setActiveListFilter(l.name.toLowerCase());
                        setIsFilterOpen(false);
                      }}
                      className={`w-full text-left px-2.5 py-1.5 rounded-lg font-medium transition-colors flex items-center justify-between ${
                        isActive
                          ? 'bg-accent/20 text-accent font-bold'
                          : 'hover:bg-muted/60 text-foreground'
                      }`}
                    >
                      <span className="flex items-center gap-2">
                        <span
                          className="w-2 h-2 rounded-full shrink-0"
                          style={{ backgroundColor: l.color }}
                        />
                        {l.name}
                      </span>
                      {isActive && <Check className="w-3.5 h-3.5 text-accent" />}
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Collapse/Expand Toggle */}
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="p-1.5 rounded-lg bg-accent/10 text-accent hover:bg-accent/20 transition-colors active:scale-95"
            title={isCollapsed ? 'Expand Agenda' : 'Collapse Agenda'}
          >
            <ChevronsUpDown className="w-4 h-4" />
          </button>

          {/* Plus Add Button */}
          <button
            onClick={onOpenAddModal}
            className="p-1.5 rounded-lg bg-accent text-accent-foreground hover:opacity-90 transition-opacity shadow-2xs flex items-center justify-center active:scale-95"
            title="Add Event or Task (+)"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
          </button>
        </div>
      </div>

      {!isCollapsed && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-1">
          {/* Sub-Column 1: ALL DAY + NO TIME (Untimed Tasks & Deadlines) */}
          <div className="space-y-3">
            <div className="flex items-center justify-between text-[11px] font-mono font-bold tracking-wider text-muted-foreground uppercase pb-1 border-b border-border/30">
              <span>All Day + No Time</span>
              <span className="text-foreground">{untimedTasks.filter((t) => !t.is_done).length}</span>
            </div>

            {untimedTasks.length === 0 ? (
              <p className="text-xs text-muted-foreground/60 italic py-4">
                No all-day tasks
              </p>
            ) : (
              <ul className="space-y-2.5">
                {untimedTasks.map((task) => {
                  const tag = task.list_id || task.list_tag;
                  const tagColor = getListColor(tag, lists);
                  const tagName = getListName(tag, lists);

                  return (
                    <li
                      key={task.id}
                      className="group flex items-start justify-between gap-2.5 p-1.5 rounded-lg hover:bg-muted/40 transition-all"
                    >
                      <div className="flex items-start gap-2.5 min-w-0 flex-1">
                        {/* Outline Circle Checkbox */}
                        <button
                          onClick={() => onToggleTaskDone(task)}
                          className="mt-0.5 text-muted-foreground hover:text-foreground transition-colors shrink-0"
                        >
                          {task.is_done ? (
                            <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 animate-check-pop" />
                          ) : (
                            <Circle className="w-4 h-4 stroke-[1.2]" />
                          )}
                        </button>

                        <div className="min-w-0 flex-1">
                          {/* Task Text — Clickable to edit */}
                          <p
                            onClick={() => onEditItem(task)}
                            className={`text-sm font-medium leading-snug break-words cursor-pointer hover:text-accent transition-colors ${
                              task.is_done
                                ? 'line-through text-muted-foreground/70'
                                : 'text-foreground'
                            }`}
                          >
                            {task.text}
                          </p>

                          <div className="flex flex-wrap items-center gap-2 mt-0.5 text-[11px] text-muted-foreground">
                            {task.priority === 1 ? (
                              <span className="text-red-600 dark:text-red-400 font-semibold">Overdue</span>
                            ) : (
                              <span>All day</span>
                            )}

                            {tag && (
                              <span className="inline-flex items-center gap-1 px-1.5 py-0.2 rounded-full font-mono text-[10px] bg-muted/60 text-foreground font-medium">
                                <span
                                  className="w-1.5 h-1.5 rounded-full"
                                  style={{ backgroundColor: tagColor }}
                                />
                                {tagName}
                              </span>
                            )}

                            {/* Subtask Progress Badge */}
                            {task.subtasks && task.subtasks.length > 0 && (
                              <span className="inline-flex items-center gap-1 px-1.5 py-0.2 rounded-md font-mono text-[10px] bg-accent/15 text-accent font-semibold">
                                <ListChecks className="w-3 h-3" />
                                {task.subtasks.filter((s) => s.is_done).length}/{task.subtasks.length}
                              </span>
                            )}
                          </div>

                          {/* Nested Sub-task Checklist */}
                          {task.subtasks && task.subtasks.length > 0 && (
                            <div className="mt-2 space-y-1 pl-1 border-l-2 border-accent/20">
                              {task.subtasks.map((st) => (
                                <div key={st.id} className="flex items-center gap-2 text-xs py-0.5">
                                  <button
                                    type="button"
                                    onClick={() => {
                                      if (onSaveTask) {
                                        const updatedSubtasks = task.subtasks!.map((s) =>
                                          s.id === st.id ? { ...s, is_done: !s.is_done } : s
                                        );
                                        const allDone = updatedSubtasks.every((s) => s.is_done);
                                        onSaveTask({
                                          ...task,
                                          subtasks: updatedSubtasks,
                                          is_done: allDone ? true : task.is_done,
                                        });
                                      }
                                    }}
                                    className="text-muted-foreground hover:text-accent transition-colors shrink-0"
                                  >
                                    {st.is_done ? (
                                      <CheckSquare className="w-3.5 h-3.5 text-accent" />
                                    ) : (
                                      <Square className="w-3.5 h-3.5 text-muted-foreground/60" />
                                    )}
                                  </button>
                                  <span className={`break-words ${st.is_done ? 'line-through text-muted-foreground/60' : 'text-foreground/90'}`}>
                                    {st.text}
                                  </span>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Action Buttons: Edit Pencil & Delete Trash */}
                      <div className="opacity-0 group-hover:opacity-100 flex items-center gap-1 transition-opacity">
                        <button
                          onClick={() => onEditItem(task)}
                          className="p-1 text-muted-foreground hover:text-accent rounded transition-colors"
                          title="Edit Task"
                        >
                          <Pencil className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => onDeleteTask(task.id)}
                          className="p-1 text-muted-foreground hover:text-red-500 rounded transition-colors"
                          title="Delete Task"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>

          {/* Sub-Column 2: TIMED (Scheduled Tasks & Timed Agenda Events) */}
          <div className="space-y-3">
            <div className="flex items-center justify-between text-[11px] font-mono font-bold tracking-wider text-muted-foreground uppercase pb-1 border-b border-border/30">
              <span>Timed</span>
              <span className="text-foreground">{combinedTimedItems.length}</span>
            </div>

            {combinedTimedItems.length === 0 ? (
              <p className="text-xs text-muted-foreground/60 italic py-4">
                No scheduled items
              </p>
            ) : (
              <ul className="space-y-2.5">
                {combinedTimedItems.map((item) => {
                  const isTask = item.type === 'task';
                  const isExternalEvent = item.type === 'event' && item.data.is_external;
                  const isDone = isTask ? item.data.is_done : !!item.data.is_done;

                  if (isTask || !isExternalEvent) {
                    // Render with Check Circle for all Tasks and all non-external local items
                    const task = isTask ? item.data : null;
                    const event = !isTask ? item.data : null;
                    const text = task ? task.text : event!.text;
                    const priority = task ? task.priority : event!.priority;
                    const tag = task ? (task.list_id || task.list_tag) : (event!.list_id || event!.list_tag);
                    const tagColor = getListColor(tag || event?.calendar_color, lists);
                    const tagName = getListName(tag, lists);

                    return (
                      <li
                        key={item.data.id}
                        className="group flex items-start justify-between gap-2.5 p-1.5 rounded-lg hover:bg-muted/40 transition-all"
                      >
                        <div className="flex items-start gap-2.5 min-w-0 flex-1">
                          {/* Checkbox for Scheduled Task or Local Event */}
                          <button
                            onClick={() =>
                              task ? onToggleTaskDone(task) : onToggleEventDone(event!)
                            }
                            className="mt-0.5 text-muted-foreground hover:text-foreground transition-colors shrink-0"
                          >
                            {isDone ? (
                              <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 animate-check-pop" />
                            ) : (
                              <Circle className="w-4 h-4 stroke-[1.2]" />
                            )}
                          </button>

                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-1.5">
                              {/* Clickable Title */}
                              <p
                                onClick={() => onEditItem(item.data)}
                                className={`text-sm font-medium leading-snug break-words cursor-pointer hover:text-accent transition-colors ${
                                  isDone
                                    ? 'line-through text-muted-foreground/70'
                                    : 'text-foreground'
                                }`}
                              >
                                {text}
                              </p>
                            </div>

                            <p className="text-[11px] font-mono text-muted-foreground mt-0.5 flex items-center gap-1.5">
                              <span>{item.start_time}</span>
                              {priority === 1 && (
                                <span className="text-red-600 dark:text-red-400 font-semibold font-sans">!1</span>
                              )}
                              {tag && (
                                <span className="inline-flex items-center gap-1 px-1.5 py-0.2 rounded-full font-mono text-[9px] bg-muted/60 text-foreground font-medium">
                                  <span
                                    className="w-1.5 h-1.5 rounded-full"
                                    style={{ backgroundColor: tagColor }}
                                  />
                                  {tagName}
                                </span>
                              )}
                            </p>
                          </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="opacity-0 group-hover:opacity-100 flex items-center gap-1 transition-opacity">
                          <button
                            onClick={() => onEditItem(item.data)}
                            className="p-1 text-muted-foreground hover:text-accent rounded transition-colors"
                            title="Edit Item"
                          >
                            <Pencil className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() =>
                              task ? onDeleteTask(task.id) : onDeleteEvent(event!.id)
                            }
                            className="p-1 text-muted-foreground hover:text-red-500 rounded transition-colors"
                            title="Delete Item"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </li>
                    );
                  } else {
                    // Render with Clock icon for external synced Google Calendar events
                    const event = item.data;
                    return (
                      <li
                        key={event.id}
                        className="group flex items-start justify-between gap-2.5 p-1.5 rounded-lg hover:bg-muted/40 transition-all"
                      >
                        <div className="flex items-start gap-2.5 min-w-0 flex-1">
                          <Clock className="w-4 h-4 mt-0.5 text-muted-foreground/70 shrink-0 stroke-[1.5]" />

                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-1.5">
                              {/* Subtle Colored Dot for Calendar Source */}
                              <div
                                className="w-2 h-2 rounded-full shrink-0 shadow-2xs"
                                style={{ backgroundColor: event.calendar_color || 'hsl(var(--accent))' }}
                                title={event.calendar_name || 'Event'}
                              />

                              <p className="text-sm font-medium text-foreground leading-snug truncate">
                                {event.text}
                              </p>
                            </div>

                            <p className="text-[11px] font-mono text-muted-foreground mt-0.5">
                              {event.start_time}
                              {event.end_time ? ` - ${event.end_time}` : ''}
                              {event.calendar_name ? ` · ${event.calendar_name}` : ''}
                            </p>
                          </div>
                        </div>

                        <button
                          onClick={() => onDeleteEvent(event.id)}
                          className="opacity-0 group-hover:opacity-100 p-1 text-muted-foreground hover:text-red-500 rounded transition-opacity"
                          title="Delete Event"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </li>
                    );
                  }
                })}
              </ul>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

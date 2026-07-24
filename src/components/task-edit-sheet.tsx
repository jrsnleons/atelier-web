'use client';

import { useState, useEffect } from 'react';
import { Task, Event, ListCategory, CalendarFeed, Priority, SubTask } from '@/lib/supabase/types';
import { DEFAULT_LISTS } from '@/lib/lists';
import { X, Trash2, Calendar, Clock, Tag, Flag, Check, ListChecks, Plus, CheckSquare, Square } from 'lucide-react';

import { CustomCalendarPicker } from './custom-calendar-picker';

interface TaskEditSheetProps {
  item: Task | Event | null;
  isOpen: boolean;
  onClose: () => void;
  onSaveTask: (updatedTask: Task, oldDate?: string) => Promise<void>;
  onSaveEvent: (updatedEvent: Event, oldDate?: string) => Promise<void>;
  onDeleteTask: (id: string, dateStr: string) => Promise<void>;
  onDeleteEvent: (id: string, dateStr: string) => Promise<void>;
  lists?: ListCategory[];
  feeds?: CalendarFeed[];
}

export function TaskEditSheet({
  item,
  isOpen,
  onClose,
  onSaveTask,
  onSaveEvent,
  onDeleteTask,
  onDeleteEvent,
  lists = DEFAULT_LISTS,
  feeds = [],
}: TaskEditSheetProps) {
  const [text, setText] = useState('');
  const [date, setDate] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [priority, setPriority] = useState<Priority>(0);
  const [selectedList, setSelectedList] = useState<string>('');
  const [selectedCalendarFeed, setSelectedCalendarFeed] = useState<string>('');
  const [subtasks, setSubtasks] = useState<SubTask[]>([]);
  const [newSubtaskText, setNewSubtaskText] = useState('');

  useEffect(() => {
    if (item) {
      setText(item.text);
      setDate(item.date);
      setStartTime(item.start_time || '');
      setEndTime(item.end_time || '');
      setPriority(item.priority || 0);
      setSelectedList(item.list_id || item.list_tag || '');
      setSelectedCalendarFeed(('calendar_name' in item && item.calendar_name) ? item.calendar_name : '');
      setSubtasks(('subtasks' in item && Array.isArray((item as Task).subtasks)) ? (item as Task).subtasks! : []);
      setNewSubtaskText('');
    }
  }, [item]);

  if (!isOpen || !item) return null;

  const isTask = 'is_done' in item && typeof item.is_done === 'boolean';

  const handleAddSubtask = () => {
    if (!newSubtaskText.trim()) return;
    const newSub: SubTask = {
      id: typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : String(Date.now()),
      text: newSubtaskText.trim(),
      is_done: false,
    };
    setSubtasks([...subtasks, newSub]);
    setNewSubtaskText('');
  };

  const handleToggleSubtask = (id: string) => {
    setSubtasks(subtasks.map((s) => (s.id === id ? { ...s, is_done: !s.is_done } : s)));
  };

  const handleDeleteSubtask = (id: string) => {
    setSubtasks(subtasks.filter((s) => s.id !== id));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim()) return;

    const oldDate = item.date;

    if (isTask) {
      const updated: Task = {
        ...(item as Task),
        text: text.trim(),
        date,
        start_time: startTime.trim() || null,
        end_time: endTime.trim() || null,
        priority,
        list_tag: selectedList || null,
        list_id: selectedList || null,
        subtasks,
      };
      await onSaveTask(updated, oldDate);
    } else {
      const matchedFeed = feeds.find(
        (f) => f.name.toLowerCase() === selectedCalendarFeed.toLowerCase() || f.id === selectedCalendarFeed
      );

      const updated: Event = {
        ...(item as Event),
        text: text.trim(),
        date,
        start_time: startTime.trim() || '09:00',
        end_time: endTime.trim() || null,
        priority,
        list_tag: selectedList || null,
        list_id: selectedList || null,
        calendar_name: matchedFeed?.name || (item as Event).calendar_name || feeds[0]?.name || 'Personal',
        calendar_color: matchedFeed?.color || (item as Event).calendar_color || feeds[0]?.color || '#10b981',
      };
      await onSaveEvent(updated, oldDate);
    }

    onClose();
  };

  const handleDelete = async () => {
    if (isTask) {
      await onDeleteTask(item.id, item.date);
    } else {
      await onDeleteEvent(item.id, item.date);
    }
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-black/75 backdrop-blur-md flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in duration-200"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      onKeyDown={(e) => {
        if (e.key === 'Escape') onClose();
      }}
      role="dialog"
      aria-modal="true"
    >
      <div className="bg-card dark:bg-[#1E1C1A] border border-border/80 rounded-t-2xl sm:rounded-2xl max-w-lg w-full shadow-2xl overflow-hidden animate-in fade-in slide-in-from-bottom-6 sm:zoom-in-95 duration-200 ease-[cubic-bezier(0.16,1,0.3,1)] ring-1 ring-white/10">
        {/* Header Bar */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-border/50 bg-muted/30">
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono font-bold tracking-wider text-muted-foreground uppercase">
              Edit {isTask ? 'Task' : 'Event'}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleDelete}
              className="p-1.5 rounded-lg text-muted-foreground hover:text-red-500 hover:bg-red-500/10 transition-colors"
              title="Delete Item"
            >
              <Trash2 className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        <form onSubmit={handleSave} className="p-5 space-y-4">
          {/* Title Input */}
          <div className="space-y-1">
            <label className="text-xs font-semibold text-muted-foreground">Title</label>
            <input
              type="text"
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Task or event title..."
              className="w-full px-3.5 py-2.5 bg-background border border-border/80 rounded-xl text-sm font-sans text-foreground outline-none focus:ring-2 focus:ring-accent/40 transition-all"
              autoFocus
            />
          </div>

          {/* Time & Date Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Date Field */}
            <div className="space-y-1">
              <label className="text-xs font-semibold text-muted-foreground flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-accent" /> Date
              </label>
              <div className="flex items-center gap-2">
                <CustomCalendarPicker value={date} onChange={setDate} />
                <span className="font-mono text-xs text-foreground font-medium px-2 py-1 bg-muted/40 rounded-lg border border-border/60">
                  {date}
                </span>
              </div>
            </div>

            {/* Start Time Field */}
            <div className="space-y-1">
              <label className="text-xs font-semibold text-muted-foreground flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-accent" /> Start Time (HH:MM)
              </label>
              <input
                type="time"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                placeholder="Untimed"
                className="w-full px-3 py-2 bg-background border border-border/80 rounded-xl text-xs font-mono text-foreground outline-none focus:ring-2 focus:ring-accent/40"
              />
            </div>
          </div>

          {/* Calendar Feed Selector (Only for Events) */}
          {!isTask && feeds.length > 0 && (
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-muted-foreground flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-accent" /> Target Calendar
              </label>
              <div className="flex flex-wrap gap-1.5">
                {feeds.map((feed) => {
                  const isSelected =
                    selectedCalendarFeed.toLowerCase() === feed.name.toLowerCase() ||
                    selectedCalendarFeed === feed.id ||
                    (!selectedCalendarFeed && feed.name === (item as Event).calendar_name);
                  return (
                    <button
                      key={feed.id}
                      type="button"
                      onClick={() => setSelectedCalendarFeed(feed.name)}
                      className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all flex items-center gap-1.5 ${
                        isSelected
                          ? 'bg-accent/20 text-accent font-bold ring-1 ring-accent/40'
                          : 'bg-muted/60 text-muted-foreground hover:text-foreground'
                      }`}
                    >
                      <span
                        className="w-2 h-2 rounded-full shrink-0"
                        style={{ backgroundColor: feed.color }}
                      />
                      {feed.name}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Category / List Selector */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-muted-foreground flex items-center gap-1">
              <Tag className="w-3.5 h-3.5 text-accent" /> Category / List
            </label>
            <div className="flex flex-wrap gap-1.5">
              <button
                type="button"
                onClick={() => setSelectedList('')}
                className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all ${
                  !selectedList
                    ? 'bg-foreground text-background font-bold shadow-xs'
                    : 'bg-muted/60 text-muted-foreground hover:text-foreground'
                }`}
              >
                None
              </button>

              {lists.map((l) => {
                const isSelected = selectedList.toLowerCase() === l.name.toLowerCase() || selectedList === l.id;
                return (
                  <button
                    key={l.id}
                    type="button"
                    onClick={() => setSelectedList(l.name)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all flex items-center gap-1.5 ${
                      isSelected
                        ? 'bg-accent/20 text-accent font-bold ring-1 ring-accent/40'
                        : 'bg-muted/60 text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    <span
                      className="w-2 h-2 rounded-full shrink-0"
                      style={{ backgroundColor: l.color }}
                    />
                    {l.name}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Sub-tasks / Checklist (Only for Tasks) */}
          {isTask && (
            <div className="space-y-2 pt-1 border-t border-border/40">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-muted-foreground flex items-center gap-1">
                  <ListChecks className="w-3.5 h-3.5 text-accent" /> Sub-tasks ({subtasks.filter((s) => s.is_done).length}/{subtasks.length})
                </label>
              </div>

              {/* Sub-task List */}
              {subtasks.length > 0 && (
                <div className="space-y-1.5 max-h-36 overflow-y-auto pr-1">
                  {subtasks.map((st) => (
                    <div
                      key={st.id}
                      className="flex items-center gap-2 p-1.5 bg-muted/30 border border-border/40 rounded-lg text-xs"
                    >
                      <button
                        type="button"
                        onClick={() => handleToggleSubtask(st.id)}
                        className="text-muted-foreground hover:text-accent transition-colors"
                      >
                        {st.is_done ? (
                          <CheckSquare className="w-4 h-4 text-accent fill-accent/20" />
                        ) : (
                          <Square className="w-4 h-4 text-muted-foreground" />
                        )}
                      </button>
                      <span className={`flex-1 text-foreground ${st.is_done ? 'line-through text-muted-foreground' : ''}`}>
                        {st.text}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleDeleteSubtask(st.id)}
                        className="text-muted-foreground hover:text-red-500 transition-colors p-0.5"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {/* Add Sub-task Input */}
              <div className="flex items-center gap-1.5">
                <input
                  type="text"
                  value={newSubtaskText}
                  onChange={(e) => setNewSubtaskText(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddSubtask();
                    }
                  }}
                  placeholder="Add a sub-item..."
                  className="flex-1 px-3 py-1.5 bg-background border border-border/80 rounded-lg text-xs font-sans text-foreground outline-none focus:ring-1 focus:ring-accent/40"
                />
                <button
                  type="button"
                  onClick={handleAddSubtask}
                  disabled={!newSubtaskText.trim()}
                  className="p-1.5 rounded-lg bg-accent text-accent-foreground disabled:opacity-40 transition-opacity"
                  title="Add Sub-task"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* Priority Picker */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-muted-foreground flex items-center gap-1">
              <Flag className="w-3.5 h-3.5 text-accent" /> Priority
            </label>
            <div className="grid grid-cols-4 gap-2">
              {[
                { level: 0, label: 'Normal' },
                { level: 1, label: 'High (!1)' },
                { level: 2, label: 'Med (!2)' },
                { level: 3, label: 'Low (!3)' },
              ].map((p) => (
                <button
                  key={p.level}
                  type="button"
                  onClick={() => setPriority(p.level as Priority)}
                  className={`py-1.5 px-2 rounded-lg text-xs font-medium transition-all text-center ${
                    priority === p.level
                      ? p.level === 1
                        ? 'bg-red-500/20 text-red-600 dark:text-red-400 font-bold ring-1 ring-red-500/40'
                        : 'bg-accent text-accent-foreground font-bold shadow-xs'
                      : 'bg-muted/50 text-muted-foreground hover:text-foreground'
                  }`}
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>

          {/* Action Footer */}
          <div className="flex items-center justify-end gap-2 pt-3 border-t border-border/40">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!text.trim()}
              className="px-5 py-2 rounded-xl text-xs font-bold bg-accent text-accent-foreground hover:opacity-90 transition-opacity shadow-xs flex items-center gap-1.5 disabled:opacity-40"
            >
              <Check className="w-3.5 h-3.5 stroke-[2.5]" /> Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

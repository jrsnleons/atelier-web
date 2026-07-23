'use client';

import { useState, useEffect } from 'react';
import { Task, Event, ListCategory, Priority } from '@/lib/supabase/types';
import { DEFAULT_LISTS } from '@/lib/lists';
import { X, Trash2, Calendar, Clock, Tag, Flag, Check } from 'lucide-react';

interface TaskEditSheetProps {
  item: Task | Event | null;
  isOpen: boolean;
  onClose: () => void;
  onSaveTask: (updatedTask: Task, oldDate?: string) => Promise<void>;
  onSaveEvent: (updatedEvent: Event, oldDate?: string) => Promise<void>;
  onDeleteTask: (id: string, dateStr: string) => Promise<void>;
  onDeleteEvent: (id: string, dateStr: string) => Promise<void>;
  lists?: ListCategory[];
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
}: TaskEditSheetProps) {
  const [text, setText] = useState('');
  const [date, setDate] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [priority, setPriority] = useState<Priority>(0);
  const [selectedList, setSelectedList] = useState<string>('');

  useEffect(() => {
    if (item) {
      setText(item.text);
      setDate(item.date);
      setStartTime(item.start_time || '');
      setEndTime(item.end_time || '');
      setPriority(item.priority || 0);
      setSelectedList(item.list_id || item.list_tag || '');
    }
  }, [item]);

  if (!isOpen || !item) return null;

  const isTask = 'is_done' in item && typeof item.is_done === 'boolean';

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
      };
      await onSaveTask(updated, oldDate);
    } else {
      const updated: Event = {
        ...(item as Event),
        text: text.trim(),
        date,
        start_time: startTime.trim() || '09:00',
        end_time: endTime.trim() || null,
        priority,
        list_tag: selectedList || null,
        list_id: selectedList || null,
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
      className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in duration-150"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      onKeyDown={(e) => {
        if (e.key === 'Escape') onClose();
      }}
      role="dialog"
      aria-modal="true"
    >
      <div className="bg-card dark:bg-[#1E1C1A] border border-border/80 rounded-t-2xl sm:rounded-2xl max-w-lg w-full shadow-2xl overflow-hidden animate-in slide-in-from-bottom-6 sm:zoom-in-95 duration-150 ring-1 ring-white/10">
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
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-3 py-2 bg-background border border-border/80 rounded-xl text-xs font-mono text-foreground outline-none focus:ring-2 focus:ring-accent/40"
              />
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

'use client';

import { useEffect, useState } from 'react';
import { Event } from '@/lib/supabase/types';
import { Clock, CalendarDays, Trash2, Tag, MapPin, Globe } from 'lucide-react';

interface AgendaTimelineProps {
  events: Event[];
  onDeleteEvent: (id: string) => void;
}

export function AgendaTimeline({ events, onDeleteEvent }: AgendaTimelineProps) {
  const [currentTimeStr, setCurrentTimeStr] = useState<string>('');

  // Track real time for timeline indicator
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const hh = String(now.getHours()).padStart(2, '0');
      const mm = String(now.getMinutes()).padStart(2, '0');
      setCurrentTimeStr(`${hh}:${mm}`);
    };
    updateTime();
    const interval = setInterval(updateTime, 30000);
    return () => clearInterval(interval);
  }, []);

  // Sort events chronologically by start_time
  const sortedEvents = [...events].sort((a, b) => a.start_time.localeCompare(b.start_time));

  return (
    <div className="bg-card border border-border/70 rounded-xl p-4 shadow-2xs flex flex-col h-full">
      <div className="flex items-center justify-between pb-3 mb-3 border-b border-border/50">
        <div className="flex items-center gap-2">
          <CalendarDays className="w-4 h-4 text-blue-500" />
          <h2 className="text-sm font-semibold tracking-wide uppercase text-muted-foreground">
            Timed Agenda & Meetings
          </h2>
        </div>
        <span className="text-xs font-mono font-medium px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-600 dark:text-blue-400">
          {events.length} events
        </span>
      </div>

      {events.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center py-10 text-center text-muted-foreground/60">
          <p className="text-xs italic">No scheduled events for this day</p>
        </div>
      ) : (
        <div className="relative flex-1 overflow-y-auto max-h-[420px] pr-1 pl-2">
          {/* Vertical timeline line */}
          <div className="absolute left-[3.25rem] top-2 bottom-2 w-0.5 bg-border/60" />

          <ul className="space-y-4 relative">
            {sortedEvents.map((event) => {
              const isPast = currentTimeStr ? event.start_time < currentTimeStr : false;

              return (
                <li
                  key={event.id}
                  className={`group relative flex items-start gap-4 transition-all duration-150 ${
                    isPast ? 'opacity-55' : 'opacity-100'
                  }`}
                >
                  {/* Time label */}
                  <div className="w-10 text-right font-mono text-xs font-semibold text-muted-foreground pt-0.5 shrink-0">
                    {event.start_time}
                  </div>

                  {/* Timeline dot */}
                  <div
                    className="mt-1.5 w-3 h-3 rounded-full border-2 border-background z-10 shrink-0"
                    style={{
                      backgroundColor: event.calendar_color
                        ? event.calendar_color
                        : isPast
                        ? 'hsl(var(--muted-foreground))'
                        : event.priority === 1
                        ? 'var(--priority-high)'
                        : '#3b82f6',
                    }}
                  />

                  {/* Card Content */}
                  <div
                    className="flex-1 min-w-0 bg-background border border-border/60 rounded-lg p-2.5 shadow-2xs hover:border-border transition-colors relative overflow-hidden"
                    style={
                      event.calendar_color
                        ? { borderLeft: `3px solid ${event.calendar_color}` }
                        : {}
                    }
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          {/* Calendar Source Badge (e.g. Work 1, Work 2, Personal) */}
                          {event.calendar_name && (
                            <span
                              className="px-1.5 py-0.2 rounded text-[10px] font-bold text-white uppercase tracking-wider shrink-0"
                              style={{
                                backgroundColor: event.calendar_color || '#3b82f6',
                              }}
                            >
                              {event.calendar_name}
                            </span>
                          )}

                          <h3 className="text-sm font-semibold text-foreground leading-snug truncate">
                            {event.text}
                          </h3>
                        </div>

                        <div className="flex items-center gap-2 mt-1.5 text-[11px] text-muted-foreground flex-wrap">
                          <span className="flex items-center gap-1 font-mono">
                            <Clock className="w-3 h-3 text-muted-foreground/70" />
                            {event.start_time}
                            {event.end_time ? ` - ${event.end_time}` : ''}
                          </span>

                          {event.location && (
                            <span className="flex items-center gap-0.5 truncate text-muted-foreground">
                              <MapPin className="w-3 h-3 text-accent" />
                              {event.location}
                            </span>
                          )}

                          {event.list_tag && (
                            <span className="inline-flex items-center gap-0.5 px-1.5 py-0.2 bg-muted rounded font-mono">
                              <Tag className="w-2.5 h-2.5" />
                              {event.list_tag}
                            </span>
                          )}

                          {event.is_external && (
                            <span className="inline-flex items-center gap-0.5 text-[10px] text-muted-foreground/70">
                              <Globe className="w-2.5 h-2.5" /> Synced
                            </span>
                          )}
                        </div>
                      </div>

                      <button
                        onClick={() => onDeleteEvent(event.id)}
                        className="opacity-0 group-hover:opacity-100 p-1 text-muted-foreground hover:text-red-500 rounded transition-opacity shrink-0"
                        title="Delete event"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </div>
  );
}

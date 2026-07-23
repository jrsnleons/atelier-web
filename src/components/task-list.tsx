'use client';

import { Task } from '@/lib/supabase/types';
import { Check, Trash2, ListCheck, Tag } from 'lucide-react';

interface TaskListProps {
  tasks: Task[];
  onToggleDone: (task: Task) => void;
  onDeleteTask: (id: string) => void;
}

export function TaskList({ tasks, onToggleDone, onDeleteTask }: TaskListProps) {
  // Sort tasks: pending first (by priority high->low), then done tasks
  const sortedTasks = [...tasks].sort((a, b) => {
    if (a.is_done !== b.is_done) return a.is_done ? 1 : -1;
    if (b.priority !== a.priority) return b.priority - a.priority;
    return 0;
  });

  return (
    <div className="bg-card border border-border/70 rounded-xl p-4 shadow-2xs flex flex-col h-full">
      <div className="flex items-center justify-between pb-3 mb-3 border-b border-border/50">
        <div className="flex items-center gap-2">
          <ListCheck className="w-4 h-4 text-accent" />
          <h2 className="text-sm font-semibold tracking-wide uppercase text-muted-foreground">
            Untimed Tasks & Deadlines
          </h2>
        </div>
        <span className="text-xs font-mono font-medium px-2 py-0.5 rounded-full bg-muted text-muted-foreground">
          {tasks.filter((t) => !t.is_done).length} remaining
        </span>
      </div>

      {tasks.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center py-10 text-center text-muted-foreground/60">
          <p className="text-xs italic">No all-day tasks or deadlines</p>
        </div>
      ) : (
        <ul className="space-y-2 flex-1 overflow-y-auto max-h-[380px] pr-1">
          {sortedTasks.map((task) => (
            <li
              key={task.id}
              className={`group flex items-center justify-between p-2.5 rounded-lg border transition-all duration-150 ${
                task.is_done
                  ? 'bg-muted/30 border-transparent opacity-60'
                  : 'bg-background border-border/60 hover:border-border hover:shadow-2xs'
              }`}
            >
              <div className="flex items-start gap-3 flex-1 min-w-0 pr-2">
                {/* Custom Checkbox */}
                <button
                  type="button"
                  onClick={() => onToggleDone(task)}
                  className={`mt-0.5 w-4 h-4 rounded border flex items-center justify-center transition-all shrink-0 ${
                    task.is_done
                      ? 'bg-accent border-accent text-accent-foreground'
                      : 'border-muted-foreground/40 hover:border-accent'
                  }`}
                >
                  {task.is_done && <Check className="w-3 h-3 stroke-[3]" />}
                </button>

                {/* Task Content */}
                <div className="flex-1 min-w-0">
                  <p
                    className={`text-sm leading-tight break-words transition-all ${
                      task.is_done
                        ? 'line-through text-muted-foreground'
                        : 'text-foreground font-medium'
                    }`}
                  >
                    {task.text}
                  </p>

                  <div className="flex items-center gap-1.5 mt-1 text-[11px] text-muted-foreground">
                    {/* Priority Dot */}
                    {task.priority > 0 && (
                      <span className="flex items-center gap-1 font-semibold">
                        <span
                          className={`w-2 h-2 rounded-full ${
                            task.priority === 1
                              ? 'bg-priority-high'
                              : task.priority === 2
                              ? 'bg-priority-medium'
                              : 'bg-priority-low'
                          }`}
                        />
                        <span
                          className={
                            task.priority === 1
                              ? 'text-priority-high'
                              : task.priority === 2
                              ? 'text-priority-medium'
                              : 'text-priority-low'
                          }
                        >
                          P{task.priority}
                        </span>
                      </span>
                    )}

                    {/* List Tag */}
                    {task.list_tag && (
                      <span className="inline-flex items-center gap-0.5 px-1.5 py-0.2 bg-muted rounded text-muted-foreground font-mono">
                        <Tag className="w-2.5 h-2.5" />
                        {task.list_tag}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Delete button on hover */}
              <button
                onClick={() => onDeleteTask(task.id)}
                className="opacity-0 group-hover:opacity-100 p-1 text-muted-foreground hover:text-red-500 rounded transition-opacity"
                title="Delete task"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

'use client';

import { useState, useRef, useEffect } from 'react';
import { Search, Calendar, CheckSquare, Sparkles, X, CornerDownLeft } from 'lucide-react';
import { parseNLPInput, ParsedItem } from '@/lib/nlp-parser';

interface SmartInputProps {
  currentDateStr: string;
  onAddItem: (item: ParsedItem) => void;
}

export function SmartInput({ currentDateStr, onAddItem }: SmartInputProps) {
  const [value, setValue] = useState('');
  const [parsed, setParsed] = useState<ParsedItem | null>(null);
  const [isFocused, setIsFocused] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // Update parsed preview on input change
  useEffect(() => {
    if (value.trim().length > 1) {
      setParsed(parseNLPInput(value, currentDateStr));
    } else {
      setParsed(null);
    }
  }, [value, currentDateStr]);

  // Keyboard shortcut (/ or Cmd+K) listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        (e.key === '/' && document.activeElement?.tagName !== 'INPUT' && document.activeElement?.tagName !== 'TEXTAREA') ||
        ((e.metaKey || e.ctrlKey) && e.key === 'k')
      ) {
        e.preventDefault();
        inputRef.current?.focus();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!value.trim()) return;

    const itemToSubmit = parseNLPInput(value, currentDateStr);
    onAddItem(itemToSubmit);
    setValue('');
    setParsed(null);
  };

  return (
    <div className="relative mb-6">
      <form onSubmit={handleSubmit} className="relative group">
        <div
          className={`relative flex items-center bg-card border rounded-xl shadow-xs transition-all duration-200 ${
            isFocused
              ? 'border-accent ring-2 ring-accent/20 shadow-md'
              : 'border-border hover:border-muted-foreground/30'
          }`}
        >
          <div className="pl-3.5 pr-2 text-muted-foreground">
            <Sparkles className={`w-4 h-4 transition-colors ${isFocused ? 'text-accent' : ''}`} />
          </div>

          <input
            ref={inputRef}
            type="text"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            placeholder='Type a task or event (e.g., "Sync with team tomorrow at 2pm" or "Buy groceries !1 /personal")'
            className="w-full py-3 pr-24 text-sm bg-transparent text-foreground placeholder:text-muted-foreground/60 outline-none font-sans"
          />

          {value && (
            <button
              type="button"
              onClick={() => {
                setValue('');
                setParsed(null);
              }}
              className="p-1 mr-1 text-muted-foreground hover:text-foreground rounded-md transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          )}

          <div className="pr-3 flex items-center gap-1">
            <kbd className="hidden sm:inline-flex items-center gap-0.5 px-1.5 py-0.5 text-[10px] font-mono text-muted-foreground bg-muted rounded border border-border">
              <span>⌘</span>K
            </kbd>
            <button
              type="submit"
              disabled={!value.trim()}
              className="p-1.5 rounded-lg bg-accent text-accent-foreground disabled:opacity-30 disabled:cursor-not-allowed hover:opacity-90 transition-opacity"
              title="Add Item (Enter)"
            >
              <CornerDownLeft className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </form>

      {/* Live NLP Preview Chip */}
      {parsed && (
        <div className="absolute left-0 right-0 top-full mt-1.5 p-2.5 bg-card/95 backdrop-blur-xs border border-border/80 rounded-xl shadow-lg z-20 text-xs flex items-center justify-between gap-2 animate-in fade-in slide-in-from-top-1 duration-150">
          <div className="flex items-center gap-2 overflow-hidden">
            {parsed.type === 'event' ? (
              <span className="flex items-center gap-1 px-2 py-0.5 bg-blue-500/10 text-blue-600 dark:text-blue-400 rounded-md font-medium shrink-0">
                <Calendar className="w-3 h-3" /> Event
              </span>
            ) : (
              <span className="flex items-center gap-1 px-2 py-0.5 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 rounded-md font-medium shrink-0">
                <CheckSquare className="w-3 h-3" /> Task
              </span>
            )}

            <span className="font-medium text-foreground truncate">
              "{parsed.text}"
            </span>
          </div>

          <div className="flex items-center gap-1.5 shrink-0 text-muted-foreground font-mono text-[11px]">
            <span>📅 {parsed.targetDate}</span>
            {parsed.startTime && (
              <span className="px-1.5 py-0.5 bg-muted rounded text-foreground font-semibold">
                🕒 {parsed.startTime}
                {parsed.endTime ? ` - ${parsed.endTime}` : ''}
              </span>
            )}
            {parsed.priority > 0 && (
              <span
                className={`px-1.5 py-0.5 rounded font-bold text-white ${
                  parsed.priority === 1
                    ? 'bg-red-500'
                    : parsed.priority === 2
                    ? 'bg-amber-500'
                    : 'bg-blue-500'
                }`}
              >
                !{parsed.priority}
              </span>
            )}
            {parsed.listTag && (
              <span className="px-1.5 py-0.5 bg-accent/20 text-accent rounded font-medium">
                /{parsed.listTag}
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

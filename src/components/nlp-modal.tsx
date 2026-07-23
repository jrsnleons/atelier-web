'use client';

import { useState, useEffect, useRef } from 'react';
import { parseNLPInput, ParsedItem } from '@/lib/nlp-parser';
import { X, Calendar, CheckSquare, Sparkles } from 'lucide-react';

interface NLPModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentDateStr: string;
  onAddItem: (item: ParsedItem) => void;
}

export function NLPModal({ isOpen, onClose, currentDateStr, onAddItem }: NLPModalProps) {
  const [activeTab, setActiveTab] = useState<'event' | 'task'>('task');
  const [value, setValue] = useState('');
  const [parsed, setParsed] = useState<ParsedItem | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
    } else {
      setValue('');
      setParsed(null);
    }
  }, [isOpen]);

  useEffect(() => {
    if (value.trim().length > 1) {
      const res = parseNLPInput(value, currentDateStr);
      setParsed(res);
    } else {
      setParsed(null);
    }
  }, [value, currentDateStr]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!value.trim()) return;

    const finalItem = parseNLPInput(value, currentDateStr);
    finalItem.type = activeTab;

    onAddItem(finalItem);
    setValue('');
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-black/75 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-150"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
      onKeyDown={(e) => { if (e.key === 'Escape') onClose(); }}
      role="dialog"
      aria-modal="true"
    >
      <div className="bg-card dark:bg-[#1E1C1A] border border-border/80 dark:border-border/60 rounded-2xl max-w-md w-full shadow-[0_25px_60px_-15px_rgba(0,0,0,0.7)] overflow-hidden animate-in zoom-in-95 duration-150 ring-1 ring-white/10">
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          {/* Segmented Tab Bar: [ Event | Task ] */}
          <div className="bg-muted/70 dark:bg-muted/40 p-1 rounded-xl flex items-center text-xs font-semibold border border-border/40">
            <button
              type="button"
              onClick={() => setActiveTab('event')}
              className={`flex-1 py-2 rounded-lg transition-all flex items-center justify-center gap-1.5 ${
                activeTab === 'event'
                  ? 'bg-background text-foreground shadow-xs font-bold'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <Calendar className="w-3.5 h-3.5" /> Event
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('task')}
              className={`flex-1 py-2 rounded-lg transition-all flex items-center justify-center gap-1.5 ${
                activeTab === 'task'
                  ? 'bg-background text-foreground shadow-xs font-bold'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <CheckSquare className="w-3.5 h-3.5" /> Task
            </button>
          </div>

          {/* Action Header: Cancel & Save */}
          <div className="flex items-center justify-between text-xs font-semibold px-0.5">
            <button
              type="button"
              onClick={onClose}
              className="text-muted-foreground hover:text-foreground font-medium transition-colors"
            >
              Cancel
            </button>

            <span className="text-muted-foreground/80 text-[11px] font-normal tracking-wide uppercase">
              Natural Language Entry
            </span>

            <button
              type="submit"
              disabled={!value.trim()}
              className="text-accent font-bold disabled:opacity-40 hover:underline transition-all"
            >
              Save
            </button>
          </div>

          {/* Text Input Field */}
          <div className="relative">
            <input
              ref={inputRef}
              type="text"
              value={value}
              onChange={(e) => setValue(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Escape') {
                  e.preventDefault();
                  onClose();
                }
              }}
              placeholder={
                activeTab === 'event'
                  ? 'e.g., Lunch with Family at noon tomorrow'
                  : 'e.g., Take Out Trash today /Home !1'
              }
              className="w-full px-3.5 py-3 bg-background border border-border/80 rounded-xl text-sm font-sans text-foreground placeholder:text-muted-foreground/60 outline-none focus:ring-2 focus:ring-accent/40 transition-all shadow-inner"
            />
          </div>

          {/* Live Parsing Preview Chip */}
          {parsed && (
            <div className="p-3 bg-muted/50 border border-border/60 rounded-xl text-xs space-y-1 font-mono">
              <div className="flex items-center justify-between text-muted-foreground text-[11px]">
                <span className="flex items-center gap-1">
                  <Sparkles className="w-3 h-3 text-accent" /> Parsed Details:
                </span>
                <span className="text-accent font-semibold">
                  {parsed.targetDate}
                </span>
              </div>
              <p className="text-foreground font-sans font-medium text-xs">
                "{parsed.text}"
              </p>
              <div className="flex items-center gap-2 pt-0.5 text-[11px] text-muted-foreground">
                {parsed.startTime && <span>🕒 {parsed.startTime}</span>}
                {parsed.priority > 0 && (
                  <span className="text-red-500 font-bold">!{parsed.priority}</span>
                )}
                {parsed.listTag && (
                  <span className="text-accent font-medium">/{parsed.listTag}</span>
                )}
              </div>
            </div>
          )}
        </form>
      </div>
    </div>
  );
}

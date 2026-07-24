'use client';

import { useState, useRef, useEffect } from 'react';
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight } from 'lucide-react';
import { formatDateISO } from '@/lib/nlp-parser';

interface CustomCalendarPickerProps {
  value: string; // YYYY-MM-DD
  onChange: (dateStr: string) => void;
  className?: string;
}

export function CustomCalendarPicker({ value, onChange, className = '' }: CustomCalendarPickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const parsedDate = value ? new Date(value + 'T00:00:00') : new Date();
  const [viewYear, setViewYear] = useState(parsedDate.getFullYear());
  const [viewMonth, setViewMonth] = useState(parsedDate.getMonth()); // 0-indexed

  useEffect(() => {
    if (value) {
      const d = new Date(value + 'T00:00:00');
      setViewYear(d.getFullYear());
      setViewMonth(d.getMonth());
    }
  }, [value]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const handlePrevMonth = () => {
    if (viewMonth === 0) {
      setViewMonth(11);
      setViewYear(viewYear - 1);
    } else {
      setViewMonth(viewMonth - 1);
    }
  };

  const handleNextMonth = () => {
    if (viewMonth === 11) {
      setViewMonth(0);
      setViewYear(viewYear + 1);
    } else {
      setViewMonth(viewMonth + 1);
    }
  };

  // Generate grid days for the month
  const firstDayOfMonth = new Date(viewYear, viewMonth, 1).getDay();
  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();

  const days: (number | null)[] = [];
  for (let i = 0; i < firstDayOfMonth; i++) {
    days.push(null);
  }
  for (let d = 1; d <= daysInMonth; d++) {
    days.push(d);
  }

  const todayStr = formatDateISO(new Date());

  const handleSelectDay = (dayNum: number) => {
    const m = String(viewMonth + 1).padStart(2, '0');
    const d = String(dayNum).padStart(2, '0');
    const selectedDateStr = `${viewYear}-${m}-${d}`;
    onChange(selectedDateStr);
    setIsOpen(false);
  };

  return (
    <div ref={containerRef} className={`relative inline-block ${className}`}>
      {/* Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="p-2 rounded-xl bg-card border border-border/70 text-foreground hover:border-border hover:bg-muted/40 active:scale-95 transition-all flex items-center justify-center shadow-2xs cursor-pointer"
        title="Open Custom Calendar"
      >
        <CalendarIcon className="w-4 h-4 text-muted-foreground" />
      </button>

      {/* Popover Calendar Dropdown */}
      {isOpen && (
        <div className="absolute left-0 top-full mt-2 z-50 bg-card dark:bg-[#1E1C1A] border border-border/80 rounded-2xl p-4 shadow-2xl w-64 ring-1 ring-white/10 animate-in zoom-in-95 fade-in duration-150">
          {/* Calendar Header: Month & Prev/Next */}
          <div className="flex items-center justify-between pb-3 border-b border-border/40">
            <button
              type="button"
              onClick={handlePrevMonth}
              className="p-1 rounded-lg hover:bg-muted/60 text-muted-foreground hover:text-foreground transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="text-xs font-serif font-bold text-foreground">
              {monthNames[viewMonth]} {viewYear}
            </span>
            <button
              type="button"
              onClick={handleNextMonth}
              className="p-1 rounded-lg hover:bg-muted/60 text-muted-foreground hover:text-foreground transition-colors"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {/* Weekday Labels */}
          <div className="grid grid-cols-7 gap-1 pt-2 pb-1 text-center font-mono text-[10px] text-muted-foreground font-semibold">
            <span>Su</span>
            <span>Mo</span>
            <span>Tu</span>
            <span>We</span>
            <span>Th</span>
            <span>Fr</span>
            <span>Sa</span>
          </div>

          {/* Days Grid */}
          <div className="grid grid-cols-7 gap-1 text-xs">
            {days.map((dayNum, idx) => {
              if (dayNum === null) {
                return <div key={`empty-${idx}`} />;
              }

              const m = String(viewMonth + 1).padStart(2, '0');
              const d = String(dayNum).padStart(2, '0');
              const dateStr = `${viewYear}-${m}-${d}`;

              const isSelected = dateStr === value;
              const isTodayDay = dateStr === todayStr;

              return (
                <button
                  key={`day-${dayNum}`}
                  type="button"
                  onClick={() => handleSelectDay(dayNum)}
                  className={`h-7 w-7 rounded-lg flex items-center justify-center font-mono text-xs transition-all active:scale-90 ${
                    isSelected
                      ? 'bg-accent text-accent-foreground font-bold shadow-2xs'
                      : isTodayDay
                      ? 'bg-accent/20 text-accent font-bold ring-1 ring-accent/40'
                      : 'hover:bg-muted/60 text-foreground'
                  }`}
                >
                  {dayNum}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

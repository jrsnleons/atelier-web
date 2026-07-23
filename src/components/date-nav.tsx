'use client';

import { Calendar as CalendarIcon, Settings, ChevronLeft, ChevronRight } from 'lucide-react';
import { formatDateISO } from '@/lib/nlp-parser';

interface DateNavProps {
  currentDateStr: string;
  onDateChange: (newDateStr: string) => void;
  onOpenSettings: () => void;
}

export function DateNav({ currentDateStr, onDateChange, onOpenSettings }: DateNavProps) {
  const todayStr = formatDateISO(new Date());
  const isToday = currentDateStr === todayStr;

  // Format date heading: "Thursday, 24 July"
  const [year, month, day] = currentDateStr.split('-').map(Number);
  const dateObj = new Date(year, month - 1, day);
  const formattedDay = dateObj.toLocaleDateString('en-US', { weekday: 'long' });
  const formattedDate = dateObj.toLocaleDateString('en-US', { day: 'numeric', month: 'long' });

  const handleShiftDay = (delta: number) => {
    const nextDate = new Date(year, month - 1, day + delta);
    onDateChange(formatDateISO(nextDate));
  };

  const handleQuickToggle = (target: 'yesterday' | 'today' | 'tomorrow') => {
    const now = new Date();
    if (target === 'yesterday') {
      now.setDate(now.getDate() - 1);
    } else if (target === 'tomorrow') {
      now.setDate(now.getDate() + 1);
    }
    onDateChange(formatDateISO(now));
  };

  return (
    <div className="space-y-4 mb-2">
      {/* Top Capsule Navigation Bar matching Parchment Design */}
      <div className="flex items-center justify-between">
        {/* Left: Native Calendar Picker Button */}
        <div className="relative">
          <label
            htmlFor="header-date-picker"
            className="p-2 rounded-xl bg-card border border-border/70 text-foreground hover:border-border hover:bg-muted/40 transition-all flex items-center justify-center cursor-pointer shadow-2xs"
            title="Pick Date"
          >
            <CalendarIcon className="w-4 h-4 text-muted-foreground" />
          </label>
          <input
            id="header-date-picker"
            type="date"
            value={currentDateStr}
            onChange={(e) => e.target.value && onDateChange(e.target.value)}
            className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
          />
        </div>

        {/* Center: [ Yesterday | Today | Tomorrow ] Capsule */}
        <div className="flex items-center gap-1 bg-card p-1 rounded-full border border-border/70 shadow-2xs text-xs font-semibold">
          <button
            onClick={() => handleShiftDay(-1)}
            className="p-1 rounded-full text-muted-foreground hover:text-foreground sm:hidden"
            title="Previous Day"
          >
            <ChevronLeft className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={() => handleQuickToggle('yesterday')}
            className="hidden sm:inline-block px-3 py-1 rounded-full text-muted-foreground hover:text-foreground hover:bg-muted/40 transition-all"
          >
            Yesterday
          </button>

          <button
            onClick={() => handleQuickToggle('today')}
            className={`px-3.5 py-1 rounded-full transition-all ${
              isToday
                ? 'bg-accent text-accent-foreground shadow-2xs font-bold'
                : 'text-muted-foreground hover:text-foreground hover:bg-muted/40'
            }`}
          >
            Today
          </button>

          <button
            onClick={() => handleQuickToggle('tomorrow')}
            className="hidden sm:inline-block px-3 py-1 rounded-full text-muted-foreground hover:text-foreground hover:bg-muted/40 transition-all"
          >
            Tomorrow
          </button>

          <button
            onClick={() => handleShiftDay(1)}
            className="p-1 rounded-full text-muted-foreground hover:text-foreground sm:hidden"
            title="Next Day"
          >
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Right: Settings Gear Button */}
        <button
          onClick={onOpenSettings}
          className="p-2 rounded-xl bg-card border border-border/70 text-foreground hover:border-border hover:bg-muted/40 transition-all flex items-center justify-center shadow-2xs"
          title="Preferences & Settings"
        >
          <Settings className="w-4 h-4 text-muted-foreground" />
        </button>
      </div>

      {/* Large Bold Serif Date Heading */}
      <div>
        <h1 className="text-3xl sm:text-4xl font-serif font-bold text-foreground tracking-tight">
          {formattedDay}, {formattedDate}
        </h1>
      </div>
    </div>
  );
}

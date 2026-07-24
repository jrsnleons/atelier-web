'use client';

import { Settings, ChevronLeft, ChevronRight } from 'lucide-react';
import { formatDateISO } from '@/lib/nlp-parser';
import { CustomCalendarPicker } from './custom-calendar-picker';

interface DateNavProps {
  currentDateStr: string;
  onDateChange: (newDateStr: string) => void;
  onOpenSettings: () => void;
}

export function DateNav({ currentDateStr, onDateChange, onOpenSettings }: DateNavProps) {
  const todayStr = formatDateISO(new Date());
  const yesterdayDate = new Date();
  yesterdayDate.setDate(yesterdayDate.getDate() - 1);
  const yesterdayStr = formatDateISO(yesterdayDate);

  const tomorrowDate = new Date();
  tomorrowDate.setDate(tomorrowDate.getDate() + 1);
  const tomorrowStr = formatDateISO(tomorrowDate);

  const isToday = currentDateStr === todayStr;
  const isYesterday = currentDateStr === yesterdayStr;
  const isTomorrow = currentDateStr === tomorrowStr;

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
        {/* Left: Custom Popover Calendar Picker */}
        <CustomCalendarPicker
          value={currentDateStr}
          onChange={onDateChange}
        />

        {/* Center: [ Yesterday | Today | Tomorrow ] Capsule with animated sliding highlight */}
        <div className="relative flex items-center gap-1 bg-card p-1 rounded-full border border-border/70 shadow-2xs text-xs font-semibold overflow-hidden">
          <button
            onClick={() => handleShiftDay(-1)}
            className="p-1 rounded-full text-muted-foreground hover:text-foreground active:scale-95 transition-transform sm:hidden"
            title="Previous Day"
          >
            <ChevronLeft className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={() => handleQuickToggle('yesterday')}
            className={`px-3.5 py-1 rounded-full transition-all active:scale-95 ${
              isYesterday
                ? 'bg-accent text-accent-foreground shadow-2xs font-bold'
                : 'text-muted-foreground hover:text-foreground hover:bg-muted/40'
            }`}
          >
            Yesterday
          </button>

          <button
            onClick={() => handleQuickToggle('today')}
            className={`px-4 py-1 rounded-full transition-all active:scale-95 ${
              isToday
                ? 'bg-accent text-accent-foreground shadow-2xs font-bold'
                : 'text-muted-foreground hover:text-foreground hover:bg-muted/40'
            }`}
          >
            Today
          </button>

          <button
            onClick={() => handleQuickToggle('tomorrow')}
            className={`px-3.5 py-1 rounded-full transition-all active:scale-95 ${
              isTomorrow
                ? 'bg-accent text-accent-foreground shadow-2xs font-bold'
                : 'text-muted-foreground hover:text-foreground hover:bg-muted/40'
            }`}
          >
            Tomorrow
          </button>

          <button
            onClick={() => handleShiftDay(1)}
            className="p-1 rounded-full text-muted-foreground hover:text-foreground active:scale-95 transition-transform sm:hidden"
            title="Next Day"
          >
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Right: Settings Gear Button */}
        <button
          onClick={onOpenSettings}
          className="p-2 rounded-xl bg-card border border-border/70 text-foreground hover:border-border hover:bg-muted/40 active:scale-95 transition-all flex items-center justify-center shadow-2xs"
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

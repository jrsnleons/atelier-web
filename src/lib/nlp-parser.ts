import { Priority } from './supabase/types';

export interface ParsedItem {
  type: 'event' | 'task';
  text: string;
  targetDate: string; // YYYY-MM-DD
  startTime?: string; // HH:MM (24-hour)
  endTime?: string;   // HH:MM (24-hour)
  priority: Priority;
  listTag?: string | null;
}

/**
 * Format a Date object to YYYY-MM-DD
 */
export function formatDateISO(d: Date): string {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Deterministic Natural Language Parser for tasks & events.
 */
export function parseNLPInput(rawInput: string, baseDateStr: string): ParsedItem {
  let text = rawInput.trim();
  let priority: Priority = 0;
  let listTag: string | null = null;
  let targetDate = baseDateStr;
  let startTime: string | undefined = undefined;
  let endTime: string | undefined = undefined;

  if (!text) {
    return {
      type: 'task',
      text: '',
      targetDate,
      priority: 0,
    };
  }

  // 1. Priority parsing: !1, !2, !3
  const priorityMatch = text.match(/\b!([1-3])\b/);
  if (priorityMatch) {
    priority = parseInt(priorityMatch[1], 10) as Priority;
    text = text.replace(priorityMatch[0], '').trim();
  }

  // 2. List tag parsing: /tag (e.g., /personal, /work)
  const listMatch = text.match(/\/([a-zA-Z0-9_-]+)/);
  if (listMatch) {
    listTag = listMatch[1];
    text = text.replace(listMatch[0], '').trim();
  }

  // Calculate base Date object
  const [baseYear, baseMonth, baseDay] = baseDateStr.split('-').map(Number);
  const baseDateObj = new Date(baseYear, baseMonth - 1, baseDay);

  // 3. Relative & named Date parsing
  // Matches: today, tomorrow, yesterday
  if (/\btoday\b/i.test(text)) {
    targetDate = formatDateISO(baseDateObj);
    text = text.replace(/\btoday\b/gi, '').trim();
  } else if (/\btomorrow\b/i.test(text)) {
    const tom = new Date(baseDateObj);
    tom.setDate(tom.getDate() + 1);
    targetDate = formatDateISO(tom);
    text = text.replace(/\btomorrow\b/gi, '').trim();
  } else if (/\byesterday\b/i.test(text)) {
    const yest = new Date(baseDateObj);
    yest.setDate(yest.getDate() - 1);
    targetDate = formatDateISO(yest);
    text = text.replace(/\byesterday\b/gi, '').trim();
  } else {
    // Days of week (e.g., "on Friday", "this Monday", "next Tuesday")
    const dayNames = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
    const dayRegex = new RegExp(`\\b(on\\s+|next\\s+|this\\s+)?(${dayNames.join('|')})\\b`, 'i');
    const dayMatch = text.match(dayRegex);

    if (dayMatch) {
      const matchedDayName = dayMatch[2].toLowerCase();
      const targetDayIdx = dayNames.indexOf(matchedDayName);

      if (targetDayIdx !== -1) {
        const resultDate = new Date(baseDateObj);
        const currentDayIdx = resultDate.getDay();
        let daysToAdd = targetDayIdx - currentDayIdx;

        if (daysToAdd <= 0) {
          daysToAdd += 7; // Move to next upcoming occurrence
        }

        resultDate.setDate(resultDate.getDate() + daysToAdd);
        targetDate = formatDateISO(resultDate);
        text = text.replace(dayMatch[0], '').trim();
      }
    }
  }

  // 4. Time range / single time parsing
  // Pattern matches: "2pm", "2:30pm", "14:00", "2pm-3:30pm", "at 5pm", "from 10am to 11am"
  const timeRangeRegex = /\b(?:at\s+|from\s+)?(\d{1,2}(?::\d{2})?\s*(?:am|pm)?)\s*(?:-|to)\s*(\d{1,2}(?::\d{2})?\s*(?:am|pm)?)\b/i;
  const singleTimeRegex = /\b(?:at\s+)?(\d{1,2}(?::\d{2})?\s*(?:am|pm))\b/i;
  const militaryTimeRegex = /\b([01]?\d|2[0-3]):([0-5]\d)\b/;

  const rangeMatch = text.match(timeRangeRegex);
  if (rangeMatch) {
    startTime = parseTimeStringTo24H(rangeMatch[1]);
    endTime = parseTimeStringTo24H(rangeMatch[2]);
    text = text.replace(rangeMatch[0], '').trim();
  } else {
    const singleMatch = text.match(singleTimeRegex);
    if (singleMatch) {
      startTime = parseTimeStringTo24H(singleMatch[1]);
      text = text.replace(singleMatch[0], '').trim();
    } else {
      const milMatch = text.match(militaryTimeRegex);
      if (milMatch) {
        startTime = `${milMatch[1].padStart(2, '0')}:${milMatch[2]}`;
        text = text.replace(milMatch[0], '').trim();
      }
    }
  }

  // Clean up any double spaces or hanging prepositions
  text = text.replace(/\s+/g, ' ').replace(/\b(at|on)\b$/i, '').trim();

  // Item type determination: if a time is present, it's an event; otherwise it's a task.
  const type = startTime ? 'event' : 'task';

  return {
    type,
    text: text || rawInput.trim(),
    targetDate,
    startTime,
    endTime,
    priority,
    listTag,
  };
}

/**
 * Converts strings like "2pm", "2:30pm", "10am", "14:00" to "HH:MM" 24h format
 */
function parseTimeStringTo24H(timeStr: string): string {
  const cleaned = timeStr.trim().toLowerCase();
  const isPM = cleaned.includes('pm');
  const isAM = cleaned.includes('am');

  const digitsOnly = cleaned.replace(/[^\d:]/g, '');
  let [hoursStr, minutesStr] = digitsOnly.split(':');

  let hours = parseInt(hoursStr, 10) || 0;
  const minutes = parseInt(minutesStr, 10) || 0;

  if (isPM && hours < 12) {
    hours += 12;
  } else if (isAM && hours === 12) {
    hours = 0;
  }

  const hh = String(hours).padStart(2, '0');
  const mm = String(minutes).padStart(2, '0');
  return `${hh}:${mm}`;
}

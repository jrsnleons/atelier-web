import { Event } from './supabase/types';

export interface ParsedICalEvent {
  summary: string;
  startDateISO: string; // YYYY-MM-DD
  startTime24: string;  // HH:MM
  endTime24?: string;   // HH:MM
  isAllDay: boolean;
  location?: string;
}

/**
 * Lightweight, zero-dependency iCal (.ics) parser for VEVENT blocks.
 */
export function parseICalFeed(icsData: string, targetDateStr: string): ParsedICalEvent[] {
  const events: ParsedICalEvent[] = [];
  if (!icsData) return events;

  // Unfold folded lines in iCal (lines starting with space/tab are continuations)
  const unfolded = icsData.replace(/\r\n[ \t]/g, '').replace(/\n[ \t]/g, '');
  const lines = unfolded.split(/\r?\n/);

  let inVEvent = false;
  let currentEvent: Record<string, string> = {};

  for (const line of lines) {
    const trimmed = line.trim();
    if (trimmed === 'BEGIN:VEVENT') {
      inVEvent = true;
      currentEvent = {};
      continue;
    }

    if (trimmed === 'END:VEVENT') {
      inVEvent = false;
      const parsed = processVEvent(currentEvent, targetDateStr);
      if (parsed) {
        events.push(parsed);
      }
      continue;
    }

    if (inVEvent) {
      const colonIdx = trimmed.indexOf(':');
      if (colonIdx !== -1) {
        const keyPart = trimmed.substring(0, colonIdx);
        const valuePart = trimmed.substring(colonIdx + 1);

        // Normalize key (strip parameters like ;TZID=...)
        const keyBase = keyPart.split(';')[0].toUpperCase();
        currentEvent[keyBase] = valuePart;

        // Also store full key for parameter parsing if needed
        currentEvent[keyPart.toUpperCase()] = valuePart;
      }
    }
  }

  return events;
}

function processVEvent(
  raw: Record<string, string>,
  targetDateStr: string
): ParsedICalEvent | null {
  const summary = raw['SUMMARY'] || 'Untitled Event';

  // Extract DTSTART
  let dtStartRaw = '';
  for (const k of Object.keys(raw)) {
    if (k.startsWith('DTSTART')) {
      dtStartRaw = raw[k];
      break;
    }
  }

  if (!dtStartRaw) return null;

  // Parse start time & date
  const parsedStart = parseICalDateTime(dtStartRaw);
  if (!parsedStart) return null;

  // Filter for requested target date
  if (parsedStart.dateISO !== targetDateStr) {
    return null;
  }

  // Extract DTEND if present
  let dtEndRaw = '';
  for (const k of Object.keys(raw)) {
    if (k.startsWith('DTEND')) {
      dtEndRaw = raw[k];
      break;
    }
  }

  let endTime24: string | undefined = undefined;
  if (dtEndRaw) {
    const parsedEnd = parseICalDateTime(dtEndRaw);
    if (parsedEnd) {
      endTime24 = parsedEnd.time24;
    }
  }

  const location = raw['LOCATION'] || undefined;

  return {
    summary,
    startDateISO: parsedStart.dateISO,
    startTime24: parsedStart.time24,
    endTime24,
    isAllDay: parsedStart.isAllDay,
    location,
  };
}

interface DateTimeResult {
  dateISO: string; // YYYY-MM-DD
  time24: string;  // HH:MM
  isAllDay: boolean;
}

function parseICalDateTime(rawVal: string): DateTimeResult | null {
  const clean = rawVal.trim();

  // All-Day Date format: YYYYMMDD (8 digits)
  if (/^\d{8}$/.test(clean)) {
    const y = clean.substring(0, 4);
    const m = clean.substring(4, 6);
    const d = clean.substring(6, 8);
    return {
      dateISO: `${y}-${m}-${d}`,
      time24: '00:00',
      isAllDay: true,
    };
  }

  // Timestamp format: YYYYMMDDTHHMMSS or YYYYMMDDTHHMMSSZ
  const match = clean.match(/^(\d{4})(\d{2})(\d{2})T(\d{2})(\d{2})(\d{2})(Z)?/);
  if (match) {
    const [, y, m, d, hh, mm, , isUTC] = match;

    if (isUTC) {
      // Convert UTC timestamp to local Date
      const utcDate = new Date(Date.UTC(+y, +m - 1, +d, +hh, +mm));
      const locY = utcDate.getFullYear();
      const locM = String(utcDate.getMonth() + 1).padStart(2, '0');
      const locD = String(utcDate.getDate()).padStart(2, '0');
      const locHH = String(utcDate.getHours()).padStart(2, '0');
      const locMM = String(utcDate.getMinutes()).padStart(2, '0');

      return {
        dateISO: `${locY}-${locM}-${locD}`,
        time24: `${locHH}:${locMM}`,
        isAllDay: false,
      };
    }

    return {
      dateISO: `${y}-${m}-${d}`,
      time24: `${hh}:${mm}`,
      isAllDay: false,
    };
  }

  return null;
}

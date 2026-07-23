import { NextResponse } from 'next/server';
import { parseICalFeed } from '@/lib/ical-parser';
import { CalendarFeed, Event } from '@/lib/supabase/types';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { feeds, dateStr } = body as { feeds: CalendarFeed[]; dateStr: string };

    if (!feeds || !Array.isArray(feeds) || !dateStr) {
      return NextResponse.json({ events: [] }, { status: 200 });
    }

    const enabledFeeds = feeds.filter((f) => f.enabled && f.url && f.url.trim().length > 0);
    const allExternalEvents: Event[] = [];

    // Fetch and parse all enabled feeds concurrently
    await Promise.all(
      enabledFeeds.map(async (feed) => {
        try {
          // Fetch iCal feed with timeout
          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), 6000);

          const res = await fetch(feed.url, {
            signal: controller.signal,
            headers: {
              'User-Agent': 'Parchment-Calendar-Sync/1.0',
            },
            next: { revalidate: 300 }, // Cache feed for 5 minutes
          });

          clearTimeout(timeoutId);

          if (!res.ok) {
            console.warn(`Failed to fetch feed ${feed.name}: HTTP ${res.status}`);
            return;
          }

          const icsText = await res.text();
          const parsed = parseICalFeed(icsText, dateStr);

          for (const ev of parsed) {
            allExternalEvents.push({
              id: `gcal_${feed.id}_${Math.random().toString(36).substring(2, 9)}`,
              date: dateStr,
              text: ev.summary,
              start_time: ev.startTime24,
              end_time: ev.endTime24,
              priority: 0,
              list_id: feed.category_id || feed.name,
              list_tag: feed.category_id || feed.name,
              is_external: true,
              calendar_id: feed.id,
              calendar_name: feed.name,
              calendar_color: feed.color,
              location: ev.location,
            });
          }
        } catch (err) {
          console.warn(`Error syncing feed ${feed.name}:`, err);
        }
      })
    );

    return NextResponse.json({ events: allExternalEvents }, { status: 200 });
  } catch (err) {
    console.error('Calendar sync API error:', err);
    return NextResponse.json({ events: [], error: 'Failed to sync feeds' }, { status: 500 });
  }
}

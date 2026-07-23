import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function GET(request: Request) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    return NextResponse.json(
      { status: 'error', message: 'Supabase credentials not configured in environment variables' },
      { status: 400 }
    );
  }

  try {
    const supabase = createClient(supabaseUrl, supabaseAnonKey);

    // Light ping query to keep Supabase database active and prevent 2-week inactivity pause
    const { data, error } = await supabase.from('notes').select('id').limit(1);

    if (error && error.code !== 'PGRST116') {
      console.warn('Supabase keep-alive ping returned database response:', error.message);
    }

    return NextResponse.json({
      status: 'ok',
      message: 'Supabase keep-alive ping successful. Database activity registered.',
      timestamp: new Date().toISOString(),
    });
  } catch (e: any) {
    console.error('Supabase keep-alive error:', e);
    return NextResponse.json(
      { status: 'error', message: e.message || 'Keep-alive ping failed' },
      { status: 500 }
    );
  }
}

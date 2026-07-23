'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth-context';
import { Feather, Calendar, CheckSquare, Sparkles, Tag, ShieldCheck, ArrowRight, Zap } from 'lucide-react';

interface LandingPageProps {
  onGuestAccess: () => void;
}

export function LandingPage({ onGuestAccess }: LandingPageProps) {
  const { signInWithGoogle } = useAuth();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="min-h-screen bg-background text-foreground flex flex-col font-sans transition-colors duration-200">
        <nav className="border-b border-border/60 bg-card/60 backdrop-blur-xs sticky top-0 z-30 px-4 sm:px-8 py-3.5 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-accent text-accent-foreground flex items-center justify-center shadow-2xs">
              <Feather className="w-4 h-4 stroke-[2.5]" />
            </div>
            <div>
              <span className="font-serif font-bold text-lg tracking-tight text-foreground">
                Atelier
              </span>
            </div>
          </div>
        </nav>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col font-sans transition-colors duration-200 selection:bg-accent/20">
      {/* Top Application Bar */}
      <nav className="border-b border-border/60 bg-card/60 backdrop-blur-xs sticky top-0 z-30 px-4 sm:px-8 py-3.5 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-accent text-accent-foreground flex items-center justify-center shadow-2xs">
            <Feather className="w-4 h-4 stroke-[2.5]" />
          </div>
          <div>
            <span className="font-serif font-bold text-lg tracking-tight text-foreground">
              Atelier
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={onGuestAccess}
            className="text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors px-3 py-1.5"
          >
            Guest Preview
          </button>
          <button
            onClick={() => signInWithGoogle()}
            className="px-4 py-2 rounded-xl bg-accent text-accent-foreground hover:opacity-90 transition-opacity text-xs font-bold flex items-center gap-2 shadow-xs"
          >
            <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
            </svg>
            Sign in with Google
          </button>
        </div>
      </nav>

      {/* Main Content Area */}
      <main className="flex-1 max-w-5xl w-full mx-auto px-4 sm:px-6 py-12 space-y-16">
        {/* Editorial Hero Section */}
        <div className="text-center space-y-6 max-w-3xl mx-auto pt-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-accent/10 text-accent border border-accent/20 text-xs font-mono font-medium">
            <Sparkles className="w-3.5 h-3.5" /> Quiet Luxury Daily Studio & Workspace
          </div>

          <h1 className="text-4xl sm:text-6xl font-serif font-bold text-foreground tracking-tight leading-[1.1]">
            Your Daily Rhythm, <br className="hidden sm:inline" />
            <span className="italic font-normal text-muted-foreground">Mastered.</span>
          </h1>

          <p className="text-base sm:text-lg text-muted-foreground leading-relaxed max-w-2xl mx-auto">
            Atelier is a refined daily studio for intentional work. Combining daily markdown notes, natural language task parsing, custom categories, and Google Calendar sync.
          </p>

          {/* Primary Action Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-4">
            <button
              onClick={() => signInWithGoogle()}
              className="w-full sm:w-auto px-6 py-3.5 rounded-2xl bg-accent text-accent-foreground hover:opacity-90 transition-all font-bold text-sm flex items-center justify-center gap-2.5 shadow-md hover:shadow-lg"
            >
              <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
              </svg>
              Get Started with Google <ArrowRight className="w-4 h-4 ml-1" />
            </button>

            <button
              onClick={onGuestAccess}
              className="w-full sm:w-auto px-6 py-3.5 rounded-2xl bg-muted/50 border border-border/80 text-foreground hover:bg-muted font-semibold text-sm transition-colors"
            >
              Try Guest Mode
            </button>
          </div>

          <div className="flex items-center justify-center gap-6 pt-2 text-xs text-muted-foreground font-mono">
            <span className="flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" /> Private Cloud Sync
            </span>
            <span>·</span>
            <span className="flex items-center gap-1.5">
              <Zap className="w-3.5 h-3.5 text-amber-500" /> 100% Offline PWA
            </span>
          </div>
        </div>

        {/* Feature Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-6 bg-card border border-border/80 rounded-2xl space-y-3 card-hover-effect">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center">
              <CheckSquare className="w-5 h-5" />
            </div>
            <h3 className="text-base font-serif font-bold text-foreground">Unified Agenda</h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Two-column agenda separating untimed all-day tasks from scheduled events. Complete tasks with check circles.
            </p>
          </div>

          <div className="p-6 bg-card border border-border/80 rounded-2xl space-y-3 card-hover-effect">
            <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center">
              <Sparkles className="w-5 h-5" />
            </div>
            <h3 className="text-base font-serif font-bold text-foreground">Natural Language Input</h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Type <code className="bg-muted px-1.5 py-0.5 rounded text-[11px]">Lunch tomorrow at 12pm /Work !1</code> to auto-parse date, time, priority, and category tag.
            </p>
          </div>

          <div className="p-6 bg-card border border-border/80 rounded-2xl space-y-3 card-hover-effect">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <Tag className="w-5 h-5" />
            </div>
            <h3 className="text-base font-serif font-bold text-foreground">Custom Categories</h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Organize tasks into colored categories like Work 🔵, Personal 🟡, Health 🟢, Study 🟣 with instant filtering.
            </p>
          </div>
        </div>

        {/* Product Preview Card */}
        <div className="bg-card border border-border/80 rounded-3xl p-6 sm:p-8 shadow-xl space-y-6 ring-1 ring-white/5">
          <div className="flex items-center justify-between border-b border-border/40 pb-4">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-red-400/80" />
              <div className="w-3 h-3 rounded-full bg-amber-400/80" />
              <div className="w-3 h-3 rounded-full bg-emerald-400/80" />
            </div>
            <span className="text-xs font-mono text-muted-foreground">atelier-web.app</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
            <div className="md:col-span-5 p-4 bg-muted/30 border border-border/60 rounded-2xl space-y-3">
              <div className="flex items-center justify-between font-serif font-bold text-sm">
                <span>Agenda</span>
                <span className="text-xs text-accent font-sans">Today</span>
              </div>
              <div className="space-y-2 text-xs">
                <div className="flex items-center gap-2 p-2 bg-background rounded-lg border border-border/40">
                  <span className="w-2 h-2 rounded-full bg-blue-500" />
                  <span className="font-medium">Publish Atelier Release</span>
                </div>
                <div className="flex items-center gap-2 p-2 bg-background rounded-lg border border-border/40">
                  <span className="w-2 h-2 rounded-full bg-amber-500" />
                  <span className="font-medium">Design Sync at 12:00</span>
                </div>
              </div>
            </div>

            <div className="md:col-span-7 p-4 bg-muted/30 border border-border/60 rounded-2xl space-y-3">
              <div className="font-serif font-bold text-sm">Daily Journal & Scratchpad</div>
              <p className="text-xs text-muted-foreground italic leading-relaxed">
                "Focus on shipping cleanly today. Key priorities include multi-calendar feed parsing, NLP modal entry, and design system polish..."
              </p>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-border/40 py-6 px-4 text-center text-xs text-muted-foreground bg-card/30">
        <p className="font-serif font-bold text-foreground">Atelier Web</p>
        <p className="text-[11px] mt-1">
          Designed with quiet luxury & local-first autonomy. Powered by Next.js & Supabase.
        </p>
      </footer>
    </div>
  );
}

'use client';

import { useState, useRef, useEffect } from 'react';
import { useAuth } from '@/lib/auth-context';
import { LogOut, Cloud, LogIn, ChevronDown } from 'lucide-react';

export function UserMenu() {
  const { user, signInWithGoogle, signOut } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  if (!user) {
    return (
      <button
        onClick={() => signInWithGoogle()}
        className="px-3.5 py-1.5 rounded-xl bg-accent text-accent-foreground hover:opacity-90 transition-opacity text-xs font-semibold flex items-center gap-1.5 shadow-2xs"
      >
        <LogIn className="w-3.5 h-3.5" /> Sign in
      </button>
    );
  }

  const avatarUrl = user.user_metadata?.avatar_url;
  const displayName = user.user_metadata?.full_name || user.email?.split('@')[0] || 'User';
  const initials = displayName
    .split(' ')
    .map((n: string) => n[0])
    .join('')
    .toUpperCase()
    .substring(0, 2);

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 p-1 pl-1.5 pr-2.5 rounded-xl bg-muted/40 hover:bg-muted/80 border border-border/50 transition-colors"
      >
        {avatarUrl ? (
          <img
            src={avatarUrl}
            alt={displayName}
            className="w-6 h-6 rounded-full object-cover shadow-2xs"
          />
        ) : (
          <div className="w-6 h-6 rounded-full bg-accent text-accent-foreground flex items-center justify-center text-[10px] font-bold">
            {initials}
          </div>
        )}
        <span className="text-xs font-semibold text-foreground max-w-[100px] truncate hidden sm:inline">
          {displayName}
        </span>
        <ChevronDown className="w-3 h-3 text-muted-foreground" />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-56 bg-card border border-border/80 rounded-2xl shadow-xl p-2 z-50 animate-in fade-in zoom-in-95 duration-150">
          {/* User Info Header */}
          <div className="px-3 py-2 border-b border-border/40">
            <p className="text-xs font-bold text-foreground truncate">{displayName}</p>
            <p className="text-[11px] text-muted-foreground truncate">{user.email}</p>
            <div className="flex items-center gap-1 mt-1 text-[10px] text-emerald-600 dark:text-emerald-400 font-mono">
              <Cloud className="w-3 h-3" /> Synced to Supabase Cloud
            </div>
          </div>

          {/* Action List */}
          <div className="pt-1">
            <button
              onClick={() => {
                setIsOpen(false);
                signOut();
              }}
              className="w-full px-3 py-2 rounded-xl text-xs font-medium text-red-500 hover:bg-red-500/10 flex items-center gap-2 transition-colors text-left"
            >
              <LogOut className="w-3.5 h-3.5" /> Sign Out
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

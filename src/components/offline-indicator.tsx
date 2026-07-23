'use client';

import { useState, useEffect } from 'react';
import { WifiOff, Wifi } from 'lucide-react';

export function OfflineIndicator() {
  const [isOffline, setIsOffline] = useState(false);
  const [showRestored, setShowRestored] = useState(false);

  useEffect(() => {
    // Initial check
    if (typeof window !== 'undefined') {
      setIsOffline(!navigator.onLine);
    }

    const handleOffline = () => {
      setIsOffline(true);
      setShowRestored(false);
    };

    const handleOnline = () => {
      setIsOffline(false);
      setShowRestored(true);
      const timer = setTimeout(() => setShowRestored(false), 3000);
      return () => clearTimeout(timer);
    };

    window.addEventListener('offline', handleOffline);
    window.addEventListener('online', handleOnline);

    return () => {
      window.removeEventListener('offline', handleOffline);
      window.removeEventListener('online', handleOnline);
    };
  }, []);

  if (!isOffline && !showRestored) return null;

  return (
    <div className="fixed bottom-12 left-1/2 -translate-x-1/2 z-50 animate-in fade-in slide-in-from-bottom-3 duration-200 pointer-events-none">
      {isOffline ? (
        <div className="bg-card/95 backdrop-blur-md border border-amber-500/40 text-amber-600 dark:text-amber-400 px-3.5 py-2 rounded-full shadow-lg text-xs font-medium flex items-center gap-2">
          <WifiOff className="w-4 h-4 animate-pulse shrink-0" />
          <span>Offline Mode — All notes & tasks saved locally</span>
        </div>
      ) : (
        <div className="bg-card/95 backdrop-blur-md border border-emerald-500/40 text-emerald-600 dark:text-emerald-400 px-3.5 py-2 rounded-full shadow-lg text-xs font-medium flex items-center gap-2">
          <Wifi className="w-4 h-4 shrink-0" />
          <span>Connection Restored — Back Online</span>
        </div>
      )}
    </div>
  );
}

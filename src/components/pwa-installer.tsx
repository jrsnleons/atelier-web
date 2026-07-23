'use client';

import { useEffect, useState } from 'react';
import { Download } from 'lucide-react';

export function PWAInstaller() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isInstallable, setIsInstallable] = useState(false);

  useEffect(() => {
    // Register Service Worker
    if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
      window.addEventListener('load', () => {
        navigator.serviceWorker
          .register('/sw.js')
          .then((reg) => {
            console.log('Parchment ServiceWorker registered:', reg.scope);
          })
          .catch((err) => {
            console.warn('Parchment ServiceWorker registration failed:', err);
          });
      });
    }

    // Capture install prompt event
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setIsInstallable(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      setIsInstallable(false);
      setDeferredPrompt(null);
    }
  };

  if (!isInstallable) return null;

  return (
    <button
      onClick={handleInstallClick}
      className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-accent/40 bg-accent/10 hover:bg-accent/20 text-xs font-semibold text-accent transition-all shadow-2xs"
      title="Install Parchment as Desktop / Mobile App"
    >
      <Download className="w-3.5 h-3.5" />
      <span className="hidden sm:inline">Install App</span>
    </button>
  );
}

'use client';

import { useEffect } from 'react';
import { formatDateISO } from './nlp-parser';

interface KeyboardProps {
  currentDateStr: string;
  onDateChange: (dateStr: string) => void;
  onOpenAddModal?: () => void;
}

export function useGlobalKeyboard({ currentDateStr, onDateChange, onOpenAddModal }: KeyboardProps) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Check if user pressed Cmd+K or Ctrl+K anywhere (even inside editor/input)
      if ((e.key === 'k' || e.key === 'K') && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        onOpenAddModal?.();
        return;
      }

      // Don't trigger single-key shortcuts when typing in an input or contenteditable area
      const activeEl = document.activeElement;
      const isEditing =
        activeEl?.tagName === 'INPUT' ||
        activeEl?.tagName === 'TEXTAREA' ||
        activeEl?.getAttribute('contenteditable') === 'true' ||
        activeEl?.classList.contains('ProseMirror');

      if (isEditing) return;

      if (e.key === '/') {
        e.preventDefault();
        onOpenAddModal?.();
        return;
      }

      const [y, m, d] = currentDateStr.split('-').map(Number);
      const currDate = new Date(y, m - 1, d);

      if (e.key === 'ArrowLeft') {
        e.preventDefault();
        currDate.setDate(currDate.getDate() - 1);
        onDateChange(formatDateISO(currDate));
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        currDate.setDate(currDate.getDate() + 1);
        onDateChange(formatDateISO(currDate));
      } else if (e.key.toLowerCase() === 't') {
        e.preventDefault();
        onDateChange(formatDateISO(new Date()));
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentDateStr, onDateChange, onOpenAddModal]);
}

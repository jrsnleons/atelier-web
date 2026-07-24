'use client';

import { useState, useRef, useEffect } from 'react';
import { Check, Palette } from 'lucide-react';

interface CustomColorPickerProps {
  color: string;
  onChange: (hexColor: string) => void;
  className?: string;
}

const PRESET_COLORS = [
  '#3b82f6', // Blue
  '#f59e0b', // Amber
  '#10b981', // Emerald
  '#8b5cf6', // Purple
  '#f43f5e', // Rose
  '#06b6d4', // Cyan
  '#6366f1', // Indigo
  '#64748b', // Slate
  '#ec4899', // Pink
  '#84cc16', // Lime
];

export function CustomColorPicker({ color, onChange, className = '' }: CustomColorPickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  return (
    <div ref={containerRef} className={`relative inline-block ${className}`}>
      {/* Trigger Swatch Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-1.5 bg-background border border-border/80 rounded-xl hover:border-accent/40 active:scale-95 transition-all shadow-2xs cursor-pointer text-xs"
      >
        <span
          className="w-4 h-4 rounded-full border border-black/10 shrink-0 shadow-2xs"
          style={{ backgroundColor: color || '#3b82f6' }}
        />
        <span className="font-mono text-foreground font-medium">{color || '#3b82f6'}</span>
        <Palette className="w-3.5 h-3.5 text-muted-foreground ml-1" />
      </button>

      {/* Popover Color Grid */}
      {isOpen && (
        <div className="absolute left-0 top-full mt-2 z-50 bg-card dark:bg-[#1E1C1A] border border-border/80 rounded-2xl p-3 shadow-2xl w-56 ring-1 ring-white/10 animate-in zoom-in-95 fade-in duration-150 space-y-3">
          <div className="text-[11px] font-mono font-bold tracking-wider text-muted-foreground uppercase">
            Select Color
          </div>

          {/* Preset Swatches */}
          <div className="grid grid-cols-5 gap-2">
            {PRESET_COLORS.map((hex) => {
              const isSelected = color.toLowerCase() === hex.toLowerCase();
              return (
                <button
                  key={hex}
                  type="button"
                  onClick={() => {
                    onChange(hex);
                    setIsOpen(false);
                  }}
                  className="w-8 h-8 rounded-full flex items-center justify-center transition-all active:scale-90 hover:scale-105 shadow-2xs"
                  style={{ backgroundColor: hex }}
                >
                  {isSelected && <Check className="w-4 h-4 text-white stroke-[2.5]" />}
                </button>
              );
            })}
          </div>

          {/* Native Custom Color Input fallback */}
          <div className="pt-2 border-t border-border/40 flex items-center gap-2 text-xs">
            <span className="text-muted-foreground font-mono text-[11px]">Custom:</span>
            <input
              type="color"
              value={color || '#3b82f6'}
              onChange={(e) => onChange(e.target.value)}
              className="w-7 h-7 rounded-lg border-0 cursor-pointer p-0 bg-transparent"
            />
            <input
              type="text"
              value={color || ''}
              onChange={(e) => onChange(e.target.value)}
              placeholder="#3b82f6"
              className="flex-1 px-2 py-1 bg-muted/40 border border-border/60 rounded-md font-mono text-xs text-foreground outline-none focus:ring-1 focus:ring-accent/40"
            />
          </div>
        </div>
      )}
    </div>
  );
}

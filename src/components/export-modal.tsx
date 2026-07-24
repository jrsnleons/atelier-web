'use client';

import { useState } from 'react';
import { store } from '@/lib/store';
import { X, Download, FileText, FileJson, Check, Sparkles } from 'lucide-react';

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ExportModal({ isOpen, onClose }: ExportModalProps) {
  const [isExporting, setIsExporting] = useState(false);
  const [downloadedFormat, setDownloadedFormat] = useState<string | null>(null);

  if (!isOpen) return null;

  const downloadFile = (content: string, filename: string, mimeType: string) => {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleExportMarkdown = async () => {
    setIsExporting(true);
    try {
      const mdContent = await store.exportAsMarkdown();
      const dateStr = new Date().toISOString().split('T')[0];
      downloadFile(mdContent, `atelier_journal_${dateStr}.md`, 'text/markdown');
      setDownloadedFormat('Markdown (.md)');
      setTimeout(() => setDownloadedFormat(null), 3000);
    } catch (e) {
      console.error('Export markdown error:', e);
      alert('Failed to generate Markdown export.');
    } finally {
      setIsExporting(false);
    }
  };

  const handleExportJson = async () => {
    setIsExporting(true);
    try {
      const data = await store.exportAllData();
      const jsonContent = JSON.stringify(data, null, 2);
      const dateStr = new Date().toISOString().split('T')[0];
      downloadFile(jsonContent, `atelier_backup_${dateStr}.json`, 'application/json');
      setDownloadedFormat('JSON (.json)');
      setTimeout(() => setDownloadedFormat(null), 3000);
    } catch (e) {
      console.error('Export JSON error:', e);
      alert('Failed to generate JSON backup.');
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="bg-card dark:bg-[#1E1C1A] border border-border/80 rounded-2xl max-w-md w-full shadow-2xl overflow-hidden ring-1 ring-white/10 p-6 space-y-5 animate-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-border/40">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-accent stroke-[2]" />
            <h2 className="text-lg font-serif font-bold text-foreground">
              Export Workspace Data
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <p className="text-xs text-muted-foreground leading-relaxed">
          Atelier ensures 100% data ownership. Export your daily journal, scratchpads, tasks, sub-tasks, and calendar archives anytime.
        </p>

        {/* Success Alert */}
        {downloadedFormat && (
          <div className="p-3 bg-emerald-500/15 border border-emerald-500/30 rounded-xl text-xs font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-2 animate-in fade-in">
            <Check className="w-4 h-4 text-emerald-500 shrink-0" />
            <span>Downloaded {downloadedFormat} successfully!</span>
          </div>
        )}

        {/* Options Grid */}
        <div className="grid grid-cols-1 gap-3">
          {/* Markdown Option */}
          <button
            onClick={handleExportMarkdown}
            disabled={isExporting}
            className="group flex items-start gap-3.5 p-4 rounded-xl border border-border/80 bg-muted/20 hover:bg-accent/10 hover:border-accent/40 text-left transition-all"
          >
            <div className="p-2.5 rounded-lg bg-accent/15 text-accent group-hover:scale-105 transition-transform shrink-0">
              <FileText className="w-5 h-5" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-sm font-bold text-foreground group-hover:text-accent transition-colors flex items-center justify-between">
                <span>Markdown Journal (.md)</span>
                <Download className="w-4 h-4 text-muted-foreground group-hover:text-accent" />
              </h3>
              <p className="text-xs text-muted-foreground mt-0.5">
                Formatted Markdown file containing all notes, checklists, and tasks. Ideal for Obsidian, Notion, or local archives.
              </p>
            </div>
          </button>

          {/* JSON Option */}
          <button
            onClick={handleExportJson}
            disabled={isExporting}
            className="group flex items-start gap-3.5 p-4 rounded-xl border border-border/80 bg-muted/20 hover:bg-accent/10 hover:border-accent/40 text-left transition-all"
          >
            <div className="p-2.5 rounded-lg bg-accent/15 text-accent group-hover:scale-105 transition-transform shrink-0">
              <FileJson className="w-5 h-5" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-sm font-bold text-foreground group-hover:text-accent transition-colors flex items-center justify-between">
                <span>Raw JSON Snapshot (.json)</span>
                <Download className="w-4 h-4 text-muted-foreground group-hover:text-accent" />
              </h3>
              <p className="text-xs text-muted-foreground mt-0.5">
                Complete database backup containing raw JSON structures for notes, tasks, events, and list categories.
              </p>
            </div>
          </button>
        </div>

        {/* Footer */}
        <div className="pt-3 border-t border-border/40 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-muted/50 text-muted-foreground hover:text-foreground rounded-xl text-xs font-medium transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

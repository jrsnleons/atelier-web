'use client';

import { useState } from 'react';
import { CalendarFeed } from '@/lib/supabase/types';
import {
  Calendar,
  X,
  Plus,
  Trash2,
  HelpCircle,
  Check,
  RefreshCw,
  ExternalLink,
  Pencil,
} from 'lucide-react';

interface CalendarSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  feeds: CalendarFeed[];
  onSaveFeed: (feed: CalendarFeed) => void;
  onDeleteFeed: (id: string) => void;
  onSyncNow: () => void;
  isSyncing: boolean;
}

export function CalendarSettingsModal({
  isOpen,
  onClose,
  feeds,
  onSaveFeed,
  onDeleteFeed,
  onSyncNow,
  isSyncing,
}: CalendarSettingsModalProps) {
  const [showForm, setShowForm] = useState(false);
  const [editingFeedId, setEditingFeedId] = useState<string | null>(null);
  const [showInstructions, setShowInstructions] = useState(false);

  // Form State
  const [name, setName] = useState('');
  const [color, setColor] = useState('#3b82f6');
  const [url, setUrl] = useState('');
  const [presetLabel, setPresetLabel] = useState<string>('Work 1');

  if (!isOpen) return null;

  const handleOpenAddForm = () => {
    setEditingFeedId(null);
    setName('');
    setColor('#3b82f6');
    setUrl('');
    setPresetLabel('');
    setShowForm(true);
  };

  const handleOpenEditForm = (feed: CalendarFeed) => {
    setEditingFeedId(feed.id);
    setName(feed.name);
    setColor(feed.color);
    setUrl(feed.url);
    setPresetLabel(feed.name);
    setShowForm(true);
  };

  const handleSelectPreset = (label: string, defaultColor: string) => {
    setPresetLabel(label);
    setName(label);
    setColor(defaultColor);
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    if (editingFeedId) {
      const existing = feeds.find((f) => f.id === editingFeedId);
      const updatedFeed: CalendarFeed = {
        id: editingFeedId,
        name: name.trim(),
        color,
        url: url.trim(),
        enabled: existing ? existing.enabled : true,
      };
      onSaveFeed(updatedFeed);
    } else {
      const newFeed: CalendarFeed = {
        id: 'feed_' + Math.random().toString(36).substring(2, 9),
        name: name.trim(),
        color,
        url: url.trim(),
        enabled: true,
      };
      onSaveFeed(newFeed);
    }

    setName('');
    setUrl('');
    setEditingFeedId(null);
    setShowForm(false);
  };

  const handleCancelForm = () => {
    setShowForm(false);
    setEditingFeedId(null);
    setName('');
    setUrl('');
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150">
      <div className="bg-card border border-border/80 rounded-2xl max-w-lg w-full shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border/60 bg-muted/30">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-accent/15 text-accent">
              <Calendar className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-foreground">
                Linked Calendars
              </h2>
              <p className="text-xs text-muted-foreground">
                Manage & edit Google Calendars for Work 1, Work 2 & Personal
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-5 overflow-y-auto flex-1">
          {/* Instructions Toggle */}
          <div className="p-3 bg-muted/40 border border-border/60 rounded-xl text-xs space-y-2">
            <button
              onClick={() => setShowInstructions(!showInstructions)}
              className="flex items-center justify-between w-full font-medium text-foreground hover:text-accent transition-colors"
            >
              <span className="flex items-center gap-1.5">
                <HelpCircle className="w-4 h-4 text-accent" />
                How to get your Google Calendar iCal link
              </span>
              <span className="text-[11px] underline">
                {showInstructions ? 'Hide steps' : 'Show steps'}
              </span>
            </button>

            {showInstructions && (
              <ol className="list-decimal list-inside space-y-1.5 text-muted-foreground pt-1 border-t border-border/40">
                <li>
                  Open <strong>Google Calendar</strong> on desktop (
                  <a
                    href="https://calendar.google.com"
                    target="_blank"
                    rel="noreferrer"
                    className="text-accent underline inline-flex items-center gap-0.5"
                  >
                    calendar.google.com <ExternalLink className="w-2.5 h-2.5" />
                  </a>
                  )
                </li>
                <li>
                  Click ⚙️ <strong>Settings</strong> → Select your calendar under{' '}
                  <em>"Settings for my calendars"</em>
                </li>
                <li>
                  Scroll down to <strong>"Integrate calendar"</strong>
                </li>
                <li>
                  Copy the <strong>"Secret address in iCal format"</strong> link
                </li>
                <li>Paste the URL below!</li>
              </ol>
            )}
          </div>

          {/* Active Feeds List */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-semibold uppercase text-muted-foreground tracking-wide">
                Your Calendars ({feeds.length})
              </h3>

              <div className="flex items-center gap-2">
                <button
                  onClick={onSyncNow}
                  disabled={isSyncing || feeds.length === 0}
                  className="flex items-center gap-1 text-xs text-accent hover:underline disabled:opacity-40"
                >
                  <RefreshCw className={`w-3 h-3 ${isSyncing ? 'animate-spin' : ''}`} />
                  Sync Now
                </button>
              </div>
            </div>

            {feeds.length === 0 ? (
              <div className="py-6 text-center text-xs text-muted-foreground border border-dashed border-border/80 rounded-xl">
                No calendars linked yet. Click below to add your first calendar!
              </div>
            ) : (
              <ul className="space-y-2">
                {feeds.map((feed) => (
                  <li
                    key={feed.id}
                    className={`flex items-center justify-between p-3 border rounded-xl transition-all ${
                      editingFeedId === feed.id
                        ? 'bg-accent/10 border-accent'
                        : 'bg-background border-border/60 hover:border-border'
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0 pr-2">
                      <button
                        onClick={() =>
                          onSaveFeed({ ...feed, enabled: !feed.enabled })
                        }
                        className={`w-5 h-5 rounded-md flex items-center justify-center transition-all ${
                          feed.enabled
                            ? 'bg-accent text-accent-foreground'
                            : 'border border-border bg-muted/40'
                        }`}
                        title={feed.enabled ? 'Enabled' : 'Disabled'}
                      >
                        {feed.enabled && <Check className="w-3.5 h-3.5" />}
                      </button>

                      <div
                        className="w-3.5 h-3.5 rounded-full shrink-0 shadow-2xs"
                        style={{ backgroundColor: feed.color }}
                      />

                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-foreground leading-none">
                          {feed.name}
                        </p>
                        <p className="text-[11px] font-mono text-muted-foreground truncate max-w-[200px] sm:max-w-[240px] mt-0.5">
                          {feed.url || 'No URL configured (Local preset)'}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-1 shrink-0">
                      {/* Edit Calendar Button */}
                      <button
                        onClick={() => handleOpenEditForm(feed)}
                        className="p-1.5 text-muted-foreground hover:text-accent rounded-lg hover:bg-muted transition-colors"
                        title="Edit Calendar Settings"
                      >
                        <Pencil className="w-3.5 h-3.5" />
                      </button>

                      {/* Delete Calendar Button */}
                      <button
                        onClick={() => onDeleteFeed(feed.id)}
                        className="p-1.5 text-muted-foreground hover:text-red-500 rounded-lg hover:bg-muted transition-colors"
                        title="Remove Calendar"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Add / Edit Calendar Form Section */}
          {!showForm ? (
            <button
              onClick={handleOpenAddForm}
              className="w-full py-2.5 border border-dashed border-accent/40 text-accent hover:bg-accent/5 rounded-xl font-medium text-xs flex items-center justify-center gap-1.5 transition-colors"
            >
              <Plus className="w-4 h-4" /> Add Google Calendar
            </button>
          ) : (
            <form
              onSubmit={handleFormSubmit}
              className="p-4 bg-muted/30 border border-border rounded-xl space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-150"
            >
              <div className="flex items-center justify-between border-b border-border/40 pb-2">
                <h4 className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                  {editingFeedId ? (
                    <>
                      <Pencil className="w-3.5 h-3.5 text-accent" />
                      Edit Calendar: <span className="text-accent">{name}</span>
                    </>
                  ) : (
                    <>
                      <Plus className="w-3.5 h-3.5 text-accent" />
                      Add New Calendar Feed
                    </>
                  )}
                </h4>
                <button
                  type="button"
                  onClick={handleCancelForm}
                  className="text-muted-foreground hover:text-foreground text-xs"
                >
                  Cancel
                </button>
              </div>

              {/* Quick Presets */}
              <div className="space-y-1">
                <label className="text-[11px] text-muted-foreground font-medium">
                  Quick Presets:
                </label>
                <div className="flex flex-wrap gap-1.5">
                  <button
                    type="button"
                    onClick={() => handleSelectPreset('Work 1', '#3b82f6')}
                    className={`px-2 py-1 rounded text-xs border ${
                      presetLabel === 'Work 1'
                        ? 'bg-blue-500/15 border-blue-500 text-blue-600 dark:text-blue-400 font-semibold'
                        : 'border-border text-muted-foreground'
                    }`}
                  >
                    Work 1
                  </button>
                  <button
                    type="button"
                    onClick={() => handleSelectPreset('Work 2', '#8b5cf6')}
                    className={`px-2 py-1 rounded text-xs border ${
                      presetLabel === 'Work 2'
                        ? 'bg-purple-500/15 border-purple-500 text-purple-600 dark:text-purple-400 font-semibold'
                        : 'border-border text-muted-foreground'
                    }`}
                  >
                    Work 2
                  </button>
                  <button
                    type="button"
                    onClick={() => handleSelectPreset('Personal', '#10b981')}
                    className={`px-2 py-1 rounded text-xs border ${
                      presetLabel === 'Personal'
                        ? 'bg-emerald-500/15 border-emerald-500 text-emerald-600 dark:text-emerald-400 font-semibold'
                        : 'border-border text-muted-foreground'
                    }`}
                  >
                    Personal
                  </button>
                </div>
              </div>

              {/* Name & Color Selection */}
              <div className="grid grid-cols-3 gap-3">
                <div className="col-span-2 space-y-1">
                  <label className="text-[11px] text-muted-foreground font-medium">
                    Calendar Name
                  </label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Work 1, Personal"
                    className="w-full px-3 py-1.5 text-xs bg-background border border-border rounded-lg text-foreground focus:outline-none focus:ring-1 focus:ring-accent"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] text-muted-foreground font-medium">
                    Color Badge
                  </label>
                  <div className="flex items-center gap-1.5">
                    <input
                      type="color"
                      value={color}
                      onChange={(e) => setColor(e.target.value)}
                      className="w-8 h-8 rounded border border-border cursor-pointer bg-transparent"
                    />
                    <span className="text-[10px] font-mono text-muted-foreground uppercase">
                      {color}
                    </span>
                  </div>
                </div>
              </div>

              {/* URL Input */}
              <div className="space-y-1">
                <label className="text-[11px] text-muted-foreground font-medium">
                  Google Calendar iCal Secret URL (.ics)
                </label>
                <input
                  type="url"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  placeholder="https://calendar.google.com/calendar/ical/.../basic.ics"
                  className="w-full px-3 py-1.5 text-xs bg-background border border-border rounded-lg text-foreground font-mono focus:outline-none focus:ring-1 focus:ring-accent"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-1">
                <button
                  type="button"
                  onClick={handleCancelForm}
                  className="px-3 py-1.5 text-xs text-muted-foreground hover:text-foreground"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-accent text-accent-foreground text-xs font-semibold rounded-lg hover:opacity-90 transition-opacity"
                >
                  {editingFeedId ? 'Update Calendar' : 'Save Calendar'}
                </button>
              </div>
            </form>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3 border-t border-border/60 bg-muted/20 flex items-center justify-between text-xs text-muted-foreground">
          <span>Synced locally & privately</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-muted hover:bg-muted/80 text-foreground font-medium rounded-lg transition-colors"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}

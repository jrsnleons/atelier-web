'use client';

import { useState } from 'react';
import { CalendarFeed, ListCategory } from '@/lib/supabase/types';
import { ThemeToggle } from '@/components/theme-toggle';
import {
  X,
  Settings,
  Calendar,
  SunMoon,
  Keyboard,
  Info,
  Plus,
  Trash2,
  HelpCircle,
  Check,
  RefreshCw,
  ExternalLink,
  Pencil,
  Tag,
  Feather,
} from 'lucide-react';

interface SettingsPanelProps {
  isOpen: boolean;
  onClose: () => void;
  feeds: CalendarFeed[];
  onSaveFeed: (feed: CalendarFeed) => void;
  onDeleteFeed: (id: string) => void;
  onSyncNow: () => void;
  isSyncing: boolean;
  lists: ListCategory[];
  onSaveList: (list: ListCategory) => void;
  onDeleteList: (id: string) => void;
}

const PRESET_COLORS = [
  { name: 'Blue', hex: '#3b82f6' },
  { name: 'Amber', hex: '#f59e0b' },
  { name: 'Emerald', hex: '#10b981' },
  { name: 'Purple', hex: '#8b5cf6' },
  { name: 'Rose', hex: '#f43f5e' },
  { name: 'Cyan', hex: '#06b6d4' },
  { name: 'Indigo', hex: '#6366f1' },
  { name: 'Slate', hex: '#64748b' },
];

export function SettingsPanel({
  isOpen,
  onClose,
  feeds,
  onSaveFeed,
  onDeleteFeed,
  onSyncNow,
  isSyncing,
  lists,
  onSaveList,
  onDeleteList,
}: SettingsPanelProps) {
  const [activeTab, setActiveTab] = useState<'categories' | 'calendars' | 'theme' | 'shortcuts' | 'about'>('categories');

  const [feedCategory, setFeedCategory] = useState<string>('');

  // Calendar Feed Form State
  const [showFeedForm, setShowFeedForm] = useState(false);
  const [editingFeedId, setEditingFeedId] = useState<string | null>(null);
  const [showInstructions, setShowInstructions] = useState(false);
  const [feedName, setFeedName] = useState('');
  const [feedColor, setFeedColor] = useState('#3b82f6');
  const [feedUrl, setFeedUrl] = useState('');
  const [presetLabel, setPresetLabel] = useState<string>('Work 1');

  // Category / List Form State
  const [showListForm, setShowListForm] = useState(false);
  const [editingListId, setEditingListId] = useState<string | null>(null);
  const [listName, setListName] = useState('');
  const [listColor, setListColor] = useState('#3b82f6');

  if (!isOpen) return null;

  // Calendar Form Handlers
  const handleOpenAddFeedForm = () => {
    setEditingFeedId(null);
    setFeedName('');
    setFeedColor('#3b82f6');
    setFeedCategory('');
    setFeedUrl('');
    setPresetLabel('');
    setShowFeedForm(true);
  };

  const handleOpenEditFeedForm = (feed: CalendarFeed) => {
    setEditingFeedId(feed.id);
    setFeedName(feed.name);
    setFeedColor(feed.color);
    setFeedCategory(feed.category_id || '');
    setFeedUrl(feed.url);
    setPresetLabel(feed.name);
    setShowFeedForm(true);
  };

  const handleSelectFeedPreset = (label: string, defaultColor: string) => {
    setPresetLabel(label);
    setFeedName(label);
    setFeedColor(defaultColor);
  };

  const handleFeedFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!feedName.trim()) return;

    if (editingFeedId) {
      const existing = feeds.find((f) => f.id === editingFeedId);
      const updatedFeed: CalendarFeed = {
        id: editingFeedId,
        name: feedName.trim(),
        color: feedColor,
        category_id: feedCategory || null,
        url: feedUrl.trim(),
        enabled: existing ? existing.enabled : true,
      };
      onSaveFeed(updatedFeed);
    } else {
      const newFeed: CalendarFeed = {
        id: 'feed_' + Math.random().toString(36).substring(2, 9),
        name: feedName.trim(),
        color: feedColor,
        category_id: feedCategory || null,
        url: feedUrl.trim(),
        enabled: true,
      };
      onSaveFeed(newFeed);
    }

    setFeedName('');
    setFeedUrl('');
    setFeedCategory('');
    setEditingFeedId(null);
    setShowFeedForm(false);
  };

  // List Category Form Handlers
  const handleOpenAddListForm = () => {
    setEditingListId(null);
    setListName('');
    setListColor('#3b82f6');
    setShowListForm(true);
  };

  const handleOpenEditListForm = (list: ListCategory) => {
    setEditingListId(list.id);
    setListName(list.name);
    setListColor(list.color);
    setShowListForm(true);
  };

  const handleListFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!listName.trim()) return;

    if (editingListId) {
      onSaveList({
        id: editingListId,
        name: listName.trim(),
        color: listColor,
      });
    } else {
      onSaveList({
        id: 'list_' + Math.random().toString(36).substring(2, 9),
        name: listName.trim(),
        color: listColor,
      });
    }

    setListName('');
    setEditingListId(null);
    setShowListForm(false);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-150">
      <div className="bg-card dark:bg-[#1E1C1A] border border-border/80 dark:border-border/60 rounded-2xl max-w-lg w-full shadow-[0_25px_60px_-15px_rgba(0,0,0,0.7)] overflow-hidden flex flex-col max-h-[90vh] ring-1 ring-white/10">
        {/* Panel Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border/60 bg-muted/20">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-accent text-accent-foreground">
              <Settings className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-serif font-bold text-foreground">
                Preferences & Settings
              </h2>
              <p className="text-xs text-muted-foreground">
                Manage categories, linked calendars, themes & keyboard shortcuts
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

        {/* Tab Navigation Pill Bar */}
        <div className="px-6 pt-4 pb-2 border-b border-border/40 bg-muted/10">
          <div className="bg-muted/60 p-1 rounded-xl flex items-center gap-1 text-xs font-medium overflow-x-auto no-scrollbar">
            <button
              onClick={() => setActiveTab('categories')}
              className={`flex-1 py-1.5 px-2 rounded-lg transition-all flex items-center justify-center gap-1.5 shrink-0 ${
                activeTab === 'categories'
                  ? 'bg-background text-foreground shadow-2xs font-semibold'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <Tag className="w-3.5 h-3.5" /> Categories
            </button>

            <button
              onClick={() => setActiveTab('calendars')}
              className={`flex-1 py-1.5 px-2 rounded-lg transition-all flex items-center justify-center gap-1.5 shrink-0 ${
                activeTab === 'calendars'
                  ? 'bg-background text-foreground shadow-2xs font-semibold'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <Calendar className="w-3.5 h-3.5" /> Calendars
            </button>

            <button
              onClick={() => setActiveTab('theme')}
              className={`flex-1 py-1.5 px-2 rounded-lg transition-all flex items-center justify-center gap-1.5 shrink-0 ${
                activeTab === 'theme'
                  ? 'bg-background text-foreground shadow-2xs font-semibold'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <SunMoon className="w-3.5 h-3.5" /> Theme
            </button>

            <button
              onClick={() => setActiveTab('shortcuts')}
              className={`flex-1 py-1.5 px-2 rounded-lg transition-all flex items-center justify-center gap-1.5 shrink-0 ${
                activeTab === 'shortcuts'
                  ? 'bg-background text-foreground shadow-2xs font-semibold'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <Keyboard className="w-3.5 h-3.5" /> Shortcuts
            </button>

            <button
              onClick={() => setActiveTab('about')}
              className={`flex-1 py-1.5 px-2 rounded-lg transition-all flex items-center justify-center gap-1.5 shrink-0 ${
                activeTab === 'about'
                  ? 'bg-background text-foreground shadow-2xs font-semibold'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <Info className="w-3.5 h-3.5" /> About
            </button>
          </div>
        </div>

        {/* Panel Body Content */}
        <div className="p-6 space-y-5 overflow-y-auto flex-1">
          {/* TAB 1: CATEGORIES & LISTS */}
          {activeTab === 'categories' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xs font-semibold uppercase text-muted-foreground tracking-wide">
                    Task Categories & Lists ({lists.length})
                  </h3>
                  <p className="text-[11px] text-muted-foreground mt-0.5">
                    Customize colored categories used to organize your daily tasks.
                  </p>
                </div>

                <button
                  onClick={handleOpenAddListForm}
                  className="p-1.5 rounded-lg bg-accent text-accent-foreground hover:opacity-90 transition-opacity flex items-center gap-1 text-xs font-semibold shadow-2xs"
                >
                  <Plus className="w-3.5 h-3.5" /> Add Category
                </button>
              </div>

              {/* Lists List */}
              {lists.length === 0 ? (
                <div className="py-6 text-center text-xs text-muted-foreground border border-dashed border-border/80 rounded-xl">
                  No categories created yet. Click above to add your first category!
                </div>
              ) : (
                <ul className="space-y-2">
                  {lists.map((list) => (
                    <li
                      key={list.id}
                      className={`flex items-center justify-between p-3 border rounded-xl transition-all ${
                        editingListId === list.id
                          ? 'bg-muted/40 border-accent'
                          : 'bg-background border-border/60 hover:border-border'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className="w-3.5 h-3.5 rounded-full shrink-0 shadow-2xs"
                          style={{ backgroundColor: list.color }}
                        />
                        <span className="text-sm font-semibold text-foreground">
                          {list.name}
                        </span>
                      </div>

                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => handleOpenEditListForm(list)}
                          className="p-1.5 text-muted-foreground hover:text-accent rounded-lg hover:bg-muted transition-colors"
                          title="Edit Category"
                        >
                          <Pencil className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => onDeleteList(list.id)}
                          className="p-1.5 text-muted-foreground hover:text-red-500 rounded-lg hover:bg-muted transition-colors"
                          title="Delete Category"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </li>
                  ))}
                </ul>
              )}

              {/* Add / Edit Category Form */}
              {showListForm && (
                <form
                  onSubmit={handleListFormSubmit}
                  className="p-4 bg-muted/30 border border-border rounded-xl space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-150"
                >
                  <div className="flex items-center justify-between border-b border-border/40 pb-2">
                    <h4 className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                      {editingListId ? (
                        <>
                          <Pencil className="w-3.5 h-3.5 text-accent" />
                          Edit Category: <span className="text-accent">{listName}</span>
                        </>
                      ) : (
                        <>
                          <Plus className="w-3.5 h-3.5 text-accent" />
                          Add New Category
                        </>
                      )}
                    </h4>
                    <button
                      type="button"
                      onClick={() => setShowListForm(false)}
                      className="text-muted-foreground hover:text-foreground text-xs"
                    >
                      Cancel
                    </button>
                  </div>

                  {/* Category Name Input */}
                  <div className="space-y-1">
                    <label className="text-[11px] text-muted-foreground font-medium">
                      Category Name
                    </label>
                    <input
                      type="text"
                      required
                      value={listName}
                      onChange={(e) => setListName(e.target.value)}
                      placeholder="e.g. Work, Personal, Health"
                      className="w-full px-3 py-1.5 text-xs bg-background border border-border rounded-lg text-foreground focus:outline-none focus:ring-1 focus:ring-accent"
                      autoFocus
                    />
                  </div>

                  {/* Color Picker & Presets */}
                  <div className="space-y-2">
                    <label className="text-[11px] text-muted-foreground font-medium">
                      Color Theme
                    </label>
                    <div className="flex flex-wrap gap-2 items-center">
                      {PRESET_COLORS.map((c) => (
                        <button
                          key={c.hex}
                          type="button"
                          onClick={() => setListColor(c.hex)}
                          className={`w-6 h-6 rounded-full flex items-center justify-center transition-all ${
                            listColor.toLowerCase() === c.hex.toLowerCase()
                              ? 'ring-2 ring-accent ring-offset-2 ring-offset-background scale-110'
                              : 'hover:scale-105'
                          }`}
                          style={{ backgroundColor: c.hex }}
                          title={c.name}
                        >
                          {listColor.toLowerCase() === c.hex.toLowerCase() && (
                            <Check className="w-3 h-3 text-white" />
                          )}
                        </button>
                      ))}

                      <div className="flex items-center gap-1 ml-auto">
                        <input
                          type="color"
                          value={listColor}
                          onChange={(e) => setListColor(e.target.value)}
                          className="w-7 h-7 rounded border border-border cursor-pointer bg-transparent"
                        />
                        <span className="text-[10px] font-mono text-muted-foreground uppercase">
                          {listColor}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-end gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() => setShowListForm(false)}
                      className="px-3 py-1.5 text-xs text-muted-foreground hover:text-foreground"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={!listName.trim()}
                      className="px-4 py-1.5 bg-accent text-accent-foreground text-xs font-semibold rounded-lg hover:opacity-90 transition-opacity disabled:opacity-40"
                    >
                      {editingListId ? 'Update Category' : 'Save Category'}
                    </button>
                  </div>
                </form>
              )}
            </div>
          )}

          {/* TAB 2: CALENDARS */}
          {activeTab === 'calendars' && (
            <div className="space-y-4">
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
                    Linked Feeds ({feeds.length})
                  </h3>

                  <button
                    onClick={onSyncNow}
                    disabled={isSyncing || feeds.length === 0}
                    className="flex items-center gap-1 text-xs text-accent font-medium hover:underline disabled:opacity-40"
                  >
                    <RefreshCw className={`w-3 h-3 ${isSyncing ? 'animate-spin' : ''}`} />
                    Sync Now
                  </button>
                </div>

                {feeds.length === 0 ? (
                  <div className="py-6 text-center text-xs text-muted-foreground border border-dashed border-border/80 rounded-xl">
                    No calendars linked yet. Click below to add your first feed!
                  </div>
                ) : (
                  <ul className="space-y-2">
                    {feeds.map((feed) => (
                      <li
                        key={feed.id}
                        className={`flex items-center justify-between p-3 border rounded-xl transition-all ${
                          editingFeedId === feed.id
                            ? 'bg-muted/40 border-accent'
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
                          <button
                            onClick={() => handleOpenEditFeedForm(feed)}
                            className="p-1.5 text-muted-foreground hover:text-accent rounded-lg hover:bg-muted transition-colors"
                            title="Edit Calendar Settings"
                          >
                            <Pencil className="w-3.5 h-3.5" />
                          </button>

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

              {/* Add / Edit Form */}
              {!showFeedForm ? (
                <button
                  onClick={handleOpenAddFeedForm}
                  className="w-full py-2.5 border border-dashed border-accent/40 text-accent hover:bg-muted/40 rounded-xl font-medium text-xs flex items-center justify-center gap-1.5 transition-colors"
                >
                  <Plus className="w-4 h-4" /> Add Google Calendar Feed
                </button>
              ) : (
                <form
                  onSubmit={handleFeedFormSubmit}
                  className="p-4 bg-muted/30 border border-border rounded-xl space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-150"
                >
                  <div className="flex items-center justify-between border-b border-border/40 pb-2">
                    <h4 className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                      {editingFeedId ? (
                        <>
                          <Pencil className="w-3.5 h-3.5 text-accent" />
                          Edit Calendar: <span className="text-accent">{feedName}</span>
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
                      onClick={() => setShowFeedForm(false)}
                      className="text-muted-foreground hover:text-foreground text-xs"
                    >
                      Cancel
                    </button>
                  </div>

                  {/* Presets */}
                  <div className="space-y-1">
                    <label className="text-[11px] text-muted-foreground font-medium">
                      Quick Presets:
                    </label>
                    <div className="flex flex-wrap gap-1.5">
                      <button
                        type="button"
                        onClick={() => handleSelectFeedPreset('Work 1', '#3b82f6')}
                        className={`px-2 py-1 rounded text-xs border ${
                          presetLabel === 'Work 1'
                            ? 'bg-accent/15 border-accent text-accent font-semibold'
                            : 'border-border text-muted-foreground'
                        }`}
                      >
                        Work 1
                      </button>
                      <button
                        type="button"
                        onClick={() => handleSelectFeedPreset('Work 2', '#8b5cf6')}
                        className={`px-2 py-1 rounded text-xs border ${
                          presetLabel === 'Work 2'
                            ? 'bg-accent/15 border-accent text-accent font-semibold'
                            : 'border-border text-muted-foreground'
                        }`}
                      >
                        Work 2
                      </button>
                      <button
                        type="button"
                        onClick={() => handleSelectFeedPreset('Personal', '#10b981')}
                        className={`px-2 py-1 rounded text-xs border ${
                          presetLabel === 'Personal'
                            ? 'bg-accent/15 border-accent text-accent font-semibold'
                            : 'border-border text-muted-foreground'
                        }`}
                      >
                        Personal
                      </button>
                    </div>
                  </div>

                  {/* Name & Color */}
                  <div className="grid grid-cols-3 gap-3">
                    <div className="col-span-2 space-y-1">
                      <label className="text-[11px] text-muted-foreground font-medium">
                        Calendar Name
                      </label>
                      <input
                        type="text"
                        required
                        value={feedName}
                        onChange={(e) => setFeedName(e.target.value)}
                        placeholder="e.g. Work 1, Personal"
                        className="w-full px-3 py-1.5 text-xs bg-background border border-border rounded-lg text-foreground focus:outline-none focus:ring-1 focus:ring-accent"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[11px] text-muted-foreground font-medium">
                        Color Dot
                      </label>
                      <div className="flex items-center gap-1.5">
                        <input
                          type="color"
                          value={feedColor}
                          onChange={(e) => setFeedColor(e.target.value)}
                          className="w-8 h-8 rounded border border-border cursor-pointer bg-transparent"
                        />
                        <span className="text-[10px] font-mono text-muted-foreground uppercase">
                          {feedColor}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Linked Category Dropdown */}
                  <div className="space-y-1">
                    <label className="text-[11px] text-muted-foreground font-medium">
                      Link to Category / List (Optional)
                    </label>
                    <select
                      value={feedCategory}
                      onChange={(e) => {
                        const val = e.target.value;
                        setFeedCategory(val);
                        const foundList = lists.find((l) => l.name === val || l.id === val);
                        if (foundList) {
                          setFeedColor(foundList.color);
                        }
                      }}
                      className="w-full px-3 py-1.5 text-xs bg-background border border-border rounded-lg text-foreground focus:outline-none focus:ring-1 focus:ring-accent"
                    >
                      <option value="">None (Independent Calendar)</option>
                      {lists.map((l) => (
                        <option key={l.id} value={l.name}>
                          {l.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* URL */}
                  <div className="space-y-1">
                    <label className="text-[11px] text-muted-foreground font-medium">
                      Google Calendar iCal Secret URL (.ics)
                    </label>
                    <input
                      type="url"
                      value={feedUrl}
                      onChange={(e) => setFeedUrl(e.target.value)}
                      placeholder="https://calendar.google.com/calendar/ical/.../basic.ics"
                      className="w-full px-3 py-1.5 text-xs bg-background border border-border rounded-lg text-foreground font-mono focus:outline-none focus:ring-1 focus:ring-accent"
                    />
                  </div>

                  <div className="flex items-center justify-end gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() => setShowFeedForm(false)}
                      className="px-3 py-1.5 text-xs text-muted-foreground hover:text-foreground"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-1.5 bg-accent text-accent-foreground text-xs font-semibold rounded-lg hover:opacity-90 transition-opacity"
                    >
                      {editingFeedId ? 'Update Feed' : 'Save Feed'}
                    </button>
                  </div>
                </form>
              )}
            </div>
          )}

          {/* TAB 3: THEME */}
          {activeTab === 'theme' && (
            <div className="space-y-4">
              <h3 className="text-xs font-semibold uppercase text-muted-foreground tracking-wide">
                Color Mode & Appearance
              </h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Choose between warm parchment light mode, deep charcoal dark mode, or follow your system preference automatically.
              </p>

              <div className="pt-2">
                <ThemeToggle />
              </div>
            </div>
          )}

          {/* TAB 4: SHORTCUTS */}
          {activeTab === 'shortcuts' && (
            <div className="space-y-3">
              <h3 className="text-xs font-semibold uppercase text-muted-foreground tracking-wide">
                Keyboard Shortcuts Legend
              </h3>

              <ul className="space-y-2 text-xs">
                <li className="flex items-center justify-between p-2 bg-muted/30 rounded-lg border border-border/40">
                  <span className="text-foreground">Add Task or Event (NLP Modal)</span>
                  <kbd className="px-2 py-0.5 bg-background border border-border rounded text-[11px] font-mono text-muted-foreground">
                    / or ⌘K
                  </kbd>
                </li>
                <li className="flex items-center justify-between p-2 bg-muted/30 rounded-lg border border-border/40">
                  <span className="text-foreground">Previous / Next Day</span>
                  <kbd className="px-2 py-0.5 bg-background border border-border rounded text-[11px] font-mono text-muted-foreground">
                    ← / →
                  </kbd>
                </li>
                <li className="flex items-center justify-between p-2 bg-muted/30 rounded-lg border border-border/40">
                  <span className="text-foreground">Jump to Today</span>
                  <kbd className="px-2 py-0.5 bg-background border border-border rounded text-[11px] font-mono text-muted-foreground">
                    T
                  </kbd>
                </li>
                <li className="flex items-center justify-between p-2 bg-muted/30 rounded-lg border border-border/40">
                  <span className="text-foreground">Toggle Bold / Italic in Notes</span>
                  <kbd className="px-2 py-0.5 bg-background border border-border rounded text-[11px] font-mono text-muted-foreground">
                    ⌘B / ⌘I
                  </kbd>
                </li>
              </ul>
            </div>
          )}

          {/* TAB 5: ABOUT */}
          {activeTab === 'about' && (
            <div className="space-y-4 text-xs text-muted-foreground leading-relaxed">
              <div className="flex items-center gap-3 p-4 bg-muted/30 rounded-xl border border-border/40">
                <div className="w-10 h-10 rounded-xl bg-accent text-accent-foreground flex items-center justify-center shrink-0">
                  <Feather className="w-5 h-5 stroke-[2.5]" />
                </div>
                <div>
                  <h4 className="text-sm font-serif font-bold text-foreground">Atelier Web</h4>
                  <p className="text-[11px] text-muted-foreground">Version 1.0.0 · Progressive Web App</p>
                </div>
              </div>

              <p>
                Atelier is a minimal, quiet daily planner & journal inspired by Christopher Lawley. Built with local-first architecture, multi-calendar support, and 100% offline capability.
              </p>

              <div className="pt-2 border-t border-border/40 flex items-center justify-between text-[11px]">
                <span>Synced locally & privately</span>
                <span>Atelier Web 2026</span>
              </div>
            </div>
          )}
        </div>

        {/* Panel Footer */}
        <div className="px-6 py-3 border-t border-border/60 bg-muted/20 flex items-center justify-between text-xs text-muted-foreground">
          <span>Preferences saved automatically</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-accent text-accent-foreground font-medium rounded-lg hover:opacity-90 transition-opacity"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}

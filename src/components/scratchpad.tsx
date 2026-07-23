'use client';

import { useEffect, useRef } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';
import TaskListExtension from '@tiptap/extension-task-list';
import TaskItemExtension from '@tiptap/extension-task-item';
import { PenTool, Bold, Italic, List, CheckSquare, Heading1, Heading2, Share2, Type } from 'lucide-react';

interface ScratchpadProps {
  dateStr: string;
  initialContent: any;
  onSaveContent: (content: any) => void;
}

export function Scratchpad({ dateStr, initialContent, onSaveContent }: ScratchpadProps) {
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [1, 2, 3],
        },
      }),
      Placeholder.configure({
        placeholder: 'Write your thoughts, daily journal, or notes for this day...',
      }),
      TaskListExtension,
      TaskItemExtension.configure({
        nested: true,
      }),
    ],
    content: initialContent || '',
    editorProps: {
      attributes: {
        class:
          'prose dark:prose-invert max-w-none font-sans text-sm sm:text-base leading-[1.7] focus:outline-none min-h-[300px] text-foreground',
      },
    },
    onUpdate: ({ editor }) => {
      const jsonContent = editor.getJSON();
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
      saveTimeoutRef.current = setTimeout(() => {
        onSaveContent(jsonContent);
      }, 600);
    },
  });

  // Re-hydrate content when dateStr changes
  useEffect(() => {
    if (editor) {
      editor.commands.setContent(initialContent || '');
    }
  }, [dateStr]);

  const handleShareClick = () => {
    if (editor && typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(editor.getText());
      alert('Daily note copied to clipboard!');
    }
  };

  if (!editor) {
    return (
      <div className="bg-card border border-border/80 rounded-2xl p-5 shadow-2xs h-full min-h-[340px] animate-pulse">
        <div className="h-6 w-36 bg-muted rounded mb-4" />
        <div className="h-4 w-full bg-muted/60 rounded mb-2" />
        <div className="h-4 w-4/5 bg-muted/60 rounded" />
      </div>
    );
  }

  const characterCount = editor.getText().length;
  const wordCount = editor.getText().trim() ? editor.getText().trim().split(/\s+/).length : 0;

  return (
    <div className="bg-card border border-border/80 rounded-2xl p-5 card-hover-effect space-y-4 flex flex-col h-full w-full">
      {/* Card Header: 🖋️ Daily Note [ Ⓐ ] [ ⎋ ] */}
      <div className="flex items-center justify-between pb-2 border-b border-border/40">
        <div className="flex items-center gap-2">
          <PenTool className="w-5 h-5 text-foreground stroke-[1.8]" />
          <h2 className="text-lg font-serif font-bold text-foreground tracking-tight">
            Daily Note
          </h2>
        </div>

        <div className="flex items-center gap-1.5">
          {/* Format Action Button Ⓐ */}
          <button
            onClick={() => editor.chain().focus().toggleBold().run()}
            className="p-1.5 rounded-lg bg-accent/10 text-accent hover:bg-accent/20 transition-colors"
            title="Formatting Mode (Ⓐ)"
          >
            <Type className="w-4 h-4" />
          </button>

          {/* Share / Export Action Button ⎋ */}
          <button
            onClick={handleShareClick}
            className="p-1.5 rounded-lg bg-accent/10 text-accent hover:bg-accent/20 transition-colors"
            title="Export / Copy Note (⎋)"
          >
            <Share2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Floating Quick Format Bar */}
      <div className="flex items-center gap-1 bg-muted/40 p-1 rounded-xl border border-border/40 text-muted-foreground w-fit text-xs">
        <button
          onClick={() => editor.chain().focus().toggleBold().run()}
          className={`p-1 rounded-md hover:text-foreground hover:bg-background/80 transition-colors ${
            editor.isActive('bold') ? 'bg-background text-foreground shadow-2xs font-bold' : ''
          }`}
          title="Bold (⌘B)"
        >
          <Bold className="w-3.5 h-3.5" />
        </button>
        <button
          onClick={() => editor.chain().focus().toggleItalic().run()}
          className={`p-1 rounded-md hover:text-foreground hover:bg-background/80 transition-colors ${
            editor.isActive('italic') ? 'bg-background text-foreground shadow-2xs' : ''
          }`}
          title="Italic (⌘I)"
        >
          <Italic className="w-3.5 h-3.5" />
        </button>
        <button
          onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
          className={`p-1 rounded-md hover:text-foreground hover:bg-background/80 transition-colors ${
            editor.isActive('heading', { level: 1 }) ? 'bg-background text-foreground shadow-2xs' : ''
          }`}
          title="Heading 1"
        >
          <Heading1 className="w-3.5 h-3.5" />
        </button>
        <button
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
          className={`p-1 rounded-md hover:text-foreground hover:bg-background/80 transition-colors ${
            editor.isActive('heading', { level: 2 }) ? 'bg-background text-foreground shadow-2xs' : ''
          }`}
          title="Heading 2"
        >
          <Heading2 className="w-3.5 h-3.5" />
        </button>
        <button
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          className={`p-1 rounded-md hover:text-foreground hover:bg-background/80 transition-colors ${
            editor.isActive('bulletList') ? 'bg-background text-foreground shadow-2xs' : ''
          }`}
          title="Bullet List"
        >
          <List className="w-3.5 h-3.5" />
        </button>
        <button
          onClick={() => editor.chain().focus().toggleTaskList().run()}
          className={`p-1 rounded-md hover:text-foreground hover:bg-background/80 transition-colors ${
            editor.isActive('taskList') ? 'bg-background text-foreground shadow-2xs' : ''
          }`}
          title="Task Checklist"
        >
          <CheckSquare className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Writing Canvas Container (Editorial Sans-Serif) */}
      <div
        className="flex-1 bg-muted/15 border border-border/40 rounded-xl p-4 cursor-text overflow-y-auto min-h-[320px] max-h-[520px]"
        onClick={() => editor.commands.focus()}
      >
        <EditorContent editor={editor} />
      </div>

      {/* Footer Word Count */}
      <div className="pt-2 border-t border-border/40 flex items-center justify-between text-xs text-muted-foreground font-mono">
        <span>Markdown supported</span>
        <span>
          {wordCount} {wordCount === 1 ? 'word' : 'words'} · {characterCount} chars
        </span>
      </div>
    </div>
  );
}

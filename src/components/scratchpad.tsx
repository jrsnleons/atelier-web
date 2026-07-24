'use client';

import { useEffect, useRef } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';
import TaskListExtension from '@tiptap/extension-task-list';
import TaskItemExtension from '@tiptap/extension-task-item';
import TiptapImage from '@tiptap/extension-image';
import { createClient } from '@/lib/supabase/client';
import { PenTool, Bold, Italic, List, CheckSquare, Heading1, Heading2, Share2, Type, ImageIcon, Upload } from 'lucide-react';

interface ScratchpadProps {
  dateStr: string;
  initialContent: any;
  onSaveContent: (content: any) => void;
}

const handleFileUpload = async (file: File): Promise<string> => {
  const supabase = createClient();
  if (supabase) {
    try {
      const fileName = `${Date.now()}_${file.name.replace(/[^a-zA-Z0-9._-]/g, '_')}`;
      const { data, error } = await supabase.storage.from('attachments').upload(fileName, file);
      if (!error && data) {
        const { data: publicUrlData } = supabase.storage.from('attachments').getPublicUrl(fileName);
        if (publicUrlData?.publicUrl) return publicUrlData.publicUrl;
      }
    } catch (e) {
      console.warn('Supabase storage upload error, using local base64:', e);
    }
  }

  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = (e) => resolve(e.target?.result as string);
    reader.readAsDataURL(file);
  });
};

export function Scratchpad({ dateStr, initialContent, onSaveContent }: ScratchpadProps) {
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [1, 2, 3],
        },
      }),
      Placeholder.configure({
        placeholder: 'Write your thoughts, daily journal, or notes for this day (drop images here)...',
      }),
      TaskListExtension,
      TaskItemExtension.configure({
        nested: true,
      }),
      TiptapImage.configure({
        inline: true,
        allowBase64: true,
        HTMLAttributes: {
          class: 'rounded-xl max-h-[400px] w-auto my-3 border border-border/60 shadow-xs object-cover',
        },
      }),
    ],
    content: initialContent || '',
    editorProps: {
      attributes: {
        class:
          'prose dark:prose-invert max-w-none font-sans text-sm sm:text-base leading-[1.7] focus:outline-none min-h-[300px] text-foreground',
      },
      handleDrop: (view, event, _slice, moved) => {
        if (!moved && event.dataTransfer && event.dataTransfer.files && event.dataTransfer.files.length > 0) {
          const file = event.dataTransfer.files[0];
          if (file.type.startsWith('image/')) {
            event.preventDefault();
            handleFileUpload(file).then((url) => {
              const { schema } = view.state;
              const node = schema.nodes.image.create({ src: url });
              const transaction = view.state.tr.insert(view.state.selection.from, node);
              view.dispatch(transaction);
            });
            return true;
          }
        }
        return false;
      },
      handlePaste: (view, event) => {
        if (event.clipboardData && event.clipboardData.files && event.clipboardData.files.length > 0) {
          const file = event.clipboardData.files[0];
          if (file.type.startsWith('image/')) {
            event.preventDefault();
            handleFileUpload(file).then((url) => {
              const { schema } = view.state;
              const node = schema.nodes.image.create({ src: url });
              const transaction = view.state.tr.insert(view.state.selection.from, node);
              view.dispatch(transaction);
            });
            return true;
          }
        }
        return false;
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

  // Re-hydrate content when dateStr changes or when initialContent loads asynchronously
  const previousDateRef = useRef<string>(dateStr);

  useEffect(() => {
    if (!editor) return;

    const dateChanged = previousDateRef.current !== dateStr;
    if (dateChanged) {
      previousDateRef.current = dateStr;
      editor.commands.setContent(initialContent || '');
      return;
    }

    if (!editor.isFocused && initialContent) {
      const currentText = editor.getText().trim();
      if (!currentText) {
        editor.commands.setContent(initialContent);
      }
    }
  }, [dateStr, initialContent, editor]);

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
      <div className="flex items-center gap-1 bg-muted/40 p-1.5 rounded-xl border border-border/40 text-muted-foreground w-fit text-xs backdrop-blur-xs">
        <button
          type="button"
          onMouseDown={(e) => e.preventDefault()}
          onClick={() => editor.chain().focus().toggleBold().run()}
          className={`p-1.5 rounded-md hover:text-foreground hover:bg-background/80 transition-all active:scale-95 ${
            editor.isActive('bold') ? 'bg-background text-foreground shadow-2xs font-bold ring-1 ring-border/60' : ''
          }`}
          title="Bold (⌘B)"
        >
          <Bold className="w-3.5 h-3.5" />
        </button>
        <button
          type="button"
          onMouseDown={(e) => e.preventDefault()}
          onClick={() => editor.chain().focus().toggleItalic().run()}
          className={`p-1.5 rounded-md hover:text-foreground hover:bg-background/80 transition-all active:scale-95 ${
            editor.isActive('italic') ? 'bg-background text-foreground shadow-2xs ring-1 ring-border/60' : ''
          }`}
          title="Italic (⌘I)"
        >
          <Italic className="w-3.5 h-3.5" />
        </button>

        <span className="w-px h-3.5 bg-border/60 mx-0.5" />

        <button
          type="button"
          onMouseDown={(e) => e.preventDefault()}
          onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
          className={`p-1.5 rounded-md hover:text-foreground hover:bg-background/80 transition-all active:scale-95 ${
            editor.isActive('heading', { level: 1 }) ? 'bg-background text-foreground shadow-2xs font-bold ring-1 ring-border/60' : ''
          }`}
          title="Heading 1"
        >
          <Heading1 className="w-3.5 h-3.5" />
        </button>
        <button
          type="button"
          onMouseDown={(e) => e.preventDefault()}
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
          className={`p-1.5 rounded-md hover:text-foreground hover:bg-background/80 transition-all active:scale-95 ${
            editor.isActive('heading', { level: 2 }) ? 'bg-background text-foreground shadow-2xs font-bold ring-1 ring-border/60' : ''
          }`}
          title="Heading 2"
        >
          <Heading2 className="w-3.5 h-3.5" />
        </button>

        <span className="w-px h-3.5 bg-border/60 mx-0.5" />

        <button
          type="button"
          onMouseDown={(e) => e.preventDefault()}
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          className={`p-1.5 rounded-md hover:text-foreground hover:bg-background/80 transition-all active:scale-95 ${
            editor.isActive('bulletList') ? 'bg-background text-foreground shadow-2xs ring-1 ring-border/60' : ''
          }`}
          title="Bullet List"
        >
          <List className="w-3.5 h-3.5" />
        </button>
        <button
          type="button"
          onMouseDown={(e) => e.preventDefault()}
          onClick={() => editor.chain().focus().toggleTaskList().run()}
          className={`p-1.5 rounded-md hover:text-foreground hover:bg-background/80 transition-all active:scale-95 ${
            editor.isActive('taskList') ? 'bg-background text-foreground shadow-2xs ring-1 ring-border/60' : ''
          }`}
          title="Task Checklist"
        >
          <CheckSquare className="w-3.5 h-3.5" />
        </button>

        <span className="w-px h-3.5 bg-border/60 mx-0.5" />

        <button
          type="button"
          onMouseDown={(e) => e.preventDefault()}
          onClick={() => fileInputRef.current?.click()}
          className="p-1.5 rounded-md hover:text-foreground hover:bg-background/80 transition-all active:scale-95"
          title="Insert Image / Media"
        >
          <ImageIcon className="w-3.5 h-3.5 text-accent" />
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={async (e) => {
            if (e.target.files && e.target.files.length > 0) {
              const file = e.target.files[0];
              const url = await handleFileUpload(file);
              editor.chain().focus().setImage({ src: url }).run();
              e.target.value = '';
            }
          }}
        />
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

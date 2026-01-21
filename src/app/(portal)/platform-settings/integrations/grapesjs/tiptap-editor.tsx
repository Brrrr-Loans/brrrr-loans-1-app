"use client";

import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';
import { Button } from '@/components/ui/shadcn/button';
import { Bold, Italic, List, ListOrdered, Heading1, Heading2, Quote, Undo, Redo, Code } from 'lucide-react';
import { Toggle } from '@/components/ui/shadcn/toggle';
import { Separator } from '@/components/ui/shadcn/separator';

export function TiptapEditor() {
  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit,
      Placeholder.configure({
        placeholder: 'Draft your email template here...',
      }),
    ],
    content: `
      <h2>Email Template Draft</h2>
      <p>Start writing your email content here. You can use the AI Assistant to generate sections or entire templates.</p>
      <blockquote>"Efficiency is doing things right; effectiveness is doing the right things." - Peter Drucker</blockquote>
      <ul>
        <li>Use clear subject lines</li>
        <li>Keep it concise</li>
        <li>Include a call to action</li>
      </ul>
    `,
    editorProps: {
        attributes: {
            class: 'tiptap-content focus:outline-none min-h-[500px] p-8 max-w-none font-sans',
        },
    },
  });

  if (!editor) {
    return null;
  }

  return (
    <div className="border border-border rounded-lg overflow-hidden flex flex-col h-[calc(100vh-250px)] bg-background shadow-sm">
      <div className="flex items-center gap-1 p-2 border-b bg-muted overflow-x-auto sticky top-0 z-10">
        <div className="flex items-center gap-1">
            <Toggle
                size="sm"
                pressed={editor.isActive('bold')}
                onPressedChange={() => editor.chain().focus().toggleBold().run()}
                disabled={!editor.can().chain().focus().toggleBold().run()}
                aria-label="Toggle bold"
            >
                <Bold className="h-4 w-4" />
            </Toggle>
            <Toggle
                size="sm"
                pressed={editor.isActive('italic')}
                onPressedChange={() => editor.chain().focus().toggleItalic().run()}
                disabled={!editor.can().chain().focus().toggleItalic().run()}
                aria-label="Toggle italic"
            >
                <Italic className="h-4 w-4" />
            </Toggle>
            <Toggle
                size="sm"
                pressed={editor.isActive('code')}
                onPressedChange={() => editor.chain().focus().toggleCode().run()}
                disabled={!editor.can().chain().focus().toggleCode().run()}
                aria-label="Toggle code"
            >
                <Code className="h-4 w-4" />
            </Toggle>
        </div>
        
        <Separator orientation="vertical" className="mx-1 h-6" />
        
        <div className="flex items-center gap-1">
            <Toggle
                size="sm"
                pressed={editor.isActive('heading', { level: 1 })}
                onPressedChange={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
                aria-label="Toggle H1"
            >
                <Heading1 className="h-4 w-4" />
            </Toggle>
            <Toggle
                size="sm"
                pressed={editor.isActive('heading', { level: 2 })}
                onPressedChange={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
                aria-label="Toggle H2"
            >
                <Heading2 className="h-4 w-4" />
            </Toggle>
        </div>

        <Separator orientation="vertical" className="mx-1 h-6" />

        <div className="flex items-center gap-1">
            <Toggle
                size="sm"
                pressed={editor.isActive('bulletList')}
                onPressedChange={() => editor.chain().focus().toggleBulletList().run()}
                aria-label="Toggle Bullet List"
            >
                <List className="h-4 w-4" />
            </Toggle>
            <Toggle
                size="sm"
                pressed={editor.isActive('orderedList')}
                onPressedChange={() => editor.chain().focus().toggleOrderedList().run()}
                aria-label="Toggle Ordered List"
            >
                <ListOrdered className="h-4 w-4" />
            </Toggle>
            <Toggle
                size="sm"
                pressed={editor.isActive('blockquote')}
                onPressedChange={() => editor.chain().focus().toggleBlockquote().run()}
                aria-label="Toggle Blockquote"
            >
                <Quote className="h-4 w-4" />
            </Toggle>
        </div>

        <Separator orientation="vertical" className="mx-1 h-6" />

        <div className="flex items-center gap-1">
            <Button
                size="icon"
                variant="ghost"
                className="h-8 w-8"
                onClick={() => editor.chain().focus().undo().run()}
                disabled={!editor.can().chain().focus().undo().run()}
                title="Undo"
            >
                <Undo className="h-4 w-4" />
            </Button>
            <Button
                size="icon"
                variant="ghost"
                className="h-8 w-8"
                onClick={() => editor.chain().focus().redo().run()}
                disabled={!editor.can().chain().focus().redo().run()}
                title="Redo"
            >
                <Redo className="h-4 w-4" />
            </Button>
        </div>
      </div>
      <div className="flex-1 overflow-auto bg-background">
        <EditorContent editor={editor} className="h-full min-h-[500px]" />
      </div>
    </div>
  );
}

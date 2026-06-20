"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Link from "@tiptap/extension-link";
import Underline from "@tiptap/extension-underline";
import TextAlign from "@tiptap/extension-text-align";
import { TextStyle } from "@tiptap/extension-text-style";
import Placeholder from "@tiptap/extension-placeholder";
import { useEffect, useCallback } from "react";
import { cn } from "@/lib/utils";
import {
  Bold, Italic, Underline as UnderlineIcon, Strikethrough,
  Heading2, Heading3, List, ListOrdered,
  AlignLeft, AlignCenter, AlignRight,
  Link2, Link2Off, Quote, Minus, Undo, Redo,
} from "lucide-react";

// ─── Toolbar button ───────────────────────────────────────────────────────────

function ToolBtn({
  onClick,
  active,
  disabled,
  title,
  children,
}: {
  onClick: () => void;
  active?: boolean;
  disabled?: boolean;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onMouseDown={(e) => { e.preventDefault(); onClick(); }}
      disabled={disabled}
      title={title}
      className={cn(
        "flex h-7 w-7 items-center justify-center rounded transition-colors",
        active
          ? "bg-amber-100 text-amber-700 dark:bg-amber-400/20 dark:text-amber-400"
          : "text-zinc-500 hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-100",
        disabled && "cursor-not-allowed opacity-30"
      )}
    >
      {children}
    </button>
  );
}

function Divider() {
  return <div className="mx-0.5 h-5 w-px shrink-0 bg-zinc-200 dark:bg-zinc-700" />;
}

// ─── Editor ───────────────────────────────────────────────────────────────────

interface RichTextEditorProps {
  value: string;
  onChange: (html: string) => void;
  placeholder?: string;
  minHeight?: number;
}

export function RichTextEditor({
  value,
  onChange,
  placeholder = "Descreva o imóvel com detalhes que convertem: vista, acabamento, localização...",
  minHeight = 240,
}: RichTextEditorProps) {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: { levels: [2, 3] },
      }),
      Underline,
      TextStyle,
      TextAlign.configure({ types: ["heading", "paragraph"] }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: { class: "text-amber-600 underline" },
      }),
      Placeholder.configure({ placeholder }),
    ],
    content: value || "",
    editorProps: {
      attributes: {
        class: "outline-none",
      },
    },
    onUpdate({ editor }) {
      const html = editor.getHTML();
      onChange(html === "<p></p>" ? "" : html);
    },
    immediatelyRender: false,
  });

  // Sync external value changes (e.g. reset form)
  useEffect(() => {
    if (!editor) return;
    const current = editor.getHTML();
    if (current !== value && (value ?? "") !== (current === "<p></p>" ? "" : current)) {
      editor.commands.setContent(value || "");
    }
  }, [value, editor]);

  const setLink = useCallback(() => {
    if (!editor) return;
    const prev = editor.getAttributes("link").href as string | undefined;
    const url  = window.prompt("URL do link:", prev ?? "https://");
    if (url === null) return;
    if (url === "") { editor.chain().focus().unsetLink().run(); return; }
    editor.chain().focus().setLink({ href: url }).run();
  }, [editor]);

  if (!editor) return null;

  const can = editor.can().chain().focus();

  return (
    <div className="overflow-hidden rounded-lg border border-zinc-200 bg-white transition-colors focus-within:border-amber-400 focus-within:ring-1 focus-within:ring-amber-400/30 dark:border-zinc-800 dark:bg-zinc-900">

      {/* ── Toolbar ── */}
      <div className="flex flex-wrap items-center gap-0.5 border-b border-zinc-200 bg-zinc-50 px-2 py-1.5 dark:border-zinc-800 dark:bg-zinc-900/80">

        {/* Histórico */}
        <ToolBtn title="Desfazer (⌘Z)"  onClick={() => editor.chain().focus().undo().run()} disabled={!can.undo().run()}>
          <Undo size={14} />
        </ToolBtn>
        <ToolBtn title="Refazer (⌘⇧Z)" onClick={() => editor.chain().focus().redo().run()} disabled={!can.redo().run()}>
          <Redo size={14} />
        </ToolBtn>

        <Divider />

        {/* Títulos */}
        <ToolBtn title="Título H2" onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} active={editor.isActive("heading", { level: 2 })}>
          <Heading2 size={14} />
        </ToolBtn>
        <ToolBtn title="Título H3" onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()} active={editor.isActive("heading", { level: 3 })}>
          <Heading3 size={14} />
        </ToolBtn>

        <Divider />

        {/* Formatação */}
        <ToolBtn title="Negrito (⌘B)" onClick={() => editor.chain().focus().toggleBold().run()} active={editor.isActive("bold")}>
          <Bold size={14} />
        </ToolBtn>
        <ToolBtn title="Itálico (⌘I)" onClick={() => editor.chain().focus().toggleItalic().run()} active={editor.isActive("italic")}>
          <Italic size={14} />
        </ToolBtn>
        <ToolBtn title="Sublinhado (⌘U)" onClick={() => editor.chain().focus().toggleUnderline().run()} active={editor.isActive("underline")}>
          <UnderlineIcon size={14} />
        </ToolBtn>
        <ToolBtn title="Tachado" onClick={() => editor.chain().focus().toggleStrike().run()} active={editor.isActive("strike")}>
          <Strikethrough size={14} />
        </ToolBtn>

        <Divider />

        {/* Listas */}
        <ToolBtn title="Lista com marcadores" onClick={() => editor.chain().focus().toggleBulletList().run()} active={editor.isActive("bulletList")}>
          <List size={14} />
        </ToolBtn>
        <ToolBtn title="Lista numerada" onClick={() => editor.chain().focus().toggleOrderedList().run()} active={editor.isActive("orderedList")}>
          <ListOrdered size={14} />
        </ToolBtn>

        <Divider />

        {/* Alinhamento */}
        <ToolBtn title="Alinhar à esquerda" onClick={() => editor.chain().focus().setTextAlign("left").run()} active={editor.isActive({ textAlign: "left" })}>
          <AlignLeft size={14} />
        </ToolBtn>
        <ToolBtn title="Centralizar" onClick={() => editor.chain().focus().setTextAlign("center").run()} active={editor.isActive({ textAlign: "center" })}>
          <AlignCenter size={14} />
        </ToolBtn>
        <ToolBtn title="Alinhar à direita" onClick={() => editor.chain().focus().setTextAlign("right").run()} active={editor.isActive({ textAlign: "right" })}>
          <AlignRight size={14} />
        </ToolBtn>

        <Divider />

        {/* Link */}
        <ToolBtn title="Inserir link" onClick={setLink} active={editor.isActive("link")}>
          <Link2 size={14} />
        </ToolBtn>
        {editor.isActive("link") && (
          <ToolBtn title="Remover link" onClick={() => editor.chain().focus().unsetLink().run()}>
            <Link2Off size={14} />
          </ToolBtn>
        )}

        <Divider />

        {/* Extras */}
        <ToolBtn title="Citação" onClick={() => editor.chain().focus().toggleBlockquote().run()} active={editor.isActive("blockquote")}>
          <Quote size={14} />
        </ToolBtn>
        <ToolBtn title="Linha horizontal" onClick={() => editor.chain().focus().setHorizontalRule().run()}>
          <Minus size={14} />
        </ToolBtn>
      </div>

      {/* ── Content area ── */}
      <EditorContent
        editor={editor}
        style={{ minHeight }}
        className={cn(
          "px-4 py-3 font-inter text-sm text-zinc-900 dark:text-zinc-100",
          "[&_.tiptap]:outline-none",
          // headings
          "[&_.tiptap_h2]:mb-2 [&_.tiptap_h2]:mt-5 [&_.tiptap_h2]:font-cormorant [&_.tiptap_h2]:text-2xl [&_.tiptap_h2]:font-semibold [&_.tiptap_h2]:text-zinc-900 dark:[&_.tiptap_h2]:text-zinc-100",
          "[&_.tiptap_h3]:mb-1.5 [&_.tiptap_h3]:mt-4 [&_.tiptap_h3]:font-cormorant [&_.tiptap_h3]:text-xl [&_.tiptap_h3]:font-semibold [&_.tiptap_h3]:text-zinc-900 dark:[&_.tiptap_h3]:text-zinc-100",
          // paragraph
          "[&_.tiptap_p]:mb-3 [&_.tiptap_p]:leading-relaxed",
          // lists
          "[&_.tiptap_ul]:mb-3 [&_.tiptap_ul]:list-disc [&_.tiptap_ul]:pl-5",
          "[&_.tiptap_ol]:mb-3 [&_.tiptap_ol]:list-decimal [&_.tiptap_ol]:pl-5",
          "[&_.tiptap_li]:mb-1",
          // blockquote
          "[&_.tiptap_blockquote]:border-l-2 [&_.tiptap_blockquote]:border-amber-400 [&_.tiptap_blockquote]:pl-4 [&_.tiptap_blockquote]:italic [&_.tiptap_blockquote]:text-zinc-500",
          // hr
          "[&_.tiptap_hr]:my-4 [&_.tiptap_hr]:border-zinc-200 dark:[&_.tiptap_hr]:border-zinc-700",
          // link
          "[&_.tiptap_a]:text-amber-600 [&_.tiptap_a]:underline",
          // placeholder
          "[&_.tiptap_p.is-editor-empty:first-child::before]:pointer-events-none [&_.tiptap_p.is-editor-empty:first-child::before]:float-left [&_.tiptap_p.is-editor-empty:first-child::before]:h-0 [&_.tiptap_p.is-editor-empty:first-child::before]:text-zinc-400 [&_.tiptap_p.is-editor-empty:first-child::before]:content-[attr(data-placeholder)]",
        )}
      />
    </div>
  );
}

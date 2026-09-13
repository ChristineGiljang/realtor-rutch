"use client";

import { useCallback, useRef, useState } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import TiptapImage from "@tiptap/extension-image";
import TiptapLink from "@tiptap/extension-link";
import Placeholder from "@tiptap/extension-placeholder";
import {
  Bold,
  Italic,
  Heading2,
  Heading3,
  Heading4,
  List,
  ListOrdered,
  Quote,
  Link as LinkIcon,
  Image as ImageIcon,
  Undo2,
  Redo2,
  Pilcrow,
} from "lucide-react";

interface Props {
  content: string;
  onChange: (html: string) => void;
  placeholder?: string;
}

export default function RichTextEditor({
  content,
  onChange,
  placeholder,
}: Props) {
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      // H1 is the post title (rendered separately) — the body only ever
      // needs H2/H3/H4, matching a typical SEO outline.
      StarterKit.configure({
        heading: { levels: [2, 3, 4] },
      }),
      TiptapImage.configure({ inline: false }),
      TiptapLink.configure({ openOnClick: false, autolink: true }),
      Placeholder.configure({
        placeholder: placeholder || "Write your post here…",
      }),
    ],
    content,
    onUpdate: ({ editor }) => onChange(editor.getHTML()),
    editorProps: {
      attributes: {
        class:
          "blog-content min-h-[400px] px-4 py-3 focus:outline-none text-sm",
      },
    },
  });

  const uploadImage = useCallback(
    async (file: File) => {
      if (!editor) return;
      setUploading(true);
      try {
        const formData = new FormData();
        formData.set("file", file);
        const res = await fetch("/api/blog/upload-image", {
          method: "POST",
          body: formData,
        });

        const raw = await res.text();
        let data: { url?: string; error?: string } = {};
        try {
          data = raw ? JSON.parse(raw) : {};
        } catch {
          // Response wasn't JSON at all (e.g. a server crash page) —
          // fall through and surface the status code below instead.
        }

        if (!res.ok || !data.url) {
          throw new Error(data.error || `Upload failed (status ${res.status})`);
        }

        editor.chain().focus().setImage({ src: data.url, alt: "" }).run();
      } catch (err) {
        alert(err instanceof Error ? err.message : "Image upload failed");
      } finally {
        setUploading(false);
      }
    },
    [editor],
  );

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) uploadImage(file);
    e.target.value = "";
  };

  const addLink = () => {
    if (!editor) return;
    const previousUrl = editor.getAttributes("link").href as string | undefined;
    const url = window.prompt("Link URL", previousUrl || "https://");
    if (url === null) return;
    if (url === "") {
      editor.chain().focus().extendMarkRange("link").unsetLink().run();
      return;
    }
    editor.chain().focus().extendMarkRange("link").setLink({ href: url }).run();
  };

  if (!editor) return null;

  const btnClass = (active: boolean) =>
    `p-2 border border-[#E2D9C8] transition ${
      active
        ? "bg-[#1A1A1A] text-[#F5F0E8]"
        : "bg-white text-[#8B7355] hover:bg-[#F5F0E8]"
    }`;

  return (
    <div className="border border-[#E2D9C8] bg-white">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-1.5 p-2 border-b border-[#E2D9C8] bg-[#faf9f6]">
        <button
          type="button"
          title="Paragraph"
          onClick={() => editor.chain().focus().setParagraph().run()}
          className={btnClass(editor.isActive("paragraph"))}
        >
          <Pilcrow size={15} />
        </button>
        <button
          type="button"
          title="Heading 2 (H2 — main section)"
          onClick={() =>
            editor.chain().focus().toggleHeading({ level: 2 }).run()
          }
          className={btnClass(editor.isActive("heading", { level: 2 }))}
        >
          <Heading2 size={15} />
        </button>
        <button
          type="button"
          title="Heading 3 (H3 — subsection)"
          onClick={() =>
            editor.chain().focus().toggleHeading({ level: 3 }).run()
          }
          className={btnClass(editor.isActive("heading", { level: 3 }))}
        >
          <Heading3 size={15} />
        </button>
        <button
          type="button"
          title="Heading 4 (H4 — supporting point)"
          onClick={() =>
            editor.chain().focus().toggleHeading({ level: 4 }).run()
          }
          className={btnClass(editor.isActive("heading", { level: 4 }))}
        >
          <Heading4 size={15} />
        </button>

        <div className="w-px h-5 bg-[#E2D9C8] mx-1" />

        <button
          type="button"
          title="Bold"
          onClick={() => editor.chain().focus().toggleBold().run()}
          className={btnClass(editor.isActive("bold"))}
        >
          <Bold size={15} />
        </button>
        <button
          type="button"
          title="Italic"
          onClick={() => editor.chain().focus().toggleItalic().run()}
          className={btnClass(editor.isActive("italic"))}
        >
          <Italic size={15} />
        </button>

        <div className="w-px h-5 bg-[#E2D9C8] mx-1" />

        <button
          type="button"
          title="Bullet list"
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          className={btnClass(editor.isActive("bulletList"))}
        >
          <List size={15} />
        </button>
        <button
          type="button"
          title="Numbered list"
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          className={btnClass(editor.isActive("orderedList"))}
        >
          <ListOrdered size={15} />
        </button>
        <button
          type="button"
          title="Quote"
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
          className={btnClass(editor.isActive("blockquote"))}
        >
          <Quote size={15} />
        </button>

        <div className="w-px h-5 bg-[#E2D9C8] mx-1" />

        <button
          type="button"
          title="Link"
          onClick={addLink}
          className={btnClass(editor.isActive("link"))}
        >
          <LinkIcon size={15} />
        </button>
        <button
          type="button"
          title="Insert image"
          disabled={uploading}
          onClick={() => fileInputRef.current?.click()}
          className={`${btnClass(false)} ${uploading ? "opacity-50" : ""}`}
        >
          <ImageIcon size={15} />
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleFileChange}
        />

        <div className="w-px h-5 bg-[#E2D9C8] mx-1" />

        <button
          type="button"
          title="Undo"
          onClick={() => editor.chain().focus().undo().run()}
          className={btnClass(false)}
        >
          <Undo2 size={15} />
        </button>
        <button
          type="button"
          title="Redo"
          onClick={() => editor.chain().focus().redo().run()}
          className={btnClass(false)}
        >
          <Redo2 size={15} />
        </button>

        {uploading && (
          <span className="text-xs text-[#8B7355] ml-2">Uploading image…</span>
        )}
      </div>

      <EditorContent editor={editor} />
    </div>
  );
}

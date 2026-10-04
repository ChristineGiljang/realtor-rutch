"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import RichTextEditor from "./RichTextEditor";

interface Props {
  mode: "create" | "edit";
  postId?: string;
  initialValues?: {
    title: string;
    content: string;
    coverImage: string | null;
    coverPositionX?: number;
    coverPositionY?: number;
    published: boolean;
  };
}

const clamp = (n: number) => Math.min(100, Math.max(0, n));

/**
 * Banner preview you can drag to choose which part of the cover image shows.
 * The frame uses roughly the same proportions as the public banner, and the
 * result is saved as an object-position percentage (x, y).
 */
function CoverPositioner({
  src,
  x,
  y,
  onChange,
}: {
  src: string;
  x: number;
  y: number;
  onChange: (x: number, y: number) => void;
}) {
  const frameRef = useRef<HTMLDivElement>(null);
  const [natural, setNatural] = useState<{ w: number; h: number } | null>(null);
  const [dragging, setDragging] = useState(false);
  const drag = useRef<{ px: number; py: number; x: number; y: number } | null>(
    null,
  );

  // How many pixels of the image are cropped off on each axis (object-cover).
  const getOverflow = () => {
    const frame = frameRef.current;
    if (!frame || !natural) return { ox: 0, oy: 0 };
    const fw = frame.clientWidth;
    const fh = frame.clientHeight;
    const scale = Math.max(fw / natural.w, fh / natural.h);
    return {
      ox: Math.max(0, natural.w * scale - fw),
      oy: Math.max(0, natural.h * scale - fh),
    };
  };

  const onPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    e.currentTarget.setPointerCapture(e.pointerId);
    drag.current = { px: e.clientX, py: e.clientY, x, y };
    setDragging(true);
  };

  const onPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!drag.current) return;
    const { ox, oy } = getOverflow();
    const dx = e.clientX - drag.current.px;
    const dy = e.clientY - drag.current.py;
    // Dragging right reveals more of the left side, so subtract.
    const nx =
      ox > 0 ? clamp(drag.current.x - (dx / ox) * 100) : drag.current.x;
    const ny =
      oy > 0 ? clamp(drag.current.y - (dy / oy) * 100) : drag.current.y;
    onChange(Math.round(nx), Math.round(ny));
  };

  const endDrag = () => {
    drag.current = null;
    setDragging(false);
  };

  // Keyboard support: arrow keys nudge the position.
  const onKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    const step = e.shiftKey ? 10 : 2;
    if (e.key === "ArrowLeft") onChange(clamp(x - step), y);
    else if (e.key === "ArrowRight") onChange(clamp(x + step), y);
    else if (e.key === "ArrowUp") onChange(x, clamp(y - step));
    else if (e.key === "ArrowDown") onChange(x, clamp(y + step));
    else return;
    e.preventDefault();
  };

  return (
    <div className="mb-3">
      <div
        ref={frameRef}
        tabIndex={0}
        role="slider"
        aria-label="Cover image position. Drag, or use the arrow keys."
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={y}
        aria-valuetext={`${x}% horizontal, ${y}% vertical`}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={endDrag}
        onPointerCancel={endDrag}
        onKeyDown={onKeyDown}
        style={{ touchAction: "none" }}
        className={`relative w-full aspect-[1440/420] overflow-hidden border border-[#E2D9C8] bg-[#E2D9C8] select-none focus:outline-none focus:border-[#C9A96E] ${
          dragging ? "cursor-grabbing" : "cursor-grab"
        }`}
      >
        <img
          src={src}
          alt="Cover preview"
          draggable={false}
          onLoad={(e) =>
            setNatural({
              w: e.currentTarget.naturalWidth,
              h: e.currentTarget.naturalHeight,
            })
          }
          className="w-full h-full object-cover pointer-events-none"
          style={{ objectPosition: `${x}% ${y}%` }}
        />
        {!dragging && (
          <span className="absolute left-2 bottom-2 bg-[#1A1A1A]/70 text-[#F5F0E8] text-[11px] tracking-wider uppercase px-2 py-1 pointer-events-none">
            Drag to reposition
          </span>
        )}
      </div>
      <div className="flex items-center justify-between mt-2">
        <p className="text-xs text-[#8B7355]">
          Drag the image (or use the arrow keys) to choose what shows in the
          banner. On phones the banner is narrower, so more is cropped from the
          sides.
        </p>
        <button
          type="button"
          onClick={() => onChange(50, 50)}
          className="text-xs text-[#8B7355] underline underline-offset-2 hover:text-[#1A1A1A] ml-4 shrink-0"
        >
          Reset
        </button>
      </div>
    </div>
  );
}

export default function BlogForm({ mode, postId, initialValues }: Props) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [preview, setPreview] = useState<string | null>(
    initialValues?.coverImage ?? null,
  );
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [content, setContent] = useState(initialValues?.content ?? "");
  const [posX, setPosX] = useState(initialValues?.coverPositionX ?? 50);
  const [posY, setPosY] = useState(initialValues?.coverPositionY ?? 50);

  const inputClass =
    "w-full bg-white border border-[#E2D9C8] text-[#1A1A1A] text-sm px-4 py-3 focus:outline-none focus:border-[#C9A96E] placeholder:text-[#8B7355]";
  const labelClass =
    "block text-xs tracking-widest uppercase text-[#8B7355] mb-2";

  const handleCoverChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setCoverFile(file);
    setPreview(URL.createObjectURL(file));
    // New image: start centered again.
    setPosX(50);
    setPosY(50);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const isContentEmpty = content.replace(/<[^>]*>/g, "").trim().length === 0;
    if (isContentEmpty) {
      setError("Content is required.");
      return;
    }

    setLoading(true);
    setError("");

    const form = e.currentTarget;
    const formData = new FormData(form);
    formData.set("content", content);
    if (coverFile) formData.set("coverImage", coverFile);

    try {
      const url = mode === "create" ? "/api/blog" : `/api/blog/${postId}`;
      const method = mode === "create" ? "POST" : "PATCH";

      const res = await fetch(url, { method, body: formData });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Something went wrong");

      router.push("/admin/blog");
      router.refresh();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-10">
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 text-sm">
          {error}
        </div>
      )}

      {/* Title */}
      <section>
        <h2 className="text-lg font-semibold mb-6 pb-2 border-b border-[#E2D9C8] text-[#1A1A1A]">
          Post
        </h2>
        <div className="space-y-6">
          <div>
            <label className={labelClass}>Title *</label>
            <input
              name="title"
              required
              defaultValue={initialValues?.title}
              placeholder="e.g. How to Check if a Property Title is Clean in Cebu"
              className={inputClass}
            />
          </div>

          <div>
            <label className={labelClass}>Cover Image</label>
            {preview && (
              <>
                <CoverPositioner
                  src={preview}
                  x={posX}
                  y={posY}
                  onChange={(nx, ny) => {
                    setPosX(nx);
                    setPosY(ny);
                  }}
                />
                <input type="hidden" name="coverPositionX" value={posX} />
                <input type="hidden" name="coverPositionY" value={posY} />
              </>
            )}
            <input
              type="file"
              accept="image/*"
              onChange={handleCoverChange}
              className="w-full text-sm text-[#8B7355] file:mr-4 file:py-2 file:px-4 file:border file:border-[#E2D9C8] file:bg-[#1A1A1A] file:text-[#F5F0E8] file:text-sm file:cursor-pointer hover:file:bg-[#C9A96E] file:transition"
            />
            <p className="text-xs text-[#8B7355] mt-2">
              {mode === "edit"
                ? "Leave blank to keep the current cover image."
                : "Optional — recommended for blog and social previews."}
            </p>
          </div>

          <div>
            <label className={labelClass}>Content *</label>
            <RichTextEditor
              content={content}
              onChange={setContent}
              placeholder="Write the post here. Use H2/H3/H4 for your SEO outline, and the image button to drop photos into the body."
            />
          </div>

          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              id="published"
              name="published"
              value="true"
              defaultChecked={initialValues?.published ?? false}
              className="w-4 h-4"
            />
            <label
              htmlFor="published"
              className="text-sm text-[#1A1A1A] cursor-pointer"
            >
              Publish now (visible on the public blog and included in the
              sitemap)
            </label>
          </div>
        </div>
      </section>

      <div className="flex items-center gap-4">
        <button
          type="submit"
          disabled={loading}
          className="bg-[#1A1A1A] text-[#F5F0E8] text-sm tracking-widest uppercase px-8 py-4 hover:bg-[#C9A96E] transition disabled:opacity-50"
        >
          {loading
            ? "Saving..."
            : mode === "create"
              ? "Create Post"
              : "Save Changes"}
        </button>
      </div>
    </form>
  );
}

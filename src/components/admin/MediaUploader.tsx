"use client";

// ===========================================================================
//  MediaUploader — upload avec aperçu, suppression, réorganisation.
//   - mode "single"  : une seule image (logo / couverture).
//   - mode "gallery" : plusieurs médias, drag & drop pour réordonner.
//  Compresse les images côté client avant upload.
// ===========================================================================

import { useRef, useState } from "react";
import Image from "next/image";
import {
  UploadCloud,
  Loader2,
  Trash2,
  GripVertical,
  ArrowUp,
  ArrowDown,
} from "lucide-react";
import { uploadFile, removeFileByUrl } from "@/lib/upload";
import { useToast } from "@/components/ui/Toaster";
import type { MediaType } from "@/types";

interface GalleryItem {
  key: string;
  media_url: string;
  media_type: MediaType;
  alt_text: string;
}

// --------------------------------------------------------------------------
//  Image unique (logo / couverture)
// --------------------------------------------------------------------------
export function SingleImageUploader({
  name,
  defaultValue = "",
  folder = "covers",
  label,
}: {
  name: string;
  defaultValue?: string;
  folder?: string;
  label?: string;
}) {
  const [url, setUrl] = useState(defaultValue);
  const [busy, setBusy] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleFile = async (file: File) => {
    setBusy(true);
    try {
      const res = await uploadFile(file, folder);
      setUrl(res.url);
    } catch (e) {
      toast(e instanceof Error ? e.message : "Échec de l'upload.", "error");
    } finally {
      setBusy(false);
    }
  };

  const handleRemove = async () => {
    if (url) removeFileByUrl(url).catch(() => {});
    setUrl("");
  };

  return (
    <div>
      {label && <span className="label">{label}</span>}
      <input type="hidden" name={name} value={url} readOnly />
      <div className="flex items-center gap-4">
        <div className="relative flex h-24 w-24 flex-none items-center justify-center overflow-hidden rounded-lg border border-ink-700/60 bg-ink-900">
          {url ? (
            <Image src={url} alt="" fill className="object-contain p-1" sizes="96px" />
          ) : (
            <span className="text-xs text-ink-500">Aucune</span>
          )}
          {busy && (
            <div className="absolute inset-0 flex items-center justify-center bg-ink-950/70">
              <Loader2 size={18} className="animate-spin text-paper" />
            </div>
          )}
        </div>
        <div className="flex flex-col gap-2">
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            className="inline-flex items-center gap-2 rounded-lg border border-ink-700/60 px-3 py-2 text-sm text-paper transition-colors hover:border-paper/60"
          >
            <UploadCloud size={15} /> {url ? "Remplacer" : "Téléverser"}
          </button>
          {url && (
            <button
              type="button"
              onClick={handleRemove}
              className="inline-flex items-center gap-1.5 text-xs text-red-300 hover:text-red-200"
            >
              <Trash2 size={13} /> Supprimer
            </button>
          )}
        </div>
      </div>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) handleFile(f);
          e.target.value = "";
        }}
      />
    </div>
  );
}

// --------------------------------------------------------------------------
//  Galerie multiple
// --------------------------------------------------------------------------
export function MediaUploader({
  name = "media_json",
  initial = [],
  folder = "gallery",
}: {
  name?: string;
  initial?: { media_url: string; media_type: MediaType; alt_text: string | null }[];
  folder?: string;
}) {
  const [items, setItems] = useState<GalleryItem[]>(
    initial.map((m, i) => ({
      key: `init-${i}`,
      media_url: m.media_url,
      media_type: m.media_type,
      alt_text: m.alt_text || "",
    })),
  );
  const [busy, setBusy] = useState(false);
  const dragIndex = useRef<number | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const serialized = JSON.stringify(
    items.map((it, i) => ({
      media_url: it.media_url,
      media_type: it.media_type,
      alt_text: it.alt_text,
      display_order: i,
    })),
  );

  const handleFiles = async (files: FileList) => {
    setBusy(true);
    try {
      for (const file of Array.from(files)) {
        const res = await uploadFile(file, folder);
        setItems((prev) => [
          ...prev,
          {
            key: res.path,
            media_url: res.url,
            media_type: res.type,
            alt_text: "",
          },
        ]);
      }
    } catch (e) {
      toast(e instanceof Error ? e.message : "Échec de l'upload.", "error");
    } finally {
      setBusy(false);
    }
  };

  const remove = (key: string) => {
    const item = items.find((i) => i.key === key);
    if (item) removeFileByUrl(item.media_url).catch(() => {});
    setItems((prev) => prev.filter((i) => i.key !== key));
  };

  const move = (from: number, to: number) => {
    if (to < 0 || to >= items.length) return;
    setItems((prev) => {
      const next = [...prev];
      const [moved] = next.splice(from, 1);
      next.splice(to, 0, moved);
      return next;
    });
  };

  const setAlt = (key: string, alt: string) =>
    setItems((prev) =>
      prev.map((i) => (i.key === key ? { ...i, alt_text: alt } : i)),
    );

  return (
    <div>
      <input type="hidden" name={name} value={serialized} readOnly />

      <div className="mb-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
        {items.map((it, i) => (
          <div
            key={it.key}
            draggable
            onDragStart={() => (dragIndex.current = i)}
            onDragOver={(e) => e.preventDefault()}
            onDrop={() => {
              if (dragIndex.current !== null) move(dragIndex.current, i);
              dragIndex.current = null;
            }}
            className="flex gap-3 rounded-lg border border-ink-700/60 bg-ink-900/60 p-3"
          >
            <div className="flex flex-col items-center justify-between text-ink-500">
              <GripVertical size={16} className="cursor-grab" />
              <div className="flex flex-col">
                <button type="button" onClick={() => move(i, i - 1)} aria-label="Monter">
                  <ArrowUp size={14} />
                </button>
                <button type="button" onClick={() => move(i, i + 1)} aria-label="Descendre">
                  <ArrowDown size={14} />
                </button>
              </div>
            </div>
            <div className="relative h-16 w-16 flex-none overflow-hidden rounded bg-ink-950">
              {it.media_type === "video" ? (
                <video src={it.media_url} className="h-full w-full object-cover" muted />
              ) : (
                <Image src={it.media_url} alt="" fill className="object-cover" sizes="64px" />
              )}
            </div>
            <div className="flex flex-1 flex-col gap-2">
              <input
                value={it.alt_text}
                onChange={(e) => setAlt(it.key, e.target.value)}
                placeholder="Texte alternatif"
                className="w-full rounded border border-ink-700/60 bg-ink-950 px-2 py-1 text-xs text-paper placeholder:text-ink-500 focus:outline-none"
              />
              <button
                type="button"
                onClick={() => remove(it.key)}
                className="inline-flex w-fit items-center gap-1 text-xs text-red-300 hover:text-red-200"
              >
                <Trash2 size={12} /> Retirer
              </button>
            </div>
          </div>
        ))}
      </div>

      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        disabled={busy}
        className="inline-flex items-center gap-2 rounded-lg border border-dashed border-ink-600/70 px-4 py-3 text-sm text-ink-300 transition-colors hover:border-paper/60 hover:text-paper disabled:opacity-60"
      >
        {busy ? <Loader2 size={15} className="animate-spin" /> : <UploadCloud size={15} />}
        Ajouter des médias (images, vidéos)
      </button>
      <input
        ref={inputRef}
        type="file"
        accept="image/*,video/*"
        multiple
        className="hidden"
        onChange={(e) => {
          if (e.target.files?.length) handleFiles(e.target.files);
          e.target.value = "";
        }}
      />
    </div>
  );
}

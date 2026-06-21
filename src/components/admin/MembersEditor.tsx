"use client";

// ===========================================================================
//  MembersEditor — gestion de l'équipe d'un projet (admin).
//  Avatar (upload), nom, rôle, lien, description, réorganisation.
//  Sérialise vers un champ caché `members_json` consommé par saveProjectAction.
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
  UserPlus,
} from "lucide-react";
import { uploadFile, removeFileByUrl } from "@/lib/upload";
import { useToast } from "@/components/ui/Toaster";
import type { ProjectMember } from "@/types";

const ROLE_SUGGESTIONS = [
  "Owner",
  "Co-owner",
  "Admin",
  "Modérateur",
  "Développeur",
  "Designer",
  "Créateur",
  "Collaborateur",
];

interface Item {
  key: string;
  name: string;
  role: string;
  avatar_url: string;
  link: string;
  description: string;
}

let counter = 0;
const newItem = (): Item => ({
  key: `new-${++counter}`,
  name: "",
  role: "",
  avatar_url: "",
  link: "",
  description: "",
});

export function MembersEditor({
  name = "members_json",
  initial = [],
}: {
  name?: string;
  initial?: ProjectMember[];
}) {
  const [items, setItems] = useState<Item[]>(
    initial.map((m, i) => ({
      key: `init-${i}`,
      name: m.name,
      role: m.role ?? "",
      avatar_url: m.avatar_url ?? "",
      link: m.link ?? "",
      description: m.description ?? "",
    })),
  );
  const [busyKey, setBusyKey] = useState<string | null>(null);
  const dragIndex = useRef<number | null>(null);
  const { toast } = useToast();

  const serialized = JSON.stringify(
    items
      .filter((it) => it.name.trim())
      .map((it, i) => ({
        name: it.name.trim(),
        role: it.role.trim() || null,
        avatar_url: it.avatar_url || null,
        link: it.link.trim() || null,
        description: it.description.trim() || null,
        display_order: i,
      })),
  );

  const patch = (key: string, changes: Partial<Item>) =>
    setItems((prev) => prev.map((it) => (it.key === key ? { ...it, ...changes } : it)));

  const move = (from: number, to: number) => {
    if (to < 0 || to >= items.length) return;
    setItems((prev) => {
      const next = [...prev];
      const [m] = next.splice(from, 1);
      next.splice(to, 0, m);
      return next;
    });
  };

  const remove = (item: Item) => {
    if (item.avatar_url) removeFileByUrl(item.avatar_url).catch(() => {});
    setItems((prev) => prev.filter((it) => it.key !== item.key));
  };

  const uploadAvatar = async (key: string, file: File) => {
    setBusyKey(key);
    try {
      const res = await uploadFile(file, "members");
      patch(key, { avatar_url: res.url });
    } catch (e) {
      toast(e instanceof Error ? e.message : "Échec de l'upload.", "error");
    } finally {
      setBusyKey(null);
    }
  };

  return (
    <div>
      <input type="hidden" name={name} value={serialized} readOnly />

      <div className="space-y-3">
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
            className="rounded-xl border border-ink-700/60 bg-ink-900/60 p-3"
          >
            <div className="flex gap-3">
              <div className="flex flex-col items-center gap-1 pt-1 text-ink-500">
                <GripVertical size={15} className="cursor-grab" />
                <button type="button" onClick={() => move(i, i - 1)} aria-label="Monter">
                  <ArrowUp size={14} />
                </button>
                <button type="button" onClick={() => move(i, i + 1)} aria-label="Descendre">
                  <ArrowDown size={14} />
                </button>
              </div>

              {/* Avatar */}
              <AvatarPicker
                url={it.avatar_url}
                busy={busyKey === it.key}
                onPick={(file) => uploadAvatar(it.key, file)}
                onClear={() => {
                  if (it.avatar_url) removeFileByUrl(it.avatar_url).catch(() => {});
                  patch(it.key, { avatar_url: "" });
                }}
              />

              <div className="grid flex-1 grid-cols-1 gap-2 sm:grid-cols-2">
                <input
                  value={it.name}
                  onChange={(e) => patch(it.key, { name: e.target.value })}
                  placeholder="Nom ou pseudo"
                  className="field py-2"
                />
                <input
                  value={it.role}
                  onChange={(e) => patch(it.key, { role: e.target.value })}
                  placeholder="Rôle (Owner, Designer…)"
                  list="member-roles"
                  className="field py-2"
                />
                <input
                  value={it.link}
                  onChange={(e) => patch(it.key, { link: e.target.value })}
                  placeholder="Lien (facultatif)"
                  className="field py-2 sm:col-span-2"
                />
                <input
                  value={it.description}
                  onChange={(e) => patch(it.key, { description: e.target.value })}
                  placeholder="Description courte (facultatif)"
                  className="field py-2 sm:col-span-2"
                />
              </div>

              <button
                type="button"
                onClick={() => remove(it)}
                aria-label="Retirer le membre"
                className="self-start rounded-lg p-2 text-ink-500 transition-colors hover:text-red-300"
              >
                <Trash2 size={16} />
              </button>
            </div>
          </div>
        ))}
      </div>

      <datalist id="member-roles">
        {ROLE_SUGGESTIONS.map((r) => (
          <option key={r} value={r} />
        ))}
      </datalist>

      <button
        type="button"
        onClick={() => setItems((prev) => [...prev, newItem()])}
        className="mt-3 inline-flex items-center gap-2 rounded-lg border border-dashed border-ink-600/70 px-4 py-2.5 text-sm text-ink-300 transition-colors hover:border-paper/60 hover:text-paper"
      >
        <UserPlus size={15} /> Ajouter un membre
      </button>
    </div>
  );
}

function AvatarPicker({
  url,
  busy,
  onPick,
  onClear,
}: {
  url: string;
  busy: boolean;
  onPick: (file: File) => void;
  onClear: () => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  return (
    <div className="flex-none">
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        className="relative flex h-14 w-14 items-center justify-center overflow-hidden rounded-full border border-ink-700/60 bg-ink-950 text-ink-500 transition-colors hover:border-paper/50"
        aria-label="Avatar du membre"
      >
        {url ? (
          <Image src={url} alt="" fill className="object-cover" sizes="56px" />
        ) : (
          <UploadCloud size={16} />
        )}
        {busy && (
          <span className="absolute inset-0 flex items-center justify-center bg-ink-950/70">
            <Loader2 size={16} className="animate-spin text-paper" />
          </span>
        )}
      </button>
      {url && (
        <button
          type="button"
          onClick={onClear}
          className="mt-1 block w-14 text-center text-[0.6rem] text-red-300 hover:text-red-200"
        >
          retirer
        </button>
      )}
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) onPick(f);
          e.target.value = "";
        }}
      />
    </div>
  );
}

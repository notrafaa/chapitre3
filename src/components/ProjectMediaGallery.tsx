"use client";

// ===========================================================================
//  ProjectMediaGallery — galerie de visuels/vidéos avec lightbox.
// ===========================================================================

import Image from "next/image";
import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";
import type { ProjectMedia } from "@/types";

export function ProjectMediaGallery({ media }: { media: ProjectMedia[] }) {
  const [active, setActive] = useState<ProjectMedia | null>(null);
  if (!media.length) return null;

  return (
    <>
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
        {media.map((m) => (
          <button
            key={m.id}
            onClick={() => m.media_type === "image" && setActive(m)}
            className="group relative aspect-[4/3] overflow-hidden rounded-lg border border-ink-800/70 bg-ink-900"
          >
            {m.media_type === "video" ? (
              <video
                src={m.media_url}
                className="h-full w-full object-cover"
                muted
                loop
                playsInline
                autoPlay
              />
            ) : (
              <Image
                src={m.media_url}
                alt={m.alt_text || "Visuel du projet"}
                fill
                sizes="(max-width: 768px) 50vw, 33vw"
                className="object-cover transition-transform duration-700 ease-book group-hover:scale-105"
              />
            )}
          </button>
        ))}
      </div>

      <AnimatePresence>
        {active && (
          <motion.div
            className="fixed inset-0 z-[80] flex items-center justify-center bg-ink-950/95 p-6 backdrop-blur"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setActive(null)}
            role="dialog"
            aria-modal="true"
          >
            <button
              className="absolute right-6 top-6 text-ink-300 hover:text-paper"
              onClick={() => setActive(null)}
              aria-label="Fermer"
            >
              <X size={28} />
            </button>
            <motion.div
              className="relative h-[80vh] w-full max-w-5xl"
              initial={{ scale: 0.96, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.96, opacity: 0 }}
              transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
              onClick={(e) => e.stopPropagation()}
            >
              <Image
                src={active.media_url}
                alt={active.alt_text || "Visuel du projet"}
                fill
                sizes="100vw"
                className="object-contain"
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

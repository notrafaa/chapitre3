"use client";

// ===========================================================================
//  SoundToggle — coupe / réactive la musique d'ambiance (préférence sauvée).
// ===========================================================================

import { Volume2, VolumeX } from "lucide-react";
import { useSound } from "@/components/providers/SoundProvider";
import { cn } from "@/lib/utils";

export function SoundToggle({
  className,
  withLabel = false,
}: {
  className?: string;
  withLabel?: boolean;
}) {
  const { enabled, toggle } = useSound();

  return (
    <button
      onClick={toggle}
      aria-pressed={enabled}
      aria-label={enabled ? "Couper la musique" : "Activer la musique"}
      title={enabled ? "Couper la musique" : "Activer la musique"}
      className={cn(
        "control-pill inline-flex items-center gap-2 text-ink-300 transition-colors duration-300 hover:text-paper",
        className,
      )}
    >
      {enabled ? <Volume2 size={16} /> : <VolumeX size={16} />}
      {withLabel && (
        <span className="text-xs uppercase tracking-[0.2em]">
          {enabled ? "Son activé" : "Son coupé"}
        </span>
      )}
    </button>
  );
}

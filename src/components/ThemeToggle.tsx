"use client";

// ===========================================================================
//  ThemeToggle — bascule thème clair / sombre.
// ===========================================================================

import { Moon, Sun } from "lucide-react";
import { useTheme } from "@/components/providers/ThemeProvider";
import { cn } from "@/lib/utils";

export function ThemeToggle({
  className,
  withLabel = false,
}: {
  className?: string;
  withLabel?: boolean;
}) {
  const { theme, toggle } = useTheme();
  const isDark = theme === "dark";

  return (
    <button
      onClick={toggle}
      aria-label={isDark ? "Activer le thème clair" : "Activer le thème sombre"}
      title={isDark ? "Thème clair" : "Thème sombre"}
      className={cn(
        "control-pill inline-flex items-center gap-2 text-ink-300 transition-colors duration-300 hover:text-paper",
        className,
      )}
    >
      {isDark ? <Sun size={16} /> : <Moon size={16} />}
      {withLabel && (
        <span className="text-xs uppercase tracking-[0.2em]">
          {isDark ? "Clair" : "Sombre"}
        </span>
      )}
    </button>
  );
}

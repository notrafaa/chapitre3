import { cn } from "@/lib/utils";

/** Bloc de chargement avec effet shimmer. */
export function Skeleton({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-lg bg-ink-800/50",
        "after:absolute after:inset-0 after:-translate-x-full after:animate-shimmer after:bg-gradient-to-r after:from-transparent after:via-ink-700/40 after:to-transparent",
        className,
      )}
    />
  );
}

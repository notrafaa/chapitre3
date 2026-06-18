import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { SITE_NAME } from "@/lib/constants";

// Ratio intrinsèque de logo_complet.png (550/1672).
const RATIO = 0.329;

/**
 * Logo Chapitre 3 — image complète « chapitre 3 » (logo_complet.png).
 * S'adapte au thème via .brand-complet (texte blanc en sombre, noir en clair).
 *
 * `height` = hauteur du logo en pixels.
 */
export function Logo({
  className,
  href = "/",
  height = 34,
  priority = false,
}: {
  className?: string;
  href?: string | null;
  height?: number;
  priority?: boolean;
}) {
  const width = Math.round(height / RATIO);

  const inner = (
    <span
      className="logo-shine-mask inline-flex"
      style={
        {
          "--logo-width": `${width}px`,
          "--logo-height": `${height}px`,
          "--logo-mask": 'url("/brand/logo_complet.png")',
        } as React.CSSProperties
      }
    >
      <Image
        src="/brand/logo_complet.png"
        alt={SITE_NAME}
        width={width}
        height={height}
        priority={priority}
        className="brand-complet w-auto select-none object-contain"
        style={{ height }}
      />
    </span>
  );

  if (href === null) {
    return <span className={cn("inline-flex", className)}>{inner}</span>;
  }

  return (
    <Link
      href={href}
      aria-label={`${SITE_NAME} — accueil`}
      className={cn(
        "inline-flex transition-opacity duration-300 hover:opacity-95",
        className,
      )}
    >
      {inner}
    </Link>
  );
}

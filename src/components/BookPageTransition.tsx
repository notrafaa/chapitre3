"use client";

// ===========================================================================
//  BookPageTransition — transition d'entrée « une page se tourne » entre les
//  pages. Léger et non bloquant : n'animera jamais au point de ralentir la
//  navigation. Respecte prefers-reduced-motion.
// ===========================================================================

import { motion, useReducedMotion } from "framer-motion";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";

export function BookPageTransition({ children }: { children: ReactNode }) {
  const reduce = useReducedMotion();
  const pathname = usePathname();

  if (reduce) return <>{children}</>;

  return (
    <motion.div
      key={pathname}
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
    >
      {children}
    </motion.div>
  );
}

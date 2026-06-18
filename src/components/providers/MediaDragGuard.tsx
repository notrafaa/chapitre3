"use client";

import { useEffect } from "react";

const MEDIA_SELECTOR = "img, picture, video, svg, canvas";

export function MediaDragGuard() {
  useEffect(() => {
    const preventMediaDrag = (event: DragEvent) => {
      const target = event.target;
      if (!(target instanceof Element)) return;
      if (target.closest(MEDIA_SELECTOR)) event.preventDefault();
    };

    document.addEventListener("dragstart", preventMediaDrag, true);
    return () => document.removeEventListener("dragstart", preventMediaDrag, true);
  }, []);

  return null;
}

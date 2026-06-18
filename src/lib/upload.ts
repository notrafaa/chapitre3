// ===========================================================================
//  Upload côté client vers Supabase Storage (avec compression d'images).
//  Utilise le client navigateur (session admin) ; soumis aux policies Storage.
// ===========================================================================

import imageCompression from "browser-image-compression";
import { createClient } from "@/lib/supabase/client";
import { STORAGE_BUCKET } from "@/lib/constants";

export interface UploadResult {
  url: string;
  path: string;
  type: "image" | "video";
}

const IMAGE_COMPRESS_OPTIONS = {
  maxSizeMB: 1.2,
  maxWidthOrHeight: 2200,
  useWebWorker: true,
};

/** Téléverse un fichier (image compressée si pertinent) et renvoie son URL publique. */
export async function uploadFile(
  file: File,
  folder = "projects",
): Promise<UploadResult> {
  const supabase = createClient();
  const isImage = file.type.startsWith("image/");
  const isSvg = file.type === "image/svg+xml";

  let toUpload: File = file;
  // Compression côté client pour les images bitmap (hors SVG).
  if (isImage && !isSvg && file.size > 200 * 1024) {
    try {
      toUpload = await imageCompression(file, IMAGE_COMPRESS_OPTIONS);
    } catch {
      toUpload = file; // en cas d'échec, on téléverse l'original
    }
  }

  const ext = file.name.split(".").pop()?.toLowerCase() || "bin";
  const id =
    typeof crypto !== "undefined" && "randomUUID" in crypto
      ? crypto.randomUUID()
      : `${Date.now()}-${Math.random().toString(36).slice(2)}`;
  const path = `${folder}/${id}.${ext}`;

  const { error } = await supabase.storage
    .from(STORAGE_BUCKET)
    .upload(path, toUpload, {
      cacheControl: "3600",
      upsert: false,
      contentType: file.type || undefined,
    });

  if (error) throw new Error(error.message);

  const { data } = supabase.storage.from(STORAGE_BUCKET).getPublicUrl(path);

  return {
    url: data.publicUrl,
    path,
    type: isImage ? "image" : "video",
  };
}

/** Supprime un objet du Storage à partir de son URL publique. */
export async function removeFileByUrl(url: string): Promise<void> {
  const supabase = createClient();
  const marker = `/storage/v1/object/public/${STORAGE_BUCKET}/`;
  const idx = url.indexOf(marker);
  if (idx === -1) return;
  const path = decodeURIComponent(url.slice(idx + marker.length));
  await supabase.storage.from(STORAGE_BUCKET).remove([path]);
}

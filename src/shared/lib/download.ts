const FALLBACK_FILE_NAME = "fokus-fayl";

/** Auth talab qiladigan fayllar blob sifatida olinadi va shu yerda saqlanadi. */
export function downloadBlob(blob: Blob | null | undefined, fileName = FALLBACK_FILE_NAME): boolean {
  if (typeof document === "undefined" || !blob) return false;
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = fileName || FALLBACK_FILE_NAME;
  anchor.rel = "noopener";
  document.body.append(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(url);
  return true;
}

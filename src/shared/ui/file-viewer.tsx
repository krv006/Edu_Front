import { useEffect, useState } from "react";
import { FileQuestion, Loader2 } from "lucide-react";
import {
  blobForViewing,
  fileKindLabel,
  fileKindOf,
  fileNameFor,
  type FileKind,
} from "@/shared/lib";
import { Button, Dialog, DialogContent } from "./legacy";

export interface FileViewerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  name: string;
  mimeType?: string;
  /** Faylni olib keladi. Auth kerak bo'lgani uchun URL emas, blob qaytariladi. */
  load: (signal: AbortSignal) => Promise<Blob>;
}

interface LoadedFile {
  url: string;
  kind: FileKind;
  /** Kengaytmasi bilan to'ldirilgan nom — sarlavhada ko'rinadi. */
  fileName: string;
}

/**
 * Faylni FAQAT platforma ichida ochadi — yuklab olish taklif qilinmaydi.
 *
 * Fayl auth bilan olinadi, shuning uchun to'g'ridan-to'g'ri `src` berib
 * bo'lmaydi: blob olinib, uning object URL'i ko'rsatiladi. URL oyna yopilishi
 * bilan bekor qilinadi, aks holda blob xotirada qolib ketadi.
 *
 * DIQQAT: bu — nusxa olishga to'siq emas, xulq-atvor chegarasi. Fayl brauzer
 * xotirasida turadi va uni devtools orqali olish mumkin. Haqiqiy himoya faqat
 * server tomonda bo'ladi (masalan vaqtinchalik imzolangan havola yoki
 * watermark). Bu yerda maqsad — oddiy yo'l bilan saqlab qo'yishning oldini olish.
 */
export function FileViewer({ open, onOpenChange, name, mimeType = "", load }: FileViewerProps) {
  const [file, setFile] = useState<LoadedFile | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return undefined;
    const controller = new AbortController();
    let objectUrl: string | null = null;

    load(controller.signal)
      .then((blob) => {
        if (controller.signal.aborted) return;
        /*
         * Turni AYNAN yuklangan fayl aytadi. Xabar ma'lumotidagi `file_type`
         * ko'pincha bo'sh keladi va u holda hamma narsa "boshqa fayl" bo'lib
         * ko'rinardi; javobning `content-type` sarlavhasi esa to'g'ri
         * (`application/pdf`) va blob shuni saqlaydi.
         */
        const type = blob.type || mimeType;
        const kind = fileKindOf(type, name);
        objectUrl = URL.createObjectURL(blobForViewing(blob, kind));
        setFile({ url: objectUrl, kind, fileName: fileNameFor(name, type) });
      })
      .catch((cause: unknown) => {
        if (controller.signal.aborted) return;
        setError(cause instanceof Error ? cause.message : "Faylni ochib bo‘lmadi");
      });

    return () => {
      controller.abort();
      if (objectUrl) URL.revokeObjectURL(objectUrl);
      setFile(null);
      setError(null);
    };
    // `load` har renderda yangi bo'lishi mumkin — qayta yuklashni oyna
    // ochilishi va faylning o'zi belgilaydi.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, name, mimeType]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      {open ? (
        <DialogContent
          title={file?.fileName ?? name}
          description={file ? fileKindLabel(file.kind) : "Ochilmoqda…"}
          className="file-viewer-dialog"
        >
          {/* Kontekst menyusi ("Rasmni saqlash", "Videoni saqlash") yopiladi. */}
          <div className="file-viewer-body" onContextMenu={(event) => event.preventDefault()}>
            {error ? (
              <div className="file-viewer-state">
                <FileQuestion size={30} />
                <p>{error}</p>
              </div>
            ) : !file ? (
              <div className="file-viewer-state">
                <Loader2 size={26} className="spin" />
                <p>Ochilmoqda…</p>
              </div>
            ) : file.kind === "pdf" ? (
              // `#toolbar=0` — brauzerning PDF paneli, ya'ni yuklash va chop
              // etish tugmalari ko'rinmaydi.
              <iframe src={`${file.url}#toolbar=0`} title={file.fileName} />
            ) : file.kind === "image" ? (
              <img src={file.url} alt={file.fileName} draggable={false} />
            ) : file.kind === "video" ? (
              <video src={file.url} controls playsInline controlsList="nodownload" />
            ) : file.kind === "audio" ? (
              <audio src={file.url} controls controlsList="nodownload" />
            ) : (
              <div className="file-viewer-state">
                <FileQuestion size={30} />
                <p>Bu turdagi faylni brauzerda ko‘rib bo‘lmaydi.</p>
              </div>
            )}
          </div>

          <div className="dialog-actions">
            <small className="file-viewer-note">Fayl faqat platforma ichida ko‘riladi</small>
            <Button variant="secondary" onClick={() => onOpenChange(false)}>
              Yopish
            </Button>
          </div>
        </DialogContent>
      ) : null}
    </Dialog>
  );
}

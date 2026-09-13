import { useEffect, useState } from "react";
import { FileQuestion, Loader2 } from "lucide-react";
import { useTranslation } from "react-i18next";
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
  load: (signal: AbortSignal) => Promise<Blob>;
}

interface LoadedFile {
  url: string;
  kind: FileKind;
  fileName: string;
}

export function FileViewer({ open, onOpenChange, name, mimeType = "", load }: FileViewerProps) {
  const { t } = useTranslation();
  const [file, setFile] = useState<LoadedFile | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return undefined;
    const controller = new AbortController();
    let objectUrl: string | null = null;

    load(controller.signal)
      .then((blob) => {
        if (controller.signal.aborted) return;
        const type = blob.type || mimeType;
        const kind = fileKindOf(type, name);
        objectUrl = URL.createObjectURL(blobForViewing(blob, kind));
        setFile({ url: objectUrl, kind, fileName: fileNameFor(name, type) });
      })
      .catch((cause: unknown) => {
        if (controller.signal.aborted) return;
        setError(cause instanceof Error ? cause.message : t("fileViewer.openError"));
      });

    return () => {
      controller.abort();
      if (objectUrl) URL.revokeObjectURL(objectUrl);
      setFile(null);
      setError(null);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, name, mimeType]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      {open ? (
        <DialogContent
          title={file?.fileName ?? name}
          description={file ? fileKindLabel(file.kind) : t("fileViewer.opening")}
          className="file-viewer-dialog"
        >
          <div className="file-viewer-body" onContextMenu={(event) => event.preventDefault()}>
            {error ? (
              <div className="file-viewer-state">
                <FileQuestion size={30} />
                <p>{error}</p>
              </div>
            ) : !file ? (
              <div className="file-viewer-state">
                <Loader2 size={26} className="spin" />
                <p>{t("fileViewer.opening")}</p>
              </div>
            ) : file.kind === "pdf" ? (
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
                <p>{t("fileViewer.unsupported")}</p>
              </div>
            )}
          </div>

          <div className="dialog-actions">
            <small className="file-viewer-note">{t("fileViewer.platformOnlyNote")}</small>
            <Button variant="secondary" onClick={() => onOpenChange(false)}>
              {t("fileViewer.close")}
            </Button>
          </div>
        </DialogContent>
      ) : null}
    </Dialog>
  );
}

import { useCallback, useState } from "react";
import { Eye, FileText } from "lucide-react";
import { fileKindLabel, fileKindOf } from "@/shared/lib";
import type { MessageAttachment as Attachment } from "@/shared/types";
import { FileViewer } from "@/shared/ui/file-viewer";
import { messageApi } from "../api/message.api";

/**
 * Xabarga biriktirilgan fayl (odatda dars doskasining PDF'i).
 *
 * Bosilganda platforma ichida ochiladi — yuklab olish shart emas. Fayl
 * `/api/v1/chat/files/<messageId>/` dan Authorization header bilan olinadi,
 * shuning uchun oddiy `<a href>` ishlamaydi: ko'ruvchi oyna blob oladi.
 */
export function MessageAttachment({ attachment }: { attachment: Attachment }) {
  const [open, setOpen] = useState(false);
  const kind = fileKindOf(attachment.mimeType, attachment.name);

  const load = useCallback(
    (signal: AbortSignal) => messageApi.downloadFile(attachment.messageId, { signal }),
    [attachment.messageId]
  );

  return (
    <>
      <button
        type="button"
        className="message-attachment"
        onClick={() => setOpen(true)}
        aria-label={`${attachment.name} — ochish`}
      >
        <span className="message-attachment-icon">
          <FileText size={17} />
        </span>
        <span className="message-attachment-body">
          <strong>{attachment.name}</strong>
          <small>{fileKindLabel(kind)} · ochish</small>
        </span>
        <Eye size={15} />
      </button>

      <FileViewer
        open={open}
        onOpenChange={setOpen}
        name={attachment.name}
        mimeType={attachment.mimeType}
        load={load}
      />
    </>
  );
}

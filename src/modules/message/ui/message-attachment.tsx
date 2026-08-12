import { useState } from "react";
import { Download, FileText, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { downloadBlob } from "@/shared/lib";
import type { MessageAttachment as Attachment } from "@/shared/types";
import { messageApi } from "../api/message.api";

/**
 * Xabarga biriktirilgan fayl (odatda dars doskasining PDF'i).
 *
 * Fayl `/api/v1/chat/files/<messageId>/` dan Authorization header bilan
 * olinadi, shuning uchun oddiy `<a href>` ishlamaydi — blob yuklab olinadi.
 * Yuklash holati komponent ichida saqlanadi: bir chatda bir nechta biriktirma
 * bo'lishi mumkin va ular bir-birining spinnerini yoqib yubormasligi kerak.
 */
export function MessageAttachment({ attachment }: { attachment: Attachment }) {
  const [loading, setLoading] = useState(false);

  const isPdf =
    attachment.mimeType.includes("pdf") || attachment.name.toLowerCase().endsWith(".pdf");

  async function download() {
    if (loading) return;
    setLoading(true);
    try {
      const blob = await messageApi.downloadFile(attachment.messageId);
      downloadBlob(blob, attachment.name);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Faylni yuklab bo‘lmadi");
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      type="button"
      className="message-attachment"
      onClick={download}
      disabled={loading}
      aria-label={`${attachment.name} — yuklab olish`}
    >
      <span className="message-attachment-icon">
        {loading ? <Loader2 size={17} className="spin" /> : <FileText size={17} />}
      </span>
      <span className="message-attachment-body">
        <strong>{attachment.name}</strong>
        <small>{isPdf ? "PDF hujjat" : "Fayl"} · yuklab olish</small>
      </span>
      <Download size={15} />
    </button>
  );
}

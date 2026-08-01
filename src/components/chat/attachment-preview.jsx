import { Download, FileText, Image as ImageIcon } from "lucide-react";
import { toast } from "sonner";

export function AttachmentPreview({ attachment, kind = "file" }) {
  const fallbackContent = `${attachment?.name ?? "Fokus_fayl.pdf"}\n\nFokus o‘quv platformasi demo fayli.\nMazkur fayl chat orqali yuklab olindi.`;
  const downloadHref = attachment?.url || `data:${attachment?.mimeType || "application/pdf"};charset=utf-8,${encodeURIComponent(fallbackContent)}`;
  if (kind === "image") {
    return (
      <div className="image-attachment">
        <div className="image-placeholder">
          <ImageIcon size={24} />
          <span>Dars doskasidan lavha</span>
        </div>
      </div>
    );
  }
  return (
    <div className="file-attachment">
      <span className="file-icon">
        <FileText size={20} />
      </span>
      <span>
        <strong>{attachment.name}</strong>
        <small>PDF · {attachment.size}</small>
      </span>
      <a href={downloadHref} download={attachment.name} onClick={() => toast.success(`${attachment.name} yuklab olindi`)} aria-label="Faylni yuklab olish">
        <Download size={18} />
      </a>
    </div>
  );
}

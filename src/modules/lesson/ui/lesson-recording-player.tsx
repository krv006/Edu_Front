import { useState } from "react";
import { Clock3, Loader2, ShieldCheck, Trash2, TriangleAlert, VideoOff } from "lucide-react";
import { formatDateTime, formatDuration } from "@/shared/lib";
import type { LessonRecording } from "@/shared/types";
import { Button, Dialog, DialogContent } from "@/shared/ui/legacy";
import { useDeleteRecording } from "../model/lesson.queries";

export interface LessonRecordingPlayerProps {
  lessonId: string;
  recording: LessonRecording | null | undefined;
  /** O'qituvchi bo'lsa — o'chirish tugmasi ko'rinadi. */
  canDelete?: boolean;
}

function formatSize(bytes: number): string {
  if (!bytes) return "";
  const mb = bytes / 1024 / 1024;
  return mb >= 1024 ? `${(mb / 1024).toFixed(1)} GB` : `${Math.round(mb)} MB`;
}

/**
 * Dars video yozuvi (docs/PROJECT.md §10).
 *
 * Yozuv FAQAT platformada ochiladi: havola muddatli va imzolangan, yuklab olish
 * tugmasi ko'rsatilmaydi (`controlsList`), kontekst menyusi bloklanadi.
 * Bu himoya emas — brauzerda to'liq himoya imkonsiz — lekin yozuvni tarqatishni
 * taklif qilmaslik hujjatdagi talab.
 */
export function LessonRecordingPlayer({
  lessonId,
  recording,
  canDelete = false,
}: LessonRecordingPlayerProps) {
  const [confirmOpen, setConfirmOpen] = useState(false);
  const removeRecording = useDeleteRecording();

  if (!recording) {
    return (
      <div className="recording-state">
        <VideoOff size={28} />
        <p>Bu darsda video yozuv yo‘q.</p>
      </div>
    );
  }

  if (recording.status === "processing") {
    return (
      <div className="recording-state">
        <Loader2 size={28} className="spin" />
        <p>Yozuv tayyorlanmoqda — tayyor bo‘lishi bilan shu yerda ochiladi.</p>
      </div>
    );
  }

  if (recording.status === "failed" || !recording.streamUrl) {
    return (
      <div className="recording-state recording-state--error">
        <TriangleAlert size={28} />
        <p>Yozuvni ochib bo‘lmadi. Iltimos, keyinroq urinib ko‘ring.</p>
      </div>
    );
  }

  return (
    <div className="recording-player">
      {/* Subtitr manbasi yo'q — backend faqat MP4 oqimini beradi. */}
      <video
        controls
        playsInline
        preload="metadata"
        src={recording.streamUrl}
        controlsList="nodownload noplaybackrate"
        disablePictureInPicture
        onContextMenu={(event) => event.preventDefault()}
      />

      <div className="recording-meta">
        <div>
          <strong>{recording.title}</strong>
          <small>
            <ShieldCheck size={13} /> Faqat platformada ochiladi
            {recording.createdAt ? ` · ${formatDateTime(recording.createdAt)}` : ""}
            {recording.durationSeconds ? ` · ${formatDuration(recording.durationSeconds)}` : ""}
            {recording.sizeBytes ? ` · ${formatSize(recording.sizeBytes)}` : ""}
          </small>
          {recording.expiresAt ? (
            <small>
              <Clock3 size={13} /> Havola {formatDateTime(recording.expiresAt)} gacha amal qiladi
            </small>
          ) : null}
        </div>
        {canDelete ? (
          <Button variant="secondary" onClick={() => setConfirmOpen(true)}>
            <Trash2 size={16} /> O‘chirish
          </Button>
        ) : null}
      </div>

      <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        {confirmOpen ? (
          <DialogContent
            title="Yozuvni o‘chirish"
            description="Video butunlay o‘chadi va qayta tiklab bo‘lmaydi."
          >
            <div className="dialog-actions">
              <Button variant="secondary" onClick={() => setConfirmOpen(false)}>
                Bekor
              </Button>
              <Button
                loading={removeRecording.isPending}
                onClick={() =>
                  removeRecording.mutate(lessonId, { onSuccess: () => setConfirmOpen(false) })
                }
              >
                O‘chirish
              </Button>
            </div>
          </DialogContent>
        ) : null}
      </Dialog>
    </div>
  );
}

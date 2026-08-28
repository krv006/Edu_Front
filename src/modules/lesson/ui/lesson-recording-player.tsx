import { useState } from "react";
import { Loader2, ShieldCheck, Trash2, TriangleAlert, VideoOff } from "lucide-react";
import { formatDateTime } from "@/shared/lib";
import type { LessonRecording } from "@/shared/types";
import { Button, Dialog, DialogContent } from "@/shared/ui/legacy";
import { useDeleteRecording } from "../model/lesson.queries";

export interface LessonRecordingPlayerProps {
  lessonId: string;
  recording: LessonRecording | null | undefined;
  /** O'qituvchi bo'lsa — o'chirish tugmasi ko'rinadi. */
  canDelete?: boolean;
}

/**
 * Dars video yozuvi (docs/COMPLETED_WORK.md §1).
 *
 * Yozuv FAQAT platformada ochiladi: havola 3 soatlik va imzolangan, yuklab olish
 * tugmasi ko'rsatilmaydi (`controlsList`), kontekst menyusi bloklanadi.
 * Bu to'liq himoya emas — brauzerda imkonsiz — lekin yozuvni tarqatishni
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

  if (recording.status === "failed") {
    return (
      <div className="recording-state recording-state--error">
        <TriangleAlert size={28} />
        <p>{recording.error || "Yozuvni tayyorlashda xatolik yuz berdi."}</p>
      </div>
    );
  }

  // `recording` — dars hali davom etmoqda; `completed` bo'lsa-yu havola yo'q bo'lsa
  // egress fayli hali ko'chirilmagan. Ikkalasida ham kutish holati ko'rsatiladi.
  if (!recording.ready || !recording.streamUrl) {
    return (
      <div className="recording-state">
        <Loader2 size={28} className="spin" />
        <p>
          {recording.status === "recording"
            ? "Dars yozib olinmoqda — tugagach shu yerda ochiladi."
            : recording.status === "merging"
              ? "Audio va video birlashtirilmoqda — bu biroz vaqt olishi mumkin."
              : "Yozuv tayyorlanmoqda — tayyor bo‘lishi bilan shu yerda ochiladi."}
        </p>
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
            {recording.endedAt
              ? ` · ${formatDateTime(recording.endedAt)}`
              : recording.createdAt
                ? ` · ${formatDateTime(recording.createdAt)}`
                : ""}
          </small>
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

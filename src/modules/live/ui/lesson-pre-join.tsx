import { useEffect, useRef, useState } from "react";
import { usePreviewTracks } from "@livekit/components-react";
import { Track, type LocalVideoTrack } from "livekit-client";
import { Mic, MicOff, Video, VideoOff } from "lucide-react";
import type { Lesson } from "@/shared/types";
import { Avatar, Button } from "@/shared/ui/legacy";

export interface LessonPreJoinChoices {
  micOn: boolean;
  cameraOn: boolean;
}

export interface LessonPreJoinProps {
  lesson: Lesson;
  userName?: string;
  /**
   * O'quvchi darsga mikrofonsiz kiradi (MIC_REQUEST_GRANT.md) — gapirish uchun
   * darsda ruxsat so'raydi. O'qituvchida esa odatdagidek yoqiq.
   */
  defaultMicOn?: boolean;
  onJoin: (choices: LessonPreJoinChoices) => void;
  onCancel: () => void;
}

/**
 * Darsga kirishdan oldingi ekran (Meet/Zoom uslubi): kamera ko'rinishi va
 * mikrofon/kamera holatini oldindan tanlash.
 *
 * Xonaga ulanishdan OLDIN turadi, shuning uchun `usePreviewTracks` ishlatiladi —
 * u LiveKit xonasidan mustaqil ravishda lokal trek ochadi va komponent
 * yo'q qilinganda o'zi to'xtatadi (kamera chirog'i o'chadi).
 */
export function LessonPreJoin({
  lesson,
  userName,
  defaultMicOn = true,
  onJoin,
  onCancel,
}: LessonPreJoinProps) {
  const [micOn, setMicOn] = useState(defaultMicOn);
  const [cameraOn, setCameraOn] = useState(true);
  const [deviceError, setDeviceError] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  const tracks = usePreviewTracks({ audio: micOn, video: cameraOn }, (error) =>
    setDeviceError(error.message)
  );

  const videoTrack = tracks?.find((track) => track.kind === Track.Kind.Video) as
    | LocalVideoTrack
    | undefined;

  useEffect(() => {
    const element = videoRef.current;
    if (!element || !videoTrack) return undefined;
    videoTrack.attach(element);
    return () => {
      videoTrack.detach(element);
    };
  }, [videoTrack]);

  /** Qurilma qayta so'ralganda eski xato osilib qolmasin. */
  function toggleMic() {
    setDeviceError(null);
    setMicOn((value) => !value);
  }

  function toggleCamera() {
    setDeviceError(null);
    setCameraOn((value) => !value);
  }

  return (
    <div className="pre-join">
      <div className="pre-join-card">
        <div className="pre-join-preview">
          {cameraOn && videoTrack ? (
            <video ref={videoRef} muted playsInline autoPlay />
          ) : (
            <div className="pre-join-placeholder">
              <Avatar name={userName || "Siz"} size="lg" />
              <p>Kamera o‘chiq</p>
            </div>
          )}

          <div className="pre-join-toggles">
            <button
              type="button"
              className={micOn ? "" : "is-off"}
              aria-pressed={micOn}
              aria-label={micOn ? "Mikrofonni o‘chirish" : "Mikrofonni yoqish"}
              onClick={toggleMic}
            >
              {micOn ? <Mic size={19} /> : <MicOff size={19} />}
            </button>
            <button
              type="button"
              className={cameraOn ? "" : "is-off"}
              aria-pressed={cameraOn}
              aria-label={cameraOn ? "Kamerani o‘chirish" : "Kamerani yoqish"}
              onClick={toggleCamera}
            >
              {cameraOn ? <Video size={19} /> : <VideoOff size={19} />}
            </button>
          </div>
        </div>

        <div className="pre-join-info">
          <span className="portal-eyebrow">DARSGA KIRISH</span>
          <h1>{lesson.title}</h1>
          <p>{lesson.courseTitle}</p>

          {deviceError ? (
            <div className="form-alert">
              Qurilmaga ulanib bo‘lmadi: {deviceError}. Brauzer ruxsatini tekshiring.
            </div>
          ) : null}

          <p className="portal-muted">
            {micOn ? "Mikrofon yoqilgan" : "Mikrofon o‘chiq"} ·{" "}
            {cameraOn ? "kamera yoqilgan" : "kamera o‘chiq"}.{" "}
            {defaultMicOn
              ? "Darsga kirgandan keyin ham o‘zgartirishingiz mumkin."
              : "Darsda gapirish uchun o‘qituvchidan ruxsat so‘raysiz."}
          </p>

          <div className="pre-join-actions">
            <Button variant="secondary" onClick={onCancel}>
              Bekor qilish
            </Button>
            <Button onClick={() => onJoin({ micOn, cameraOn })}>Darsga kirish</Button>
          </div>
        </div>
      </div>
    </div>
  );
}

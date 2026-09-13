import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { usePreviewTracks } from "@livekit/components-react";
import { Track, type LocalVideoTrack } from "livekit-client";
import { Mic, MicOff, Video, VideoOff } from "lucide-react";
import { Trans, useTranslation } from "react-i18next";
import { i18n } from "@/shared/i18n";
import type { Lesson } from "@/shared/types";
import { Avatar, Button } from "@/shared/ui/legacy";

export interface LessonPreJoinChoices {
  micOn: boolean;
  cameraOn: boolean;
  screenStream?: MediaStream;
}

export interface LessonPreJoinProps {
  lesson: Lesson;
  userName?: string;
  micAllowed?: boolean;
  isTeacher?: boolean;
  onJoin: (choices: LessonPreJoinChoices) => void;
  onCancel: () => void;
}

export function LessonPreJoin({
  lesson,
  userName,
  micAllowed = true,
  isTeacher = false,
  onJoin,
  onCancel,
}: LessonPreJoinProps) {
  const { t } = useTranslation("live");
  const [micOn, setMicOn] = useState(false);
  const [cameraOn, setCameraOn] = useState(false);
  const [deviceError, setDeviceError] = useState<string | null>(null);
  const [screenShareError, setScreenShareError] = useState<string | null>(null);
  const [joining, setJoining] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  const handleDeviceError = useCallback(
    (error: Error) => setDeviceError(error.message || i18n.t("live:preJoin.deviceErrorFallback")),
    []
  );
  const trackOptions = useMemo(() => ({ audio: micOn, video: cameraOn }), [micOn, cameraOn]);
  const tracks = usePreviewTracks(trackOptions, handleDeviceError);

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

  async function join() {
    tracks?.forEach((track) => track.stop());

    if (!isTeacher) {
      onJoin({ micOn, cameraOn });
      return;
    }

    if (typeof navigator.mediaDevices?.getDisplayMedia !== "function") {
      setScreenShareError(t("preJoin.screenShareUnsupported"));
      return;
    }

    setJoining(true);
    setScreenShareError(null);
    try {
      const screenStream = await navigator.mediaDevices.getDisplayMedia({
        video: { frameRate: 15, displaySurface: "browser" },
        audio: true,
        systemAudio: "include",
        selfBrowserSurface: "exclude",
      } as DisplayMediaStreamOptions & {
        selfBrowserSurface?: "include" | "exclude";
        systemAudio?: "include" | "exclude";
      });
      if (screenStream.getAudioTracks().length === 0) {
        screenStream.getTracks().forEach((track) => track.stop());
        setScreenShareError(t("preJoin.screenShareNoAudio"));
        return;
      }
      onJoin({ micOn, cameraOn, screenStream });
    } catch {
      setScreenShareError(t("preJoin.screenSharePermissionDenied"));
    } finally {
      setJoining(false);
    }
  }

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
              <Avatar name={userName || t("preJoin.you")} size="lg" />
              <p>{t("preJoin.cameraOff")}</p>
            </div>
          )}

          <div className="pre-join-toggles">
            <button
              type="button"
              className={micOn ? "" : "is-off"}
              aria-pressed={micOn}
              aria-label={micOn ? t("preJoin.muteMicAria") : t("preJoin.unmuteMicAria")}
              disabled={!micAllowed}
              title={micAllowed ? undefined : t("preJoin.micDisabledTitle")}
              onClick={toggleMic}
            >
              {micOn ? <Mic size={19} /> : <MicOff size={19} />}
            </button>
            <button
              type="button"
              className={cameraOn ? "" : "is-off"}
              aria-pressed={cameraOn}
              aria-label={cameraOn ? t("preJoin.muteCameraAria") : t("preJoin.unmuteCameraAria")}
              onClick={toggleCamera}
            >
              {cameraOn ? <Video size={19} /> : <VideoOff size={19} />}
            </button>
          </div>
        </div>

        <div className="pre-join-info">
          <span className="portal-eyebrow">{t("preJoin.eyebrow")}</span>
          <h1>{lesson.title}</h1>
          <p>{lesson.courseTitle}</p>

          {deviceError ? (
            <div className="form-alert">{t("preJoin.deviceErrorMessage", { error: deviceError })}</div>
          ) : null}

          {!micAllowed && isTeacher ? (
            <div className="form-alert">{t("preJoin.micTokenMissing")}</div>
          ) : null}

          {screenShareError ? (
            <div className="form-alert" role="alert">
              {screenShareError}
            </div>
          ) : null}

          {isTeacher ? (
            <p className="portal-muted">
              <Trans
                t={t}
                i18nKey="preJoin.teacherScreenShareNote"
                components={[<strong key="0" />, <strong key="1" />, <strong key="2" />, <strong key="3" />]}
              />
            </p>
          ) : null}

          <p className="portal-muted">
            {micOn ? t("preJoin.micOn") : t("preJoin.micOff")} ·{" "}
            {cameraOn ? t("preJoin.cameraOnSuffix") : t("preJoin.cameraOffSuffix")}.{" "}
            {micAllowed || isTeacher ? t("preJoin.canChangeLater") : t("preJoin.needPermission")}
          </p>

          <div className="pre-join-actions">
            <Button variant="secondary" onClick={onCancel} disabled={joining}>
              {t("preJoin.cancel")}
            </Button>
            <Button onClick={join} loading={joining}>
              {t("preJoin.join")}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

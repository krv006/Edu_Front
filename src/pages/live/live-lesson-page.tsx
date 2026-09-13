import { useCallback, useEffect, useRef, useState } from "react";
import { LiveKitRoom } from "@livekit/components-react";
import { DisconnectReason } from "livekit-client";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "sonner";
import { useAuth } from "@/modules/auth";
import {
  LessonPreJoin,
  liveApi,
  MIC_TRACK,
  tokenAllowsTrack,
  useLiveToken,
  type LessonPreJoinChoices,
} from "@/modules/live";
import { RateLessonDialog, useLesson } from "@/modules/lesson";
import { LoadingFallback, RouteState } from "@/shared/ui/legacy";
import { LiveRoom, useLeaveGuard } from "@/widgets/live-room";

export function LiveLessonPage() {
  const { lessonId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const lesson = useLesson(lessonId ?? null);
  const token = useLiveToken(lessonId, true);
  const joined = useRef(false);
  const isTeacher = useRef(false);
  const [ratePrompt, setRatePrompt] = useState(false);
  const [choices, setChoices] = useState<LessonPreJoinChoices | null>(null);
  const [readyToConnect, setReadyToConnect] = useState(false);

  useEffect(() => {
    if (!choices || !token.data || token.data.joinDelayMs <= 0) return;
    const timer = globalThis.setTimeout(() => setReadyToConnect(true), token.data.joinDelayMs);
    return () => globalThis.clearTimeout(timer);
  }, [choices, token.data]);

  const connected = Boolean(token.data);
  useLeaveGuard(connected && !ratePrompt);

  useEffect(() => {
    if (token.data) {
      joined.current = true;
      isTeacher.current = token.data.isTeacher;
    }
  }, [token.data]);

  useEffect(() => {
    const currentLessonId = lessonId;
    return () => {
      if (joined.current && currentLessonId) {
        joined.current = false;
        liveApi.leave(currentLessonId).catch(() => undefined);
      }
    };
  }, [lessonId]);

  const refetchLesson = lesson.refetch;

  const handleLeave = useCallback(() => {
    if (isTeacher.current) {
      navigate(-1);
      return;
    }
    refetchLesson()
      .then((result) => {
        if (result.data?.status === "finished") setRatePrompt(true);
        else navigate(-1);
      })
      .catch(() => navigate(-1));
  }, [navigate, refetchLesson]);

  if (lesson.isLoading || token.isLoading) {
    return (
      <main className="live-page">
        <LoadingFallback label="Dars xonasiga ulanmoqda" />
      </main>
    );
  }

  if (lesson.isError || !lesson.data) {
    return (
      <main className="live-page">
        <RouteState
          eyebrow="JONLI DARS"
          title="Darsni topib bo‘lmadi"
          description={lesson.error?.message}
          actionLabel="Orqaga"
          onAction={handleLeave}
        />
      </main>
    );
  }

  if (ratePrompt) {
    return (
      <main className="live-page">
        <RouteState
          eyebrow="DARS YAKUNLANDI"
          title={lesson.data.title}
          description="Chiqishdan oldin o‘qituvchi uchun fikringizni qoldiring."
          actionLabel="Chiqish"
          onAction={() => navigate(-1)}
        />
        <RateLessonDialog
          lesson={lesson.data}
          currentUserId={user?.id}
          onOpenChange={(open) => {
            if (!open) navigate(-1);
          }}
        />
      </main>
    );
  }

  if (token.isError || !token.data) {
    return (
      <main className="live-page">
        <RouteState
          eyebrow="JONLI DARS"
          title="Darsga kirib bo‘lmadi"
          description={token.error?.message}
          actionLabel="Qayta urinish"
          onAction={token.refetch}
        />
      </main>
    );
  }

  if (!choices) {
    return (
      <main className="live-page">
        <LessonPreJoin
          lesson={lesson.data}
          userName={user?.name}
          micAllowed={tokenAllowsTrack(token.data.token, MIC_TRACK)}
          isTeacher={token.data.isTeacher}
          onJoin={setChoices}
          onCancel={() => navigate(-1)}
        />
      </main>
    );
  }

  if (!readyToConnect && token.data.joinDelayMs > 0) {
    return (
      <main className="live-page">
        <LoadingFallback label="Dars xonasiga ulanmoqda" />
      </main>
    );
  }

  return (
    <main className="live-page">
      <LiveKitRoom
        token={token.data.token}
        serverUrl={token.data.serverUrl}
        connect
        audio={choices.micOn}
        video={choices.cameraOn}
        onDisconnected={(reason) => {
          if (reason === DisconnectReason.PARTICIPANT_REMOVED) {
            toast.error("Siz darsdan chetlashtirildingiz");
          }
          handleLeave();
        }}
        onMediaDeviceFailure={(_failure, kind) =>
          toast.error(
            kind === "audioinput"
              ? "Mikrofonni ochib bo‘lmadi — boshqa dastur band qilgan bo‘lishi mumkin"
              : "Kamerani ochib bo‘lmadi — boshqa dastur band qilgan bo‘lishi mumkin"
          )
        }
      >
        <LiveRoom
          lesson={lesson.data}
          isTeacher={token.data.isTeacher}
          screenStream={choices.screenStream ?? null}
          onLeave={handleLeave}
        />
      </LiveKitRoom>
    </main>
  );
}

import { useEffect, useState } from "react";
import {
  DisconnectButton,
  ParticipantTile,
  RoomAudioRenderer,
  TrackToggle,
  useConnectionState,
  useLocalParticipantPermissions,
  useParticipants,
  useRoomContext,
  useTracks,
  type TrackReferenceOrPlaceholder,
} from "@livekit/components-react";
import { ConnectionState, RoomEvent, Track, type Participant } from "livekit-client";
import {
  LayoutDashboard,
  Mic,
  MicOff,
  MonitorUp,
  PhoneOff,
  UserRoundPlus,
  UserRoundX,
  Users,
  Video,
  VideoOff,
  X,
} from "lucide-react";
import { toast } from "sonner";
import { AwayStudentsNotice, BoardPanel } from "@/modules/board";
import {
  AttentionCheckDialog,
  decodeScreenShareRequest,
  encodeScreenShareRequest,
  LessonInviteDialog,
  useAllowShare,
  useAttentionCheck,
  useBanFromLesson,
  useFocusTracker,
} from "@/modules/live";
import type { Lesson } from "@/shared/types";
import { Avatar, Button } from "@/shared/ui/legacy";

type SidePanel = "board" | "people" | null;

const CONNECTION_LABELS: Record<string, string> = {
  [ConnectionState.Connecting]: "Ulanmoqda…",
  [ConnectionState.Connected]: "Ulandi",
  [ConnectionState.Reconnecting]: "Qayta ulanmoqda…",
  [ConnectionState.Disconnected]: "Uzildi",
};

// LiveKit protocol TrackSource.SCREEN_SHARE qiymati. Student tokenida dastlab bu source yo‘q.
const SCREEN_SHARE_SOURCE = 3;

function CameraTile({
  track,
  compact = false,
}: {
  track: TrackReferenceOrPlaceholder;
  compact?: boolean;
}) {
  const publication = "publication" in track ? track.publication : undefined;
  const cameraOff = !publication || publication.isMuted;
  const name = track.participant.name || track.participant.identity;

  return (
    <article
      className={`live-camera-tile ${compact ? "is-compact" : ""} ${cameraOff ? "is-camera-off" : ""}`}
    >
      <ParticipantTile trackRef={track} disableSpeakingIndicator={cameraOff} />
      {cameraOff ? (
        <div className="live-camera-placeholder" aria-label={`${name} kamerasi o‘chiq`}>
          <Avatar name={name} size={compact ? "sm" : "md"} />
        </div>
      ) : null}
      <span className="live-camera-name">
        {track.participant.isLocal ? `${name} (Siz)` : name}
      </span>
    </article>
  );
}

function StudentShareControl() {
  const room = useRoomContext();
  const permissions = useLocalParticipantPermissions();
  const [requesting, setRequesting] = useState(false);
  const canShare = Boolean(
    permissions?.canPublish &&
      (!permissions.canPublishSources.length ||
        permissions.canPublishSources.includes(SCREEN_SHARE_SOURCE))
  );

  if (canShare) {
    return (
      <TrackToggle
        source={Track.Source.ScreenShare}
        showIcon={false}
        className="live-control live-control--share"
        aria-label="Ekranni ulashish"
      >
        <MonitorUp size={19} />
      </TrackToggle>
    );
  }

  async function requestShare() {
    if (requesting) return;
    setRequesting(true);
    try {
      const signal = encodeScreenShareRequest(
        room.localParticipant.name || room.localParticipant.identity
      );
      await room.localParticipant.publishData(signal.payload, {
        reliable: true,
        topic: signal.topic,
      });
      toast.success("Ekran ulashish so‘rovi o‘qituvchiga yuborildi");
    } catch {
      toast.error("So‘rovni yuborib bo‘lmadi");
    } finally {
      setRequesting(false);
    }
  }

  return (
    <button
      type="button"
      className="live-control live-control--share-request"
      aria-label="Ekran ulashish uchun ruxsat so‘rash"
      title="Ekran ulashish uchun ruxsat so‘rash"
      disabled={requesting}
      onClick={requestShare}
    >
      <MonitorUp size={19} />
      <span className="live-control-request-dot" aria-hidden="true" />
    </button>
  );
}

function ShareRequestListener({ lessonId, enabled }: { lessonId: string; enabled: boolean }) {
  const room = useRoomContext();
  const { mutate: grantShare } = useAllowShare(lessonId);

  useEffect(() => {
    if (!enabled) return;

    function receive(
      payload: Uint8Array,
      participant: Participant | undefined,
      _kind: unknown,
      topic?: string
    ) {
      const request = decodeScreenShareRequest(payload, topic);
      if (!request || !participant) return;
      const identity = participant.identity;
      const name = request.name || participant.name || identity;

      toast(`${name} ekran ulashmoqchi`, {
        description: "O‘quvchiga ekran ulashish uchun ruxsat berasizmi?",
        duration: 12_000,
        action: {
          label: "Ruxsat berish",
          onClick: () => grantShare(identity),
        },
      });
    }

    room.on(RoomEvent.DataReceived, receive);
    return () => {
      room.off(RoomEvent.DataReceived, receive);
    };
  }, [enabled, grantShare, room]);

  return null;
}

export interface LiveRoomProps {
  lesson: Lesson;
  isTeacher: boolean;
  onLeave: () => void;
}

export function LiveRoom({ lesson, isTeacher, onLeave }: LiveRoomProps) {
  const [panel, setPanel] = useState<SidePanel>(null);
  const [inviteOpen, setInviteOpen] = useState(false);
  const connectionState = useConnectionState();
  const participants = useParticipants();
  const attention = useAttentionCheck(lesson.id, !isTeacher);
  useFocusTracker(lesson.id, !isTeacher);

  const tracks = useTracks(
    [
      { source: Track.Source.Camera, withPlaceholder: true },
      { source: Track.Source.ScreenShare, withPlaceholder: false },
    ],
    { onlySubscribed: false }
  );
  const screenTracks = tracks.filter((track) => track.source === Track.Source.ScreenShare);
  const cameraTracks = tracks.filter((track) => track.source === Track.Source.Camera);
  const activeShare = screenTracks[0] ?? null;

  const togglePanel = (next: Exclude<SidePanel, null>) =>
    setPanel((current) => (current === next ? null : next));
  const boardFull = panel === "board";

  return (
    <div
      className={`live-room ${panel ? "has-panel" : ""} ${boardFull ? "is-board-full" : ""}`}
      data-lk-theme="default"
    >
      <header className="live-room-topbar">
        <div className="live-room-identity">
          <span className={`live-dot live-dot--${connectionState}`} aria-hidden="true" />
          <div>
            <strong>{lesson.title}</strong>
            <small>
              {lesson.courseTitle} · {CONNECTION_LABELS[connectionState] ?? connectionState}
            </small>
          </div>
        </div>
        <div className="live-room-topbar-actions">
          <span className="live-room-count">
            <Users size={15} /> {participants.length}
          </span>
          {isTeacher ? (
            <button
              className="icon-button"
              onClick={() => setInviteOpen(true)}
              aria-label="Darsga taklif qilish"
              title="Darsga taklif qilish"
            >
              <UserRoundPlus size={19} />
            </button>
          ) : null}
          <button className="icon-button" onClick={onLeave} aria-label="Darsdan chiqish">
            <X size={19} />
          </button>
        </div>
      </header>

      <div className="live-room-body">
        {!boardFull ? (
          <main className={`live-room-stage ${activeShare ? "has-presentation" : ""}`}>
            {activeShare ? (
              <div className="live-presentation-layout">
                <div className="live-presentation-stage">
                  <ParticipantTile trackRef={activeShare} />
                </div>
                <div className="live-camera-filmstrip" aria-label="Ishtirokchilar videolari">
                  {cameraTracks.map((track) => (
                    <CameraTile
                      key={`${track.participant.identity}-${track.source}`}
                      track={track}
                      compact
                    />
                  ))}
                </div>
              </div>
            ) : cameraTracks.length ? (
              <div className="live-camera-grid">
                {cameraTracks.map((track) => (
                  <CameraTile key={`${track.participant.identity}-${track.source}`} track={track} />
                ))}
              </div>
            ) : (
              <div className="live-room-empty">
                <Video size={30} />
                <p>Kamera oqimi hali yo‘q</p>
              </div>
            )}
          </main>
        ) : null}

        {panel ? (
          <aside className="live-room-panel" aria-label="Yon panel">
            <nav className="live-room-panel-tabs">
              <button
                className={panel === "board" ? "is-active" : ""}
                onClick={() => setPanel("board")}
              >
                <LayoutDashboard size={16} /> Doska
              </button>
              <button
                className={panel === "people" ? "is-active" : ""}
                onClick={() => setPanel("people")}
              >
                <Users size={16} /> Ishtirokchilar
              </button>
              <button className="icon-button" onClick={() => setPanel(null)} aria-label="Panelni yopish">
                <X size={17} />
              </button>
            </nav>
            <div className="live-room-panel-body">
              {panel === "board" ? (
                <BoardPanel lessonId={lesson.id} courseId={lesson.courseId} />
              ) : (
                <ParticipantsPanel lessonId={lesson.id} isTeacher={isTeacher} />
              )}
            </div>
          </aside>
        ) : null}
      </div>

      <footer className="live-room-controls">
        <TrackToggle
          source={Track.Source.Microphone}
          showIcon={false}
          className="live-control"
          aria-label="Mikrofon"
        >
          <Mic size={19} />
          <MicOff size={19} className="live-control-off" />
        </TrackToggle>
        <TrackToggle
          source={Track.Source.Camera}
          showIcon={false}
          className="live-control"
          aria-label="Kamera"
        >
          <Video size={19} />
          <VideoOff size={19} className="live-control-off" />
        </TrackToggle>
        {isTeacher ? (
          <TrackToggle
            source={Track.Source.ScreenShare}
            showIcon={false}
            className="live-control live-control--share"
            aria-label="Ekranni ulashish"
          >
            <MonitorUp size={19} />
          </TrackToggle>
        ) : (
          <StudentShareControl />
        )}

        <span className="live-control-divider" aria-hidden="true" />

        <button
          className={`live-control ${panel === "board" ? "is-active" : ""}`}
          onClick={() => togglePanel("board")}
          aria-label="Doskani ochish"
          aria-pressed={panel === "board"}
        >
          <LayoutDashboard size={19} />
        </button>
        <button
          className={`live-control ${panel === "people" ? "is-active" : ""}`}
          onClick={() => togglePanel("people")}
          aria-label="Ishtirokchilar"
          aria-pressed={panel === "people"}
        >
          <Users size={19} />
        </button>

        <DisconnectButton className="live-control live-control--leave">
          <PhoneOff size={19} />
          <span>Chiqish</span>
        </DisconnectButton>
      </footer>

      <AwayStudentsNotice lessonId={lesson.id} enabled={isTeacher} />

      {isTeacher ? (
        <LessonInviteDialog
          lessonId={lesson.id}
          courseId={lesson.courseId}
          open={inviteOpen}
          onOpenChange={setInviteOpen}
        />
      ) : null}

      <RoomAudioRenderer />
      <ShareRequestListener lessonId={lesson.id} enabled={isTeacher} />
      {!isTeacher ? <AttentionCheckDialog lessonId={lesson.id} check={attention.data} /> : null}
    </div>
  );
}

function ParticipantsPanel({ lessonId, isTeacher }: { lessonId: string; isTeacher: boolean }) {
  const participants = useParticipants();
  const allowShare = useAllowShare(lessonId);
  const ban = useBanFromLesson(lessonId);

  return (
    <div className="live-participants">
      {participants.map((participant) => (
        <article key={participant.identity}>
          <Avatar name={participant.name || participant.identity} size="sm" />
          <div>
            <strong>{participant.name || participant.identity}</strong>
            <small>{participant.isLocal ? "Siz" : "Ishtirokchi"}</small>
          </div>
          {isTeacher && !participant.isLocal ? (
            <>
              <Button
                size="sm"
                variant="secondary"
                loading={allowShare.isPending}
                onClick={() => allowShare.mutate(participant.identity)}
              >
                <MonitorUp size={15} /> Ruxsat
              </Button>
              {/* LiveKit identity — backend token'da o'quvchi id'si sifatida
                  beriladi, ban ham shu id'ni kutadi. */}
              <button
                className="icon-button destructive-icon"
                aria-label={`${participant.name || participant.identity}ni darsdan chetlashtirish`}
                title="Darsdan chetlashtirish"
                disabled={ban.isPending}
                onClick={() => ban.mutate(participant.identity)}
              >
                <UserRoundX size={16} />
              </button>
            </>
          ) : null}
        </article>
      ))}
      {!participants.length ? <p className="portal-muted">Hozircha hech kim yo‘q.</p> : null}
    </div>
  );
}

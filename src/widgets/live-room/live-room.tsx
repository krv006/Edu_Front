import { useState } from "react";
import {
  DisconnectButton,
  GridLayout,
  ParticipantTile,
  RoomAudioRenderer,
  TrackToggle,
  useConnectionState,
  useParticipants,
  useTracks,
} from "@livekit/components-react";
import { ConnectionState, Track } from "livekit-client";
import {
  LayoutDashboard,
  Mic,
  MicOff,
  MonitorUp,
  PhoneOff,
  Users,
  Video,
  VideoOff,
  X,
} from "lucide-react";
import { BoardPanel } from "@/modules/board";
import { AttentionCheckDialog, useAttentionCheck, useAllowShare, useFocusTracker } from "@/modules/live";
import type { Lesson } from "@/shared/types";
import { Avatar, Button } from "@/shared/ui/legacy";

type SidePanel = "board" | "people" | null;

const CONNECTION_LABELS: Record<string, string> = {
  [ConnectionState.Connecting]: "Ulanmoqda…",
  [ConnectionState.Connected]: "Ulandi",
  [ConnectionState.Reconnecting]: "Qayta ulanmoqda…",
  [ConnectionState.Disconnected]: "Uzildi",
};

export interface LiveRoomProps {
  lesson: Lesson;
  isTeacher: boolean;
  onLeave: () => void;
}

/**
 * `LiveKitRoom` ichida render qilinadi — barcha LiveKit hook'lari shu kontekstga muhtoj.
 * Google Meet uslubi: sahna + yon panel + pastki boshqaruv paneli.
 */
export function LiveRoom({ lesson, isTeacher, onLeave }: LiveRoomProps) {
  const [panel, setPanel] = useState<SidePanel>(null);
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

  // Mobil ekranda yon panel ochilganda sahna yashiriladi — joy yetarli bo'lsin.
  const togglePanel = (next: Exclude<SidePanel, null>) =>
    setPanel((current) => (current === next ? null : next));

  /**
   * Doska yon panelga sig'maydi (asboblar qatori siqilib, gorizontal skroll paydo
   * bo'ladi), shuning uchun u butun sahnani egallaydi va video chap pastdagi
   * kichik oynaga tushadi. Ishtirokchilar ro'yxati esa oddiy yon panelligicha qoladi.
   */
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
          <button className="icon-button" onClick={onLeave} aria-label="Darsdan chiqish">
            <X size={19} />
          </button>
        </div>
      </header>

      <div className="live-room-body">
        <main className="live-room-stage">
          {tracks.length ? (
            <GridLayout tracks={tracks}>
              <ParticipantTile />
            </GridLayout>
          ) : (
            <div className="live-room-empty">
              <Video size={30} />
              <p>Kamera oqimi hali yo‘q</p>
            </div>
          )}

          {/* Kichik oynani bosish doskani yopib videoni qaytaradi. */}
          {boardFull ? (
            <button
              type="button"
              className="live-room-stage-restore"
              onClick={() => setPanel(null)}
              aria-label="Doskani yopish va videoni ochish"
              title="Doskani yopish"
            />
          ) : null}
        </main>

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
        {/* `showIcon={false}` — aks holda LiveKit o'z ikonkasini bizniki ustiga qo'shadi. */}
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
        <TrackToggle
          source={Track.Source.ScreenShare}
          showIcon={false}
          className="live-control live-control--share"
          aria-label="Ekranni ulashish"
        >
          <MonitorUp size={19} />
        </TrackToggle>

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

      <RoomAudioRenderer />
      {!isTeacher ? <AttentionCheckDialog lessonId={lesson.id} check={attention.data} /> : null}
    </div>
  );
}

/** Ishtirokchilar ro'yxati; o'qituvchiga ekran ulashish ruxsatini berish tugmasi ham shu yerda. */
function ParticipantsPanel({ lessonId, isTeacher }: { lessonId: string; isTeacher: boolean }) {
  const participants = useParticipants();
  const allowShare = useAllowShare(lessonId);

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
            <Button
              size="sm"
              variant="secondary"
              loading={allowShare.isPending}
              onClick={() => allowShare.mutate(participant.identity)}
            >
              <MonitorUp size={15} /> Ruxsat
            </Button>
          ) : null}
        </article>
      ))}
      {!participants.length ? <p className="portal-muted">Hozircha hech kim yo‘q.</p> : null}
    </div>
  );
}

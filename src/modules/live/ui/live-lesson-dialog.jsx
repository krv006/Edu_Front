import { useEffect, useRef, useState } from "react";
import { LiveKitRoom, useParticipants, VideoConference } from "@livekit/components-react";
import { LayoutDashboard, MonitorUp, Video } from "lucide-react";
import { BoardPanel } from "@/modules/board";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { LoadingFallback, RouteState } from "@/shared/ui";
import { liveApi } from "../api/live.api";
import { useFocusTracker } from "../lib/use-focus-tracker";
import { useAllowShare, useAttentionCheck, useLiveToken } from "../model/live.queries";
import { AttentionCheckDialog } from "./attention-check-dialog";

export function LiveLessonDialog({ lesson, open, onOpenChange }) {
  const [tab, setTab] = useState("video"); const joined = useRef(false); const token = useLiveToken(lesson?.id, open); const isStudent = token.data && !token.data.isTeacher;
  const attention = useAttentionCheck(lesson?.id, open && isStudent); useFocusTracker(lesson?.id, open && isStudent);
  useEffect(() => { if (open && token.data) joined.current = true; return () => { if (open && joined.current && lesson?.id) { joined.current = false; liveApi.leave(lesson.id).catch(() => undefined); } }; }, [lesson?.id, open, token.data]);
  return <Dialog open={open} onOpenChange={onOpenChange}>{open ? <DialogContent className="live-lesson-dialog" title={lesson?.title || "Jonli dars"} description={token.data?.roomName || "LiveKit xona tayyorlanmoqda"}><nav className="live-tabs"><button className={tab === "video" ? "is-active" : ""} onClick={() => setTab("video")}><Video size={17} /> Video</button><button className={tab === "board" ? "is-active" : ""} onClick={() => setTab("board")}><LayoutDashboard size={17} /> Doska</button></nav>{token.isLoading ? <LoadingFallback label="Dars xonasiga ulanmoqda" /> : token.isError ? <RouteState title="Darsga kirib bo‘lmadi" description={token.error.message} actionLabel="Qayta urinish" onAction={token.refetch} /> : tab === "video" ? <div className="livekit-shell" data-lk-theme="default"><LiveKitRoom token={token.data.token} serverUrl={token.data.serverUrl} connect={open} audio video onDisconnected={() => onOpenChange(false)}>{token.data.isTeacher ? <SharePermissionBar lessonId={lesson.id} /> : null}<VideoConference /></LiveKitRoom></div> : <BoardPanel lessonId={lesson.id} courseId={lesson.courseId} />}{isStudent ? <AttentionCheckDialog lessonId={lesson.id} check={attention.data} /> : null}</DialogContent> : null}</Dialog>;
}

function SharePermissionBar({ lessonId }) {
  const participants = useParticipants(); const allow = useAllowShare(lessonId); const remote = participants.filter((participant) => !participant.isLocal);
  if (!remote.length) return null;
  return <div className="share-permission-bar"><MonitorUp size={16} /><span>Ekran ulashish:</span>{remote.map((participant) => <button key={participant.identity} disabled={allow.isPending} onClick={() => allow.mutate(participant.identity)}>{participant.name || participant.identity}</button>)}</div>;
}

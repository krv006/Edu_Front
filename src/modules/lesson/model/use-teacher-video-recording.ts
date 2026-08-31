import { useEffect, useRef, useState } from "react";
import {
  createTeacherVideoRecording,
  releaseTeacherVideoRecording,
  type TeacherVideoRecordingSession,
  type TeacherVideoRecordingSnapshot,
} from "../lib/teacher-video-recording";

const INITIAL_SNAPSHOT: TeacherVideoRecordingSnapshot = {
  phase: "idle",
  pendingChunks: 0,
  uploadedChunks: 0,
  error: null,
};

/**
 * `stream` — `getDisplayMedia` orqali pre-join gesture ichida oldindan
 * olingan ekran oqimi (`null` bo'lsa o'qituvchi ruxsat bermagan yoki hali
 * so'ralmagan — bu holda video yozuvi shunchaki ishlamaydi, audio davom etadi).
 */
export function useTeacherVideoRecording(
  lessonId: string,
  stream: MediaStream | null,
  enabled: boolean
): TeacherVideoRecordingSnapshot {
  const sessionRef = useRef<TeacherVideoRecordingSession | null>(null);
  const [snapshot, setSnapshot] = useState(INITIAL_SNAPSHOT);

  useEffect(() => {
    if (!enabled || !stream) return;
    const session = createTeacherVideoRecording(lessonId);
    sessionRef.current = session;
    const unsubscribe = session.subscribe(setSnapshot);
    session.start(stream);

    return () => {
      unsubscribe();
      sessionRef.current = null;
      releaseTeacherVideoRecording(session);
    };
  }, [enabled, lessonId, stream]);

  return snapshot;
}

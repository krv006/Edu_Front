import { useEffect, useRef } from "react";
import { liveApi } from "../api/live.api";
import type { FocusKind } from "../api/live.dto";
/** O‘quvchi oynadan chiqib-kirganini backendga yozadi (anti-cheat fokus jurnali). */
export function useFocusTracker(lessonId: string | undefined, enabled: boolean) {
  const lastEvent = useRef<{ kind: FocusKind | null; at: number }>({ kind: null, at: 0 });
  useEffect(() => {
    if (!enabled || !lessonId) return undefined;
    const send = (kind: FocusKind) => { const now = Date.now(); if (lastEvent.current.kind === kind && now - lastEvent.current.at < 2000) return; lastEvent.current = { kind, at: now }; liveApi.sendFocus(lessonId, kind).catch(() => undefined); };
    const visibility = () => send(document.hidden ? "exit" : "return"); const blur = () => send("exit"); const focus = () => send("return");
    document.addEventListener("visibilitychange", visibility); window.addEventListener("blur", blur); window.addEventListener("focus", focus);
    return () => { document.removeEventListener("visibilitychange", visibility); window.removeEventListener("blur", blur); window.removeEventListener("focus", focus); };
  }, [enabled, lessonId]);
}

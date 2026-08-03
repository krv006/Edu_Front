import { useEffect, useRef } from "react";
import { liveApi } from "../api/live.api";
export function useFocusTracker(lessonId, enabled) {
  const lastEvent = useRef({ kind: null, at: 0 });
  useEffect(() => {
    if (!enabled || !lessonId) return undefined;
    const send = (kind) => { const now = Date.now(); if (lastEvent.current.kind === kind && now - lastEvent.current.at < 2000) return; lastEvent.current = { kind, at: now }; liveApi.sendFocus(lessonId, kind).catch(() => undefined); };
    const visibility = () => send(document.hidden ? "exit" : "return"); const blur = () => send("exit"); const focus = () => send("return");
    document.addEventListener("visibilitychange", visibility); window.addEventListener("blur", blur); window.addEventListener("focus", focus);
    return () => { document.removeEventListener("visibilitychange", visibility); window.removeEventListener("blur", blur); window.removeEventListener("focus", focus); };
  }, [enabled, lessonId]);
}

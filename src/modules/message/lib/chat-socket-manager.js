import { env } from "@/shared/config";
import { refreshTokenManager, tokenStorage } from "@/shared/api";
import { parseSocketEvent } from "./message.mappers";

export function getSocketClosePolicy(code) {
  if (code === 4403) return { refresh: false, reconnect: false };
  if (code === 4401) return { refresh: true, reconnect: true };
  return { refresh: false, reconnect: true };
}

export class ChatSocketManager {
  constructor({ roomId, onEvent, onState }) {
    this.roomId = roomId; this.onEvent = onEvent; this.onState = onState;
    this.socket = null; this.retries = 0; this.maxRetries = 6; this.closed = false; this.retryTimer = null; this.lastTypingAt = 0;
    this.handleOnline = () => this.connect();
    this.handleVisibility = () => { if (document.visibilityState === "visible" && !this.socket) this.connect(); };
  }
  start() { this.closed = false; globalThis.addEventListener?.("online", this.handleOnline); globalThis.document?.addEventListener?.("visibilitychange", this.handleVisibility); this.connect(); }
  connect() {
    if (this.closed || this.socket || (typeof navigator !== "undefined" && !navigator.onLine)) return;
    const token = tokenStorage.getAccessToken(); if (!token) return;
    const url = `${env.wsUrl}/ws/chat/${encodeURIComponent(this.roomId)}/?token=${encodeURIComponent(token)}`;
    this.onState?.("connecting"); const socket = new WebSocket(url); this.socket = socket;
    socket.onopen = () => { this.retries = 0; this.onState?.("connected"); };
    socket.onmessage = (event) => { try { const parsed = parseSocketEvent(event.data); if (parsed) this.onEvent?.(parsed); } catch { this.onEvent?.({ type: "error", detail: "Socket javobi noto‘g‘ri" }); } };
    socket.onerror = () => this.onState?.("error");
    socket.onclose = async (event) => {
      if (this.socket === socket) this.socket = null;
      this.onState?.("disconnected");
      const policy = getSocketClosePolicy(event.code);
      if (this.closed || !policy.reconnect) return;
      if (policy.refresh) { const refreshed = await refreshTokenManager.refresh(); if (!refreshed) return; }
      this.scheduleReconnect();
    };
  }
  scheduleReconnect() { if (this.closed || this.retryTimer || this.retries >= this.maxRetries) return; const delay = Math.min(30_000, 700 * 2 ** this.retries++); this.retryTimer = globalThis.setTimeout(() => { this.retryTimer = null; this.connect(); }, delay); }
  sendTyping() { const now = Date.now(); if (now - this.lastTypingAt < 1500 || this.socket?.readyState !== WebSocket.OPEN) return; this.lastTypingAt = now; this.socket.send(JSON.stringify({ type: "typing" })); }
  stop() { this.closed = true; globalThis.clearTimeout(this.retryTimer); this.retryTimer = null; globalThis.removeEventListener?.("online", this.handleOnline); globalThis.document?.removeEventListener?.("visibilitychange", this.handleVisibility); const socket = this.socket; this.socket = null; socket?.close(1000, "Room changed"); }
}

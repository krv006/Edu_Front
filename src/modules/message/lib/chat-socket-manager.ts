import { env } from "@/shared/config";
import { refreshTokenManager, tokenStorage } from "@/shared/api";
import { parseSocketEvent, type ParsedSocketEvent } from "./message.mappers";

export type SocketState = "idle" | "connecting" | "connected" | "disconnected" | "error";

export interface SocketClosePolicy {
  refresh: boolean;
  reconnect: boolean;
}

/**
 * Yopilish kodlari (docs/PROJECT.md §5):
 * `4401` — token yaroqsiz (refresh qilib qayta ulanamiz),
 * `4403` — xonaga a'zo emas (qayta urinmaymiz).
 */
export function getSocketClosePolicy(code: number): SocketClosePolicy {
  if (code === 4403) return { refresh: false, reconnect: false };
  if (code === 4401) return { refresh: true, reconnect: true };
  return { refresh: false, reconnect: true };
}

export interface ChatSocketManagerInit {
  roomId: string;
  onEvent?: (event: ParsedSocketEvent) => void;
  onState?: (state: SocketState) => void;
}

const MAX_RETRIES = 6;
const MAX_RETRY_DELAY_MS = 30_000;
const TYPING_THROTTLE_MS = 1500;

export class ChatSocketManager {
  private readonly roomId: string;
  private readonly onEvent?: (event: ParsedSocketEvent) => void;
  private readonly onState?: (state: SocketState) => void;

  private socket: WebSocket | null = null;
  private retries = 0;
  private closed = false;
  private retryTimer: ReturnType<typeof setTimeout> | null = null;
  private lastTypingAt = 0;

  private readonly handleOnline: () => void;
  private readonly handleVisibility: () => void;

  constructor({ roomId, onEvent, onState }: ChatSocketManagerInit) {
    this.roomId = roomId;
    this.onEvent = onEvent;
    this.onState = onState;
    this.handleOnline = () => this.connect();
    this.handleVisibility = () => {
      if (document.visibilityState === "visible" && !this.socket) this.connect();
    };
  }

  start(): void {
    this.closed = false;
    globalThis.addEventListener?.("online", this.handleOnline);
    globalThis.document?.addEventListener?.("visibilitychange", this.handleVisibility);
    this.connect();
  }

  connect(): void {
    if (this.closed || this.socket || (typeof navigator !== "undefined" && !navigator.onLine)) return;
    const token = tokenStorage.getAccessToken();
    if (!token) return;

    const url = `${env.wsUrl}/ws/chat/${encodeURIComponent(this.roomId)}/?token=${encodeURIComponent(token)}`;
    this.onState?.("connecting");
    const socket = new WebSocket(url);
    this.socket = socket;

    socket.onopen = () => {
      this.retries = 0;
      this.onState?.("connected");
    };

    socket.onmessage = (event: MessageEvent<string>) => {
      try {
        const parsed = parseSocketEvent(event.data);
        if (parsed) this.onEvent?.(parsed);
      } catch {
        this.onEvent?.({ type: "error", detail: "Socket javobi noto‘g‘ri" });
      }
    };

    socket.onerror = () => this.onState?.("error");

    socket.onclose = async (event: CloseEvent) => {
      if (this.socket === socket) this.socket = null;
      this.onState?.("disconnected");
      const policy = getSocketClosePolicy(event.code);
      if (this.closed || !policy.reconnect) return;
      if (policy.refresh) {
        const refreshed = await refreshTokenManager.refresh();
        if (!refreshed) return;
      }
      this.scheduleReconnect();
    };
  }

  /** Exponential backoff: 700ms, 1.4s, 2.8s … maksimum 30s, 6 martagacha. */
  scheduleReconnect(): void {
    if (this.closed || this.retryTimer || this.retries >= MAX_RETRIES) return;
    const delay = Math.min(MAX_RETRY_DELAY_MS, 700 * 2 ** this.retries++);
    this.retryTimer = globalThis.setTimeout(() => {
      this.retryTimer = null;
      this.connect();
    }, delay);
  }

  sendTyping(): void {
    const now = Date.now();
    if (now - this.lastTypingAt < TYPING_THROTTLE_MS || this.socket?.readyState !== WebSocket.OPEN) {
      return;
    }
    this.lastTypingAt = now;
    this.socket.send(JSON.stringify({ type: "typing" }));
  }

  stop(): void {
    this.closed = true;
    if (this.retryTimer) globalThis.clearTimeout(this.retryTimer);
    this.retryTimer = null;
    globalThis.removeEventListener?.("online", this.handleOnline);
    globalThis.document?.removeEventListener?.("visibilitychange", this.handleVisibility);
    const socket = this.socket;
    this.socket = null;
    socket?.close(1000, "Room changed");
  }
}

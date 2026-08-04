import { useEffect, useState, type CSSProperties, type KeyboardEvent, type PointerEvent } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Outlet, useParams } from "react-router-dom";
import { ConversationPanel } from "@/widgets/conversation-panel";
import { STORAGE_KEYS } from "@/shared/constants";
import { storage } from "@/shared/lib";
import type { ConversationRole } from "@/shared/types";



const WIDTH_KEYS: Record<ConversationRole, string> = {
  teacher: STORAGE_KEYS.CONVERSATION_PANEL_WIDTH,
  student: STORAGE_KEYS.STUDENT_CONVERSATION_PANEL_WIDTH,
};

const MIN_WIDTH = 300;
const MAX_WIDTH = 480;
const DEFAULT_WIDTH = 368;

export function ConversationLayout({ role = "teacher" }: { role?: ConversationRole }) {
  const { conversationId } = useParams();
  const storageKey = WIDTH_KEYS[role] ?? WIDTH_KEYS.teacher;
  const [panelWidth, setPanelWidth] = useState(() => {
    const saved = Number(storage.get(storageKey));
    return Number.isFinite(saved) && saved >= MIN_WIDTH && saved <= MAX_WIDTH ? saved : DEFAULT_WIDTH;
  });
  const [resizing, setResizing] = useState(false);

  useEffect(() => {
    if (!resizing) return undefined;
    function handleMove(event: globalThis.PointerEvent) {
      setPanelWidth(Math.min(MAX_WIDTH, Math.max(MIN_WIDTH, event.clientX)));
    }
    function handleUp() {
      setResizing(false);
      document.body.classList.remove("is-resizing-sidebar");
    }
    window.addEventListener("pointermove", handleMove);
    window.addEventListener("pointerup", handleUp);
    return () => {
      window.removeEventListener("pointermove", handleMove);
      window.removeEventListener("pointerup", handleUp);
      document.body.classList.remove("is-resizing-sidebar");
    };
  }, [resizing]);

  useEffect(() => {
    storage.set(storageKey, panelWidth);
  }, [panelWidth, storageKey]);

  function startResize(event: PointerEvent<HTMLDivElement>) {
    if (window.innerWidth <= 768) return;
    event.preventDefault();
    setResizing(true);
    document.body.classList.add("is-resizing-sidebar");
  }

  function resizeWithKeyboard(event: KeyboardEvent<HTMLDivElement>) {
    if (event.key === "ArrowLeft") setPanelWidth((width) => Math.max(MIN_WIDTH, width - 16));
    if (event.key === "ArrowRight") setPanelWidth((width) => Math.min(MAX_WIDTH, width + 16));
  }

  return (
    <div
      className={`teacher-shell conversation-shell conversation-shell--${role} ${resizing ? "is-resizing" : ""}`}
      style={{ "--conversation-width": `${panelWidth}px` } as CSSProperties}
    >
      <ConversationPanel role={role} />
      <div
        className="conversation-resize-handle"
        role="separator"
        aria-label="Suhbatlar paneli kengligini o‘zgartirish"
        aria-orientation="vertical"
        tabIndex={0}
        onPointerDown={startResize}
        onDoubleClick={() => setPanelWidth(DEFAULT_WIDTH)}
        onKeyDown={resizeWithKeyboard}
      >
        <span />
      </div>
      <main className={`teacher-main conversation-main ${conversationId ? "has-conversation" : ""}`}>
        <AnimatePresence mode="wait">
          <motion.div
            key={conversationId ?? "empty"}
            className="route-motion"
            initial={{ opacity: 0, x: 5 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -4 }}
            transition={{ duration: 0.18 }}
          >
            <Outlet />
          </motion.div>
        </AnimatePresence>
      </main>
    </div>
  );
}

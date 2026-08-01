import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Outlet, useParams } from "react-router-dom";
import { ConversationPanel } from "../../components/layout/conversation-panel";

export function TeacherLayout() {
  const { conversationId } = useParams();
  const [panelWidth, setPanelWidth] = useState(() => {
    const saved = Number(
      window.localStorage.getItem("fokus_conversation_width")
    );
    return Number.isFinite(saved) && saved >= 300 && saved <= 480 ? saved : 368;
  });
  const [resizing, setResizing] = useState(false);

  useEffect(() => {
    if (!resizing) return undefined;
    function handleMove(event) {
      setPanelWidth(Math.min(480, Math.max(300, event.clientX)));
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
    window.localStorage.setItem("fokus_conversation_width", String(panelWidth));
  }, [panelWidth]);

  function startResize(event) {
    if (window.innerWidth <= 768) return;
    event.preventDefault();
    setResizing(true);
    document.body.classList.add("is-resizing-sidebar");
  }

  function resizeWithKeyboard(event) {
    if (event.key === "ArrowLeft")
      setPanelWidth((width) => Math.max(300, width - 16));
    if (event.key === "ArrowRight")
      setPanelWidth((width) => Math.min(480, width + 16));
  }

  return (
    <div
      className={`teacher-shell ${resizing ? "is-resizing" : ""}`}
      style={{ "--conversation-width": `${panelWidth}px` }}
    >
      <ConversationPanel />
      <div
        className="conversation-resize-handle"
        role="separator"
        aria-label="Suhbatlar paneli kengligini o‘zgartirish"
        aria-orientation="vertical"
        tabIndex={0}
        onPointerDown={startResize}
        onDoubleClick={() => setPanelWidth(368)}
        onKeyDown={resizeWithKeyboard}
      >
        <span />
      </div>
      <main
        className={`teacher-main ${conversationId ? "has-conversation" : ""}`}
      >
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

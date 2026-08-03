import { AnimatePresence, motion } from "framer-motion";
import { Pencil, Reply, Trash2, UsersRound } from "lucide-react";
import { useEffect } from "react";

const quickReactions = ["👍", "❤️", "🔥", "👏", "😁", "🤔"];

export function MessageActionsMenu({
  message,
  position,
  onClose,
  onReply,
  onEdit,
  onDelete,
  onReact,
  currentUserId = "teacher-1",
  capabilities = { reply: true, edit: false, delete: false, react: false },
}) {
  const outgoing = message?.senderId === currentUserId;

  useEffect(() => {
    if (!message) return undefined;
    function handleEscape(event) {
      if (event.key === "Escape") onClose();
    }
    window.addEventListener("keydown", handleEscape);
    return () => window.removeEventListener("keydown", handleEscape);
  }, [message, onClose]);

  return (
    <AnimatePresence>
      {message && (
        <>
          <motion.button
            className="message-menu-overlay"
            aria-label="Xabar menyusini yopish"
            onClick={onClose}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          />
          <motion.div
            className="message-actions-menu"
            role="menu"
            style={{ left: position.x, top: position.y }}
            initial={{ opacity: 0, scale: 0.94, y: -5 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96 }}
            transition={{ duration: 0.14 }}
          >
            {capabilities.react ? <div
              className="message-reaction-picker"
              aria-label="Reaksiya tanlash"
            >
              {quickReactions.map((emoji) => (
                <motion.button
                  key={emoji}
                  whileHover={{ y: -3, scale: 1.08 }}
                  whileTap={{ scale: 1.28, rotate: -7 }}
                  onClick={() => {
                    onReact(message, emoji);
                    onClose();
                  }}
                  aria-label={`${emoji} reaksiyasini qo‘shish`}
                >
                  {emoji}
                </motion.button>
              ))}
            </div> : null}
            {capabilities.react ? <span className="message-menu-divider" /> : null}
            {capabilities.reply ? <button
              role="menuitem"
              onClick={() => {
                onReply(message);
                onClose();
              }}
            >
              <Reply size={17} /> Javob berish
            </button> : null}
            {capabilities.edit && outgoing && (
              <button
                role="menuitem"
                onClick={() => {
                  onEdit(message);
                  onClose();
                }}
              >
                <Pencil size={16} /> Tahrirlash
              </button>
            )}
            {capabilities.delete ? <span className="message-menu-divider" /> : null}
            {capabilities.delete ? <button
              role="menuitem"
              className="destructive"
              onClick={() => {
                onDelete(message, "me");
                onClose();
              }}
            >
              <Trash2 size={16} /> Men uchun o‘chirish
            </button> : null}
            {capabilities.delete && outgoing && (
              <button
                role="menuitem"
                className="destructive"
                onClick={() => {
                  onDelete(message, "everyone");
                  onClose();
                }}
              >
                <UsersRound size={16} /> Hamma uchun o‘chirish
              </button>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

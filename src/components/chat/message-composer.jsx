import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  LoaderCircle,
  Paperclip,
  Pencil,
  Reply,
  SendHorizontal,
  Smile,
  X,
} from "lucide-react";
import { toast } from "sonner";
import {
  Dropdown,
  DropdownContent,
  DropdownItem,
  DropdownTrigger,
} from "../ui/dropdown";

const emojis = ["🔥", "💎", "🚀", "👑", "⚡", "🎯"];

export function MessageComposer({
  onSend,
  sending,
  replyTo,
  editingMessage,
  onCancelContext,
  currentUserId = "teacher-1",
}) {
  const [draft, setDraft] = useState(() => editingMessage?.text ?? "");
  const [selectedFile, setSelectedFile] = useState(null);
  const textareaRef = useRef(null);
  const fileRef = useRef(null);

  useEffect(() => {
    const element = textareaRef.current;
    if (!element) return;
    element.style.height = "auto";
    element.style.height = `${Math.min(element.scrollHeight, 120)}px`;
  }, [draft]);

  useEffect(() => {
    if (editingMessage || replyTo) textareaRef.current?.focus();
  }, [editingMessage, replyTo]);

  async function submit() {
    const text = draft.trim();
    if ((!text && !selectedFile) || sending) return;
    const attachment = selectedFile
      ? {
          name: selectedFile.name,
          size: formatFileSize(selectedFile.size),
          mimeType: selectedFile.type,
          url: URL.createObjectURL(selectedFile),
        }
      : undefined;
    await onSend({ text, attachment });
    setDraft("");
    setSelectedFile(null);
  }

  function handleKeyDown(event) {
    if (event.key === "Escape" && (replyTo || editingMessage)) {
      onCancelContext();
      if (editingMessage) setDraft("");
      return;
    }
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      submit();
    }
  }

  const context = editingMessage || replyTo;

  return (
    <div className="composer-wrap">
      <AnimatePresence initial={false}>
        {context && (
          <motion.div
            className="composer-context"
            initial={{ opacity: 0, y: 8, height: 0 }}
            animate={{ opacity: 1, y: 0, height: "auto" }}
            exit={{ opacity: 0, y: 5, height: 0 }}
          >
            <span className="composer-context-icon">
              {editingMessage ? <Pencil size={16} /> : <Reply size={17} />}
            </span>
            <span className="composer-context-copy">
              <strong>
                {editingMessage
                  ? "Xabarni tahrirlash"
                  : `${
                      replyTo.senderName ||
                      (replyTo.senderId === currentUserId ? "Siz" : "Javob")
                    }`}
              </strong>
              <small>{context.text}</small>
            </span>
            <button
              onClick={() => {
                onCancelContext();
                if (editingMessage) setDraft("");
              }}
              aria-label={
                editingMessage
                  ? "Tahrirlashni bekor qilish"
                  : "Replyni bekor qilish"
              }
            >
              <X size={17} />
            </button>
          </motion.div>
        )}
      </AnimatePresence>
      <AnimatePresence initial={false}>
        {selectedFile && (
          <motion.div
            className="composer-file"
            initial={{ opacity: 0, y: 6, height: 0 }}
            animate={{ opacity: 1, y: 0, height: "auto" }}
            exit={{ opacity: 0, y: 4, height: 0 }}
          >
            <span>
              <Paperclip size={16} />
            </span>
            <div>
              <strong>{selectedFile.name}</strong>
              <small>{formatFileSize(selectedFile.size)}</small>
            </div>
            <button
              onClick={() => setSelectedFile(null)}
              aria-label="Biriktirilgan faylni olib tashlash"
            >
              <X size={16} />
            </button>
          </motion.div>
        )}
      </AnimatePresence>
      <div className="composer">
        <input
          ref={fileRef}
          type="file"
          hidden
          onChange={(event) => {
            const file = event.target.files?.[0];
            if (!file) return;
            if (file.size > 20 * 1024 * 1024) {
              toast.error("Fayl hajmi 20 MB dan oshmasligi kerak");
              return;
            }
            setSelectedFile(file);
            toast.success("Fayl biriktirildi");
            event.target.value = "";
          }}
        />
        <button
          className="composer-action"
          onClick={() => fileRef.current?.click()}
          disabled={Boolean(editingMessage)}
          aria-label="Fayl biriktirish"
        >
          <Paperclip size={20} />
        </button>
        <textarea
          ref={textareaRef}
          rows={1}
          value={draft}
          onChange={(event) => setDraft(event.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={
            editingMessage ? "Xabarni tahrirlang..." : "Xabar yozing..."
          }
          aria-label="Xabar matni"
        />
        <Dropdown>
          <DropdownTrigger asChild>
            <button className="composer-action" aria-label="Emoji tanlash">
              <Smile size={20} />
            </button>
          </DropdownTrigger>
          <DropdownContent className="emoji-picker">
            {emojis.map((emoji) => (
              <DropdownItem
                key={emoji}
                onSelect={() => setDraft((value) => value + emoji)}
              >
                {emoji}
              </DropdownItem>
            ))}
          </DropdownContent>
        </Dropdown>
        <button
          className="send-button"
          onClick={submit}
          disabled={(!draft.trim() && !selectedFile) || sending}
          aria-label={
            editingMessage ? "Tahrirlangan xabarni saqlash" : "Xabarni yuborish"
          }
        >
          {sending ? (
            <LoaderCircle className="spin" size={19} />
          ) : editingMessage ? (
            <Pencil size={18} />
          ) : (
            <SendHorizontal size={19} />
          )}
        </button>
      </div>
    </div>
  );
}

function formatFileSize(bytes) {
  if (bytes < 1024 * 1024) return `${Math.max(1, Math.round(bytes / 1024))} KB`;
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}

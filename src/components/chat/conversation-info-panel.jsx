import { useState } from "react";
import {
  Bell,
  BellOff,
  BookOpen,
  Check,
  Copy,
  Mail,
  ShieldAlert,
  UserRound,
  UsersRound,
} from "lucide-react";
import { toast } from "sonner";
import { availableUsers, currentTeacher } from "@/modules/user";
import { useAuth } from "@/app/providers";
import { Avatar } from "../ui/avatar";
import { Button } from "../ui/button";
import { Dialog, DialogContent } from "../ui/dialog";

export function ConversationInfoPanel({ conversation, open, onOpenChange }) {
  const { user: currentUser } = useAuth();
  const isGroup = conversation.type === "group";
  const person = [...availableUsers, currentTeacher].find(
    (user) => user.id === conversation.participantId
  );
  const muteKey = `fokus_muted_${conversation.id}`;
  const [muted, setMuted] = useState(
    () => window.localStorage.getItem(muteKey) === "true"
  );
  const [copied, setCopied] = useState("");

  function toggleMute() {
    const next = !muted;
    setMuted(next);
    window.localStorage.setItem(muteKey, String(next));
    toast.success(
      next
        ? "Bildirishnomalar ovozsiz qilindi"
        : "Bildirishnomalar ovozi yoqildi"
    );
  }

  async function copyValue(label, value) {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(label);
      toast.success(`${label} nusxalandi`);
      window.setTimeout(() => setCopied(""), 1400);
    } catch {
      toast.error("Nusxalash amalga oshmadi");
    }
  }

  const username = person?.username ?? "@fokus_user";
  const email = person?.email ?? "student@fokus.uz";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      {open && (
        <DialogContent className="info-sheet" motionPreset="right-sheet">
          <div className="info-profile">
            <Avatar
              name={conversation.title}
              tone={conversation.avatarTone}
              size="lg"
              status={!isGroup ? conversation.status : undefined}
            />
            <h3>{conversation.title}</h3>
            <p>
              {isGroup
                ? `${conversation.memberCount ?? 1} o‘quvchi · ${
                    conversation.subject ?? "O‘quv guruhi"
                  }`
                : conversation.status === "online"
                ? "Hozir onlayn"
                : conversation.status === "offline"
                ? "Offline"
                : "Yaqinda faol edi"}
            </p>
          </div>

          <div className="info-quick-actions">
            <button
              className={muted ? "is-active" : ""}
              onClick={toggleMute}
              aria-pressed={muted}
            >
              {muted ? <Bell size={19} /> : <BellOff size={19} />}
              <span>{muted ? "Ovozni yoqish" : "Ovozsiz qilish"}</span>
            </button>
            <button
              onClick={() =>
                toast.info(
                  isGroup ? "Guruh materiallari" : "Profil materiallari"
                )
              }
            >
              <BookOpen size={19} />
              <span>Materiallar</span>
            </button>
          </div>

          <div className="info-section">
            <span className="info-section-title">
              {isGroup ? "GURUH HAQIDA" : "MA’LUMOT"}
            </span>
            {isGroup ? (
              <p className="info-description">{conversation.description}</p>
            ) : (
              <div className="info-copy-list">
                <button
                  className="info-row"
                  onClick={() => copyValue("Username", username)}
                >
                  <UserRound size={18} />
                  <span>
                    <small>Username · nusxalash uchun bosing</small>
                    <strong>{username}</strong>
                  </span>
                  {copied === "Username" ? (
                    <Check size={17} />
                  ) : (
                    <Copy size={16} />
                  )}
                </button>
                <button
                  className="info-row"
                  onClick={() => copyValue("Email", email)}
                >
                  <Mail size={18} />
                  <span>
                    <small>Email · nusxalash uchun bosing</small>
                    <strong>{email}</strong>
                  </span>
                  {copied === "Email" ? (
                    <Check size={17} />
                  ) : (
                    <Copy size={16} />
                  )}
                </button>
              </div>
            )}
          </div>

          {isGroup && (
            <div className="info-section">
              <span className="info-section-title">ISHTIROKCHILAR</span>
              {availableUsers.slice(0, 3).map((user) => (
                <div className="member-mini" key={user.id}>
                  <Avatar
                    name={user.name}
                    tone={user.avatarTone}
                    size="sm"
                    status={user.status}
                  />
                  <span>
                    <strong>{user.name}</strong>
                    <small>{user.username}</small>
                  </span>
                </div>
              ))}
              <div className="member-count">
                <UsersRound size={16} /> Yana{" "}
                {Math.max(0, (conversation.memberCount ?? 3) - 3)} ishtirokchi
              </div>
            </div>
          )}

          {!isGroup && currentUser?.role !== "STUDENT" && (
            <Button
              variant="ghost"
              className="block-button"
              onClick={() =>
                toast.error(
                  "Foydalanuvchini bloklash demo rejimida o‘chirilgan"
                )
              }
            >
              <ShieldAlert size={18} /> Foydalanuvchini bloklash
            </Button>
          )}
        </DialogContent>
      )}
    </Dialog>
  );
}

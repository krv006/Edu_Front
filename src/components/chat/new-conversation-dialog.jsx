import { useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  MessageCircle,
  Search,
  Sparkles,
  UserPlus,
  UsersRound,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { conversationApi, conversationKeys } from "@/modules/conversation";
import { availableUsers } from "@/modules/user";
import { Avatar } from "../ui/avatar";
import { Button } from "../ui/button";
import { Dialog, DialogContent } from "../ui/dialog";

export function NewConversationDialog({ open, onOpenChange }) {
  const [mode, setMode] = useState("group");
  const [search, setSearch] = useState("");
  const [group, setGroup] = useState({
    name: "",
    subject: "",
    description: "",
  });
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const users = useMemo(
    () =>
      availableUsers.filter((user) =>
        `${user.name} ${user.username} ${user.email}`
          .toLowerCase()
          .includes(search.toLowerCase())
      ),
    [search]
  );
  const create = useMutation({
    mutationFn: ({ kind, payload }) =>
      kind === "group"
        ? conversationApi.createGroup(payload)
        : conversationApi.createDirect(payload),
    onSuccess: (conversation) => {
      queryClient.invalidateQueries({ queryKey: conversationKeys.all });
      onOpenChange(false);
      navigate(`/teacher/chats/${conversation.id}`);
      toast.success(
        conversation.type === "group"
          ? "Yangi guruh yaratildi"
          : "Shaxsiy suhbat ochildi"
      );
      setGroup({ name: "", subject: "", description: "" });
      setSearch("");
    },
  });

  function updateGroup(field, value) {
    setGroup((current) => ({ ...current, [field]: value }));
  }

  function submitGroup(event) {
    event.preventDefault();
    if (!group.name.trim() || !group.subject.trim()) return;
    create.mutate({ kind: "group", payload: group });
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      {open && (
        <DialogContent
          title="Yangi muloqot"
          description="Guruh yarating yoki o‘quvchi bilan shaxsiy suhbat boshlang."
        >
          <div
            className="create-mode-tabs"
            role="tablist"
            aria-label="Muloqot turi"
          >
            <button
              className={mode === "group" ? "is-active" : ""}
              onClick={() => setMode("group")}
              role="tab"
              aria-selected={mode === "group"}
            >
              {mode === "group" && (
                <motion.span
                  layoutId="create-mode-indicator"
                  className="create-mode-indicator"
                />
              )}
              <UsersRound size={17} /> Yangi guruh
            </button>
            <button
              className={mode === "direct" ? "is-active" : ""}
              onClick={() => setMode("direct")}
              role="tab"
              aria-selected={mode === "direct"}
            >
              {mode === "direct" && (
                <motion.span
                  layoutId="create-mode-indicator"
                  className="create-mode-indicator"
                />
              )}
              <MessageCircle size={17} /> Shaxsiy xabar
            </button>
          </div>

          <AnimatePresence mode="wait" initial={false}>
            {mode === "group" ? (
              <motion.div
                key="group"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 8 }}
                transition={{ duration: 0.18 }}
              >
                <form className="create-group-form" onSubmit={submitGroup}>
                  <div className="group-create-note">
                    <span>
                      <Sparkles size={17} />
                    </span>
                    <p>
                      <strong>Yangi o‘quv maydoni</strong>
                      <small>
                        Chat, darslar, vazifalar va o‘quvchilar bitta guruhda.
                      </small>
                    </p>
                  </div>
                  <label>
                    Kurs yoki guruh nomi
                    <input
                      value={group.name}
                      onChange={(event) =>
                        updateGroup("name", event.target.value)
                      }
                      placeholder="Masalan: Ingliz tili — Intermediate"
                      autoFocus
                    />
                  </label>
                  <label>
                    Fan
                    <input
                      value={group.subject}
                      onChange={(event) =>
                        updateGroup("subject", event.target.value)
                      }
                      placeholder="Masalan: Ingliz tili"
                    />
                  </label>
                  <label>
                    Qisqa tavsif
                    <textarea
                      rows={3}
                      value={group.description}
                      onChange={(event) =>
                        updateGroup("description", event.target.value)
                      }
                      placeholder="Guruh maqsadi va yo‘nalishi..."
                    />
                  </label>
                  <div className="dialog-actions">
                    <Button
                      type="button"
                      variant="ghost"
                      onClick={() => onOpenChange(false)}
                    >
                      Bekor qilish
                    </Button>
                    <Button
                      type="submit"
                      loading={create.isPending}
                      disabled={!group.name.trim() || !group.subject.trim()}
                    >
                      Guruh yaratish
                    </Button>
                  </div>
                </form>
              </motion.div>
            ) : (
              <motion.div
                key="direct"
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -8 }}
                transition={{ duration: 0.18 }}
              >
                <div className="dialog-search">
                  <Search size={18} />
                  <input
                    autoFocus
                    value={search}
                    onChange={(event) => setSearch(event.target.value)}
                    placeholder="Ism, username yoki email..."
                    aria-label="Foydalanuvchini qidirish"
                  />
                </div>
                <div className="people-list">
                  <p className="list-caption">O‘QUVCHILAR · {users.length}</p>
                  {users.map((user) => (
                    <button
                      key={user.id}
                      className="person-row"
                      onClick={() =>
                        create.mutate({ kind: "direct", payload: user })
                      }
                      disabled={create.isPending}
                    >
                      <Avatar
                        name={user.name}
                        tone={user.avatarTone}
                        size="md"
                        status={user.status}
                      />
                      <span>
                        <strong>{user.name}</strong>
                        <small>
                          {user.username} · {user.email}
                        </small>
                      </span>
                      <UserPlus size={18} />
                    </button>
                  ))}
                  {users.length === 0 && (
                    <p className="dialog-empty">Mos foydalanuvchi topilmadi.</p>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </DialogContent>
      )}
    </Dialog>
  );
}

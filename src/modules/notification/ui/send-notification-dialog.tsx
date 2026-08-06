import { useState, type FormEvent } from "react";
import { Megaphone, Search, UserRound } from "lucide-react";
import { Avatar, Button, Dialog, DialogContent } from "@/shared/ui/legacy";
import type { NotificationTarget } from "../api/notification.dto";
import { useSendNotification, useUserSearch } from "../model/notification.queries";

export interface SendNotificationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const TARGETS: Array<{ id: NotificationTarget; label: string; hint: string; icon: typeof UserRound }> = [
  { id: "user", label: "Bitta foydalanuvchi", hint: "Qidirib tanlang", icon: UserRound },
  { id: "all", label: "Hammaga", hint: "Barcha foydalanuvchilar", icon: Megaphone },
];

/**
 * Admin xabar yuborish formasi (docs/COMPLETED_WORK.md §2).
 *
 * Matn oddiy paragraflar sifatida yuboriladi — backend `nh3` bilan tozalaydi,
 * shuning uchun formatlash teglari saqlanib qoladi, xavflisi tashlanadi.
 */
export function SendNotificationDialog({ open, onOpenChange }: SendNotificationDialogProps) {
  const [target, setTarget] = useState<NotificationTarget>("user");
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState<{ id: string; name: string } | null>(null);
  const [text, setText] = useState("");

  const search = useUserSearch(target === "user" ? query : "");
  const send = useSendNotification();

  function reset() {
    setTarget("user");
    setQuery("");
    setSelected(null);
    setText("");
  }

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!text.trim() || (target === "user" && !selected)) return;

    send.mutate(
      {
        // Har bir qator alohida paragraf bo'ladi.
        description: text
          .trim()
          .split(/\n{2,}/)
          .map((block) => `<p>${block.replace(/\n/g, "<br />")}</p>`)
          .join(""),
        targetType: target,
        userId: selected?.id,
      },
      {
        onSuccess: () => {
          reset();
          onOpenChange(false);
        },
      }
    );
  }

  const canSubmit = Boolean(text.trim()) && (target === "all" || Boolean(selected));

  return (
    <Dialog
      open={open}
      onOpenChange={(value) => {
        onOpenChange(value);
        if (!value) reset();
      }}
    >
      {open ? (
        <DialogContent title="Yangi xabar yuborish" description="Xabar tanlangan foydalanuvchilarga darhol yetadi.">
          <form className="dialog-form" onSubmit={submit}>
            <div className="notification-target">
              {TARGETS.map(({ id, label, hint, icon: Icon }) => (
                <button
                  key={id}
                  type="button"
                  className={target === id ? "is-active" : ""}
                  aria-pressed={target === id}
                  onClick={() => {
                    setTarget(id);
                    if (id === "all") setSelected(null);
                  }}
                >
                  <Icon size={17} />
                  <span>
                    <strong>{label}</strong>
                    <small>{hint}</small>
                  </span>
                </button>
              ))}
            </div>

            {target === "user" ? (
              <label className="field-group">
                <span>Foydalanuvchi</span>
                <div className="input-shell">
                  <Search size={16} />
                  <input
                    value={selected ? selected.name : query}
                    placeholder="Ism yoki username (2+ belgi)"
                    onChange={(event) => {
                      setSelected(null);
                      setQuery(event.target.value);
                    }}
                  />
                </div>

                {!selected && query.trim().length >= 2 ? (
                  <div className="notification-user-list">
                    {search.isLoading ? <p className="portal-muted">Qidirilmoqda…</p> : null}
                    {search.data?.map((user) => (
                      <button
                        key={user.id}
                        type="button"
                        onClick={() => {
                          setSelected({ id: user.id, name: user.name });
                          setQuery("");
                        }}
                      >
                        <Avatar name={user.name} size="sm" />
                        <span>
                          <strong>{user.name}</strong>
                          <small>@{user.username} · {user.role}</small>
                        </span>
                      </button>
                    ))}
                    {search.isSuccess && !search.data.length ? (
                      <p className="portal-muted">Foydalanuvchi topilmadi.</p>
                    ) : null}
                  </div>
                ) : null}
              </label>
            ) : null}

            <label className="field-group">
              <span>Xabar matni</span>
              <div className="input-shell">
                <textarea
                  rows={5}
                  value={text}
                  placeholder="Ertaga nazorat ishi bo‘ladi…"
                  onChange={(event) => setText(event.target.value)}
                  required
                />
              </div>
            </label>

            <div className="dialog-actions">
              <Button type="button" variant="secondary" onClick={() => onOpenChange(false)}>
                Bekor
              </Button>
              <Button type="submit" loading={send.isPending} disabled={!canSubmit}>
                Yuborish
              </Button>
            </div>
          </form>
        </DialogContent>
      ) : null}
    </Dialog>
  );
}

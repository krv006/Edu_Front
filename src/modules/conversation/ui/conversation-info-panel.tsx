import { useRef, useState, type FormEvent } from "react";
import { Bell, BellOff, Camera, Check, Copy, Loader2, Pencil, ShieldAlert, Trash2, UserRound } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { storage } from "@/shared/lib";
import { useAuth } from "@/modules/auth";
import { useCourse, useDeleteCourse, useUpdateCourse } from "@/modules/course";
import { DIRECT_STATUS, useDirectStatusLabel, useRespondDirect, useSetRoomImage } from "@/modules/conversation";
import type { CourseFormInput } from "@/modules/course";
import type { Conversation } from "@/shared/types";
import { Avatar, Button, Dialog, DialogContent } from "@/shared/ui/legacy";
import type { DirectAction } from "../api/conversation.dto";

export interface ConversationInfoPanelProps {
  conversation: Conversation;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ConversationInfoPanel({ conversation, open, onOpenChange }: ConversationInfoPanelProps) {
  const { t } = useTranslation("chat");
  const directStatusLabel = useDirectStatusLabel();
  const { user } = useAuth();
  const navigate = useNavigate();
  const isGroup = conversation.type === "group";
  const muteKey = `fokus_muted_${conversation.id}`;
  const [muted, setMuted] = useState(() => storage.get(muteKey) === "true");
  const [copied, setCopied] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [courseForm, setCourseForm] = useState<CourseFormInput>({ title: "", subject: "", description: "" });
  // O'quvchiga guruh a'zolari ko'rinmaydi, lekin darsni KIM o'tishini bilishi kerak.
  // `null` — panel yopiq: aks holda har chat ochilganda ortiqcha so'rov ketardi.
  const course = useCourse(open ? conversation.courseId : null);
  const respond = useRespondDirect();
  const updateCourse = useUpdateCourse();
  const deleteCourse = useDeleteCourse();
  const setRoomImage = useSetRoomImage();
  const imageRef = useRef<HTMLInputElement>(null);

  function toggleMute() {
    const next = !muted;
    setMuted(next);
    storage.set(muteKey, next);
    toast.success(next ? t("info.mutedOn") : t("info.mutedOff"));
  }

  async function copyUsername() {
    const value = conversation.participant?.username ? `@${conversation.participant.username}` : "";
    if (!value) return;
    await navigator.clipboard.writeText(value);
    setCopied(true);
    toast.success(t("info.usernameCopied"));
    setTimeout(() => setCopied(false), 1400);
  }

  function respondDirect(action: DirectAction) {
    respond.mutate(
      { roomId: conversation.id, action },
      {
        onSuccess: () => {
          toast.success(action === "accept" ? t("info.conversationAccepted") : t("info.conversationBlocked"));
          onOpenChange(false);
        },
        onError: (error: Error) => toast.error(error.message),
      }
    );
  }

  function beginEdit() {
    setCourseForm({
      title: conversation.title || "",
      subject: conversation.subject || "",
      description: conversation.description || "",
    });
    setEditOpen(true);
  }

  function saveCourse(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    updateCourse.mutate(
      { id: conversation.courseId as string, form: courseForm },
      { onSuccess: () => setEditOpen(false), onError: (error: Error) => toast.error(error.message) }
    );
  }

  function removeCourse() {
    deleteCourse.mutate(conversation.courseId as string, {
      onSuccess: () => {
        setDeleteOpen(false);
        onOpenChange(false);
        navigate("/teacher/chats", { replace: true });
      },
      onError: (error: Error) => toast.error(error.message),
    });
  }

  const teacherGroup = isGroup && user?.role === "TEACHER";

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        {open ? (
          <DialogContent
            className="info-sheet"
            motionPreset="right-sheet"
            title={conversation.title}
            description={isGroup ? conversation.subject || t("info.groupSubjectFallback") : t("info.profileInfo")}
          >
            <div className="info-profile">
              <span className="info-avatar-slot">
                <Avatar name={conversation.title} tone={conversation.avatarTone} size="lg" src={conversation.imageUrl} />
                {/* Guruh rasmini faqat kurs egasi almashtira oladi. */}
                {teacherGroup ? (
                  <>
                    <input
                      ref={imageRef}
                      type="file"
                      accept="image/png,image/jpeg,image/webp"
                      hidden
                      onChange={(event) => {
                        const file = event.target.files?.[0];
                        event.target.value = "";
                        if (file) {
                          setRoomImage.mutate(
                            { roomId: conversation.id, image: file },
                            {
                              onSuccess: () => toast.success(t("info.groupImageUpdated")),
                              onError: (error: Error) => toast.error(error.message),
                            }
                          );
                        }
                      }}
                    />
                    <button
                      type="button"
                      className="info-avatar-edit"
                      aria-label={t("info.changeGroupImageAria")}
                      disabled={setRoomImage.isPending}
                      onClick={() => imageRef.current?.click()}
                    >
                      {setRoomImage.isPending ? <Loader2 size={14} className="spin" /> : <Camera size={14} />}
                    </button>
                  </>
                ) : null}
              </span>
              <h3>{conversation.title}</h3>
              <p>
                {isGroup
                  ? t("info.memberCount", { count: conversation.memberCount ?? 0 })
                  : directStatusLabel(conversation.directStatus, t("directStatus.active"))}
              </p>
            </div>
            <div className="info-quick-actions">
              <button className={muted ? "is-active" : ""} onClick={toggleMute}>
                {muted ? <Bell size={19} /> : <BellOff size={19} />}
                <span>{muted ? t("info.muteOn") : t("info.muteOff")}</span>
              </button>
              {teacherGroup ? (
                <button onClick={beginEdit}>
                  <Pencil size={19} />
                  <span>{t("info.editCourse")}</span>
                </button>
              ) : null}
            </div>
            <div className="info-section">
              <span className="info-section-title">{isGroup ? t("info.aboutGroup") : t("info.aboutDirect")}</span>
              {isGroup ? (
                <p className="info-description">{conversation.description || t("info.groupDescriptionFallback")}</p>
              ) : (
                <button className="info-row" onClick={copyUsername}>
                  <UserRound size={18} />
                  <span>
                    <small>{t("info.usernameHint")}</small>
                    <strong>@{conversation.participant?.username || "—"}</strong>
                  </span>
                  {copied ? <Check size={17} /> : <Copy size={16} />}
                </button>
              )}
            </div>
            {/* O‘qituvchi — kurs egasiga o‘z ismini ko‘rsatishdan ma’no yo‘q. */}
            {isGroup && !teacherGroup ? (
              <div className="info-section">
                <span className="info-section-title">{t("info.teacherSection")}</span>
                {course.data ? (
                  <div className="member-mini">
                    <Avatar name={course.data.teacher} tone={course.data.teacherUser?.avatarTone} size="sm" />
                    <span>
                      <strong>{course.data.teacher}</strong>
                      {course.data.teacherUser?.username ? <small>@{course.data.teacherUser.username}</small> : null}
                    </span>
                  </div>
                ) : (
                  <p className="info-description">{course.isLoading ? t("info.loading") : t("info.noInfo")}</p>
                )}
              </div>
            ) : null}
            {/* Backend DirectStatusEnum: pending | active | blocked (/api/schema/). */}
            {!isGroup && user?.role === "TEACHER" && conversation.directStatus === DIRECT_STATUS.PENDING ? (
              <Button loading={respond.isPending} onClick={() => respondDirect("accept")}>
                <Check size={18} /> {t("info.acceptConversation")}
              </Button>
            ) : null}
            {!isGroup && user?.role === "TEACHER" && conversation.directStatus !== DIRECT_STATUS.BLOCKED ? (
              <Button
                variant="ghost"
                className="block-button"
                loading={respond.isPending}
                onClick={() => respondDirect("block")}
              >
                <ShieldAlert size={18} /> {t("info.blockUser")}
              </Button>
            ) : null}
            {teacherGroup ? (
              <Button variant="ghost" className="block-button" onClick={() => setDeleteOpen(true)}>
                <Trash2 size={18} /> {t("info.deleteCourse")}
              </Button>
            ) : null}
          </DialogContent>
        ) : null}
      </Dialog>
      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        {editOpen && (
          <DialogContent title={t("info.editCourseTitle")} description={t("info.editCourseDescription")}>
            <form className="dialog-form" onSubmit={saveCourse}>
              <label className="field-group">
                <span>{t("info.courseName")}</span>
                <div className="input-shell">
                  <input
                    value={courseForm.title}
                    onChange={(event) => setCourseForm((value) => ({ ...value, title: event.target.value }))}
                    required
                  />
                </div>
              </label>
              <label className="field-group">
                <span>{t("info.subject")}</span>
                <div className="input-shell">
                  <input
                    value={courseForm.subject}
                    onChange={(event) => setCourseForm((value) => ({ ...value, subject: event.target.value }))}
                  />
                </div>
              </label>
              <label className="field-group">
                <span>{t("info.description")}</span>
                <textarea
                  value={courseForm.description}
                  onChange={(event) => setCourseForm((value) => ({ ...value, description: event.target.value }))}
                  rows={4}
                />
              </label>
              <div className="dialog-actions">
                <Button type="button" variant="secondary" onClick={() => setEditOpen(false)}>
                  {t("info.cancel")}
                </Button>
                <Button type="submit" loading={updateCourse.isPending}>
                  {t("info.save")}
                </Button>
              </div>
            </form>
          </DialogContent>
        )}
      </Dialog>
      <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        {deleteOpen && (
          <DialogContent
            title={t("info.deleteCourseTitle")}
            description={t("info.deleteCourseDescription", { title: conversation.title })}
          >
            <div className="dialog-actions">
              <Button variant="secondary" onClick={() => setDeleteOpen(false)}>
                {t("info.cancel")}
              </Button>
              <Button loading={deleteCourse.isPending} onClick={removeCourse}>
                {t("info.deleteCourse")}
              </Button>
            </div>
          </DialogContent>
        )}
      </Dialog>
    </>
  );
}

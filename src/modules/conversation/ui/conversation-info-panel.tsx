import { useRef, useState, type FormEvent } from "react";
import { Bell, BellOff, Camera, Check, Copy, Loader2, Pencil, ShieldAlert, Trash2, UserRound } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { storage } from "@/shared/lib";
import { useAuth } from "@/modules/auth";
import { useCourse, useDeleteCourse, useUpdateCourse } from "@/modules/course";
import { DIRECT_STATUS, directStatusLabel, useRespondDirect, useSetRoomImage } from "@/modules/conversation";
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
  const { user } = useAuth(); const navigate = useNavigate(); const isGroup = conversation.type === "group"; const muteKey = `fokus_muted_${conversation.id}`;
  const [muted, setMuted] = useState(() => storage.get(muteKey) === "true"); const [copied, setCopied] = useState(false); const [editOpen, setEditOpen] = useState(false); const [deleteOpen, setDeleteOpen] = useState(false); const [courseForm, setCourseForm] = useState<CourseFormInput>({ title: "", subject: "", description: "" });
  // O'quvchiga guruh a'zolari ko'rinmaydi, lekin darsni KIM o'tishini bilishi kerak.
  // `null` — panel yopiq: aks holda har chat ochilganda ortiqcha so'rov ketardi.
  const course = useCourse(open ? conversation.courseId : null); const respond = useRespondDirect(); const updateCourse = useUpdateCourse(); const deleteCourse = useDeleteCourse(); const setRoomImage = useSetRoomImage(); const imageRef = useRef<HTMLInputElement>(null);
  function toggleMute() { const next = !muted; setMuted(next); storage.set(muteKey, next); toast.success(next ? "Bildirishnomalar ovozsiz qilindi" : "Bildirishnomalar ovozi yoqildi"); }
  async function copyUsername() { const value = conversation.participant?.username ? `@${conversation.participant.username}` : ""; if (!value) return; await navigator.clipboard.writeText(value); setCopied(true); toast.success("Username nusxalandi"); setTimeout(() => setCopied(false), 1400); }
  function respondDirect(action: DirectAction) { respond.mutate({ roomId: conversation.id, action }, { onSuccess: () => { toast.success(action === "accept" ? "Suhbat qabul qilindi" : "Suhbat bloklandi"); onOpenChange(false); }, onError: (error: Error) => toast.error(error.message) }); }
  function beginEdit() { setCourseForm({ title: conversation.title || "", subject: conversation.subject || "", description: conversation.description || "" }); setEditOpen(true); }
  function saveCourse(event: FormEvent<HTMLFormElement>) { event.preventDefault(); updateCourse.mutate({ id: conversation.courseId as string, form: courseForm }, { onSuccess: () => setEditOpen(false), onError: (error: Error) => toast.error(error.message) }); }
  function removeCourse() { deleteCourse.mutate(conversation.courseId as string, { onSuccess: () => { setDeleteOpen(false); onOpenChange(false); navigate("/teacher/chats", { replace: true }); }, onError: (error: Error) => toast.error(error.message) }); }
  const teacherGroup = isGroup && user?.role === "TEACHER";
  return <><Dialog open={open} onOpenChange={onOpenChange}>{open ? <DialogContent className="info-sheet" motionPreset="right-sheet" title={conversation.title} description={isGroup ? conversation.subject || "Kurs guruhi" : "Profil ma’lumotlari"}>
    <div className="info-profile">
      <span className="info-avatar-slot">
        <Avatar name={conversation.title} tone={conversation.avatarTone} size="lg" src={conversation.imageUrl} />
        {/* Guruh rasmini faqat kurs egasi almashtira oladi. */}
        {teacherGroup ? (<>
          <input ref={imageRef} type="file" accept="image/png,image/jpeg,image/webp" hidden onChange={(event) => { const file = event.target.files?.[0]; event.target.value = ""; if (file) setRoomImage.mutate({ roomId: conversation.id, image: file }, { onSuccess: () => toast.success("Guruh rasmi yangilandi"), onError: (error: Error) => toast.error(error.message) }); }} />
          <button type="button" className="info-avatar-edit" aria-label="Guruh rasmini o‘zgartirish" disabled={setRoomImage.isPending} onClick={() => imageRef.current?.click()}>{setRoomImage.isPending ? <Loader2 size={14} className="spin" /> : <Camera size={14} />}</button>
        </>) : null}
      </span>
      <h3>{conversation.title}</h3><p>{isGroup ? `${conversation.memberCount ?? 0} o‘quvchi` : directStatusLabel(conversation.directStatus, "Shaxsiy suhbat")}</p>
    </div>
    <div className="info-quick-actions"><button className={muted ? "is-active" : ""} onClick={toggleMute}>{muted ? <Bell size={19} /> : <BellOff size={19} />}<span>{muted ? "Ovozni yoqish" : "Ovozsiz qilish"}</span></button>{teacherGroup ? <button onClick={beginEdit}><Pencil size={19} /><span>Kursni tahrirlash</span></button> : null}</div>
    <div className="info-section"><span className="info-section-title">{isGroup ? "GURUH HAQIDA" : "MA’LUMOT"}</span>{isGroup ? <p className="info-description">{conversation.description || "Kurs guruh chati"}</p> : <button className="info-row" onClick={copyUsername}><UserRound size={18} /><span><small>Username · nusxalash uchun bosing</small><strong>@{conversation.participant?.username || "—"}</strong></span>{copied ? <Check size={17} /> : <Copy size={16} />}</button>}</div>
    {/* O‘qituvchi — kurs egasiga o‘z ismini ko‘rsatishdan ma’no yo‘q. */}
    {isGroup && !teacherGroup ? <div className="info-section"><span className="info-section-title">O‘QITUVCHI</span>{course.data ? <div className="member-mini"><Avatar name={course.data.teacher} tone={course.data.teacherUser?.avatarTone} size="sm" /><span><strong>{course.data.teacher}</strong>{course.data.teacherUser?.username ? <small>@{course.data.teacherUser.username}</small> : null}</span></div> : <p className="info-description">{course.isLoading ? "Yuklanmoqda…" : "Ma’lumot yo‘q"}</p>}</div> : null}
    {/* Backend DirectStatusEnum: pending | active | blocked (/api/schema/). */}
    {!isGroup && user?.role === "TEACHER" && conversation.directStatus === DIRECT_STATUS.PENDING ? <Button loading={respond.isPending} onClick={() => respondDirect("accept")}><Check size={18} /> Suhbatni qabul qilish</Button> : null}
    {!isGroup && user?.role === "TEACHER" && conversation.directStatus !== DIRECT_STATUS.BLOCKED ? <Button variant="ghost" className="block-button" loading={respond.isPending} onClick={() => respondDirect("block")}><ShieldAlert size={18} /> Foydalanuvchini bloklash</Button> : null}
    {teacherGroup ? <Button variant="ghost" className="block-button" onClick={() => setDeleteOpen(true)}><Trash2 size={18} /> Kursni o‘chirish</Button> : null}
  </DialogContent> : null}</Dialog>
  <Dialog open={editOpen} onOpenChange={setEditOpen}>{editOpen && <DialogContent title="Kursni tahrirlash" description="Kurs nomi, fan va tavsifini yangilang."><form className="dialog-form" onSubmit={saveCourse}><label className="field-group"><span>Kurs nomi</span><div className="input-shell"><input value={courseForm.title} onChange={(event) => setCourseForm((value) => ({ ...value, title: event.target.value }))} required /></div></label><label className="field-group"><span>Fan</span><div className="input-shell"><input value={courseForm.subject} onChange={(event) => setCourseForm((value) => ({ ...value, subject: event.target.value }))} /></div></label><label className="field-group"><span>Tavsif</span><textarea value={courseForm.description} onChange={(event) => setCourseForm((value) => ({ ...value, description: event.target.value }))} rows={4} /></label><div className="dialog-actions"><Button type="button" variant="secondary" onClick={() => setEditOpen(false)}>Bekor</Button><Button type="submit" loading={updateCourse.isPending}>Saqlash</Button></div></form></DialogContent>}</Dialog>
  <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>{deleteOpen && <DialogContent title="Kursni o‘chirish" description={`“${conversation.title}” va unga bog‘liq ma’lumotlar qayta tiklanmaydi.`}><div className="dialog-actions"><Button variant="secondary" onClick={() => setDeleteOpen(false)}>Bekor</Button><Button loading={deleteCourse.isPending} onClick={removeCourse}>Kursni o‘chirish</Button></div></DialogContent>}</Dialog></>;
}

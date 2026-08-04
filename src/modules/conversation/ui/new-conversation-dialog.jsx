import { useState } from "react";
import { motion } from "framer-motion";
import { Sparkles } from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { conversationApi, conversationKeys } from "@/modules/conversation";
import { useCourseRequests, useRespondCourseRequest } from "@/modules/course";
import { Button } from "../ui/button";
import { Dialog, DialogContent } from "../ui/dialog";

export function NewConversationDialog({ open, onOpenChange }) {
  const [group, setGroup] = useState({ name: "", subject: "", description: "" }); const navigate = useNavigate(); const client = useQueryClient(); const requests = useCourseRequests({ page_size: 20 }); const respond = useRespondCourseRequest();
  const create = useMutation({ mutationFn: conversationApi.createGroup.bind(conversationApi), onSuccess: (room) => { client.invalidateQueries({ queryKey: conversationKeys.all }); onOpenChange(false); setGroup({ name: "", subject: "", description: "" }); navigate(`/teacher/chats/${room.id}`); toast.success("Kurs va guruh chat yaratildi"); } });
  function update(field, value) { setGroup((current) => ({ ...current, [field]: value })); }
  return <Dialog open={open} onOpenChange={onOpenChange}>{open ? <DialogContent title="Yangi kurs va guruh" description="Kurs yaratilganda backend uning guruh chatini avtomatik ochadi."><motion.div initial={{ opacity: 0, y: 7 }} animate={{ opacity: 1, y: 0 }}>
    {requests.data?.items?.length ? <section className="enrollment-request-box"><span className="dialog-section-label">KUTILAYOTGAN YOZILISHLAR</span>{requests.data.items.map((request) => <article key={request.id}><div><strong>{request.student.name}</strong><small>{request.courseTitle} · @{request.student.username}</small></div><div className="inline-actions"><Button size="sm" variant="secondary" loading={respond.isPending} onClick={() => respond.mutate({ enrollmentId: request.id, action: "decline" })}>Rad etish</Button><Button size="sm" loading={respond.isPending} onClick={() => respond.mutate({ enrollmentId: request.id, action: "approve" })}>Qabul qilish</Button></div></article>)}</section> : null}
    <form className="create-group-form" onSubmit={(event) => { event.preventDefault(); if (group.name.trim() && group.subject.trim()) create.mutate(group); }}><div className="group-create-note"><span><Sparkles size={17} /></span><p><strong>Yangi o‘quv maydoni</strong><small>Chat, darslar, vazifalar va o‘quvchilar bitta kursda.</small></p></div><label>Kurs nomi<input autoFocus value={group.name} onChange={(event) => update("name", event.target.value)} placeholder="Masalan: Ingliz tili — Intermediate" /></label><label>Fan<input value={group.subject} onChange={(event) => update("subject", event.target.value)} placeholder="Masalan: Ingliz tili" /></label><label>Qisqa tavsif<textarea rows={3} value={group.description} onChange={(event) => update("description", event.target.value)} placeholder="Kurs maqsadi va yo‘nalishi..." /></label>{create.isError || requests.isError ? <div className="form-alert">{create.error?.message || requests.error?.message}</div> : null}<div className="dialog-actions"><Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>Bekor qilish</Button><Button type="submit" loading={create.isPending} disabled={!group.name.trim() || !group.subject.trim()}>Kurs yaratish</Button></div></form>
  </motion.div></DialogContent> : null}</Dialog>;
}

import { CheckCircle2, Clock3, ListChecks } from "lucide-react";
import { useParentHomework, useSelectedChild } from "@/modules/parent";
import { LoadingFallback, RouteState } from "@/shared/ui";

export function ParentHomeworkPage() {
  const { selectedChild, selectedChildId } = useSelectedChild(); const homework = useParentHomework(selectedChildId);
  if (!selectedChild) return <div className="portal-empty"><ListChecks size={30} /><h2>Farzand tanlanmagan</h2><p>Avval o‘quvchi hisobini ulang.</p></div>;
  if (homework.isLoading) return <LoadingFallback label="Vazifalar yuklanmoqda" />;
  if (homework.isError) return <RouteState title="Vazifalarni yuklab bo‘lmadi" description={homework.error.message} actionLabel="Qayta urinish" onAction={homework.refetch} />;
  return <div className="portal-page"><div className="portal-page-heading"><div><span className="portal-eyebrow">VAZIFALAR</span><h1>{selectedChild.name}</h1><p>Topshiriqlar va AI tekshiruv natijalari.</p></div></div><section className="portal-card parent-homework-list">{homework.data.map((item) => <article key={item.id}><span className="workspace-list-icon"><ListChecks size={19} /></span><div><strong>{item.title}</strong><small>{item.courseTitle} · {item.dueAt ? new Intl.DateTimeFormat("uz-UZ", { dateStyle: "medium", timeStyle: "short" }).format(new Date(item.dueAt)) : "Muddat yo‘q"}</small></div>{item.mySubmission?.status === "done" ? <span className="grade-pill"><CheckCircle2 size={15} /> {item.mySubmission.overallScore} ball · {item.mySubmission.grade}</span> : item.mySubmission?.status === "checking" ? <span className="grade-pill grade-pill--checking"><Clock3 size={14} /> Tekshirilmoqda</span> : <span className="grade-pill">Topshirilmagan</span>}</article>)}{!homework.data.length ? <div className="portal-empty"><ListChecks size={28} /><h2>Vazifa topilmadi</h2></div> : null}</section></div>;
}

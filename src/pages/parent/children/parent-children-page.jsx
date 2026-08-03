import { motion } from "framer-motion";
import { CheckCircle2, Clock3, Link2, Plus, UserPlus, UsersRound } from "lucide-react";
import { toast } from "sonner";
import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { useParentChildren } from "@/modules/parent";
import { LoadingFallback, RouteState } from "@/shared/ui";

export function ParentChildrenPage() {
  const childrenQuery = useParentChildren();
  if (childrenQuery.isLoading) return <LoadingFallback label="Farzandlar yuklanmoqda" />;
  if (childrenQuery.isError) return <RouteState title="Farzandlar ro‘yxatini yuklab bo‘lmadi" actionLabel="Qayta urinish" onAction={childrenQuery.refetch} />;
  return (
    <div className="portal-page">
      <div className="portal-page-heading"><div><span className="portal-eyebrow">OILA PROFILI</span><h1>Farzandlarim</h1><p>Biriktirilgan o‘quvchi hisoblari va ularning faolligi.</p></div><div className="heading-actions"><Button variant="secondary" onClick={() => toast.info("O‘quvchi kodi orqali ulash oynasi keyingi bosqichda ochiladi")}><Link2 size={17} /> O‘quvchini ulash</Button><Button onClick={() => toast.info("Yangi bola hisobi keyingi bosqichda yaratiladi")}><Plus size={17} /> Bola hisobi</Button></div></div>
      <div className="children-card-grid">{childrenQuery.data.map((child, index) => <motion.article className="child-profile-card" key={child.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.05 }}><div className="child-card-status"><CheckCircle2 size={15} /> Tasdiqlangan</div><Avatar name={child.name} tone={child.avatarTone} size="lg" status="online" /><h2>{child.name}</h2><p>{child.username} · {child.grade}</p><div className="child-stats"><span><CheckCircle2 size={16} /><strong>{child.lessons}</strong><small>dars</small></span><span><Clock3 size={16} /><strong>{child.minutes}</strong><small>daqiqa</small></span></div><div className="child-last"><small>So‘nggi faollik</small><strong>{child.lastActivity}</strong></div><Button variant="secondary" onClick={() => toast.info(`${child.name} profili`)}><UserPlus size={16} /> Profilni ko‘rish</Button></motion.article>)}</div>
      {childrenQuery.data.length === 0 && <div className="portal-empty"><UsersRound size={30} /><h2>Farzand hali ulanmagan</h2><p>O‘quvchi kodini kiriting yoki yangi hisob yarating.</p></div>}
    </div>
  );
}

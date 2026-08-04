import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { ShieldCheck } from "lucide-react";
import { Button, Dialog, DialogContent } from "@/shared/ui/legacy";
import { useAnswerAttention } from "../model/live.queries";
import type { AttentionCheck } from "../api/live.dto";

export interface AttentionCheckDialogProps {
  lessonId: string;
  check: AttentionCheck | null | undefined;
}
export function AttentionCheckDialog({ lessonId, check }: AttentionCheckDialogProps) {
  const answer = useAnswerAttention(lessonId); const [seconds, setSeconds] = useState(15);
  useEffect(() => { if (!check) return undefined; const update = () => setSeconds(Math.max(0, Math.ceil((new Date(check.dueAt).getTime() + 15000 - Date.now()) / 1000))); update(); const id = setInterval(update, 250); return () => clearInterval(id); }, [check]);
  return <Dialog open={Boolean(check)} onOpenChange={() => undefined}>{check ? <DialogContent title="Siz shu yerdamisiz?" description="Diqqat tekshiruviga vaqtida javob bering." closeable={false}><motion.div className="attention-check" initial={{ scale: .94, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}><ShieldCheck size={36} /><strong>{seconds}</strong><p>soniya qoldi</p><Button disabled={seconds <= 0} loading={answer.isPending} onClick={() => answer.mutate(check.id)}>Shu yerdaman</Button></motion.div></DialogContent> : null}</Dialog>;
}

import { useEffect, useRef } from "react";
import { toast } from "sonner";
import { ConversationLayout } from "@/app/layouts/conversation-layout";
import { useAuth } from "@/modules/auth";

export function TeacherLayout() {
  const { user } = useAuth();
  const warned = useRef(false);

  /**
   * Bir marta ogohlantiramiz — har render/qayta-fetchda emas, aks holda
   * darsdan darsga o'tganda ham qayta-qayta chiqib bezovta qiladi.
   */
  useEffect(() => {
    if (user?.isApproved === false && !warned.current) {
      warned.current = true;
      toast.warning(
        "Hisobingiz hali administrator tomonidan tasdiqlanmagan — kurs va dars yaratish vaqtincha yopiq.",
        { duration: 8000 }
      );
    }
  }, [user?.isApproved]);

  return <ConversationLayout role="teacher" />;
}

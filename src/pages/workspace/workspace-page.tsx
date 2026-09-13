import { Award, BarChart3, ClipboardList, FileQuestion, Library, Video } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";

interface WorkspaceCard {
  id: string;
  icon: LucideIcon;
  /**
   * Yo'l berilmagan karta — hali tayyor emas, "tez orada" deb ko'rsatiladi.
   * Yangi bo'lim tayyor bo'lsa, shu ro'yxatga `to` qo'shilsa yetarli.
   */
  to?: string;
}

/*
 * Workspace kartalari. Ro'yxat ataylab bitta joyda: bo'lim vaqt o'tib
 * kengayadi, har safar tartib-tuzilishni qayta yozmaslik uchun.
 *
 * `../quizzes` — bu sahifa `chats/workspace` ichida, shuning uchun bir pog'ona
 * yuqori chiqib `chats/quizzes` ga boradi. Shu bilan yo'l o'qituvchida ham,
 * o'quvchida ham bir xil ishlaydi.
 */
const CARDS: WorkspaceCard[] = [
  { id: "quizzes", icon: FileQuestion, to: "../quizzes" },
  { id: "assignments", icon: ClipboardList },
  { id: "materials", icon: Library },
  { id: "recordings", icon: Video },
  { id: "stats", icon: BarChart3 },
  { id: "certificates", icon: Award },
];

export function WorkspacePage() {
  const { t } = useTranslation("workspace");

  return (
    <div className="portal-page">
      <div className="portal-page-heading">
        <div>
          <span className="portal-eyebrow">{t("eyebrow")}</span>
          <h1>{t("title")}</h1>
          <p>{t("subtitle")}</p>
        </div>
      </div>

      <div className="workspace-grid">
        {CARDS.map((card, index) => {
          const Icon = card.icon;
          const body = (
            <>
              <span className="workspace-card-icon">
                <Icon size={22} />
              </span>
              <strong>{t(`cards.${card.id}.title`)}</strong>
              <p>{t(`cards.${card.id}.description`)}</p>
              {card.to ? null : <em className="workspace-card-soon">{t("soon")}</em>}
            </>
          );
          return (
            <motion.article
              key={card.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.04 }}
            >
              {card.to ? (
                <Link className="workspace-card" to={card.to}>
                  {body}
                </Link>
              ) : (
                /* Havola emas: bosiladigan ko'rinsa, bosgan odam nima
                   bo'lmaganini tushunmay qolardi. */
                <div className="workspace-card is-soon" aria-disabled="true">
                  {body}
                </div>
              )}
            </motion.article>
          );
        })}
      </div>
    </div>
  );
}

import { UserMinus } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useBoard } from "../model/board.queries";

export interface AwayStudentsNoticeProps {
  lessonId: string;
  enabled: boolean;
}

export function AwayStudentsNotice({ lessonId, enabled }: AwayStudentsNoticeProps) {
  const { t } = useTranslation("board");
  const board = useBoard(lessonId, { enabled });
  const away = enabled ? (board.data?.awayStudents ?? []) : [];

  if (!away.length) return null;

  return (
    <aside className="away-students" role="status" aria-live="polite">
      <UserMinus size={15} />
      <div>
        <strong>{t("away.title")}</strong>
        <span>{away.map((student) => student.name).join(", ")}</span>
      </div>
    </aside>
  );
}

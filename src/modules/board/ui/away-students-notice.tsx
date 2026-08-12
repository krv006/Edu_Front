import { UserMinus } from "lucide-react";
import { useBoard } from "../model/board.queries";

export interface AwayStudentsNoticeProps {
  lessonId: string;
  /** Faqat o'qituvchida so'raladi — boshqa rolga backend bu ma'lumotni bermaydi. */
  enabled: boolean;
}

/**
 * Dars oynasidan chiqib ketgan o'quvchilar (docs/STAFF_API.md §7).
 *
 * Ataylab EKRAN CHEKKASIDA, kichik va dialogsiz: o'qituvchi dars o'tayotganda
 * uni bo'lmaslik kerak. Hech kim chiqib ketmagan bo'lsa umuman ko'rinmaydi.
 */
export function AwayStudentsNotice({ lessonId, enabled }: AwayStudentsNoticeProps) {
  // Bir xil so'rov kaliti — doska paneli bilan bitta so'rovni baham ko'radi,
  // ya'ni qo'shimcha trafik yo'q.
  const board = useBoard(lessonId, { enabled });
  const away = enabled ? (board.data?.awayStudents ?? []) : [];

  if (!away.length) return null;

  return (
    <aside className="away-students" role="status" aria-live="polite">
      <UserMinus size={15} />
      <div>
        <strong>Darsdan chiqqan</strong>
        <span>{away.map((student) => student.name).join(", ")}</span>
      </div>
    </aside>
  );
}

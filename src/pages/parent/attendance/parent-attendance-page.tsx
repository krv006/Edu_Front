import { useMemo, useState } from "react";
import { CalendarCheck2, Download, Search } from "lucide-react";
import { AttendanceAccordion, useAttendance } from "@/modules/attendance";
import { useSelectedChild } from "@/modules/parent";
import { formatDuration } from "@/shared/lib";
import { Button, LoadingFallback, RouteState } from "@/shared/ui/legacy";

export function ParentAttendancePage() {
  const { selectedChildId, selectedChild } = useSelectedChild();
  const attendanceQuery = useAttendance(selectedChildId ? { student: selectedChildId } : {});
  const [search, setSearch] = useState("");

  const rows = useMemo(() => {
    const needle = search.trim().toLowerCase();
    const items = attendanceQuery.data ?? [];
    if (!needle) return items;
    return items.filter((item) => `${item.child} ${item.lesson}`.toLowerCase().includes(needle));
  }, [attendanceQuery.data, search]);

  // Ota-ona uchun eng muhim yig'ma ko'rsatkich — bola darsdan jami qancha chalg'igani.
  const totalAway = useMemo(
    () => rows.reduce((sum, item) => sum + item.focus.awaySeconds, 0),
    [rows]
  );

  if (attendanceQuery.isLoading) return <LoadingFallback label="Davomat yuklanmoqda" />;
  if (attendanceQuery.isError) {
    return (
      <RouteState
        title="Davomatni yuklab bo‘lmadi"
        actionLabel="Qayta urinish"
        onAction={attendanceQuery.refetch}
      />
    );
  }

  return (
    <div className="portal-page">
      <div className="portal-page-heading">
        <div>
          <span className="portal-eyebrow">KUZATUV</span>
          <h1>Davomat tarixi</h1>
          <p>
            {selectedChild
              ? `${selectedChild.name}ning darsga kirish va chiqish vaqtlari.`
              : "Farzandingizning davomat ma’lumotlari."}
          </p>
        </div>
        <Button variant="secondary" onClick={() => window.print()}>
          <Download size={17} /> Hisobot
        </Button>
      </div>

      <div className="attendance-toolbar">
        <label className="portal-search">
          <Search size={18} />
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Dars yoki o‘quvchini qidirish"
          />
        </label>
        <span>
          <CalendarCheck2 size={17} /> {rows.length} ta yozuv
          {totalAway ? ` · ${formatDuration(totalAway)} chalg‘igan` : ""}
        </span>
      </div>

      <AttendanceAccordion rows={rows} />
    </div>
  );
}

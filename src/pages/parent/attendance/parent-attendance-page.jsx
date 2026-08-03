import { CalendarCheck2, Download, Search } from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { useAttendance } from "@/modules/attendance";
import { LoadingFallback, RouteState } from "@/shared/ui";

export function ParentAttendancePage() {
  const attendanceQuery = useAttendance();
  const [search, setSearch] = useState("");
  const rows = useMemo(() => (attendanceQuery.data ?? []).filter((item) => `${item.child} ${item.lesson}`.toLowerCase().includes(search.toLowerCase())), [attendanceQuery.data, search]);
  if (attendanceQuery.isLoading) return <LoadingFallback label="Davomat yuklanmoqda" />;
  if (attendanceQuery.isError) return <RouteState title="Davomatni yuklab bo‘lmadi" actionLabel="Qayta urinish" onAction={attendanceQuery.refetch} />;
  return (
    <div className="portal-page">
      <div className="portal-page-heading"><div><span className="portal-eyebrow">KUZATUV</span><h1>Davomat tarixi</h1><p>Farzandingizning darsga kirish va chiqish vaqtlari.</p></div><Button variant="secondary" onClick={() => toast.success("Davomat hisoboti tayyorlanmoqda")}><Download size={17} /> Hisobot</Button></div>
      <div className="attendance-toolbar"><label className="portal-search"><Search size={18} /><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Dars yoki o‘quvchini qidirish" /></label><span><CalendarCheck2 size={17} /> {rows.length} ta yozuv</span></div>
      <section className="portal-card attendance-table-card"><div className="attendance-table-scroll"><table className="attendance-table"><thead><tr><th>O‘quvchi</th><th>Dars</th><th>Kirdi</th><th>Chiqdi</th><th>Davomiyligi</th><th>Holat</th></tr></thead><tbody>{rows.map((item) => <tr key={item.id}><td><strong>{item.child}</strong></td><td>{item.lesson}</td><td>{item.entered}</td><td>{item.exited}</td><td>{item.duration}</td><td><span className={`attendance-status attendance-status--${item.status}`}>{item.status === "active" ? "Darsda" : "Qatnashdi"}</span></td></tr>)}</tbody></table></div></section>
    </div>
  );
}

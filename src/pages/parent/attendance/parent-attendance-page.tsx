import { useMemo, useState } from "react";
import { CalendarCheck2, Download, Search } from "lucide-react";
import { Button, LoadingFallback, RouteState } from "@/shared/ui/legacy";
import { useAttendance } from "@/modules/attendance";
import { useSelectedChild } from "@/modules/parent";

export function ParentAttendancePage() {
  const { selectedChildId, selectedChild } = useSelectedChild(); const attendanceQuery = useAttendance(selectedChildId ? { student: selectedChildId } : {}); const [search, setSearch] = useState("");
  const rows = useMemo(() => (attendanceQuery.data ?? []).filter((item) => `${item.child} ${item.lesson}`.toLowerCase().includes(search.toLowerCase())), [attendanceQuery.data, search]);
  if (attendanceQuery.isLoading) return <LoadingFallback label="Davomat yuklanmoqda" />;
  if (attendanceQuery.isError) return <RouteState title="Davomatni yuklab bo‘lmadi" actionLabel="Qayta urinish" onAction={attendanceQuery.refetch} />;
  return <div className="portal-page"><div className="portal-page-heading"><div><span className="portal-eyebrow">KUZATUV</span><h1>Davomat tarixi</h1><p>{selectedChild ? `${selectedChild.name}ning darsga kirish va chiqish vaqtlari.` : "Farzandingizning davomat ma’lumotlari."}</p></div><Button variant="secondary" onClick={() => window.print()}><Download size={17} /> Hisobot</Button></div>
    <div className="attendance-toolbar"><label className="portal-search"><Search size={18} /><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Dars yoki o‘quvchini qidirish" /></label><span><CalendarCheck2 size={17} /> {rows.length} ta yozuv</span></div>
    <section className="portal-card attendance-table-card"><div className="attendance-table-scroll"><table className="attendance-table"><thead><tr><th>O‘quvchi</th><th>Dars</th><th>Kirdi</th><th>Chiqdi</th><th>Davomiyligi</th><th>Diqqat</th><th>Fokus</th></tr></thead><tbody>{rows.map((item) => <tr key={item.id}><td><strong>{item.child}</strong></td><td>{item.lesson}</td><td>{item.entered}</td><td>{item.exited}</td><td>{item.duration}</td><td>{item.attentionAnswered}/{item.attentionTotal}</td><td>{item.focusExits} chiqish</td></tr>)}</tbody></table>{!rows.length ? <p className="portal-muted">Davomat yozuvi topilmadi.</p> : null}</div></section>
  </div>;
}

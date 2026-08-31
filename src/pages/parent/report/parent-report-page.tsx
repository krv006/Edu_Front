import { Trophy } from "lucide-react";
import { HomeworkReportView, useHomeworkReport } from "@/modules/homework";
import { useSelectedChild } from "@/modules/parent";
import { LoadingFallback, RouteState } from "@/shared/ui/legacy";

export function ParentReportPage() {
  const { selectedChild, selectedChildId } = useSelectedChild();
  const report = useHomeworkReport(selectedChildId, Boolean(selectedChildId));

  if (!selectedChild)
    return (
      <div className="portal-empty">
        <Trophy size={30} />
        <h2>Farzand tanlanmagan</h2>
        <p>Avval o‘quvchi hisobini ulang.</p>
      </div>
    );
  if (report.isLoading) return <LoadingFallback label="Reyting yuklanmoqda" />;
  if (report.isError || !report.data)
    return (
      <RouteState
        eyebrow="REYTING"
        title="Reytingni yuklab bo‘lmadi"
        description={report.error?.message}
        actionLabel="Qayta urinish"
        onAction={report.refetch}
      />
    );

  return (
    <div className="portal-page">
      <div className="portal-page-heading">
        <div>
          <span className="portal-eyebrow">REYTING</span>
          <h1>{selectedChild.name}</h1>
          <p>Har bir fan bo‘yicha vazifalar va baholar.</p>
        </div>
      </div>
      <HomeworkReportView report={report.data} />
    </div>
  );
}

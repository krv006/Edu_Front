import { HomeworkReportView, useHomeworkReport } from "@/modules/homework";
import { LoadingFallback, RouteState } from "@/shared/ui/legacy";

export function StudentReportPage() {
  const report = useHomeworkReport();

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
          <h1>Mening natijalarim</h1>
          <p>Har bir fan bo‘yicha vazifalar va baholaringiz.</p>
        </div>
      </div>
      <HomeworkReportView report={report.data} />
    </div>
  );
}

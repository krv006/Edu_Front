import { useTranslation } from "react-i18next";
import { HomeworkReportView, useHomeworkReport } from "@/modules/homework";
import { LoadingFallback, RouteState } from "@/shared/ui/legacy";

export function StudentReportPage() {
  const { t } = useTranslation("student");
  const report = useHomeworkReport();

  if (report.isLoading) return <LoadingFallback label={t("report.loading")} />;
  if (report.isError || !report.data)
    return (
      <RouteState
        eyebrow={t("report.eyebrow")}
        title={t("report.loadError")}
        description={report.error?.message}
        actionLabel={t("report.retry")}
        onAction={report.refetch}
      />
    );

  return (
    <div className="portal-page">
      <div className="portal-page-heading">
        <div>
          <span className="portal-eyebrow">{t("report.eyebrow")}</span>
          <h1>{t("report.title")}</h1>
          <p>{t("report.subtitle")}</p>
        </div>
      </div>
      <HomeworkReportView report={report.data} />
    </div>
  );
}

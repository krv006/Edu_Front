import { Globe, MonitorSmartphone, ShieldAlert } from "lucide-react";
import { formatDateTime } from "@/shared/lib";
import { Dialog, DialogContent, LoadingFallback, RouteState } from "@/shared/ui/legacy";
import { useLoginHistory } from "../model/auth.queries";

export interface LoginHistoryDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Ota-ona bolasining tarixini ko'rsatmoqchi bo'lsa — bolaning id'si. */
  studentId?: string | null;
  title?: string;
  description?: string;
}

/**
 * Kirishlar jurnali (docs/PROJECT.md §10): har login IP va qurilma bilan yoziladi.
 * `new_ip` / `new_device` bayroqlari — "bu men emasmanmi?" degan shubhani ko'rsatish uchun.
 */
export function LoginHistoryDialog({
  open,
  onOpenChange,
  studentId = null,
  title = "Kirishlar tarixi",
  description = "Hisobingizga qaysi qurilma va IP’dan kirilgani.",
}: LoginHistoryDialogProps) {
  const query = useLoginHistory(studentId, open);
  const records = query.data ?? [];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      {open ? (
        <DialogContent title={title} description={description}>
          {query.isLoading ? <LoadingFallback label="Tarix yuklanmoqda" /> : null}

          {query.isError ? (
            <RouteState
              title="Tarixni yuklab bo‘lmadi"
              actionLabel="Qayta urinish"
              onAction={query.refetch}
            />
          ) : null}

          {query.isSuccess && !records.length ? (
            <p className="portal-muted">Kirishlar hali qayd etilmagan.</p>
          ) : null}

          {records.length ? (
            <ul className="login-history">
              {records.map((record) => (
                <li key={record.id} className={record.isNewDevice ? "is-alert" : ""}>
                  <span className="login-history-icon">
                    {record.isNewDevice || record.isNewIp ? (
                      <ShieldAlert size={17} />
                    ) : (
                      <MonitorSmartphone size={17} />
                    )}
                  </span>
                  <div className="login-history-body">
                    <strong>{record.device}</strong>
                    <small title={record.userAgent}>
                      <Globe size={12} /> {record.ip} · {formatDateTime(record.at)}
                    </small>
                  </div>
                  <div className="login-history-flags">
                    {record.isNewDevice ? <span>Yangi qurilma</span> : null}
                    {record.isNewIp ? <span>Yangi IP</span> : null}
                  </div>
                </li>
              ))}
            </ul>
          ) : null}
        </DialogContent>
      ) : null}
    </Dialog>
  );
}

import { Sparkles } from "lucide-react";

export function Brand({ compact = false }: { compact?: boolean }) {
  return (
    <div className={`brand ${compact ? "brand--compact" : ""}`} aria-label="Fokus">
      <span className="brand-mark">
        <Sparkles size={19} strokeWidth={2.2} />
      </span>
      {!compact && <span className="brand-name">Fokus</span>}
    </div>
  );
}

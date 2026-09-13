import logoUrl from "@/shared/assets/y-logo.svg";

export function Brand({ compact = false }: { compact?: boolean }) {
  return (
    <div className={`brand ${compact ? "brand--compact" : ""}`}>
      <img className="brand-mark" src={logoUrl} alt="YolUp" />
    </div>
  );
}

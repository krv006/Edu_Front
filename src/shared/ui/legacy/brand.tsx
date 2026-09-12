import logoUrl from "@/shared/assets/y-logo.svg";

/**
 * Brend belgisi — faqat logo, matnsiz (logo o'zi monogramm).
 *
 * `compact` endi faqat O'LCHAMNI o'zgartiradi: ilgari u yondagi nomni
 * yashirar edi, ammo nom umuman yo'q — shuning uchun ikkala holat ham
 * bir xil element, faqat kattaligi boshqacha.
 */
export function Brand({ compact = false }: { compact?: boolean }) {
  return (
    <div className={`brand ${compact ? "brand--compact" : ""}`}>
      <img className="brand-mark" src={logoUrl} alt="YolUp" />
    </div>
  );
}

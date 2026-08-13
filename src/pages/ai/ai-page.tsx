import { Sparkles } from "lucide-react";

/**
 * AI bo'limi — hozircha o'rin egallab turadi.
 *
 * Ustundagi tuzilma tayyor bo'lishi uchun qo'shildi; mazmuni keyin
 * to'ldiriladi. Ataylab "ishlayotgandek" ko'rinmaydi — foydalanuvchi nima
 * kutishini bilib turishi kerak.
 */
export function AiPage() {
  return (
    <div className="schedule-page">
      <div className="schedule-page-head">
        <div>
          <span className="portal-eyebrow">AI</span>
          <h1>AI yordamchi</h1>
          <p>Sun’iy intellekt imkoniyatlari shu bo‘limda jamlanadi.</p>
        </div>
      </div>

      <div className="lesson-empty">
        <Sparkles size={26} />
        <p>Bu bo‘lim hozircha tayyorlanmoqda.</p>
      </div>
    </div>
  );
}

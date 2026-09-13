import { useState } from "react";
import { Star } from "lucide-react";
import { useTranslation } from "react-i18next";

const STARS = [1, 2, 3, 4, 5] as const;
const MAX_STARS = STARS.length;

export interface StarRatingProps {
  value: number;
  onChange?: (value: number) => void;
  size?: number;
  disabled?: boolean;
  readOnly?: boolean;
}

export function StarRating({
  value,
  onChange,
  size = 22,
  disabled = false,
  readOnly = false,
}: StarRatingProps) {
  const { t } = useTranslation("lesson");
  const [preview, setPreview] = useState(0);

  if (readOnly) {
    const filled = Math.round(value);
    return (
      <span
        className="star-rating star-rating--readonly"
        aria-label={t("starRating.starAria", { count: value })}
      >
        {STARS.map((star) => (
          <Star key={star} size={size} className={star <= filled ? "is-filled" : ""} />
        ))}
      </span>
    );
  }

  const shown = preview || value;

  return (
    <div
      className="star-rating"
      role="radiogroup"
      aria-label={t("starRating.aria")}
      onMouseLeave={() => setPreview(0)}
    >
      {STARS.map((star) => (
        <button
          key={star}
          type="button"
          role="radio"
          aria-checked={value === star}
          aria-label={t("starRating.starAria", { count: star })}
          disabled={disabled}
          onMouseEnter={() => setPreview(star)}
          onFocus={() => setPreview(star)}
          onBlur={() => setPreview(0)}
          onClick={() => onChange?.(star)}
        >
          <Star size={size} className={star <= shown ? "is-filled" : ""} />
        </button>
      ))}
    </div>
  );
}

export interface RatingSummaryProps {
  average: number | null;
  count: number;
  compact?: boolean;
}

export function RatingSummary({ average, count, compact = false }: RatingSummaryProps) {
  const { t } = useTranslation("lesson");
  if (!count || average === null) return null;
  return (
    <span
      className="rating-summary"
      title={t("starRating.averageTitle", { value: average.toFixed(1), max: MAX_STARS })}
    >
      <Star size={13} className="is-filled" />
      {average.toFixed(1)}
      {compact ? null : <small>{t("ratingsDialog.countSuffix", { count })}</small>}
    </span>
  );
}

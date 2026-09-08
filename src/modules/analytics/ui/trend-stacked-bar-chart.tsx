import { useState } from "react";

export interface TrendBarSeries {
  key: string;
  name: string;
  color: string;
  values: number[];
}

export interface TrendStackedBarChartProps {
  series: TrendBarSeries[];
  labels: string[];
}

const W = 600;
const H = 210;
const PAD_L = 32;
const PAD_R = 12;
const PAD_T = 16;
const PAD_B = 26;
const PLOT_W = W - PAD_L - PAD_R;
const PLOT_H = H - PAD_T - PAD_B;
const GAP = 1.5;

/** Faqat yuqori burchaklari dumaloq to'rtburchak — SVG `rx` barcha 4 burchakni
 * bir xilda dumaloqlaydi, shuning uchun stack pastki (baza) qismi kvadrat
 * qolishi uchun path qo'lda quriladi. */
function topRoundedRectPath(x: number, y: number, w: number, h: number, r: number): string {
  if (h <= 0.5) return "";
  const radius = Math.min(r, w / 2, h);
  if (radius <= 0) return `M${x},${y + h} L${x},${y} L${x + w},${y} L${x + w},${y + h} Z`;
  return `M${x},${y + h} L${x},${y + radius} Q${x},${y} ${x + radius},${y} L${x + w - radius},${y} Q${x + w},${y} ${x + w},${y + radius} L${x + w},${y + h} Z`;
}

export function TrendStackedBarChart({ series, labels }: TrendStackedBarChartProps) {
  const [hoverIndex, setHoverIndex] = useState<number | null>(null);
  const n = labels.length;

  const totals = labels.map((_, i) => series.reduce((sum, s) => sum + s.values[i], 0));
  const maxTotal = Math.max(...totals, 0);
  const niceMax = Math.ceil((maxTotal * 1.15) / 10) * 10 || 10;

  const yFor = (v: number) => PAD_T + PLOT_H - (v / niceMax) * PLOT_H;
  const slot = PLOT_W / n;
  const barWidth = slot * 0.56;
  const xFor = (i: number) => PAD_L + i * slot + (slot - barWidth) / 2;

  const gridValues = [0, 0.25, 0.5, 0.75, 1].map((f) => niceMax * f);
  const xStep = n <= 8 ? 1 : Math.ceil(n / 7);

  return (
    <div className="trend-chart">
      <svg viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none">
        {gridValues.map((gv) => (
          <g key={gv}>
            <line x1={PAD_L} y1={yFor(gv)} x2={W - PAD_R} y2={yFor(gv)} className="trend-chart-grid" />
            <text x={PAD_L - 6} y={yFor(gv) + 3.5} textAnchor="end" className="trend-chart-axis">
              {Math.round(gv)}
            </text>
          </g>
        ))}

        {labels.map((_, i) => {
          let cursor = PAD_T + PLOT_H;
          const x = xFor(i);
          return series.map((s, sIndex) => {
            const value = s.values[i];
            const segH = (value / niceMax) * PLOT_H;
            const y = cursor - segH;
            const isTop = sIndex === series.length - 1;
            const d = topRoundedRectPath(x, y, barWidth, Math.max(segH - GAP, 0), isTop ? 4 : 0);
            cursor = y - GAP;
            return d ? <path key={s.key} d={d} fill={s.color} /> : null;
          });
        })}

        {labels.map((label, i) =>
          i % xStep === 0 || i === n - 1 ? (
            <text key={i} x={xFor(i) + barWidth / 2} y={H - 6} textAnchor="middle" className="trend-chart-axis">
              {label}
            </text>
          ) : null
        )}

        {labels.map((_, i) => (
          <rect
            key={i}
            x={PAD_L + i * slot}
            y={PAD_T}
            width={slot}
            height={PLOT_H}
            fill="transparent"
            onMouseEnter={() => setHoverIndex(i)}
            onMouseLeave={() => setHoverIndex(null)}
          />
        ))}
      </svg>

      {hoverIndex != null ? (
        <div className="trend-chart-tooltip" style={{ left: `${((xFor(hoverIndex) + barWidth / 2) / W) * 100}%` }}>
          <div className="trend-chart-tooltip-title">{labels[hoverIndex]}</div>
          {series.map((s) => (
            <div key={s.key} className="trend-chart-tooltip-row">
              <span className="trend-chart-tooltip-dot" style={{ background: s.color }} />
              {s.name}: <strong>{s.values[hoverIndex]}</strong>
            </div>
          ))}
        </div>
      ) : null}
    </div>
  );
}

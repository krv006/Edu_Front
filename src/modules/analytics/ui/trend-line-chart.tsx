import { useState } from "react";

export interface TrendLineSeries {
  key: string;
  name: string;
  color: string;
  values: Array<number | null>;
  area?: boolean;
}

export interface TrendLineChartProps {
  series: TrendLineSeries[];
  labels: string[];
  /** `false` — pastki chegara ma'lumotning eng kichigidan olinadi (masalan 0-100 ball). */
  zeroBase?: boolean;
}

const W = 600;
const H = 210;
const PAD_L = 32;
const PAD_R = 12;
const PAD_T = 16;
const PAD_B = 26;
const PLOT_W = W - PAD_L - PAD_R;
const PLOT_H = H - PAD_T - PAD_B;

export function TrendLineChart({ series, labels, zeroBase = true }: TrendLineChartProps) {
  const [hoverIndex, setHoverIndex] = useState<number | null>(null);
  const n = labels.length;

  const allValues = series.flatMap((s) => s.values.filter((v): v is number => v != null));
  const rawMax = allValues.length ? Math.max(...allValues) : 1;
  const rawMin = allValues.length ? Math.min(...allValues) : 0;
  // Bir nuqta/tekis qator bo'lsa ham (span=0) chiziq pastki chetga yopishib
  // qolmasligi uchun har doim nolmas padding — |rawMax| yoki 1 dan.
  const padding = (rawMax - rawMin || Math.abs(rawMax) || 1) * 0.15;

  const niceMin = zeroBase ? 0 : rawMin - padding;
  const niceMax = zeroBase ? Math.ceil((rawMax * 1.15) / 10) * 10 || 10 : rawMax + padding;

  const xFor = (i: number) => PAD_L + (n <= 1 ? 0 : (i / (n - 1)) * PLOT_W);
  const yFor = (v: number) => PAD_T + PLOT_H - ((v - niceMin) / (niceMax - niceMin || 1)) * PLOT_H;

  const gridValues = [0, 0.25, 0.5, 0.75, 1].map((f) => niceMin + (niceMax - niceMin) * f);
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

        {series.map((s) => {
          const points = s.values
            .map((v, i) => (v == null ? null : `${xFor(i).toFixed(1)},${yFor(v).toFixed(1)}`))
            .filter((p): p is string => p !== null);
          if (!points.length) return null;
          const path = `M${points.join(" L")}`;
          const lastIndex = s.values.length - 1;
          const lastValue = s.values[lastIndex];
          return (
            <g key={s.key}>
              {s.area ? (
                <path
                  d={`${path} L${xFor(n - 1).toFixed(1)},${PAD_T + PLOT_H} L${xFor(0).toFixed(1)},${PAD_T + PLOT_H} Z`}
                  fill={s.color}
                  opacity={0.12}
                />
              ) : null}
              <path d={path} fill="none" stroke={s.color} strokeWidth={2.25} strokeLinecap="round" strokeLinejoin="round" />
              {lastValue != null ? (
                <>
                  <circle cx={xFor(lastIndex)} cy={yFor(lastValue)} r={3.4} fill={s.color} className="trend-chart-dot" />
                  <text x={xFor(lastIndex)} y={yFor(lastValue) - 9} textAnchor="end" className="trend-chart-endlabel" fill={s.color}>
                    {lastValue}
                  </text>
                </>
              ) : null}
            </g>
          );
        })}

        {labels.map((label, i) =>
          i % xStep === 0 || i === n - 1 ? (
            <text key={i} x={xFor(i)} y={H - 6} textAnchor="middle" className="trend-chart-axis">
              {label}
            </text>
          ) : null
        )}

        {hoverIndex != null ? (
          <line x1={xFor(hoverIndex)} y1={PAD_T} x2={xFor(hoverIndex)} y2={PAD_T + PLOT_H} className="trend-chart-crosshair" />
        ) : null}

        {labels.map((_, i) => (
          <rect
            key={i}
            x={PAD_L + (i / n) * PLOT_W}
            y={PAD_T}
            width={PLOT_W / n}
            height={PLOT_H}
            fill="transparent"
            onMouseEnter={() => setHoverIndex(i)}
            onMouseLeave={() => setHoverIndex(null)}
          />
        ))}
      </svg>

      {hoverIndex != null ? (
        <div className="trend-chart-tooltip" style={{ left: `${(xFor(hoverIndex) / W) * 100}%` }}>
          <div className="trend-chart-tooltip-title">{labels[hoverIndex]}</div>
          {series.map((s) => (
            <div key={s.key} className="trend-chart-tooltip-row">
              <span className="trend-chart-tooltip-dot" style={{ background: s.color }} />
              {s.name}: <strong>{s.values[hoverIndex] ?? "—"}</strong>
            </div>
          ))}
        </div>
      ) : null}
    </div>
  );
}

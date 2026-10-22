import { useState } from "react";
import { motion } from "framer-motion";
import {
  axisTicks,
  niceMax,
  useChartPalette,
  useChartWidth,
  useGradientId,
} from "./chart-utils";

export interface BarDatum {
  label: string;
  value: number;
  /** Optional second line under the label, e.g. a status breakdown. */
  hint?: string;
}

interface Props {
  data: BarDatum[];
  height?: number;
  color?: string;
  formatValue?: (value: number) => string;
  /** Shows the value above each bar. Use only for a handful of bars. */
  showValueLabels?: boolean;
  emptyMessage?: string;
}

/**
 * A bar with rounded top corners and square bottom corners — the data end is
 * rounded, the baseline end is anchored.
 */
function barPath(x: number, y: number, w: number, h: number, r = 4) {
  if (h <= 0) return "";
  const radius = Math.min(r, w / 2, h);
  return [
    `M${x},${y + h}`,
    `L${x},${y + radius}`,
    `Q${x},${y} ${x + radius},${y}`,
    `L${x + w - radius},${y}`,
    `Q${x + w},${y} ${x + w},${y + radius}`,
    `L${x + w},${y + h}`,
    "Z",
  ].join(" ");
}

/**
 * Single-series vertical bar chart.
 *
 * One series means no legend — the card title names it. Every bar carries a
 * hover tooltip, and the value is printed above the bar on hover so the
 * exact number is never colour-only. The bars fill in from the baseline when
 * the chart mounts, and a short bar set prints its values permanently.
 */
export default function BarChart({
  data,
  height = 220,
  color,
  formatValue = (v) => v.toLocaleString(),
  showValueLabels = false,
  emptyMessage = "No data yet.",
}: Props) {
  const palette = useChartPalette();
  const { ref, width } = useChartWidth();
  const [hovered, setHovered] = useState<number | null>(null);
  const seriesColor = color ?? palette.series.brand;
  const gradientId = useGradientId("bar");

  const alwaysLabel = showValueLabels || data.length <= 6;

  if (data.length === 0) {
    return (
      <div
        ref={ref}
        className="flex items-center justify-center text-sm text-text-soft border-2 border-dashed border-border rounded-lg"
        style={{ height }}
      >
        {emptyMessage}
      </div>
    );
  }

  const max = niceMax(Math.max(...data.map((d) => d.value), 0));
  const ticks = axisTicks(max);

  // The left gutter has to fit the widest tick label, or the numbers get
  // clipped by the edge of the chart.
  const widestTick = Math.max(
    ...ticks.map((tick) => formatValue(tick).length),
    1,
  );
  const padding = {
    top: 28,
    right: 12,
    bottom: 44,
    left: Math.max(40, Math.ceil(widestTick * 6.4) + 12),
  };

  const plotWidth = Math.max(width - padding.left - padding.right, 10);
  const plotHeight = height - padding.top - padding.bottom;

  const slot = plotWidth / data.length;
  // 2px of surface between adjacent bars, capped so wide charts stay airy.
  const barWidth = Math.max(Math.min(slot * 0.62, 56), 4);

  return (
    <div ref={ref} className="relative">
      <svg
        width={width}
        height={height}
        role="img"
        aria-label={`Bar chart: ${data.map((d) => `${d.label} ${d.value}`).join(", ")}`}
      >
        <defs>
          {/* A wash of the same hue — not a second colour. */}
          <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={seriesColor} stopOpacity={1} />
            <stop offset="100%" stopColor={seriesColor} stopOpacity={0.45} />
          </linearGradient>
        </defs>

        {/* Gridlines — recessive, behind the marks */}
        {ticks.map((tick) => {
          const y = padding.top + plotHeight - (tick / max) * plotHeight;
          return (
            <g key={tick}>
              <line
                x1={padding.left}
                x2={padding.left + plotWidth}
                y1={y}
                y2={y}
                stroke={palette.grid}
                strokeWidth={1}
              />
              <text
                x={padding.left - 8}
                y={y + 4}
                textAnchor="end"
                fontSize={11}
                fill={palette.ink.muted}
              >
                {formatValue(tick)}
              </text>
            </g>
          );
        })}

        {/* Baseline */}
        <line
          x1={padding.left}
          x2={padding.left + plotWidth}
          y1={padding.top + plotHeight}
          y2={padding.top + plotHeight}
          stroke={palette.grid}
          strokeWidth={1}
        />

        {data.map((datum, index) => {
          const barHeight = max ? (datum.value / max) * plotHeight : 0;
          const x = padding.left + index * slot + (slot - barWidth) / 2;
          const y = padding.top + plotHeight - barHeight;
          const isHovered = hovered === index;
          const dimmed = hovered !== null && !isHovered;

          return (
            <g key={`${datum.label}-${index}`}>
              {/* Hit target is wider than the mark */}
              <rect
                x={padding.left + index * slot}
                y={padding.top}
                width={slot}
                height={plotHeight}
                fill="transparent"
                onMouseEnter={() => setHovered(index)}
                onMouseLeave={() => setHovered(null)}
                onFocus={() => setHovered(index)}
                onBlur={() => setHovered(null)}
                tabIndex={0}
                role="button"
                aria-label={`${datum.label}: ${formatValue(datum.value)}`}
              />

              <motion.path
                d={barPath(x, y, barWidth, barHeight)}
                fill={`url(#${gradientId})`}
                initial={{ scaleY: 0 }}
                animate={{ scaleY: 1 }}
                transition={{
                  duration: 0.55,
                  delay: index * 0.05,
                  ease: [0.22, 1, 0.36, 1],
                }}
                style={{
                  transformBox: "fill-box",
                  transformOrigin: "bottom",
                  opacity: dimmed ? 0.45 : 1,
                }}
                pointerEvents="none"
              />

              {(alwaysLabel || isHovered) && (
                <text
                  x={x + barWidth / 2}
                  y={y - 8}
                  textAnchor="middle"
                  fontSize={11}
                  fontWeight={600}
                  fill={palette.ink.primary}
                  pointerEvents="none"
                >
                  {formatValue(datum.value)}
                </text>
              )}

              <text
                x={padding.left + index * slot + slot / 2}
                y={padding.top + plotHeight + 16}
                textAnchor="middle"
                fontSize={11}
                fill={palette.ink.secondary}
                pointerEvents="none"
              >
                {truncate(datum.label, Math.max(8, Math.floor(slot / 6)))}
              </text>

              {datum.hint && (
                <text
                  x={padding.left + index * slot + slot / 2}
                  y={padding.top + plotHeight + 30}
                  textAnchor="middle"
                  fontSize={10}
                  fill={palette.ink.muted}
                  pointerEvents="none"
                >
                  {truncate(datum.hint, Math.max(8, Math.floor(slot / 6)))}
                </text>
              )}
            </g>
          );
        })}
      </svg>

      {hovered !== null && (
        <div
          role="status"
          className="pointer-events-none absolute z-10 -translate-x-1/2 -translate-y-full rounded-xl border border-border bg-surface px-3 py-2 text-xs shadow-xl shadow-shadow-soft"
          style={{
            left: padding.left + hovered * slot + slot / 2,
            top:
              padding.top +
              plotHeight -
              (data[hovered].value / max) * plotHeight -
              12,
          }}
        >
          <span className="flex items-center gap-1.5">
            <span
              aria-hidden
              className="w-2 h-2 rounded-full shrink-0"
              style={{ backgroundColor: seriesColor }}
            />
            <span className="font-semibold text-text">{data[hovered].label}</span>
            <span className="text-text-muted">
              {formatValue(data[hovered].value)}
            </span>
          </span>
          {data[hovered].hint && (
            <span className="block mt-1 text-text-soft">
              {data[hovered].hint}
            </span>
          )}
        </div>
      )}
    </div>
  );
}

function truncate(value: string, max: number) {
  return value.length > max ? `${value.slice(0, max - 1)}…` : value;
}

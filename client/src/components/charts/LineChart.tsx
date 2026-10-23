import { useState } from "react";
import { motion } from "framer-motion";
import {
  axisTicks,
  niceMax,
  useChartPalette,
  useChartWidth,
  useGradientId,
} from "./chart-utils";

export interface LineDatum {
  label: string;
  value: number;
  hint?: string;
}

interface Props {
  data: LineDatum[];
  height?: number;
  color?: string;
  formatValue?: (value: number) => string;
  emptyMessage?: string;
}

/**
 * Single-series line chart with a crosshair and tooltip.
 *
 * The area under the line is a gradient wash of the same hue — the line
 * itself carries the value. The line draws itself in when the chart mounts.
 * One series means no legend; the card title names it.
 */
export default function LineChart({
  data,
  height = 220,
  color,
  formatValue = (v) => v.toLocaleString(),
  emptyMessage = "No data yet.",
}: Props) {
  const palette = useChartPalette();
  const { ref, width } = useChartWidth();
  const [hovered, setHovered] = useState<number | null>(null);
  const seriesColor = color ?? palette.series.brand;
  const gradientId = useGradientId("line");

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

  const padding = { top: 20, right: 16, bottom: 36, left: 44 };
  const plotWidth = Math.max(width - padding.left - padding.right, 10);
  const plotHeight = height - padding.top - padding.bottom;

  const max = niceMax(Math.max(...data.map((d) => d.value), 0));
  const ticks = axisTicks(max);

  const step = data.length > 1 ? plotWidth / (data.length - 1) : 0;
  const points = data.map((datum, index) => ({
    x: padding.left + (data.length > 1 ? index * step : plotWidth / 2),
    y: padding.top + plotHeight - (max ? (datum.value / max) * plotHeight : 0),
    datum,
  }));

  const linePath = points
    .map((p, i) => `${i === 0 ? "M" : "L"}${p.x},${p.y}`)
    .join(" ");

  const areaPath =
    points.length > 0
      ? `${linePath} L${points[points.length - 1].x},${padding.top + plotHeight} L${points[0].x},${padding.top + plotHeight} Z`
      : "";

  const labelEvery = Math.max(
    1,
    Math.ceil(data.length / Math.max(2, Math.floor(plotWidth / 70))),
  );

  return (
    <div ref={ref} className="relative">
      <svg
        width={width}
        height={height}
        role="img"
        aria-label={`Line chart: ${data.map((d) => `${d.label} ${d.value}`).join(", ")}`}
        onMouseLeave={() => setHovered(null)}
        onMouseMove={(e) => {
          const rect = e.currentTarget.getBoundingClientRect();
          const x = e.clientX - rect.left;
          const closest = points.reduce(
            (best, point, index) =>
              Math.abs(point.x - x) < Math.abs(points[best].x - x) ? index : best,
            0,
          );
          setHovered(closest);
        }}
      >
        <defs>
          <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={seriesColor} stopOpacity={0.28} />
            <stop offset="100%" stopColor={seriesColor} stopOpacity={0.02} />
          </linearGradient>
        </defs>

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

        {areaPath && (
          <motion.path
            d={areaPath}
            fill={`url(#${gradientId})`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          />
        )}

        <motion.path
          d={linePath}
          fill="none"
          stroke={seriesColor}
          strokeWidth={2}
          strokeLinejoin="round"
          strokeLinecap="round"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
        />

        {hovered !== null && (
          <line
            x1={points[hovered].x}
            x2={points[hovered].x}
            y1={padding.top}
            y2={padding.top + plotHeight}
            stroke={palette.axis}
            strokeWidth={1}
            strokeDasharray="3 3"
          />
        )}

        {points.map((point, index) => (
          <g key={`${point.datum.label}-${index}`}>
            {index % labelEvery === 0 && (
              <text
                x={point.x}
                y={padding.top + plotHeight + 18}
                textAnchor="middle"
                fontSize={11}
                fill={palette.ink.secondary}
              >
                {point.datum.label}
              </text>
            )}

            {/* A quiet marker on every point, a bigger one under the cursor. */}
            {data.length <= 40 && (
              <circle
                cx={point.x}
                cy={point.y}
                r={hovered === index ? 6 : 3.5}
                fill={seriesColor}
                stroke={palette.surface}
                strokeWidth={2}
                style={{ transition: "r 120ms ease" }}
              />
            )}

            {hovered === index && (
              <circle
                cx={point.x}
                cy={point.y}
                r={10}
                fill={seriesColor}
                opacity={0.18}
              />
            )}
          </g>
        ))}
      </svg>

      {hovered !== null && (
        <div
          role="status"
          className="pointer-events-none absolute z-10 -translate-x-1/2 -translate-y-full rounded-xl border border-border bg-surface px-3 py-2 text-xs shadow-xl shadow-shadow-soft"
          style={{
            left: Math.min(
              Math.max(points[hovered].x, 70),
              Math.max(width - 70, 70),
            ),
            top: points[hovered].y - 12,
          }}
        >
          <span className="flex items-center gap-1.5">
            <span
              aria-hidden
              className="w-2 h-2 rounded-full shrink-0"
              style={{ backgroundColor: seriesColor }}
            />
            <span className="font-semibold text-text">
              {data[hovered].label}
            </span>
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

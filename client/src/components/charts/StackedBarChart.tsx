import { useState } from "react";
import { motion } from "framer-motion";

export interface StackedSegment {
  label: string;
  value: number;
  color: string;
}

export interface StackedBarDatum {
  label: string;
  segments: StackedSegment[];
}

interface Props {
  data: StackedBarDatum[];
  formatValue?: (value: number) => string;
  emptyMessage?: string;
  /** The width of the label column on the left. */
  labelWidth?: number;
}

/**
 * Horizontal part-to-whole bars — one row per category, each row split into
 * its parts.
 *
 * The segments are separated by a 2px surface gap, the total is printed at
 * the end of every row, and a legend names every part with its own swatch
 * and count, so identity is never colour-alone. Hovering a segment lifts it
 * and shows its exact value.
 */
export default function StackedBarChart({
  data,
  formatValue = (v) => v.toLocaleString(),
  emptyMessage = "Nothing to show yet.",
  labelWidth = 150,
}: Props) {
  const [hovered, setHovered] = useState<{
    row: number;
    segment: number;
  } | null>(null);

  const totals = data.map((datum) =>
    datum.segments.reduce((sum, segment) => sum + segment.value, 0),
  );
  const grandTotal = totals.reduce((sum, total) => sum + total, 0);
  // The longest row sets the scale, so a bar's length shows the size of the
  // row as well as how it is split up. A 100%-stacked bar would make a row of
  // 46 look the same size as a row of 249.
  const maxTotal = Math.max(...totals, 0);

  // The parts of the whole, in the order they first appear, for the legend.
  const legend = (() => {
    const seen = new Map<string, StackedSegment>();
    for (const datum of data) {
      for (const segment of datum.segments) {
        if (!seen.has(segment.label)) seen.set(segment.label, segment);
      }
    }
    return [...seen.values()];
  })();

  if (grandTotal === 0) {
    return (
      <div className="flex items-center justify-center text-sm text-text-soft border-2 border-dashed border-border rounded-lg py-8">
        {emptyMessage}
      </div>
    );
  }

  return (
    <div>
      <div className="flex flex-col gap-3">
        {data.map((datum, rowIndex) => {
          const total = totals[rowIndex];
          if (total <= 0) return null;

          return (
            <div
              key={datum.label}
              className="flex items-center gap-3"
              onMouseLeave={() => setHovered(null)}
            >
              <div
                className="shrink-0 truncate text-xs font-medium text-text-muted"
                style={{ width: labelWidth }}
                title={datum.label}
              >
                {datum.label}
              </div>

              {/* The track */}
              <div className="relative flex-1 h-6 rounded-md bg-surface-muted overflow-hidden">
                {(() => {
                  // The gap belongs between two drawn segments, so the last one
                  // drawn must not carry a trailing gap.
                  const drawn = datum.segments
                    .map((segment, index) => ({ segment, index }))
                    .filter((entry) => entry.segment.value > 0);
                  const lastDrawn = drawn.length - 1;

                  return drawn.map(({ segment, index: segmentIndex }, drawnIndex) => {
                    const share = maxTotal
                      ? (segment.value / maxTotal) * 100
                      : 0;
                    const isHovered =
                      hovered?.row === rowIndex &&
                      hovered?.segment === segmentIndex;
                    const anyHovered = hovered?.row === rowIndex;

                    return (
                      <motion.button
                        key={`${segment.label}-${segmentIndex}`}
                        type="button"
                        title={`${segment.label}: ${formatValue(segment.value)}`}
                        aria-label={`${datum.label} — ${segment.label}: ${formatValue(segment.value)}`}
                        onMouseEnter={() =>
                          setHovered({ row: rowIndex, segment: segmentIndex })
                        }
                        onFocus={() =>
                          setHovered({ row: rowIndex, segment: segmentIndex })
                        }
                        onBlur={() => setHovered(null)}
                        className="h-full focus:outline-none focus-visible:ring-2 focus-visible:ring-focus relative"
                        style={{
                          flexShrink: 0,
                          marginRight: drawnIndex < lastDrawn ? 2 : 0,
                        }}
                        initial={{ width: 0 }}
                        animate={{ width: `${share}%` }}
                        transition={{
                          duration: 0.6,
                          delay: rowIndex * 0.06 + segmentIndex * 0.03,
                          ease: [0.22, 1, 0.36, 1],
                        }}
                      >
                        <motion.span
                          className="absolute inset-0 rounded-sm"
                          style={{ backgroundColor: segment.color }}
                          animate={{
                            opacity: anyHovered ? (isHovered ? 1 : 0.4) : 1,
                            scaleY: isHovered ? 1.25 : 1,
                          }}
                          transition={{ duration: 0.18 }}
                        />
                      </motion.button>
                    );
                  });
                })()}
              </div>

              {/* The total, always printed */}
              <div className="shrink-0 w-20 text-right text-xs font-semibold text-text tabular-nums">
                {formatValue(total)}
              </div>
            </div>
          );
        })}
      </div>

      {/* The legend — always present, so identity is never colour-alone */}
      <ul className="mt-5 flex flex-wrap gap-x-5 gap-y-2 pt-4 border-t border-border">
        {legend.map((segment) => {
          const sum = data.reduce(
            (total, datum) =>
              total +
              (datum.segments.find((s) => s.label === segment.label)?.value ??
                0),
            0,
          );

          return (
            <li key={segment.label} className="flex items-center gap-1.5 text-xs">
              <span
                aria-hidden
                className="w-2.5 h-2.5 rounded-sm shrink-0"
                style={{ backgroundColor: segment.color }}
              />
              <span className="text-text-muted">{segment.label}</span>
              <span className="font-semibold text-text">
                {formatValue(sum)}
              </span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

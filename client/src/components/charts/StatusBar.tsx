import { useState } from "react";
import { motion } from "framer-motion";

export interface StatusSegment {
  label: string;
  value: number;
  color: string;
}

interface Props {
  segments: StatusSegment[];
  formatValue?: (value: number) => string;
  emptyMessage?: string;
}

/**
 * Horizontal stacked bar for a part-to-whole breakdown.
 *
 * Segments are separated by a 2px surface gap, and every segment is named in
 * the legend with its own swatch and count — identity is never colour-alone.
 * The bar fills in when it mounts, and a hovered segment lifts slightly.
 */
export default function StatusBar({
  segments,
  formatValue = (v) => v.toLocaleString(),
  emptyMessage = "Nothing to show yet.",
}: Props) {
  const [hovered, setHovered] = useState<number | null>(null);

  const total = segments.reduce((sum, segment) => sum + segment.value, 0);

  if (total === 0) {
    return (
      <div className="flex items-center justify-center text-sm text-text-soft border-2 border-dashed border-border rounded-lg py-8">
        {emptyMessage}
      </div>
    );
  }

  return (
    <div>
      <div
        className="flex w-full h-5 rounded-full overflow-hidden bg-surface-muted"
        role="img"
        aria-label={segments
          .map((s) => `${s.label}: ${formatValue(s.value)}`)
          .join(", ")}
      >
        {segments.map((segment, index) => {
          const share = (segment.value / total) * 100;
          if (share <= 0) return null;

          const gradientId = `status-${index}-${segment.label
            .replace(/\W+/g, "-")
            .toLowerCase()}`;

          return (
            <motion.button
              key={segment.label}
              type="button"
              title={`${segment.label}: ${formatValue(segment.value)}`}
              onMouseEnter={() => setHovered(index)}
              onMouseLeave={() => setHovered(null)}
              onFocus={() => setHovered(index)}
              onBlur={() => setHovered(null)}
              aria-label={`${segment.label}: ${formatValue(segment.value)}`}
              className="h-full relative focus:outline-none focus-visible:ring-2 focus-visible:ring-focus"
              style={{
                // 2px of surface between neighbouring fills
                marginRight: index < segments.length - 1 ? 2 : 0,
              }}
              initial={{ width: 0, opacity: 0.4 }}
              animate={{
                width: `${share}%`,
                opacity: hovered === null || hovered === index ? 1 : 0.5,
              }}
              transition={{
                duration: 0.6,
                delay: index * 0.06,
                ease: [0.22, 1, 0.36, 1],
              }}
            >
              <svg
                className="absolute inset-0 h-full w-full"
                preserveAspectRatio="none"
                aria-hidden
              >
                <defs>
                  <linearGradient
                    id={gradientId}
                    x1="0"
                    y1="0"
                    x2="0"
                    y2="1"
                  >
                    <stop
                      offset="0%"
                      stopColor={segment.color}
                      stopOpacity={1}
                    />
                    <stop
                      offset="100%"
                      stopColor={segment.color}
                      stopOpacity={0.7}
                    />
                  </linearGradient>
                </defs>
                <rect
                  width="100%"
                  height="100%"
                  fill={`url(#${gradientId})`}
                />
              </svg>
            </motion.button>
          );
        })}
      </div>

      <ul className="mt-4 flex flex-wrap gap-x-4 gap-y-2">
        {segments.map((segment, index) => (
          <li
            key={segment.label}
            className="flex items-center gap-1.5 text-xs text-text-muted transition-opacity duration-150"
            style={{ opacity: hovered === null || hovered === index ? 1 : 0.55 }}
            onMouseEnter={() => setHovered(index)}
            onMouseLeave={() => setHovered(null)}
          >
            <span
              aria-hidden
              className="w-2.5 h-2.5 rounded-sm shrink-0"
              style={{ backgroundColor: segment.color }}
            />
            <span>{segment.label}</span>
            <span className="font-semibold text-text">
              {formatValue(segment.value)}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}

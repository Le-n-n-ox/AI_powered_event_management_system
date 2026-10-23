import type { ReactNode } from "react";
import { motion } from "framer-motion";
import { useCountUp } from "./chart-utils";

interface Props {
  label: string;
  value: string | number;
  icon?: ReactNode;
  hint?: string;
  tone?: "brand" | "success" | "warning" | "danger" | "info" | "neutral";
}

const TONES: Record<
  NonNullable<Props["tone"]>,
  { chip: string; bar: string }
> = {
  brand: {
    chip: "bg-brand-soft text-brand-strong",
    bar: "bg-linear-to-r from-brand via-tag-violet to-tag-pink",
  },
  success: {
    chip: "bg-success-bg text-success",
    bar: "bg-linear-to-r from-success via-tag-teal to-tag-sky",
  },
  warning: {
    chip: "bg-warning-bg text-warning",
    bar: "bg-linear-to-r from-warning via-tag-amber to-tag-pink",
  },
  danger: {
    chip: "bg-danger-bg text-danger",
    bar: "bg-linear-to-r from-danger via-tag-pink to-tag-violet",
  },
  info: {
    chip: "bg-info-bg text-info",
    bar: "bg-linear-to-r from-info via-tag-sky to-brand",
  },
  neutral: {
    chip: "bg-surface-strong text-text-muted",
    bar: "bg-linear-to-r from-border-strong via-text-soft to-border-strong",
  },
};

/**
 * A headline number. Some metrics are better read as a number than as a
 * chart, so the statistic tiles carry those.
 *
 * A numeric value counts up when the page loads; a pre-formatted string
 * (a price, a percentage) is printed as it is.
 */
export default function StatTile({
  label,
  value,
  icon,
  hint,
  tone = "brand",
}: Props) {
  const numeric = typeof value === "number" ? value : null;
  const counted = useCountUp(numeric ?? 0);
  const display =
    numeric === null ? (value as string) : Math.round(counted).toLocaleString();

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
      whileHover={{ y: -3 }}
      className="group relative overflow-hidden bg-surface rounded-2xl border border-border shadow-sm shadow-shadow-soft hover:shadow-lg hover:shadow-shadow-brand/20 hover:border-brand-border transition-all duration-300"
    >
      <div
        className={`absolute top-0 left-0 w-full h-1 ${TONES[tone].bar}`}
        aria-hidden
      />
      <div
        className="absolute -top-10 -right-8 w-32 h-32 rounded-full bg-brand/5 blur-2xl transition-all duration-500 group-hover:bg-brand/15 group-hover:scale-125 pointer-events-none"
        aria-hidden
      />

      <div className="relative p-5 flex items-start gap-4">
        {icon && (
          <div
            className={`p-2.5 rounded-xl shrink-0 ${TONES[tone].chip} transition-transform duration-300 group-hover:scale-110`}
            aria-hidden
          >
            {icon}
          </div>
        )}
        <div className="min-w-0">
          <p className="text-sm font-medium text-text-soft">{label}</p>
          <p className="font-heading text-2xl font-bold text-text mt-0.5">
            {display}
          </p>
          {hint && <p className="text-xs text-text-soft mt-1">{hint}</p>}
        </div>
      </div>
    </motion.div>
  );
}

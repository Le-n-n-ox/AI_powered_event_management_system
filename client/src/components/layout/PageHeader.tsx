import type { ReactNode } from "react";
import { motion } from "framer-motion";
import type { LucideIcon } from "lucide-react";

interface Props {
  title: ReactNode;
  subtitle?: ReactNode;
  /** Small label above the title. */
  eyebrow?: string;
  /** Icon shown in the accent tile. */
  icon?: LucideIcon;
  /** Buttons or controls rendered on the right. */
  actions?: ReactNode;
}

/**
 * The shared page heading used across the public and attendee screens so
 * every page opens with the same rhythm: an accent tile, a title, a subtitle
 * and a hairline that carries the brand gradient.
 */
export default function PageHeader({
  title,
  subtitle,
  eyebrow,
  icon: Icon,
  actions,
}: Props) {
  return (
    <motion.header
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
      className="mb-8"
    >
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div className="min-w-0">
          {eyebrow && (
            <p className="text-xs font-semibold uppercase tracking-widest text-brand-strong mb-2">
              {eyebrow}
            </p>
          )}

          <div className="flex items-center gap-3">
            {Icon && (
              <span className="w-11 h-11 rounded-2xl bg-linear-to-br from-brand to-tag-teal text-text-on-dark grid place-items-center shadow-lg shadow-shadow-brand/30 shrink-0">
                <Icon className="w-5 h-5" />
              </span>
            )}
            <h1 className="font-heading text-2xl sm:text-3xl font-bold text-text tracking-tight">
              {title}
            </h1>
          </div>

          {subtitle && (
            <p className="text-sm text-text-soft mt-3 sm:mt-2 max-w-2xl">
              {subtitle}
            </p>
          )}
        </div>

        {actions && <div className="flex items-center gap-2 shrink-0">{actions}</div>}
      </div>

      {/* brand hairline */}
      <motion.div
        initial={{ scaleX: 0 }}
        animate={{ scaleX: 1 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1], delay: 0.1 }}
        style={{ originX: 0 }}
        className="h-1 w-24 mt-6 rounded-full bg-linear-to-r from-brand via-tag-violet to-tag-teal"
      />
    </motion.header>
  );
}

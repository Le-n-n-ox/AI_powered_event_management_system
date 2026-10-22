import { motion } from "framer-motion";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "../../context/theme-context";

const FOCUS =
  "outline-none focus-visible:ring-2 focus-visible:ring-focus focus-visible:ring-offset-2 focus-visible:ring-offset-surface";

/**
 * Light/dark switch. The knob slides and the icons cross-fade, so the
 * current mode is readable at a glance without relying on colour alone.
 */
export default function ThemeToggle({ className = "" }: { className?: string }) {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === "dark";

  return (
    <button
      type="button"
      onClick={toggleTheme}
      role="switch"
      aria-checked={isDark}
      aria-label={`Switch to ${isDark ? "light" : "dark"} mode`}
      title={`Switch to ${isDark ? "light" : "dark"} mode`}
      className={`relative inline-flex h-9 w-16 items-center rounded-full border border-border bg-surface-muted px-1 transition-colors hover:border-border-strong ${FOCUS} ${className}`}
    >
      <span
        aria-hidden
        className="absolute inset-y-1 left-1 flex items-center gap-1"
        style={{ width: 28 }}
      >
        <motion.span
          className="flex h-7 w-7 items-center justify-center rounded-full bg-surface shadow-sm shadow-shadow-soft"
          animate={{ x: isDark ? 24 : 0 }}
          transition={{ type: "spring", stiffness: 500, damping: 32 }}
        >
          {isDark ? (
            <Moon className="h-3.5 w-3.5 text-brand-strong" />
          ) : (
            <Sun className="h-3.5 w-3.5 text-warning" />
          )}
        </motion.span>
      </span>

      {/* Static glyphs on the far side, faded out when inactive */}
      <Sun
        aria-hidden
        className={`absolute right-2 h-3.5 w-3.5 transition-opacity duration-200 ${
          isDark ? "opacity-0" : "text-text-soft opacity-100"
        }`}
      />
      <Moon
        aria-hidden
        className={`absolute left-2 h-3.5 w-3.5 transition-opacity duration-200 ${
          isDark ? "text-text-soft opacity-100" : "opacity-0"
        }`}
      />
    </button>
  );
}

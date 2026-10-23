import type { ReactNode } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, CalendarDays, Check } from "lucide-react";
import { VARIANTS } from "./authVariants";
import type { AuthVariant } from "./authVariants";

interface Props {
  variant: AuthVariant;
  title: string;
  subtitle: string;
  children: ReactNode;
}

const FOCUS =
  "outline-none focus-visible:ring-2 focus-visible:ring-focus focus-visible:ring-offset-2";

/** Ambient colour blooms that sit behind the marketing panel. */
function PanelBackdrop() {
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
      <div className="absolute inset-0 bg-grid opacity-[0.18] text-white" />
      <div className="absolute -top-24 -left-16 h-80 w-80 rounded-full bg-white/10 blur-3xl" />
      <div className="absolute -bottom-28 -right-10 h-96 w-96 rounded-full bg-white/[0.07] blur-3xl" />
      <div className="absolute inset-x-0 bottom-0 h-40 bg-linear-to-t from-black/20 to-transparent" />
    </div>
  );
}

export default function AuthLayout({ variant, title, subtitle, children }: Props) {
  const v = VARIANTS[variant];
  const Icon = v.icon;

  // ---------------------------------------------------------------------
  // Admin: a focused, single-column canvas — no marketing panel.
  // ---------------------------------------------------------------------
  if (variant === "admin") {
    return (
      <div className="relative min-h-[calc(100vh-4rem)] bg-panel-admin flex items-center justify-center p-4 overflow-hidden">
        <div aria-hidden className="pointer-events-none absolute inset-0">
          <div className="absolute inset-0 bg-grid opacity-[0.14] text-white" />
          <div className="absolute -top-28 left-1/4 h-96 w-96 rounded-full bg-tag-violet/25 blur-3xl" />
          <div className="absolute -bottom-32 right-1/5 h-80 w-80 rounded-full bg-tag-sky/20 blur-3xl" />
        </div>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
          className="relative w-full max-w-md"
        >
          <Link
            to="/"
            className={`inline-flex items-center gap-1.5 mb-6 text-xs font-medium text-text-on-dark/60 hover:text-text-on-dark transition-colors ${FOCUS}`}
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Back to home
          </Link>

          <div className="flex items-center justify-center gap-2 mb-6 font-heading font-semibold text-text-on-dark">
            <span className="w-9 h-9 rounded-xl bg-white/10 border border-white/15 grid place-items-center">
              <Icon className="w-4.5 h-4.5" />
            </span>
            {v.label}
          </div>

          <div className="bg-surface border border-border rounded-2xl shadow-2xl shadow-black/30 p-8">
            <h1 className="font-heading text-2xl font-bold text-text">{title}</h1>
            <p className="text-sm text-text-soft mt-1 mb-6">{subtitle}</p>
            {children}
          </div>

          <p className="text-center text-xs text-text-on-dark/40 mt-4">
            Authorized personnel only.
          </p>
        </motion.div>
      </div>
    );
  }

  // ---------------------------------------------------------------------
  // Organizer / attendee: marketing panel beside the form.
  // ---------------------------------------------------------------------
  return (
    <div className="min-h-[calc(100vh-4rem)] grid md:grid-cols-2 bg-background">
      <aside
        className={`${v.panel} text-text-on-dark relative overflow-hidden hidden md:flex flex-col justify-center p-12 ${
          variant === "attendee" ? "md:order-2" : ""
        }`}
      >
        <PanelBackdrop />

        <motion.div
          initial={{ opacity: 0, x: variant === "attendee" ? 18 : -18 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          className="relative"
        >
          <div
            className={`flex items-center gap-2 mb-6 font-heading font-semibold ${v.accent}`}
          >
            <span className="w-9 h-9 rounded-xl bg-white/10 border border-white/15 grid place-items-center">
              <Icon className="w-4.5 h-4.5" />
            </span>
            {v.label}
          </div>

          <h2 className="font-heading text-3xl font-bold leading-tight mb-6 max-w-sm">
            {v.headline}
          </h2>

          <ul className="flex flex-col gap-3">
            {v.points.map((point, i) => (
              <motion.li
                key={point}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.35, delay: 0.15 + i * 0.08 }}
                className="flex items-start gap-2.5 text-sm text-text-on-dark/85"
              >
                <span className="mt-0.5 w-5 h-5 shrink-0 rounded-full bg-white/15 grid place-items-center">
                  <Check className="w-3 h-3" />
                </span>
                {point}
              </motion.li>
            ))}
          </ul>

          <div className="mt-10 pt-6 border-t border-white/15 flex items-center gap-2 text-xs text-text-on-dark/60">
            <CalendarDays className="w-3.5 h-3.5" />
            AI help desk · QR ticketing · M-Pesa payments
          </div>
        </motion.div>
      </aside>

      <main className="relative flex items-center justify-center p-6">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
          className="w-full max-w-sm"
        >
          <Link
            to="/"
            className={`inline-flex items-center gap-1.5 mb-6 text-xs font-medium text-text-soft hover:text-brand-strong transition-colors ${FOCUS}`}
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Back to home
          </Link>

          <p className="md:hidden text-xs font-semibold uppercase tracking-wide text-text-soft mb-2">
            {v.label}
          </p>
          <h1 className="font-heading text-2xl font-bold text-text">{title}</h1>
          <p className="text-sm text-text-soft mt-1 mb-6">{subtitle}</p>

          <div className="bg-surface border border-border rounded-2xl shadow-xl shadow-shadow-soft p-6">
            {children}
          </div>
        </motion.div>
      </main>
    </div>
  );
}

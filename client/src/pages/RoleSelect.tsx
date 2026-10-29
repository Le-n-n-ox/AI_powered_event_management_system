import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  CalendarDays,
  Ticket,
  ArrowRight,
  ShieldCheck,
  ArrowLeft,
} from "lucide-react";

const FOCUS =
  "outline-none focus-visible:ring-2 focus-visible:ring-focus focus-visible:ring-offset-2";

const ROLES = [
  {
    key: "attendee",
    title: "Attendee",
    blurb: "Discover events, register, pay by M-Pesa and get SMS updates at the venue.",
    icon: Ticket,
    accent: "from-tag-teal to-tag-sky",
    tint: "bg-tag-teal-bg text-tag-teal",
  },
  {
    key: "organizer",
    title: "Organizer",
    blurb: "Create events, manage attendees, schedules, payments and venue logistics.",
    icon: CalendarDays,
    accent: "from-brand to-tag-violet",
    tint: "bg-brand-soft text-brand",
  },
];

export default function RoleSelect({ mode }: { mode: "login" | "signup" }) {
  const isLogin = mode === "login";

  return (
    <div className="relative min-h-[calc(100vh-4rem)] bg-background flex items-center justify-center p-6 overflow-hidden">
      <div aria-hidden className="pointer-events-none absolute inset-0">
        <div className="absolute inset-0 bg-grid grid-fade opacity-60" />
        <div className="absolute -top-24 -left-20 h-80 w-80 rounded-full bg-tag-violet/20 blur-3xl" />
        <div className="absolute -bottom-24 -right-16 h-80 w-80 rounded-full bg-tag-sky/20 blur-3xl" />
      </div>

      <div className="relative w-full max-w-3xl">
        <Link
          to="/"
          className={`inline-flex items-center gap-1.5 mb-8 text-xs font-medium text-text-soft hover:text-brand-strong transition-colors ${FOCUS}`}
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Back to home
        </Link>

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="text-center mb-10"
        >
          <h1 className="font-heading text-3xl sm:text-4xl font-bold text-text mb-2">
            {isLogin ? "Log in as…" : "Sign up as…"}
          </h1>
          <p className="text-text-muted">
            Choose the account type that fits you.
          </p>
        </motion.div>

        <div className="grid sm:grid-cols-2 gap-4">
          {ROLES.map((r, i) => (
            <motion.div
              key={r.key}
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35, delay: 0.08 + i * 0.07 }}
            >
              <Link
                to={`/${r.key}/${mode}`}
                className={`group block h-full bg-surface border border-border rounded-2xl p-6 shadow-sm shadow-shadow-soft transition-all duration-300 hover:-translate-y-1.5 hover:border-brand-border hover:shadow-xl ${FOCUS}`}
              >
                <span
                  className={`inline-flex w-11 h-11 rounded-xl bg-linear-to-br ${r.accent} text-text-on-dark grid place-items-center shadow-md transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3`}
                >
                  <r.icon className="w-5 h-5" />
                </span>
                <h2 className="font-heading font-semibold text-lg text-text mt-4">
                  {r.title}
                </h2>
                <p className="text-sm text-text-muted mt-1 mb-5">
                  {r.blurb}
                </p>
                <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-brand-strong">
                  {isLogin ? "Log in" : "Sign up"}
                  <ArrowRight className="w-4 h-4 transition-transform duration-200 group-hover:translate-x-1" />
                </span>
              </Link>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.4, delay: 0.28 }}
          className="mt-8 flex flex-col items-center gap-2 text-center"
        >
          <p className="text-sm text-text-muted">
            {isLogin ? "New here?" : "Already registered?"}{" "}
            <Link
              to={isLogin ? "/signup" : "/login"}
              className={`font-semibold text-brand-strong hover:text-tag-violet hover:underline ${FOCUS}`}
            >
              {isLogin ? "Create an account" : "Log in"}
            </Link>
          </p>
          <Link
            to={`/admin/${mode}`}
            className={`inline-flex items-center gap-1.5 text-xs text-text-soft hover:text-role-admin transition-colors ${FOCUS}`}
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            Platform admin?{" "}
            {isLogin ? "Log in" : "Sign up"}
          </Link>
        </motion.div>
      </div>
    </div>
  );
}

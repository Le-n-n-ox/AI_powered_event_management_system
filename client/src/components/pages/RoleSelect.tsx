import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { CalendarDays, Ticket, ArrowRight } from "lucide-react";

const ROLES = [
  {
    key: "attendee",
    title: "Attendee",
    blurb: "Discover events, register and get SMS updates at the venue.",
    icon: Ticket,
    tint: "bg-[var(--color-success-bg)] text-[var(--color-success)]",
  },
  {
    key: "organizer",
    title: "Organizer",
    blurb: "Create events and manage attendees, schedules and venues.",
    icon: CalendarDays,
    tint: "bg-[var(--color-brand-soft)] text-[var(--color-brand)]",
  },
];

export default function RoleSelect({ mode }: { mode: "login" | "signup" }) {
  const isLogin = mode === "login";

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-[var(--color-background)] flex items-center justify-center p-6">
      <div className="w-full max-w-2xl">
        <h1 className="font-heading text-3xl font-bold text-[var(--color-text)] text-center mb-2">
          {isLogin ? "Log in as…" : "Sign up as…"}
        </h1>
        <p className="text-center text-[var(--color-text-muted)] mb-8">
          Choose the account type that fits you.
        </p>

        <div className="grid sm:grid-cols-2 gap-4">
          {ROLES.map((r, i) => (
            <motion.div
              key={r.key}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: i * 0.05 }}
            >
              <Link
                to={`/${r.key}/${mode}`}
                className="group block h-full bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl p-6 hover:shadow-md transition-shadow"
              >
                <div
                  className={`w-10 h-10 rounded-lg flex items-center justify-center mb-4 ${r.tint}`}
                >
                  <r.icon className="w-5 h-5" />
                </div>
                <h2 className="font-heading font-semibold text-lg text-[var(--color-text)]">
                  {r.title}
                </h2>
                <p className="text-sm text-[var(--color-text-muted)] mt-1 mb-4">
                  {r.blurb}
                </p>
                <span className="inline-flex items-center gap-1 text-sm font-medium text-[var(--color-text)]">
                  {isLogin ? "Log in" : "Sign up"}
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                </span>
              </Link>
            </motion.div>
          ))}
        </div>

        <p className="text-center text-sm text-[var(--color-text-muted)] mt-6">
          {isLogin ? "New here?" : "Already registered?"}{" "}
          <Link
            to={isLogin ? "/signup" : "/login"}
            className="text-[var(--color-brand)] font-medium"
          >
            {isLogin ? "Create an account" : "Log in"}
          </Link>
        </p>
        <p className="text-center text-xs text-[var(--color-text-soft)] mt-3">
          Platform admin?{" "}
          <Link to={`/admin/${mode}`} className="underline">
            Admin {isLogin ? "login" : "signup"}
          </Link>
        </p>
      </div>
    </div>
  );
}

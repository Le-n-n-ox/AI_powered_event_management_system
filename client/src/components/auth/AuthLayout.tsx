import type { ReactNode } from "react";
import { Check } from "lucide-react";
import { VARIANTS } from "./authVariants";
import type { AuthVariant } from "./authVariants";

interface Props {
  variant: AuthVariant;
  title: string;
  subtitle: string;
  children: ReactNode;
}

export default function AuthLayout({ variant, title, subtitle, children }: Props) {
  const v = VARIANTS[variant];
  const Icon = v.icon;

  // Admin: dark canvas, single centered card — no marketing panel
  if (variant === "admin") {
    return (
      <div className="min-h-screen bg-panel-admin flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <div className={`flex items-center justify-center gap-2 mb-6 font-heading font-semibold ${v.accent}`}>
            <Icon className="w-5 h-5" />
            {v.label}
          </div>
          <div className="bg-surface-muted border border-border rounded-2xl shadow-2xl p-8">
            <h1 className="font-heading text-2xl font-bold text-text">{title}</h1>
            <p className="text-sm text-text-soft mt-1 mb-6">{subtitle}</p>
            {children}
          </div>
          <p className="text-center text-xs text-text-on-dark/40 mt-4">
            Authorized personnel only.
          </p>
        </div>
      </div>
    );
  }

  // Organizer: marketing panel on the left. Attendee: on the right.
  return (
    <div className="min-h-screen grid md:grid-cols-2 bg-background">
      <aside
        className={`${v.panel} text-text-on-dark hidden md:flex flex-col justify-center p-12 ${
          variant === "attendee" ? "md:order-2" : ""
        }`}
      >
        <div className={`flex items-center gap-2 mb-6 font-heading font-semibold ${v.accent}`}>
          <Icon className="w-5 h-5" />
          {v.label}
        </div>
        <h2 className="font-heading text-3xl font-bold leading-tight mb-6">{v.headline}</h2>
        <ul className="flex flex-col gap-3">
          {v.points.map((p) => (
            <li key={p} className="flex items-start gap-2 text-sm text-text-on-dark/85">
              <Check className="w-4 h-4 mt-0.5 shrink-0" />
              {p}
            </li>
          ))}
        </ul>
      </aside>

      <main className="flex items-center justify-center p-6">
        <div className="w-full max-w-sm">
          <p className="md:hidden text-xs font-semibold uppercase tracking-wide text-text-soft mb-2">
            {v.label}
          </p>
          <h1 className="font-heading text-2xl font-bold text-text">{title}</h1>
          <p className="text-sm text-text-soft mt-1 mb-6">{subtitle}</p>
          <div className="bg-surface-muted border border-border rounded-xl shadow-lg shadow-shadow-soft p-6">
            {children}
          </div>
        </div>
      </main>
    </div>
  );
}
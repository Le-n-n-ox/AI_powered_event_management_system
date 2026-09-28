import type { InputHTMLAttributes } from "react";
import type { LucideIcon } from "lucide-react";

export function Field({
  label,
  icon: Icon,
  hint,
  ...props
}: InputHTMLAttributes<HTMLInputElement> & {
  label: string;
  icon?: LucideIcon;
  hint?: string;
}) {
  return (
    <label className="block">
      <span className="flex items-center gap-1.5 text-sm font-medium text-[var(--color-text-muted)] mb-1">
        {Icon && <Icon className="w-3.5 h-3.5 text-[var(--color-text-soft)]" />}
        {label}
      </span>
      <input
        {...props}
        className="w-full border border-[var(--color-border)] rounded-lg px-3 py-2 text-sm text-[var(--color-text)] bg-[var(--color-surface)] focus:outline-none focus:ring-2 focus:ring-[var(--color-focus-soft)] focus:border-[var(--color-focus)]"
      />
      {hint && (
        <span className="block text-xs text-[var(--color-text-soft)] mt-1">
          {hint}
        </span>
      )}
    </label>
  );
}

export function ErrorBanner({ message }: { message: string | null }) {
  if (!message) return null;
  return (
    <div className="text-sm text-[var(--color-error)] bg-[var(--color-error-bg)] border border-[var(--color-error-border)] rounded-lg p-3">
      {message}
    </div>
  );
}

export function InfoBanner({ message }: { message: string | null }) {
  if (!message) return null;
  return (
    <div className="text-sm text-[var(--color-success)] bg-[var(--color-success-bg)] border border-[var(--color-success-border)] rounded-lg p-3">
      {message}
    </div>
  );
}

import type { InputHTMLAttributes } from "react";
import type { LucideIcon } from "lucide-react";
import { TriangleAlert, CircleCheck } from "lucide-react";
import { cn } from "@/lib/utils";

export function Field({
  label,
  icon: Icon,
  hint,
  className,
  ...props
}: InputHTMLAttributes<HTMLInputElement> & {
  label: string;
  icon?: LucideIcon;
  hint?: string;
}) {
  return (
    <label className="block">
      <span className="flex items-center gap-1.5 text-sm font-medium text-text-muted mb-1">
        {Icon && <Icon className="w-3.5 h-3.5 text-text-soft" />}
        {label}
      </span>
      <input
        {...props}
        className={cn(
          "w-full border border-border rounded-lg px-3 py-2 text-sm text-text bg-surface placeholder:text-text-soft transition-colors hover:border-border-strong focus:outline-none focus:ring-2 focus:ring-focus-soft focus:border-focus disabled:cursor-not-allowed disabled:bg-surface-muted disabled:text-text-soft",
          className
        )}
      />
      {hint && (
        <span className="block text-xs text-text-soft mt-1">{hint}</span>
      )}
    </label>
  );
}

export function ErrorBanner({ message }: { message: string | null }) {
  if (!message) return null;
  return (
    <div
      role="alert"
      className="flex items-start gap-2 text-sm text-danger bg-danger-bg border border-danger-border rounded-lg p-3"
    >
      <TriangleAlert className="w-4 h-4 mt-0.5 shrink-0" />
      <span>{message}</span>
    </div>
  );
}

export function InfoBanner({ message }: { message: string | null }) {
  if (!message) return null;
  return (
    <div
      role="status"
      className="flex items-start gap-2 text-sm text-success bg-success-bg border border-success-border rounded-lg p-3"
    >
      <CircleCheck className="w-4 h-4 mt-0.5 shrink-0" />
      <span>{message}</span>
    </div>
  );
}
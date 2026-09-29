import { Link } from "react-router-dom";
import { ShieldAlert } from "lucide-react";

export default function AccessDenied({ message }: { message: string }) {
  return (
    <div className="max-w-md mx-auto mt-24 p-8 text-center bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl shadow-sm">
      <ShieldAlert className="w-10 h-10 text-[var(--color-danger)] mx-auto mb-3" />
      <h1 className="font-heading text-xl font-bold text-[var(--color-text)] mb-1">
        Access denied
      </h1>
      <p className="text-sm text-[var(--color-text-muted)] mb-4">{message}</p>
      <Link
        to="/events"
        className="text-sm font-medium text-[var(--color-brand)] hover:text-[var(--color-brand-hover)]"
      >
        Back to events
      </Link>
    </div>
  );
}

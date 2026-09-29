import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Link } from "react-router-dom";
import { ShieldAlert } from "lucide-react";
export default function AccessDenied({ message }) {
    return (_jsxs("div", { className: "max-w-md mx-auto mt-24 p-8 text-center bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl shadow-sm", children: [_jsx(ShieldAlert, { className: "w-10 h-10 text-[var(--color-danger)] mx-auto mb-3" }), _jsx("h1", { className: "font-heading text-xl font-bold text-[var(--color-text)] mb-1", children: "Access denied" }), _jsx("p", { className: "text-sm text-[var(--color-text-muted)] mb-4", children: message }), _jsx(Link, { to: "/events", className: "text-sm font-medium text-[var(--color-brand)] hover:text-[var(--color-brand-hover)]", children: "Back to events" })] }));
}

import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { TriangleAlert, CircleCheck } from "lucide-react";
import { cn } from "@/lib/utils";
export function Field({ label, icon: Icon, hint, className, ...props }) {
    return (_jsxs("label", { className: "block", children: [_jsxs("span", { className: "flex items-center gap-1.5 text-sm font-medium text-text-muted mb-1", children: [Icon && _jsx(Icon, { className: "w-3.5 h-3.5 text-text-soft" }), label] }), _jsx("input", { ...props, className: cn("w-full border border-border rounded-lg px-3 py-2 text-sm text-text bg-surface placeholder:text-text-soft transition-colors hover:border-border-strong focus:outline-none focus:ring-2 focus:ring-focus-soft focus:border-focus disabled:cursor-not-allowed disabled:bg-surface-muted disabled:text-text-soft", className) }), hint && (_jsx("span", { className: "block text-xs text-text-soft mt-1", children: hint }))] }));
}
export function ErrorBanner({ message }) {
    if (!message)
        return null;
    return (_jsxs("div", { role: "alert", className: "flex items-start gap-2 text-sm text-danger bg-danger-bg border border-danger-border rounded-lg p-3", children: [_jsx(TriangleAlert, { className: "w-4 h-4 mt-0.5 shrink-0" }), _jsx("span", { children: message })] }));
}
export function InfoBanner({ message }) {
    if (!message)
        return null;
    return (_jsxs("div", { role: "status", className: "flex items-start gap-2 text-sm text-success bg-success-bg border border-success-border rounded-lg p-3", children: [_jsx(CircleCheck, { className: "w-4 h-4 mt-0.5 shrink-0" }), _jsx("span", { children: message })] }));
}

import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
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
export default function RoleSelect({ mode }) {
    const isLogin = mode === "login";
    return (_jsx("div", { className: "min-h-[calc(100vh-4rem)] bg-[var(--color-background)] flex items-center justify-center p-6", children: _jsxs("div", { className: "w-full max-w-2xl", children: [_jsx("h1", { className: "font-heading text-3xl font-bold text-[var(--color-text)] text-center mb-2", children: isLogin ? "Log in as…" : "Sign up as…" }), _jsx("p", { className: "text-center text-[var(--color-text-muted)] mb-8", children: "Choose the account type that fits you." }), _jsx("div", { className: "grid sm:grid-cols-2 gap-4", children: ROLES.map((r, i) => (_jsx(motion.div, { initial: { opacity: 0, y: 10 }, animate: { opacity: 1, y: 0 }, transition: { duration: 0.3, delay: i * 0.05 }, children: _jsxs(Link, { to: `/${r.key}/${mode}`, className: "group block h-full bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl p-6 hover:shadow-md transition-shadow", children: [_jsx("div", { className: `w-10 h-10 rounded-lg flex items-center justify-center mb-4 ${r.tint}`, children: _jsx(r.icon, { className: "w-5 h-5" }) }), _jsx("h2", { className: "font-heading font-semibold text-lg text-[var(--color-text)]", children: r.title }), _jsx("p", { className: "text-sm text-[var(--color-text-muted)] mt-1 mb-4", children: r.blurb }), _jsxs("span", { className: "inline-flex items-center gap-1 text-sm font-medium text-[var(--color-text)]", children: [isLogin ? "Log in" : "Sign up", _jsx(ArrowRight, { className: "w-4 h-4 group-hover:translate-x-0.5 transition-transform" })] })] }) }, r.key))) }), _jsxs("p", { className: "text-center text-sm text-[var(--color-text-muted)] mt-6", children: [isLogin ? "New here?" : "Already registered?", " ", _jsx(Link, { to: isLogin ? "/signup" : "/login", className: "text-[var(--color-brand)] font-medium", children: isLogin ? "Create an account" : "Log in" })] }), _jsxs("p", { className: "text-center text-xs text-[var(--color-text-soft)] mt-3", children: ["Platform admin?", " ", _jsxs(Link, { to: `/admin/${mode}`, className: "underline", children: ["Admin ", isLogin ? "login" : "signup"] })] })] }) }));
}

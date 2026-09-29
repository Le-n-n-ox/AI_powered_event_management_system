import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { ShieldCheck, CalendarDays, Ticket } from "lucide-react";
export const VARIANTS = {
    admin: {
        icon: ShieldCheck,
        label: "Admin Portal",
        headline: "Platform administration",
        points: [],
        panel: "bg-[var(--color-panel-admin)]",
        accent: "text-[var(--color-accent-admin)]",
        btn: "bg-[var(--color-panel-admin)] hover:bg-[var(--color-panel-admin-hover)]",
    },
    organizer: {
        icon: CalendarDays,
        label: "Organizer Portal",
        headline: "Run your event without the chaos",
        points: [
            "Create events with venue, pricing and capacity",
            "Approve registrations and track payments",
            "Manage schedules and venue locations",
            "AI assistant answers attendee questions by SMS",
        ],
        panel: "bg-[var(--color-panel-organizer)]",
        accent: "text-[var(--color-accent-organizer)]",
        btn: "bg-[var(--color-panel-organizer)] hover:bg-[var(--color-panel-organizer-hover)]",
    },
    attendee: {
        icon: Ticket,
        label: "Attendee Portal",
        headline: "Find events. Show up. Stay informed.",
        points: [
            "Browse and register for upcoming events",
            "Get schedule and venue answers by SMS",
            "One-tap safety check-ins at the venue",
        ],
        panel: "bg-[var(--color-panel-attendee)]",
        accent: "text-[var(--color-accent-attendee)]",
        btn: "bg-[var(--color-panel-attendee)] hover:bg-[var(--color-panel-attendee-hover)]",
    },
};
// 2. Actually create the AuthLayout component function
export default function AuthLayout({ children, variant = "admin", }) {
    const config = VARIANTS[variant];
    const Icon = config.icon;
    return (_jsxs("div", { className: "flex min-h-screen bg-[var(--color-background)]", children: [_jsxs("div", { className: `w-1/2 p-8 text-[var(--color-text-on-dark)] ${config.panel}`, children: [_jsx(Icon, { className: `w-12 h-12 ${config.accent} mb-4` }), _jsx("h1", { className: "text-3xl font-bold", children: config.headline })] }), _jsx("div", { className: "w-1/2 p-8 flex items-center justify-center bg-[var(--color-surface)]", children: children })] }));
}

import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { CalendarDays, MessageSquareText, PhoneCall, ShieldCheck, } from "lucide-react";
const FEATURES = [
    {
        icon: MessageSquareText,
        title: "AI Attendee Assistant",
        description: "Attendees text questions about venue, schedule, and logistics — answered instantly by AI, no app download needed.",
    },
    {
        icon: PhoneCall,
        title: "Emergency Escalation",
        description: "Emergency keywords trigger an automatic voice call to your floor manager, plus SMS confirmation to the attendee.",
    },
    {
        icon: CalendarDays,
        title: "Full Event Management",
        description: "Create events, manage schedules, track attendees, and monitor everything from one organizer dashboard.",
    },
    {
        icon: ShieldCheck,
        title: "Real-Time Safety Check-ins",
        description: "Attendees can text 'SAFE' with their location for instant status logging during large events.",
    },
];
const FOCUS = "outline-none focus-visible:ring-2 focus-visible:ring-focus focus-visible:ring-offset-2";
function Landing() {
    return (_jsxs("div", { className: "min-h-screen bg-background", children: [_jsxs("section", { className: "relative overflow-hidden", children: [_jsx("div", { "aria-hidden": true, className: "pointer-events-none absolute inset-x-0 top-0 h-96 bg-gradient-to-b from-surface-alt to-transparent" }), _jsxs("div", { className: "relative max-w-5xl mx-auto px-6 pt-24 pb-16 text-center", children: [_jsx(motion.span, { initial: { opacity: 0, y: 12 }, animate: { opacity: 1, y: 0 }, transition: { duration: 0.4 }, className: "inline-block mb-4 px-3 py-1 text-xs font-medium rounded-full bg-brand-soft text-brand-strong border border-brand-border", children: "AI-powered event help desk" }), _jsx(motion.h1, { initial: { opacity: 0, y: 12 }, animate: { opacity: 1, y: 0 }, transition: { duration: 0.4, delay: 0.05 }, className: "font-heading text-4xl sm:text-5xl font-bold text-text mb-4 tracking-tight", children: "Run your event without the chaos" }), _jsx(motion.p, { initial: { opacity: 0, y: 12 }, animate: { opacity: 1, y: 0 }, transition: { duration: 0.4, delay: 0.1 }, className: "text-lg text-text-muted max-w-2xl mx-auto mb-8", children: "An AI-powered help desk for event organizers \u2014 attendees get instant answers over SMS, emergencies get escalated automatically, and you get one dashboard to run it all." }), _jsxs(motion.div, { initial: { opacity: 0, y: 12 }, animate: { opacity: 1, y: 0 }, transition: { duration: 0.4, delay: 0.2 }, className: "flex flex-wrap items-center justify-center gap-3", children: [_jsx(Link, { to: "/signup", className: `px-6 py-3 text-sm font-medium text-text-on-dark bg-brand rounded-lg shadow-lg shadow-shadow-brand hover:bg-brand-hover transition-colors ${FOCUS}`, children: "Get Started Free" }), _jsx(Link, { to: "/login", className: `px-6 py-3 text-sm font-medium text-text-muted bg-surface border border-border rounded-lg hover:bg-surface-muted hover:border-border-strong transition-colors ${FOCUS}`, children: "Log In" }), _jsx(Link, { to: "/events", className: `px-4 py-3 text-sm font-medium text-brand rounded-lg hover:text-brand-hover transition-colors ${FOCUS}`, children: "Browse Events \u2192" })] })] })] }), _jsx("section", { className: "max-w-5xl mx-auto px-6 pb-24", children: _jsx("div", { className: "grid grid-cols-1 sm:grid-cols-2 gap-5", children: FEATURES.map((feature, i) => (_jsxs(motion.div, { initial: { opacity: 0, y: 12 }, whileInView: { opacity: 1, y: 0 }, viewport: { once: true }, transition: { duration: 0.35, delay: i * 0.05 }, className: "group bg-surface rounded-xl border border-border p-6 shadow-sm transition-all hover:-translate-y-0.5 hover:border-brand-border hover:shadow-md", children: [_jsx("div", { className: "mb-4 inline-flex p-2.5 rounded-lg bg-brand-soft text-brand transition-colors group-hover:bg-brand group-hover:text-text-on-dark", children: _jsx(feature.icon, { className: "w-6 h-6" }) }), _jsx("h3", { className: "font-heading font-semibold text-text mb-1", children: feature.title }), _jsx("p", { className: "text-sm text-text-muted leading-relaxed", children: feature.description })] }, feature.title))) }) }), _jsx("section", { className: "border-t border-border bg-surface", children: _jsxs("div", { className: "max-w-5xl mx-auto px-6 py-12 text-center", children: [_jsx("h2", { className: "font-heading text-2xl font-bold text-text mb-4", children: "Ready to run a smoother event?" }), _jsx(Link, { to: "/signup", className: `inline-block px-6 py-3 text-sm font-medium text-text-on-dark bg-brand rounded-lg hover:bg-brand-hover transition-colors ${FOCUS}`, children: "Create Your First Event" })] }) })] }));
}
export default Landing;

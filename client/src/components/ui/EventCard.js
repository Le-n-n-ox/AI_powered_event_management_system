import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { MapPinned, CalendarDays, UsersRound, AlarmClock, SquarePen, Link as LinkIcon, Check, } from "lucide-react";
import { getCountdown } from "../../utils/dateHelpers";
import { Card, CardContent, CardFooter, CardHeader, CardTitle, } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
const STATUS_STYLES = {
    upcoming: {
        variant: "default",
        badge: "bg-info-bg text-info border-info-border hover:bg-info-bg",
        bar: "bg-info",
    },
    ongoing: {
        variant: "default",
        badge: "bg-success-bg text-success border-success-border hover:bg-success-bg",
        bar: "bg-success",
    },
    cancelled: {
        variant: "destructive",
        badge: "",
        bar: "bg-danger",
    },
    completed: {
        variant: "secondary",
        badge: "",
        bar: "bg-border-strong",
    },
};
const ICON_BTN = "text-text-soft hover:text-text hover:bg-surface-muted";
export default function EventCard({ event }) {
    const navigate = useNavigate();
    const [copied, setCopied] = useState(false);
    const isPastEvent = new Date(event.end_date) < new Date();
    const isCancelled = event.status === "cancelled";
    const showAsPast = isPastEvent && !isCancelled;
    const style = showAsPast
        ? STATUS_STYLES.completed
        : STATUS_STYLES[event.status] ?? STATUS_STYLES.completed;
    const statusLabel = showAsPast ? "past" : event.status;
    async function handleCopyLink() {
        const url = `${window.location.origin}/events/${event.id}`;
        try {
            await navigator.clipboard.writeText(url);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        }
        catch {
            window.prompt("Copy this link:", url);
        }
    }
    return (_jsx(motion.div, { initial: { opacity: 0, y: 10 }, animate: { opacity: 1, y: 0 }, whileHover: { y: -4 }, transition: { duration: 0.2 }, className: `h-full ${showAsPast ? "opacity-80 hover:opacity-100" : ""}`, children: _jsxs(Card, { className: "h-full relative shadow-sm hover:shadow-md ring-border hover:ring-brand-border transition-all bg-surface", children: [_jsx("div", { className: `absolute top-0 left-0 w-full h-1 ${style.bar}` }), _jsxs(CardHeader, { className: "pt-1", children: [_jsxs("div", { className: "flex items-start justify-between gap-2", children: [_jsx(CardTitle, { className: "font-heading text-lg leading-snug text-text", children: event.name }), _jsx(Badge, { variant: style.variant, className: `capitalize shrink-0 ${style.badge}`, children: statusLabel })] }), event.description && (_jsx("p", { className: "text-sm text-text-soft line-clamp-2 mt-2", children: event.description }))] }), _jsx(CardContent, { className: "flex-1", children: _jsxs("div", { className: "flex flex-col gap-2 text-sm bg-surface-muted rounded-lg p-3 border border-border", children: [event.venue_name && (_jsxs("div", { className: "flex items-center gap-2 text-text-muted", children: [_jsx(MapPinned, { className: "w-4 h-4 text-text-soft shrink-0" }), _jsx("span", { className: "truncate", children: event.venue_name })] })), _jsxs("div", { className: "flex items-center gap-2 text-text-muted", children: [_jsx(CalendarDays, { className: "w-4 h-4 text-text-soft shrink-0" }), _jsx("span", { children: new Date(event.start_date).toLocaleDateString() }), _jsx("span", { className: `font-medium ml-auto text-xs ${isPastEvent ? "text-text-soft" : "text-brand"}`, children: isPastEvent ? "Ended" : getCountdown(event.start_date) })] }), event.registration_deadline && !isPastEvent && (_jsxs("div", { className: "flex items-center gap-2 text-warning mt-1", children: [_jsx(AlarmClock, { className: "w-4 h-4 shrink-0" }), _jsxs("span", { className: "text-xs font-medium", children: ["Closes ", getCountdown(event.registration_deadline)] })] }))] }) }), _jsxs(CardFooter, { className: "justify-between gap-1 border-border bg-surface-muted/50", children: [_jsx(Button, { asChild: true, variant: "secondary", className: "flex-1 text-brand-strong bg-surface-alt hover:bg-brand-soft border border-brand-border", children: _jsxs(Link, { to: `/events/${event.id}/manage`, children: [_jsx(UsersRound, { className: "w-4 h-4 mr-1.5" }), "Attendees"] }) }), _jsxs("div", { className: "flex items-center gap-1", children: [!isPastEvent && (_jsx(Button, { variant: "ghost", size: "icon", className: ICON_BTN, onClick: () => navigate("/organizer/events/edit", { state: { event } }), title: "Edit Event", "aria-label": "Edit Event", children: _jsx(SquarePen, { className: "w-4 h-4" }) })), _jsx(Button, { asChild: true, variant: "ghost", size: "icon", className: ICON_BTN, title: "Manage Schedule", children: _jsx(Link, { to: `/events/${event.id}/schedule`, "aria-label": "Manage Schedule", children: _jsx(AlarmClock, { className: "w-4 h-4" }) }) }), _jsx(Button, { asChild: true, variant: "ghost", size: "icon", className: ICON_BTN, title: "Manage Locations", children: _jsx(Link, { to: `/events/${event.id}/locations`, "aria-label": "Manage Locations", children: _jsx(MapPinned, { className: "w-4 h-4" }) }) }), _jsx(Button, { variant: "ghost", size: "icon", className: copied
                                        ? "text-success hover:text-success hover:bg-success-bg"
                                        : ICON_BTN, onClick: handleCopyLink, title: "Copy Registration Link", "aria-label": "Copy Registration Link", children: copied ? (_jsx(Check, { className: "w-4 h-4" })) : (_jsx(LinkIcon, { className: "w-4 h-4" })) })] })] })] }) }));
}

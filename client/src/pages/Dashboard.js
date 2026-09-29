import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useNavigate } from "react-router-dom";
import { CirclePlus, CalendarDays, Loader2, TriangleAlert } from "lucide-react";
import EventCard from "@/components/ui/EventCard";
import { useEvents } from "../hooks/useEvents";
import { useAuth } from "../context/AuthContext";
import { groupEventsByPeriod } from "../utils/dateHelpers";
import { Button } from "@/components/ui/button";
import AdminDashboard from "./admin/AdminDashboard";
function EventSection({ title, events }) {
    return (_jsxs("section", { className: "mb-10", children: [_jsxs("h2", { className: "font-heading text-sm font-semibold text-text-soft uppercase tracking-wide mb-4 flex items-center gap-2", children: [title, _jsx("span", { className: "inline-flex items-center justify-center min-w-6 h-6 px-2 rounded-full bg-brand-soft text-brand-strong text-xs font-medium normal-case tracking-normal", children: events.length })] }), _jsx("div", { className: "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4", children: events.map((event) => (_jsx(EventCard, { event: event }, event.id))) })] }));
}
function Dashboard() {
    const { events, loading, error } = useEvents();
    const { isAdmin } = useAuth();
    const navigate = useNavigate();
    if (isAdmin) {
        return _jsx(AdminDashboard, {});
    }
    const { groups, order } = groupEventsByPeriod(events);
    return (_jsx("div", { className: "min-h-screen bg-background", children: _jsxs("div", { className: "max-w-6xl mx-auto px-4 sm:px-6 pt-24 pb-12", children: [_jsxs("div", { className: "flex items-center justify-between gap-4 mb-8", children: [_jsxs("div", { children: [_jsx("h1", { className: "font-heading text-2xl sm:text-3xl font-bold text-text tracking-tight", children: "My Events" }), _jsx("p", { className: "text-text-soft text-sm mt-1", children: "Manage schedules, attendees and registration links." })] }), _jsxs(Button, { onClick: () => navigate("/organizer/events/new"), className: "gap-2 shadow-lg shadow-shadow-brand", children: [_jsx(CirclePlus, { className: "w-4 h-4" }), "New Event"] })] }), loading && (_jsxs("div", { className: "flex items-center gap-2 text-text-soft", children: [_jsx(Loader2, { className: "w-4 h-4 animate-spin" }), "Loading events\u2026"] })), error && (_jsxs("div", { role: "alert", className: "flex items-start gap-3 p-4 rounded-lg border border-danger-border bg-danger-bg text-danger text-sm", children: [_jsx(TriangleAlert, { className: "w-4 h-4 mt-0.5 shrink-0" }), _jsxs("span", { children: ["Error: ", error] })] })), !loading && !error && events.length === 0 && (_jsxs("div", { className: "flex flex-col items-center text-center bg-surface border border-dashed border-border-strong rounded-xl p-12", children: [_jsx("div", { className: "p-3 rounded-lg bg-brand-soft text-brand mb-4", children: _jsx(CalendarDays, { className: "w-8 h-8" }) }), _jsx("h2", { className: "font-heading text-lg font-semibold text-text", children: "No events yet" }), _jsx("p", { className: "text-sm text-text-soft mt-1 mb-5", children: "Create your first event to get started." }), _jsxs(Button, { onClick: () => navigate("/organizer/events/new"), className: "gap-2", children: [_jsx(CirclePlus, { className: "w-4 h-4" }), "Create Event"] })] })), order.map((key) => (_jsx(EventSection, { title: key, events: groups[key] }, key)))] }) }));
}
export default Dashboard;

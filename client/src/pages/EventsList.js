import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { CalendarDays, MapPin, Loader2, TriangleAlert, ArrowRight, } from "lucide-react";
import { supabase } from "../lib/supabase";
const STATUS_STYLES = {
    upcoming: {
        badge: "bg-info-bg text-info border-info-border",
        bar: "bg-info",
    },
    ongoing: {
        badge: "bg-success-bg text-success border-success-border",
        bar: "bg-success",
    },
    cancelled: {
        badge: "bg-danger-bg text-danger border-danger-border",
        bar: "bg-danger",
    },
    completed: {
        badge: "bg-surface-strong text-text-muted border-border",
        bar: "bg-border-strong",
    },
};
const FOCUS = "outline-none focus-visible:ring-2 focus-visible:ring-focus focus-visible:ring-offset-2";
function isPast(event) {
    return new Date(event.end_date) < new Date();
}
function EventTile({ event, past }) {
    const cancelled = event.status === "cancelled";
    const style = past && !cancelled
        ? STATUS_STYLES.completed
        : STATUS_STYLES[event.status] ?? STATUS_STYLES.completed;
    const label = past && !cancelled ? "past" : event.status;
    return (_jsxs("div", { className: `relative bg-surface rounded-xl shadow-sm border border-border overflow-hidden flex flex-col hover:shadow-md hover:border-brand-border hover:-translate-y-0.5 transition-all ${past ? "opacity-80 hover:opacity-100" : ""}`, children: [_jsx("div", { className: `absolute top-0 left-0 w-full h-1 ${style.bar}` }), _jsxs("div", { className: "p-6 pt-7 grow", children: [_jsxs("div", { className: "flex justify-between items-start gap-2 mb-4", children: [_jsx("h3", { className: "font-heading text-xl font-bold text-text line-clamp-2", children: event.name }), _jsx("span", { className: `shrink-0 text-xs px-2.5 py-1 rounded-full border uppercase font-semibold ${style.badge}`, children: label })] }), _jsxs("div", { className: "flex flex-col gap-2 mb-4 text-sm text-text-muted", children: [_jsxs("div", { className: "flex items-center gap-2", children: [_jsx(CalendarDays, { className: "w-4 h-4 text-brand shrink-0" }), new Date(event.start_date).toLocaleDateString()] }), event.venue_name && (_jsxs("div", { className: "flex items-center gap-2", children: [_jsx(MapPin, { className: "w-4 h-4 text-brand shrink-0" }), _jsx("span", { className: "truncate", children: event.venue_name })] }))] }), _jsx("p", { className: "text-text-soft text-sm line-clamp-3", children: event.description })] }), _jsx("div", { className: "p-4 bg-surface-muted border-t border-border mt-auto", children: _jsxs(Link, { to: `/events/${event.id}`, className: `flex items-center justify-center gap-2 w-full bg-brand text-text-on-dark py-2 rounded-lg font-medium hover:bg-brand-hover transition-colors ${FOCUS}`, children: ["View Details", _jsx(ArrowRight, { className: "w-4 h-4" })] }) })] }));
}
function Section({ title, events, past, }) {
    return (_jsxs("section", { className: "mb-12", children: [_jsxs("h2", { className: "font-heading text-sm font-semibold text-text-soft uppercase tracking-wide mb-4 flex items-center gap-2", children: [title, _jsx("span", { className: "inline-flex items-center justify-center min-w-6 h-6 px-2 rounded-full bg-brand-soft text-brand-strong text-xs font-medium normal-case tracking-normal", children: events.length })] }), _jsx("div", { className: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6", children: events.map((event) => (_jsx(EventTile, { event: event, past: past }, event.id))) })] }));
}
export default function EventsList() {
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    useEffect(() => {
        async function fetchEvents() {
            try {
                const { data, error: supabaseError } = await supabase
                    .from("events")
                    .select("*")
                    .order("start_date", { ascending: true });
                if (supabaseError)
                    throw supabaseError;
                setEvents(data || []);
            }
            catch (err) {
                console.error("Error fetching events:", err);
                setError(err instanceof Error ? err.message : "Failed to load events.");
            }
            finally {
                setLoading(false);
            }
        }
        fetchEvents();
    }, []);
    const { upcoming, past } = useMemo(() => {
        const up = [];
        const pa = [];
        for (const e of events) {
            if (isPast(e))
                pa.push(e);
            else
                up.push(e);
        }
        up.sort((a, b) => new Date(a.start_date).getTime() - new Date(b.start_date).getTime());
        pa.sort((a, b) => new Date(b.start_date).getTime() - new Date(a.start_date).getTime());
        return { upcoming: up, past: pa };
    }, [events]);
    if (loading)
        return (_jsx("div", { className: "min-h-screen bg-background pt-32 flex justify-center text-text-soft", children: _jsxs("div", { className: "flex items-center gap-2", children: [_jsx(Loader2, { className: "w-4 h-4 animate-spin" }), "Loading events..."] }) }));
    if (error)
        return (_jsx("div", { className: "min-h-screen bg-background pt-32 px-4", children: _jsxs("div", { role: "alert", className: "max-w-md mx-auto flex items-start gap-3 p-4 rounded-lg border border-danger-border bg-danger-bg text-danger text-sm", children: [_jsx(TriangleAlert, { className: "w-4 h-4 mt-0.5 shrink-0" }), _jsx("span", { children: error })] }) }));
    return (_jsx("div", { className: "min-h-screen bg-background", children: _jsxs("div", { className: "max-w-6xl mx-auto px-4 sm:px-6 md:px-10 pt-24 pb-12", children: [_jsxs("div", { className: "mb-8", children: [_jsx("h1", { className: "font-heading text-3xl font-bold text-text tracking-tight", children: "Events" }), _jsx("p", { className: "text-text-soft text-sm mt-1", children: "Browse events and register in seconds." })] }), events.length === 0 && (_jsxs("div", { className: "flex flex-col items-center text-center bg-surface border border-dashed border-border-strong rounded-xl p-12", children: [_jsx("div", { className: "p-3 rounded-lg bg-brand-soft text-brand mb-4", children: _jsx(CalendarDays, { className: "w-8 h-8" }) }), _jsx("h2", { className: "font-heading text-lg font-semibold text-text", children: "No events found" }), _jsx("p", { className: "text-sm text-text-soft mt-1", children: "Check back soon for new events." })] })), upcoming.length > 0 && (_jsx(Section, { title: "Upcoming", events: upcoming, past: false })), events.length > 0 && upcoming.length === 0 && (_jsx("p", { className: "mb-12 text-sm text-text-soft", children: "No upcoming events right now." })), past.length > 0 && (_jsx(Section, { title: "Past events", events: past, past: true }))] }) }));
}

import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
// client/src/pages/EventDetail.tsx
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { MapPin, CalendarDays, Clock, Loader2, CircleCheck, Ban, ExternalLink, } from "lucide-react";
import { supabase } from "../lib/supabase";
import RegistrationForm from "../components/ui/RegistrationForm";
const PILL = "text-xs font-semibold px-2.5 py-1 rounded-full border";
const FOCUS = "outline-none focus-visible:ring-2 focus-visible:ring-focus focus-visible:ring-offset-2 rounded";
const MAP_LINK = `inline-flex items-center gap-1 text-sm text-brand hover:text-brand-hover font-medium mt-1 ${FOCUS}`;
export default function EventDetail() {
    const { id } = useParams();
    const [event, setEvent] = useState(null);
    const [attendeeCount, setAttendeeCount] = useState(0);
    const [scheduleItems, setScheduleItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isRegistered, setIsRegistered] = useState(false);
    useEffect(() => {
        async function fetchEvent() {
            if (!id)
                return;
            const { data: eventData, error: eventError } = await supabase
                .from("events")
                .select("*")
                .eq("id", id)
                .single();
            if (eventError) {
                console.error("Error fetching event:", eventError);
            }
            else {
                setEvent(eventData);
            }
            const { data: count } = await supabase.rpc("attendee_count", { eid: id });
            setAttendeeCount(count ?? 0);
            const { data: scheduleData, error: scheduleError } = await supabase
                .from("schedule_items")
                .select("*")
                .eq("event_id", id)
                .order("start_time", { ascending: true });
            if (scheduleError) {
                console.error("Error fetching schedule:", scheduleError);
            }
            else if (scheduleData) {
                setScheduleItems(scheduleData);
            }
            setLoading(false);
        }
        fetchEvent();
    }, [id]);
    if (loading)
        return (_jsx("div", { className: "min-h-screen bg-background pt-32 flex justify-center text-text-soft", children: _jsxs("div", { className: "flex items-center gap-2", children: [_jsx(Loader2, { className: "w-4 h-4 animate-spin" }), "Loading event details..."] }) }));
    if (!event)
        return (_jsx("div", { className: "min-h-screen bg-background pt-32 text-center text-text-soft", children: "Event not found." }));
    const spotsLeft = event.capacity ? event.capacity - attendeeCount : null;
    const isFull = spotsLeft !== null && spotsLeft <= 0;
    const mapUrl = event.venue_map_url ? String(event.venue_map_url) : null;
    const mapQuery = event.venue_address || event.venue_name;
    return (_jsx("div", { className: "min-h-screen bg-background", children: _jsxs("div", { className: "max-w-5xl mx-auto px-4 sm:px-6 md:px-10 pt-24 pb-12 grid md:grid-cols-2 gap-8 md:gap-12", children: [_jsxs("div", { children: [_jsx("h1", { className: "font-heading text-3xl sm:text-4xl font-bold text-text tracking-tight mb-4", children: event.name }), _jsxs("div", { className: "bg-surface p-4 rounded-xl mb-4 border border-border shadow-sm", children: [_jsxs("div", { className: "flex items-start gap-2", children: [_jsx(MapPin, { className: "w-4 h-4 mt-0.5 text-brand shrink-0" }), _jsxs("div", { children: [_jsx("p", { className: "font-medium text-text", children: event.venue_name }), _jsx("p", { className: "text-sm text-text-soft", children: event.venue_address }), mapUrl && (_jsxs("a", { href: mapUrl, target: "_blank", rel: "noopener noreferrer", className: MAP_LINK, children: ["View on Google Maps", _jsx(ExternalLink, { className: "w-3.5 h-3.5" })] }))] })] }), mapQuery && (_jsx("div", { className: "mt-3 rounded-lg overflow-hidden border border-border", children: _jsx("iframe", { title: "Event location map", width: "100%", height: "220", style: { border: 0 }, loading: "lazy", src: `https://www.google.com/maps?q=${encodeURIComponent(mapQuery)}&output=embed` }) })), _jsx("hr", { className: "my-3 border-border" }), _jsxs("div", { className: "flex items-center gap-2 font-medium text-text", children: [_jsx(CalendarDays, { className: "w-4 h-4 text-brand shrink-0" }), new Date(event.start_date).toLocaleString()] })] }), _jsxs("div", { className: "flex flex-wrap gap-2 mb-6", children: [event.capacity != null && (_jsx("span", { className: `${PILL} ${isFull
                                        ? "bg-danger-bg text-danger border-danger-border"
                                        : "bg-info-bg text-info border-info-border"}`, children: isFull ? "Fully Booked" : `${spotsLeft} spots left` })), event.requires_approval && (_jsx("span", { className: `${PILL} bg-warning-bg text-warning border-warning-border`, children: "Approval Required" })), event.is_paid ? (_jsxs("span", { className: `${PILL} bg-success-bg text-success border-success-border`, children: ["KES ", event.ticket_price] })) : (_jsx("span", { className: `${PILL} bg-surface-strong text-text-muted border-border`, children: "Free" }))] }), _jsx("p", { className: "text-text-muted leading-relaxed whitespace-pre-wrap", children: event.description }), scheduleItems.length > 0 && (_jsxs("div", { className: "mt-8", children: [_jsx("h2", { className: "font-heading text-lg font-bold text-text mb-3", children: "Schedule" }), _jsx("div", { className: "flex flex-col gap-2", children: scheduleItems.map((item) => (_jsxs("div", { className: "border border-border rounded-lg p-3 bg-surface shadow-sm", children: [_jsx("p", { className: "font-medium text-text text-sm", children: item.title }), _jsxs("p", { className: "flex items-center gap-1.5 text-xs text-text-soft mt-1", children: [_jsx(Clock, { className: "w-3.5 h-3.5 shrink-0" }), _jsxs("span", { children: [new Date(item.start_time).toLocaleTimeString([], {
                                                                hour: "2-digit",
                                                                minute: "2-digit",
                                                            }), item.location && ` · ${item.location}`, item.speaker && ` · ${item.speaker}`] })] })] }, item.id))) })] }))] }), _jsx("div", { className: "md:sticky md:top-24 md:self-start", children: isRegistered ? (_jsxs("div", { role: "status", className: "bg-success-bg border border-success-border text-success p-8 rounded-xl text-center shadow-sm", children: [_jsx(CircleCheck, { className: "w-10 h-10 mx-auto mb-3" }), _jsx("h3", { className: "font-heading text-2xl font-bold mb-2", children: event.requires_approval
                                    ? "Request submitted"
                                    : "You're on the list!" }), _jsx("p", { className: "text-sm", children: event.requires_approval
                                    ? "The organizer will review your registration. You'll be notified once approved."
                                    : "You can now interact with our AI Assistant via SMS using the phone number you provided." })] })) : isFull ? (_jsxs("div", { role: "status", className: "bg-danger-bg border border-danger-border text-danger p-8 rounded-xl text-center shadow-sm", children: [_jsx(Ban, { className: "w-10 h-10 mx-auto mb-3" }), _jsx("h3", { className: "font-heading text-xl font-bold mb-2", children: "Event Full" }), _jsx("p", { className: "text-sm", children: "This event has reached its capacity. Registration is closed." })] })) : (_jsx(RegistrationForm, { eventId: event.id, onSuccess: () => setIsRegistered(true) })) })] }) }));
}

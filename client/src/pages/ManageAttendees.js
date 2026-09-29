import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Briefcase, Utensils, Check, Loader2, TriangleAlert, Users, Phone, Mail, } from "lucide-react";
import { supabase } from "../lib/supabase";
const STATUS_STYLES = {
    approved: "bg-success-bg text-success border-success-border",
    pending: "bg-warning-bg text-warning border-warning-border",
    waitlisted: "bg-info-bg text-info border-info-border",
    rejected: "bg-danger-bg text-danger border-danger-border",
};
const PAYMENT_STYLES = {
    paid: "bg-success-bg text-success border-success-border",
    refunded: "bg-info-bg text-info border-info-border",
    unpaid: "bg-surface-muted text-text-muted border-border",
};
const CHIP = "text-xs font-medium px-2.5 py-1 rounded-full";
const SELECT = "h-9 border rounded-lg px-2 text-base sm:text-sm font-medium cursor-pointer transition-colors focus:outline-none focus:ring-2 focus:ring-focus-soft disabled:opacity-60 disabled:cursor-not-allowed";
const TH = "px-4 py-3 font-semibold";
const FOCUS = "outline-none focus-visible:ring-2 focus-visible:ring-focus focus-visible:ring-offset-2";
export default function ManageAttendees() {
    const { id } = useParams();
    const [event, setEvent] = useState(null);
    const [attendees, setAttendees] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [pendingId, setPendingId] = useState(null);
    useEffect(() => {
        async function fetchData() {
            if (!id)
                return;
            const { data: eventData } = await supabase
                .from("events")
                .select("*")
                .eq("id", id)
                .single();
            if (eventData)
                setEvent(eventData);
            const { data: attendeeData } = await supabase
                .from("attendees")
                .select("*")
                .eq("event_id", id)
                .order("registered_at", { ascending: true });
            if (attendeeData)
                setAttendees(attendeeData);
            setLoading(false);
        }
        fetchData();
    }, [id]);
    async function updateAttendee(attendeeId, patch) {
        const previous = attendees.find((a) => a.id === attendeeId);
        if (!previous)
            return;
        setPendingId(attendeeId);
        setError(null);
        setAttendees((prev) => prev.map((a) => (a.id === attendeeId ? { ...a, ...patch } : a)));
        const { error: updateError } = await supabase
            .from("attendees")
            .update(patch)
            .eq("id", attendeeId);
        if (updateError) {
            console.error("Failed to update attendee:", updateError);
            setAttendees((prev) => prev.map((a) => (a.id === attendeeId ? previous : a)));
            setError("Couldn't save that change. Please try again.");
        }
        setPendingId(null);
    }
    if (loading)
        return (_jsx("div", { className: "min-h-screen bg-background pt-32 flex justify-center text-text-soft", children: _jsxs("div", { className: "flex items-center gap-2", children: [_jsx(Loader2, { className: "w-4 h-4 animate-spin" }), "Loading attendees..."] }) }));
    if (!event)
        return (_jsx("div", { className: "min-h-screen bg-background pt-32 px-4", children: _jsxs("div", { role: "alert", className: "max-w-md mx-auto flex items-start gap-3 p-4 rounded-lg border border-danger-border bg-danger-bg text-danger text-sm", children: [_jsx(TriangleAlert, { className: "w-4 h-4 mt-0.5 shrink-0" }), _jsx("span", { children: "Event not found." })] }) }));
    const colCount = event.is_paid ? 6 : 5;
    return (_jsx("div", { className: "min-h-screen bg-background", children: _jsxs("div", { className: "max-w-6xl mx-auto px-4 sm:px-6 pt-24 pb-12", children: [_jsxs("div", { className: "mb-6", children: [_jsxs("h1", { className: "font-heading text-2xl sm:text-3xl font-bold text-text tracking-tight mb-3", children: ["Manage attendees", _jsx("span", { className: "block sm:inline sm:ml-2 text-text-soft font-medium text-lg sm:text-2xl", children: event.name })] }), _jsxs("div", { className: "flex flex-wrap gap-2", children: [_jsxs("span", { className: `${CHIP} bg-surface-strong text-text-muted`, children: ["Capacity: ", event.capacity || "Unlimited"] }), _jsxs("span", { className: `${CHIP} inline-flex items-center gap-1 bg-brand-soft text-brand-strong`, children: [_jsx(Users, { className: "w-3 h-3" }), attendees.length, " registered"] }), event.requires_approval && (_jsx("span", { className: `${CHIP} bg-warning-bg text-warning`, children: "Approval required" })), event.is_paid && (_jsxs("span", { className: `${CHIP} bg-success-bg text-success`, children: ["KES ", event.ticket_price] }))] })] }), error && (_jsxs("div", { role: "alert", className: "mb-4 flex items-start gap-2 p-3 rounded-lg border border-danger-border bg-danger-bg text-danger text-sm", children: [_jsx(TriangleAlert, { className: "w-4 h-4 mt-0.5 shrink-0" }), _jsx("span", { children: error })] })), _jsx("div", { className: "bg-surface rounded-xl shadow-sm border border-border overflow-hidden", children: _jsx("div", { className: "overflow-x-auto", children: _jsxs("table", { className: "w-full min-w-[40rem] text-left text-sm", children: [_jsx("thead", { className: "bg-surface-muted border-b border-border text-text-soft uppercase text-xs tracking-wide", children: _jsxs("tr", { children: [_jsx("th", { scope: "col", className: TH, children: "Attendee" }), _jsx("th", { scope: "col", className: TH, children: "Contact" }), _jsx("th", { scope: "col", className: `${TH} hidden md:table-cell`, children: "Registered" }), _jsx("th", { scope: "col", className: TH, children: "Status" }), event.is_paid && (_jsx("th", { scope: "col", className: TH, children: "Payment" })), _jsx("th", { scope: "col", className: `${TH} text-right`, children: "Actions" })] }) }), _jsxs("tbody", { className: "divide-y divide-border", children: [attendees.map((attendee) => {
                                            const busy = pendingId === attendee.id;
                                            const approved = attendee.status === "approved";
                                            return (_jsxs("tr", { className: "hover:bg-surface-muted transition-colors align-top", children: [_jsxs("td", { className: "px-4 py-3", children: [_jsx("p", { className: "font-medium text-text", children: attendee.full_name }), (attendee.organization || attendee.job_title) && (_jsxs("p", { className: "flex items-center gap-1 text-xs text-text-soft mt-0.5", children: [_jsx(Briefcase, { className: "w-3 h-3 shrink-0" }), [attendee.job_title, attendee.organization]
                                                                        .filter(Boolean)
                                                                        .join(" · ")] })), attendee.dietary_notes && (_jsxs("p", { className: "flex items-start gap-1 text-xs text-warning mt-0.5", children: [_jsx(Utensils, { className: "w-3 h-3 mt-0.5 shrink-0" }), attendee.dietary_notes] }))] }), _jsxs("td", { className: "px-4 py-3 text-text-muted", children: [_jsxs("p", { className: "flex items-center gap-1.5", children: [_jsx(Phone, { className: "w-3 h-3 text-text-soft shrink-0" }), attendee.phone_number] }), attendee.email && (_jsxs("p", { className: "flex items-center gap-1.5 text-xs text-text-soft mt-0.5", children: [_jsx(Mail, { className: "w-3 h-3 shrink-0" }), attendee.email] }))] }), _jsx("td", { className: "px-4 py-3 text-text-muted whitespace-nowrap hidden md:table-cell", children: new Date(attendee.registered_at).toLocaleDateString() }), _jsx("td", { className: "px-4 py-3", children: _jsxs("select", { "aria-label": `Status for ${attendee.full_name}`, value: attendee.status, disabled: busy, onChange: (e) => updateAttendee(attendee.id, {
                                                                status: e.target.value,
                                                            }), className: `${SELECT} ${STATUS_STYLES[attendee.status] ?? STATUS_STYLES.pending}`, children: [_jsx("option", { value: "pending", children: "Pending" }), _jsx("option", { value: "approved", children: "Approved" }), _jsx("option", { value: "waitlisted", children: "Waitlisted" }), _jsx("option", { value: "rejected", children: "Rejected" })] }) }), event.is_paid && (_jsx("td", { className: "px-4 py-3", children: _jsxs("select", { "aria-label": `Payment for ${attendee.full_name}`, value: attendee.payment_status, disabled: busy, onChange: (e) => updateAttendee(attendee.id, {
                                                                payment_status: e.target.value,
                                                            }), className: `${SELECT} ${PAYMENT_STYLES[attendee.payment_status] ?? PAYMENT_STYLES.unpaid}`, children: [_jsx("option", { value: "unpaid", children: "Unpaid" }), _jsx("option", { value: "paid", children: "Paid" }), _jsx("option", { value: "refunded", children: "Refunded" })] }) })), _jsx("td", { className: "px-4 py-3 text-right", children: _jsxs("button", { type: "button", onClick: () => updateAttendee(attendee.id, { status: "approved" }), disabled: approved || busy, className: `inline-flex items-center justify-center gap-1 h-9 px-3 rounded-lg text-sm font-medium text-brand bg-brand-soft hover:bg-surface-alt disabled:opacity-40 disabled:cursor-not-allowed transition-colors ${FOCUS}`, children: [busy ? (_jsx(Loader2, { className: "w-3.5 h-3.5 animate-spin" })) : (_jsx(Check, { className: "w-3.5 h-3.5" })), approved ? "Approved" : "Approve"] }) })] }, attendee.id));
                                        }), attendees.length === 0 && (_jsx("tr", { children: _jsx("td", { colSpan: colCount, className: "px-6 py-12 text-center", children: _jsxs("div", { className: "flex flex-col items-center text-text-soft", children: [_jsx("div", { className: "p-3 rounded-lg bg-brand-soft text-brand mb-3", children: _jsx(Users, { className: "w-6 h-6" }) }), _jsx("p", { className: "font-medium text-text", children: "No attendees yet" }), _jsx("p", { className: "text-sm mt-1", children: "Share the registration link to start collecting sign-ups." })] }) }) }))] })] }) }) })] }) }));
}

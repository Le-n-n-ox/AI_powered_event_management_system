import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Plus, Trash2, Clock, MapPin, User } from "lucide-react";
import { supabase } from "../lib/supabase";
import AddScheduleItemForm from "../components/ui/AddScheduleItemForm";
export default function ManageSchedule() {
    const { id } = useParams();
    const [event, setEvent] = useState(null);
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    async function fetchData() {
        if (!id)
            return;
        setLoading(true);
        const { data: eventData } = await supabase
            .from("events")
            .select("*")
            .eq("id", id)
            .single();
        if (eventData)
            setEvent(eventData);
        const { data: itemData } = await supabase
            .from("schedule_items")
            .select("*")
            .eq("event_id", id)
            .order("start_time", { ascending: true });
        if (itemData)
            setItems(itemData);
        setLoading(false);
    }
    useEffect(() => {
        fetchData();
    }, [id]);
    async function handleDelete(itemId) {
        if (!confirm("Delete this schedule item?"))
            return;
        const { error } = await supabase
            .from("schedule_items")
            .delete()
            .eq("id", itemId);
        if (!error)
            setItems(items.filter((i) => i.id !== itemId));
    }
    if (loading)
        return (_jsx("div", { className: "p-10 text-center text-[var(--color-text-muted)]", children: "Loading schedule\u2026" }));
    if (!event)
        return (_jsx("div", { className: "p-10 text-center text-[var(--color-danger)]", children: "Event not found." }));
    return (_jsxs("div", { className: "max-w-4xl mx-auto p-6", children: [_jsxs("div", { className: "flex items-center justify-between mb-6", children: [_jsxs("div", { children: [_jsxs("h1", { className: "font-heading text-2xl font-bold text-[var(--color-text)]", children: ["Schedule: ", event.name] }), _jsxs("p", { className: "text-sm text-[var(--color-text-muted)]", children: [items.length, " session", items.length !== 1 ? "s" : ""] })] }), _jsxs("button", { onClick: () => setShowForm(true), className: "flex items-center gap-2 px-4 py-2 text-sm font-medium text-[var(--color-text-on-dark)] bg-[var(--color-brand)] rounded-lg hover:bg-[var(--color-brand-hover)]", children: [_jsx(Plus, { className: "w-4 h-4" }), "Add Item"] })] }), items.length === 0 ? (_jsx("div", { className: "text-center p-10 bg-[var(--color-surface)] rounded-lg border border-[var(--color-border)] text-[var(--color-text-muted)]", children: "No schedule items yet. Add one to get started." })) : (_jsx("div", { className: "flex flex-col gap-3", children: items.map((item) => (_jsxs("div", { className: "bg-[var(--color-surface)] rounded-xl border border-[var(--color-border)] p-4 flex items-start justify-between", children: [_jsxs("div", { children: [_jsx("h3", { className: "font-heading font-semibold text-[var(--color-text)]", children: item.title }), _jsxs("div", { className: "flex flex-wrap gap-4 mt-2 text-sm text-[var(--color-text-muted)]", children: [_jsxs("span", { className: "flex items-center gap-1", children: [_jsx(Clock, { className: "w-4 h-4" }), new Date(item.start_time).toLocaleTimeString([], {
                                                    hour: "2-digit",
                                                    minute: "2-digit",
                                                }), " ", "\u2013", " ", new Date(item.end_time).toLocaleTimeString([], {
                                                    hour: "2-digit",
                                                    minute: "2-digit",
                                                })] }), item.location && (_jsxs("span", { className: "flex items-center gap-1", children: [_jsx(MapPin, { className: "w-4 h-4" }), item.location] })), item.speaker && (_jsxs("span", { className: "flex items-center gap-1", children: [_jsx(User, { className: "w-4 h-4" }), item.speaker] }))] })] }), _jsx("button", { onClick: () => handleDelete(item.id), className: "text-[var(--color-text-soft)] hover:text-[var(--color-danger)] transition-colors", children: _jsx(Trash2, { className: "w-4 h-4" }) })] }, item.id))) })), showForm && (_jsx(AddScheduleItemForm, { eventId: event.id, onItemAdded: fetchData, onClose: () => setShowForm(false) }))] }));
}

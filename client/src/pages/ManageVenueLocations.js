import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Plus, Trash2, MapPin } from "lucide-react";
import { supabase } from "../lib/supabase";
import AddVenueLocationForm from "../components/ui/AddVenueLocationForm";
export default function ManageVenueLocations() {
    const { id } = useParams();
    const [event, setEvent] = useState(null);
    const [locations, setLocations] = useState([]);
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
        const { data: locationData } = await supabase
            .from("venue_locations")
            .select("*")
            .eq("event_id", id)
            .order("created_at", { ascending: true });
        if (locationData)
            setLocations(locationData);
        setLoading(false);
    }
    useEffect(() => {
        fetchData();
    }, [id]);
    async function handleDelete(locationId) {
        if (!confirm("Delete this location?"))
            return;
        const { error } = await supabase
            .from("venue_locations")
            .delete()
            .eq("id", locationId);
        if (!error)
            setLocations(locations.filter((l) => l.id !== locationId));
    }
    if (loading)
        return (_jsx("div", { className: "p-10 text-center text-[var(--color-text-muted)]", children: "Loading locations\u2026" }));
    if (!event)
        return (_jsx("div", { className: "p-10 text-center text-[var(--color-danger)]", children: "Event not found." }));
    return (_jsxs("div", { className: "max-w-4xl mx-auto p-6", children: [_jsxs("div", { className: "flex items-center justify-between mb-6", children: [_jsxs("div", { children: [_jsxs("h1", { className: "font-heading text-2xl font-bold text-[var(--color-text)]", children: ["Venue Locations: ", event.name] }), _jsxs("p", { className: "text-sm text-[var(--color-text-muted)]", children: [locations.length, " location", locations.length !== 1 ? "s" : "", " \u2014 used by the AI assistant to answer attendee questions"] })] }), _jsxs("button", { onClick: () => setShowForm(true), className: "flex items-center gap-2 px-4 py-2 text-sm font-medium text-[var(--color-text-on-dark)] bg-[var(--color-brand)] rounded-lg hover:bg-[var(--color-brand-hover)]", children: [_jsx(Plus, { className: "w-4 h-4" }), "Add Location"] })] }), locations.length === 0 ? (_jsx("div", { className: "text-center p-10 bg-[var(--color-surface)] rounded-lg border border-[var(--color-border)] text-[var(--color-text-muted)]", children: "No locations yet. Add washrooms, halls, registration desks, etc." })) : (_jsx("div", { className: "flex flex-col gap-3", children: locations.map((loc) => (_jsxs("div", { className: "bg-[var(--color-surface)] rounded-xl border border-[var(--color-border)] p-4 flex items-start justify-between", children: [_jsxs("div", { className: "flex items-start gap-3", children: [_jsx(MapPin, { className: "w-5 h-5 text-[var(--color-brand)] mt-0.5" }), _jsxs("div", { children: [_jsx("h3", { className: "font-heading font-semibold text-[var(--color-text)]", children: loc.label }), loc.description && (_jsx("p", { className: "text-sm text-[var(--color-text-muted)] mt-1", children: loc.description }))] })] }), _jsx("button", { onClick: () => handleDelete(loc.id), className: "text-[var(--color-text-soft)] hover:text-[var(--color-danger)] transition-colors", children: _jsx(Trash2, { className: "w-4 h-4" }) })] }, loc.id))) })), showForm && (_jsx(AddVenueLocationForm, { eventId: event.id, onLocationAdded: fetchData, onClose: () => setShowForm(false) }))] }));
}

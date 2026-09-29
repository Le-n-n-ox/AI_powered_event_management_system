import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from "react";
import { motion } from "framer-motion";
import { supabase } from "../../lib/supabase";
function AddVenueLocationForm({ eventId, onLocationAdded, onClose, }) {
    const [label, setLabel] = useState("");
    const [description, setDescription] = useState("");
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState(null);
    async function handleSubmit(e) {
        e.preventDefault();
        setSubmitting(true);
        setError(null);
        const { error } = await supabase.from("venue_locations").insert({
            event_id: eventId,
            label,
            description: description || null,
        });
        setSubmitting(false);
        if (error) {
            setError(error.message);
            return;
        }
        onLocationAdded();
        onClose();
    }
    return (_jsx(motion.div, { initial: { opacity: 0, y: 10 }, animate: { opacity: 1, y: 0 }, transition: { duration: 0.25 }, className: "fixed inset-0 bg-[var(--color-overlay)] flex items-center justify-center p-4 z-50", children: _jsxs("div", { className: "bg-[var(--color-surface)] rounded-xl shadow-lg w-full max-w-md p-6", children: [_jsx("h2", { className: "font-heading text-xl font-bold text-[var(--color-text)] mb-4", children: "Add Venue Location" }), _jsxs("form", { onSubmit: handleSubmit, className: "flex flex-col gap-3", children: [_jsx("input", { type: "text", placeholder: "Label (e.g. Washroom - 2nd Floor)", value: label, onChange: (e) => setLabel(e.target.value), required: true, className: "border border-[var(--color-border)] rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-focus)]" }), _jsx("textarea", { placeholder: "Directions (e.g. Near the elevator, left of Hall B)", value: description, onChange: (e) => setDescription(e.target.value), rows: 2, className: "border border-[var(--color-border)] rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-focus)]" }), error && (_jsx("p", { className: "text-sm text-[var(--color-danger)]", children: error })), _jsxs("div", { className: "flex justify-end gap-2 mt-2", children: [_jsx("button", { type: "button", onClick: onClose, className: "px-4 py-2 text-sm text-[var(--color-text-muted)] hover:text-[var(--color-text)]", children: "Cancel" }), _jsx("button", { type: "submit", disabled: submitting, className: "px-4 py-2 text-sm font-medium text-[var(--color-text-on-dark)] bg-[var(--color-brand)] rounded-lg hover:bg-[var(--color-brand-hover)] disabled:opacity-50", children: submitting ? "Adding…" : "Add Location" })] })] })] }) }));
}
export default AddVenueLocationForm;

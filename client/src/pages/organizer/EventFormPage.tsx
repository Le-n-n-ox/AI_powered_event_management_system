import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import { supabase } from "../../lib/supabase";
import { useAuth } from "../../context/AuthContext";
import type { Event } from "../../types/event";

// Import our new sub-components
import BasicInfoSection from "../../components/events/form/BasicInfoSection";
import VenueSection from "../../components/events/form/VenueSection";
import DateTimeSection from "../../components/events/form/DateTimeSection";
import RegistrationSection from "../../components/events/form/RegistrationSection";
import AiAutofill from "../../components/events/form/AiAutofill";

const inputCls =
  "border border-[var(--color-border)] rounded-lg px-3 py-2 text-sm text-[var(--color-text)] bg-[var(--color-surface)] focus:outline-none focus:border-[var(--color-focus)] focus:ring-1 focus:ring-[var(--color-focus-soft)] transition-colors";

function toLocalInput(iso?: string | null) {
  if (!iso) return "";
  const d = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export default function EventFormPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // If we navigated here with state (e.g., navigate('/edit-event', { state: { event: myEvent } })), use it.
  const event = location.state?.event as Event | null;
  const isEdit = !!event;

  // Grouped state is much cleaner than 15 separate useStates
  const [formData, setFormData] = useState({
    name: event?.name ?? "",
    description: event?.description ?? "",
    status: event?.status ?? "upcoming",
    venueName: event?.venue_name ?? "",
    venueAddress: event?.venue_address ?? "",
    venueMapUrl: event?.venue_map_url ?? "",
    startDate: toLocalInput(event?.start_date),
    endDate: toLocalInput(event?.end_date),
    registrationDeadline: toLocalInput(event?.registration_deadline),
    capacity: event?.capacity ? String(event.capacity) : "",
    requiresApproval: event?.requires_approval ?? false,
    isPaid: event?.is_paid ?? false,
    ticketPrice: event?.ticket_price ? String(event.ticket_price) : "",
  });

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const updateData = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleAiExtraction = (extractedData: any) => {
    // Merge the AI's data with the existing form data
    setFormData((prev) => ({
      ...prev,
      ...extractedData,
    }));
  };

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (new Date(formData.endDate) <= new Date(formData.startDate)) {
      return setError("End time must be after the start time.");
    }
    if (
      formData.registrationDeadline &&
      new Date(formData.registrationDeadline) > new Date(formData.startDate)
    ) {
      return setError("Registration deadline must be before the event starts.");
    }

    setSubmitting(true);

    const payload = {
      name: formData.name,
      description: formData.description || null,
      venue_name: formData.venueName || null,
      venue_address: formData.venueAddress || null,
      venue_map_url: formData.venueMapUrl || null,
      start_date: new Date(formData.startDate).toISOString(),
      end_date: new Date(formData.endDate).toISOString(),
      registration_deadline: formData.registrationDeadline
        ? new Date(formData.registrationDeadline).toISOString()
        : null,
      capacity: formData.capacity ? parseInt(formData.capacity, 10) : null,
      requires_approval: formData.requiresApproval,
      is_paid: formData.isPaid,
      ticket_price:
        formData.isPaid && formData.ticketPrice
          ? parseFloat(formData.ticketPrice)
          : null,
    };

    const { error: dbError } = isEdit
      ? await supabase
          .from("events")
          .update({ ...payload, status: formData.status })
          .eq("id", event!.id)
      : await supabase
          .from("events")
          .insert({ ...payload, status: "upcoming", organizer_id: user?.id });

    setSubmitting(false);

    if (dbError) {
      setError(dbError.message);
      return;
    }

    // Go back to the dashboard/events list after saving
    navigate("/organizer/dashboard");
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="min-h-screen bg-[var(--color-background)] py-8 px-4 sm:px-6 lg:px-8"
    >
      <div className="max-w-3xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-[var(--color-text)]">
            {isEdit ? "Edit Event" : "Create New Event"}
          </h1>
          <p className="text-[var(--color-text-muted)] mt-1">
            Fill in the details below to publish your event.
          </p>
        </div>

        {/* --- 🌟 THE AI COMPONENT --- */}
        {!isEdit && <AiAutofill onDataExtracted={handleAiExtraction} />}

        <form onSubmit={handleSubmit} className="space-y-6">
          <BasicInfoSection
            data={formData}
            updateData={updateData}
            isEdit={isEdit}
            inputCls={inputCls}
          />
          <DateTimeSection
            data={formData}
            updateData={updateData}
            inputCls={inputCls}
          />
          <VenueSection
            data={formData}
            updateData={updateData}
            inputCls={inputCls}
          />
          <RegistrationSection
            data={formData}
            updateData={updateData}
            inputCls={inputCls}
          />

          {error && (
            <div className="bg-[var(--color-danger-bg)] text-[var(--color-danger)] p-4 rounded-lg border border-[var(--color-danger-border)] text-sm">
              {error}
            </div>
          )}

          <div className="flex justify-end gap-3 pt-4 border-t border-[var(--color-border)]">
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="px-5 py-2.5 text-sm font-medium text-[var(--color-text-muted)] bg-[var(--color-surface)] border border-[var(--color-border)] rounded-lg hover:bg-[var(--color-surface-muted)]"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-5 py-2.5 text-sm font-medium text-[var(--color-text-on-dark)] bg-[var(--color-brand)] rounded-lg hover:bg-[var(--color-brand-hover)] disabled:opacity-50 flex items-center gap-2"
            >
              {submitting
                ? "Saving..."
                : isEdit
                  ? "Save Changes"
                  : "Create Event"}
            </button>
          </div>
        </form>
      </div>
    </motion.div>
  );
}

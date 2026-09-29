import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import { Trash2 } from "lucide-react";
import { supabase } from "../../lib/supabase";
import { useAuth } from "../../context/AuthContext";
import type { Event } from "../../types/event";
import { Button } from "../../components/ui/button";
import BackButton from "../../components/layout/BackButton";

// Import our sub-components
import BasicInfoSection from "../../components/events/form/BasicInfoSection";
import VenueSection from "../../components/events/form/VenueSection";
import DateTimeSection from "../../components/events/form/DateTimeSection";
import RegistrationSection from "../../components/events/form/RegistrationSection";
import AiAutofill from "../../components/events/form/AiAutofill";
import KnowledgeSection from "../../components/events/form/KnowledgeSection";
import React from "react";

// Premium Input Styling:
// 1. bg-surface-muted/50 and shadow-inner make it look carved into the page.
// 2. focus:bg-surface makes it "pop out" when the user types.
// 3. focus:ring-brand/30 adds a premium, glowing halo effect.
const inputCls =
  "w-full border border-border/60 rounded-xl px-3.5 py-2.5 text-sm text-text bg-surface-muted/50 shadow-[inset_0_2px_4px_rgba(0,0,0,0.2)] focus:outline-none focus:border-brand/80 focus:ring-4 focus:ring-brand/20 focus:bg-surface transition-all duration-200 placeholder:text-text-soft/50";

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

  const event = location.state?.event as Event | null;
  const isEdit = !!event;

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
    // Full text of uploaded documents, so the SMS assistant can answer from them
    knowledgeText: event?.knowledge_text ?? "",
  });

  const [submitting, setSubmitting] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const updateData = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleAiExtraction = (extractedData: any) => {
    const cleaned = Object.fromEntries(
      Object.entries(extractedData ?? {}).map(([key, value]) => [
        key,
        value ?? "",
      ]),
    );

    setFormData((prev) => ({
      ...prev,
      ...cleaned,
      isPaid:
        typeof extractedData?.isPaid === "boolean"
          ? extractedData.isPaid
          : prev.isPaid,
      // Append extracted document text instead of overwriting what the organizer typed
      knowledgeText: extractedData?.knowledgeText
        ? [prev.knowledgeText, extractedData.knowledgeText]
            .filter(Boolean)
            .join("\n\n")
        : prev.knowledgeText,
    }));
  };

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    // Backdating guard
    if (!isEdit && new Date(formData.startDate) < new Date()) {
      return setError("Event start date cannot be in the past.");
    }
    if (new Date(formData.endDate) <= new Date(formData.startDate)) {
      return setError("End time must be after the start time.");
    }
    if (
      formData.registrationDeadline &&
      !isEdit &&
      new Date(formData.registrationDeadline) < new Date()
    ) {
      return setError("Registration deadline cannot be in the past.");
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
      knowledge_text: formData.knowledgeText || null,
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

    if (isEdit) {
      try {
        const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:3000";
        await fetch(`${apiUrl}/api/broadcast-update`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            eventId: event!.id,
            eventName: formData.name,
            updateType: "event details (venue/dates)",
            changeDetails: `Venue is now ${formData.venueName}. Dates: ${formData.startDate} to ${formData.endDate}.`,
          }),
        });
      } catch (err) {
        console.error("Broadcast trigger failed:", err);
      }
    }

    navigate("/dashboard");
  }

  async function handleDelete() {
    if (!event) return;
    if (
      !confirm(
        `Delete "${event.name}"? This will also remove its attendees, schedule, and venue locations. This cannot be undone.`,
      )
    ) {
      return;
    }

    setDeleting(true);
    setError(null);

    const { error: dbError } = await supabase
      .from("events")
      .delete()
      .eq("id", event.id);

    setDeleting(false);

    if (dbError) {
      setError(dbError.message);
      return;
    }

    navigate("/dashboard");
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className="min-h-screen bg-transparent py-8 px-4 sm:px-6 lg:px-8"
    >
      <div className="max-w-3xl mx-auto">
        <div className="mb-10 flex items-start justify-between gap-4">
          <div>
            <BackButton
              fallbackTo="/dashboard"
              label="Back to dashboard"
              className="mb-5"
            />
            {/* Added a subtle gradient to the text for a premium header feel */}
            <h1 className="text-3xl font-bold font-heading bg-linear-to-br from-text to-text-soft bg-clip-text text-transparent">
              {isEdit ? "Edit Event" : "Create New Event"}
            </h1>
            <p className="text-text-soft mt-1.5 text-sm">
              Fill in the details below to publish your event to attendees.
            </p>
          </div>
          {isEdit && (
            <Button
              type="button"
              onClick={handleDelete}
              disabled={deleting}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-danger bg-danger-bg/40 border border-danger-border/60 rounded-xl hover:bg-danger-bg transition-colors disabled:opacity-50 shrink-0 shadow-sm"
            >
              <Trash2 className="w-4 h-4" />
              {deleting ? "Deleting…" : "Delete Event"}
            </Button>
          )}
        </div>

        {!isEdit && <AiAutofill onDataExtracted={handleAiExtraction} />}

        {/* Added a slight fade-in delay for the form itself */}
        <motion.form 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1, duration: 0.4 }}
          onSubmit={handleSubmit} 
          className="space-y-6"
        >
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
            isEdit={isEdit}
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
            isEdit={isEdit}
          />
          <KnowledgeSection
            data={formData}
            updateData={updateData}
            inputCls={inputCls}
          />

          {error && (
            <div className="bg-danger-bg/80 text-danger p-4 rounded-xl border border-danger-border shadow-sm text-sm flex items-center gap-2">
              <span className="font-semibold">Error:</span> {error}
            </div>
          )}

          {/* Polished Bottom Action Bar */}
          <div className="flex justify-end gap-3 pt-6 mt-8 border-t border-border/50">
            <Button
              type="button"
              onClick={() => navigate(-1)}
              className="px-6 py-2.5 text-sm font-medium text-text-muted bg-surface border border-border/60 rounded-xl hover:bg-surface-alt hover:text-text transition-all duration-200"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={submitting}
              className="px-6 py-2.5 text-sm font-medium text-white bg-brand rounded-xl hover:bg-brand-hover hover:-translate-y-0.5 disabled:opacity-50 disabled:hover:translate-y-0 flex items-center gap-2 shadow-[0_0_20px_rgba(59,92,212,0.3)] transition-all duration-200"
            >
              {submitting
                ? "Saving..."
                : isEdit
                  ? "Save Changes"
                  : "Create Event"}
            </Button>
          </div>
        </motion.form>
      </div>
    </motion.div>
  );
}
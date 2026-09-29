import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import { supabase } from "../../lib/supabase";
import { useAuth } from "../../context/AuthContext";
import type { Event } from "../../types/event";
import { Button } from "../../components/ui/button";

// Import our sub-components
import BasicInfoSection from "../../components/events/form/BasicInfoSection";
import VenueSection from "../../components/events/form/VenueSection";
import DateTimeSection from "../../components/events/form/DateTimeSection";
import RegistrationSection from "../../components/events/form/RegistrationSection";
import AiAutofill from "../../components/events/form/AiAutofill";
import KnowledgeSection from "../../components/events/form/KnowledgeSection";

const inputCls =
  "border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-900 bg-white focus:outline-none focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600/20 transition-colors";

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
  const [error, setError] = useState<string | null>(null);

  const updateData = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleAiExtraction = (extractedData: any) => {
    setFormData((prev) => ({
      ...prev,
      ...extractedData,
      // Append extracted document text instead of overwriting what the organizer typed
      knowledgeText: extractedData?.knowledgeText
        ? [prev.knowledgeText, extractedData.knowledgeText].filter(Boolean).join("\n\n")
        : prev.knowledgeText,
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
      ticket_price: formData.isPaid && formData.ticketPrice ? parseFloat(formData.ticketPrice) : null,
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

    navigate("/organizer/dashboard");
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="min-h-screen bg-slate-50 py-8 px-4 sm:px-6 lg:px-8"
    >
      <div className="max-w-3xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900">
            {isEdit ? "Edit Event" : "Create New Event"}
          </h1>
          <p className="text-slate-500 mt-1">
            Fill in the details below to publish your event.
          </p>
        </div>

        {!isEdit && <AiAutofill onDataExtracted={handleAiExtraction} />}

        <form onSubmit={handleSubmit} className="space-y-6">
          <BasicInfoSection data={formData} updateData={updateData} isEdit={isEdit} inputCls={inputCls} />
          <DateTimeSection data={formData} updateData={updateData} inputCls={inputCls} />
          <VenueSection data={formData} updateData={updateData} inputCls={inputCls} />
          <RegistrationSection data={formData} updateData={updateData} inputCls={inputCls} />
          <KnowledgeSection data={formData} updateData={updateData} inputCls={inputCls} />

          {error && (
            <div className="bg-red-50 text-red-600 p-4 rounded-lg border border-red-200 text-sm">
              {error}
            </div>
          )}

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-200">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate(-1)}
              className="px-5 py-2.5 text-sm font-medium text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={submitting}
              className="px-5 py-2.5 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 disabled:opacity-50 flex items-center gap-2 shadow-sm"
            >
              {submitting
                ? "Saving..."
                : isEdit
                  ? "Save Changes"
                  : "Create Event"}
            </Button>
          </div>
        </form>
      </div>
    </motion.div>
  );
}
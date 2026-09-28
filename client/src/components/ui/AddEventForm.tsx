import { useState } from "react";
import { motion } from "framer-motion";
import { supabase } from "../../lib/supabase";
import { useAuth } from "../../context/AuthContext";
import type { Event } from "../../types/event";

interface EventFormProps {
  event?: Event | null; // present = edit mode
  onSaved: () => void;
  onClose: () => void;
}

function toLocalInput(iso?: string | null) {
  if (!iso) return "";
  const d = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

const inputCls =
  "border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500";

function AddEventForm({ event, onSaved, onClose }: EventFormProps) {
  const { user } = useAuth();
  const isEdit = !!event;

  const [name, setName] = useState(event?.name ?? "");
  const [description, setDescription] = useState(event?.description ?? "");
  const [venueName, setVenueName] = useState(event?.venue_name ?? "");
  const [venueAddress, setVenueAddress] = useState(event?.venue_address ?? "");
  const [venueMapUrl, setVenueMapUrl] = useState(event?.venue_map_url ?? "");
  const [startDate, setStartDate] = useState(toLocalInput(event?.start_date));
  const [endDate, setEndDate] = useState(toLocalInput(event?.end_date));
  const [registrationDeadline, setRegistrationDeadline] = useState(
    toLocalInput(event?.registration_deadline)
  );
  const [capacity, setCapacity] = useState(event?.capacity ? String(event.capacity) : "");
  const [requiresApproval, setRequiresApproval] = useState(event?.requires_approval ?? false);
  const [isPaid, setIsPaid] = useState(event?.is_paid ?? false);
  const [ticketPrice, setTicketPrice] = useState(
    event?.ticket_price ? String(event.ticket_price) : ""
  );
  const [status, setStatus] = useState<Event["status"]>(event?.status ?? "upcoming");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (new Date(endDate) <= new Date(startDate)) {
      setError("End time must be after the start time.");
      return;
    }
    if (registrationDeadline && new Date(registrationDeadline) > new Date(startDate)) {
      setError("Registration deadline must be before the event starts.");
      return;
    }

    setSubmitting(true);

    const payload = {
      name,
      description: description || null,
      venue_name: venueName || null,
      venue_address: venueAddress || null,
      venue_map_url: venueMapUrl || null,
      start_date: new Date(startDate).toISOString(),
      end_date: new Date(endDate).toISOString(),
      registration_deadline: registrationDeadline
        ? new Date(registrationDeadline).toISOString()
        : null,
      capacity: capacity ? parseInt(capacity, 10) : null,
      requires_approval: requiresApproval,
      is_paid: isPaid,
      ticket_price: isPaid && ticketPrice ? parseFloat(ticketPrice) : null,
    };

    const { error } = isEdit
      ? await supabase.from("events").update({ ...payload, status }).eq("id", event!.id)
      : await supabase
          .from("events")
          .insert({ ...payload, status: "upcoming", organizer_id: user?.id });

    setSubmitting(false);

    if (error) {
      setError(error.message);
      return;
    }

    onSaved();
    onClose();
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
      className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-50 overflow-y-auto"
    >
      <div className="bg-white rounded-xl shadow-lg w-full max-w-md p-6 my-8">
        <h2 className="font-heading text-xl font-bold text-gray-900 mb-4">
          {isEdit ? "Edit Event" : "New Event"}
        </h2>

        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          <input
            type="text"
            placeholder="Event name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            className={inputCls}
          />
          <textarea
            placeholder="What is this event about?"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
            className={inputCls}
          />

          {isEdit && (
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">
                Status
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as Event["status"])}
                className={`w-full bg-white ${inputCls}`}
              >
                <option value="upcoming">Upcoming</option>
                <option value="ongoing">Ongoing</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
          )}

          <div className="border-t border-gray-100 pt-3 mt-1">
            <p className="text-xs font-semibold text-gray-500 uppercase mb-2">Venue</p>
            <input
              type="text"
              placeholder="Venue name"
              value={venueName}
              onChange={(e) => setVenueName(e.target.value)}
              className={`w-full mb-2 ${inputCls}`}
            />
            <input
              type="text"
              placeholder="Full address"
              value={venueAddress}
              onChange={(e) => setVenueAddress(e.target.value)}
              className={`w-full mb-2 ${inputCls}`}
            />
            <input
              type="url"
              placeholder="Google Maps link (optional)"
              value={venueMapUrl}
              onChange={(e) => setVenueMapUrl(e.target.value)}
              className={`w-full ${inputCls}`}
            />
          </div>

          <div className="border-t border-gray-100 pt-3 mt-1">
            <p className="text-xs font-semibold text-gray-500 uppercase mb-2">Date & Time</p>
            <div className="flex gap-3">
              <input
                type="datetime-local"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                required
                className={`flex-1 ${inputCls}`}
              />
              <input
                type="datetime-local"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                required
                className={`flex-1 ${inputCls}`}
              />
            </div>
          </div>

          <div className="border-t border-gray-100 pt-3 mt-1">
            <p className="text-xs font-semibold text-gray-500 uppercase mb-2">Registration</p>
            <label className="block text-xs text-gray-500 mb-1">
              Registration deadline (optional)
            </label>
            <input
              type="datetime-local"
              value={registrationDeadline}
              onChange={(e) => setRegistrationDeadline(e.target.value)}
              className={`w-full mb-2 ${inputCls}`}
            />
            <input
              type="number"
              placeholder="Capacity (leave blank for unlimited)"
              value={capacity}
              onChange={(e) => setCapacity(e.target.value)}
              min="1"
              className={`w-full mb-2 ${inputCls}`}
            />
            <label className="flex items-center gap-2 text-sm text-gray-700 mb-2">
              <input
                type="checkbox"
                checked={requiresApproval}
                onChange={(e) => setRequiresApproval(e.target.checked)}
                className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
              />
              Require organizer approval to register
            </label>
            <label className="flex items-center gap-2 text-sm text-gray-700">
              <input
                type="checkbox"
                checked={isPaid}
                onChange={(e) => setIsPaid(e.target.checked)}
                className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
              />
              This is a paid event
            </label>
            {isPaid && (
              <input
                type="number"
                placeholder="Ticket price (KES)"
                value={ticketPrice}
                onChange={(e) => setTicketPrice(e.target.value)}
                min="0"
                step="0.01"
                className={`w-full mt-2 ${inputCls}`}
              />
            )}
          </div>

          {error && <p className="text-sm text-red-600">{error}</p>}

          <div className="flex justify-end gap-2 mt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm text-gray-600 hover:text-gray-900"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 disabled:opacity-50"
            >
              {submitting ? "Saving…" : isEdit ? "Save Changes" : "Create Event"}
            </button>
          </div>
        </form>
      </div>
    </motion.div>
  );
}

export default AddEventForm;
import { useState } from "react";
import { motion } from "framer-motion";
import { supabase } from "../../lib/supabase";

interface AddScheduleItemFormProps {
  eventId: string;
  onItemAdded: () => void;
  onClose: () => void;
}

function AddScheduleItemForm({
  eventId,
  onItemAdded,
  onClose,
}: AddScheduleItemFormProps) {
  const [title, setTitle] = useState("");
  const [speaker, setSpeaker] = useState("");
  const [location, setLocation] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    const { error } = await supabase.from("schedule_items").insert({
      event_id: eventId,
      title,
      speaker: speaker || null,
      location: location || null,
      start_time: startTime,
      end_time: endTime,
    });

    setSubmitting(false);

    if (error) {
      setError(error.message);
      return;
    }

    onItemAdded();
    onClose();
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
      className="fixed inset-0 bg-[var(--color-overlay)] flex items-center justify-center p-4 z-50"
    >
      <div className="bg-[var(--color-surface)] rounded-xl shadow-lg w-full max-w-md p-6">
        <h2 className="font-heading text-xl font-bold text-[var(--color-text)] mb-4">
          Add Schedule Item
        </h2>

        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          <input
            type="text"
            placeholder="Session title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            className="border border-[var(--color-border)] rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-focus)]"
          />
          <input
            type="text"
            placeholder="Speaker (optional)"
            value={speaker}
            onChange={(e) => setSpeaker(e.target.value)}
            className="border border-[var(--color-border)] rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-focus)]"
          />
          <input
            type="text"
            placeholder="Location (e.g. Hall B)"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            className="border border-[var(--color-border)] rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-focus)]"
          />
          <div className="flex gap-3">
            <input
              type="datetime-local"
              value={startTime}
              onChange={(e) => setStartTime(e.target.value)}
              required
              className="flex-1 border border-[var(--color-border)] rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-focus)]"
            />
            <input
              type="datetime-local"
              value={endTime}
              onChange={(e) => setEndTime(e.target.value)}
              required
              className="flex-1 border border-[var(--color-border)] rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-focus)]"
            />
          </div>

          {error && (
            <p className="text-sm text-[var(--color-danger)]">{error}</p>
          )}

          <div className="flex justify-end gap-2 mt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm text-[var(--color-text-muted)] hover:text-[var(--color-text)]"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-4 py-2 text-sm font-medium text-[var(--color-text-on-dark)] bg-[var(--color-brand)] rounded-lg hover:bg-[var(--color-brand-hover)] disabled:opacity-50"
            >
              {submitting ? "Adding…" : "Add Item"}
            </button>
          </div>
        </form>
      </div>
    </motion.div>
  );
}

export default AddScheduleItemForm;

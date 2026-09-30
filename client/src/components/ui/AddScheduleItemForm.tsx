import { useEffect, useId, useState } from "react";
import { motion } from "framer-motion";
import { Info, Loader2, TriangleAlert, X } from "lucide-react";
import { supabase } from "../../lib/supabase";
import {
  toDatetimeLocal,
  validateSessionTimes,
} from "../../utils/scheduleWindow";

interface AddScheduleItemFormProps {
  eventId: string;
  eventStart: string;
  eventEnd: string;
  onItemAdded: () => void;
  onClose: () => void;
}

const FMT: Intl.DateTimeFormatOptions = {
  dateStyle: "medium",
  timeStyle: "short",
};

// text-base on mobile prevents iOS Safari zooming into the field on focus
const INPUT =
  "block w-full h-11 border border-border rounded-xl px-3 bg-surface-muted text-base sm:text-sm text-text placeholder:text-text-soft shadow-sm transition-all duration-200 hover:border-brand-border hover:bg-surface focus:bg-surface focus:outline-none focus:border-brand focus:ring-4 focus:ring-brand-soft disabled:opacity-60 disabled:cursor-not-allowed";

const LABEL = "block text-sm font-medium text-text-muted mb-1";

function AddScheduleItemForm({
  eventId,
  eventStart,
  eventEnd,
  onItemAdded,
  onClose,
}: AddScheduleItemFormProps) {
  const titleId = useId();
  const speakerId = useId();
  const locationId = useId();
  const startId = useId();
  const endId = useId();
  const headingId = useId();

  const [title, setTitle] = useState("");
  const [speaker, setSpeaker] = useState("");
  const [location, setLocation] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const minTime = toDatetimeLocal(eventStart);
  const maxTime = toDatetimeLocal(eventEnd);

  // Close on Escape
  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape" && !submitting) onClose();
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [onClose, submitting]);

  function handleStartChange(value: string) {
    setStartTime(value);
    setError(null);
    // Clear an end time that is no longer after the new start
    if (value && endTime && new Date(endTime).getTime() <= new Date(value).getTime()) {
      setEndTime("");
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (submitting) return;
    setError(null);

    const timeError = validateSessionTimes(
      startTime,
      endTime,
      eventStart,
      eventEnd,
    );
    if (timeError) {
      setError(timeError);
      return;
    }

    setSubmitting(true);

    const { error } = await supabase.from("schedule_items").insert({
      event_id: eventId,
      title: title.trim(),
      speaker: speaker.trim() || null,
      location: location.trim() || null,
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
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.2 }}
      className="fixed inset-0 bg-overlay backdrop-blur-sm flex items-center justify-center p-4 z-50"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget && !submitting) onClose();
      }}
    >
      <motion.div
        role="dialog"
        aria-modal="true"
        aria-labelledby={headingId}
        initial={{ opacity: 0, y: 16, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ type: "spring", stiffness: 300, damping: 26 }}
        className="relative overflow-hidden bg-surface rounded-xl shadow-2xl shadow-shadow-soft border border-border w-full max-w-md p-6 pt-7 max-h-[90vh] overflow-y-auto"
      >
        <div className="absolute top-0 left-0 w-full h-1.5 bg-linear-to-r from-brand via-tag-violet to-tag-teal" />

        <div className="flex items-start justify-between gap-3 mb-4">
          <h2
            id={headingId}
            className="font-heading text-xl font-bold text-text"
          >
            Add Schedule Item
          </h2>
          <button
            type="button"
            onClick={onClose}
            disabled={submitting}
            aria-label="Close"
            className="p-1.5 -mr-1.5 -mt-1 rounded-lg text-text-soft transition-all duration-200 hover:text-text hover:bg-surface-strong active:scale-95 outline-none focus-visible:ring-2 focus-visible:ring-focus"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex items-start gap-2 mb-4 p-3 rounded-lg border border-info-border bg-info-bg text-info text-xs">
          <Info className="w-4 h-4 mt-0.5 shrink-0" />
          <span>
            Sessions must fall between{" "}
            <strong>{new Date(eventStart).toLocaleString([], FMT)}</strong> and{" "}
            <strong>{new Date(eventEnd).toLocaleString([], FMT)}</strong>.
          </span>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label htmlFor={titleId} className={LABEL}>
              Session title
            </label>
            <input
              id={titleId}
              type="text"
              placeholder="e.g. Opening keynote"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              autoFocus
              disabled={submitting}
              className={INPUT}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor={speakerId} className={LABEL}>
                Speaker <span className="text-text-soft">(optional)</span>
              </label>
              <input
                id={speakerId}
                type="text"
                placeholder="Jane Doe"
                value={speaker}
                onChange={(e) => setSpeaker(e.target.value)}
                disabled={submitting}
                className={INPUT}
              />
            </div>
            <div>
              <label htmlFor={locationId} className={LABEL}>
                Location <span className="text-text-soft">(optional)</span>
              </label>
              <input
                id={locationId}
                type="text"
                placeholder="e.g. Hall B"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                disabled={submitting}
                className={INPUT}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor={startId} className={LABEL}>
                Starts
              </label>
              <input
                id={startId}
                type="datetime-local"
                value={startTime}
                onChange={(e) => handleStartChange(e.target.value)}
                min={minTime}
                max={endTime || maxTime}
                required
                disabled={submitting}
                className={INPUT}
              />
            </div>
            <div>
              <label htmlFor={endId} className={LABEL}>
                Ends
              </label>
              <input
                id={endId}
                type="datetime-local"
                value={endTime}
                onChange={(e) => {
                  setEndTime(e.target.value);
                  setError(null);
                }}
                min={startTime || minTime}
                max={maxTime}
                required
                disabled={submitting}
                className={INPUT}
              />
            </div>
          </div>

          {error && (
            <p
              role="alert"
              className="flex items-start gap-2 text-sm text-danger bg-danger-bg border border-danger-border rounded-lg px-3 py-2"
            >
              <TriangleAlert className="w-4 h-4 mt-0.5 shrink-0" />
              {error}
            </p>
          )}

          <div className="flex justify-end gap-2 mt-1">
            <button
              type="button"
              onClick={onClose}
              disabled={submitting}
              className="px-4 py-2 text-sm font-medium text-text-muted rounded-lg transition-all duration-200 hover:text-text hover:bg-surface-strong active:scale-95 outline-none focus-visible:ring-2 focus-visible:ring-focus"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="flex items-center gap-2 px-5 py-2 text-sm font-semibold text-text-on-dark bg-linear-to-r from-brand to-panel-organizer rounded-lg shadow-md shadow-shadow-brand/30 transition-all duration-200 hover:brightness-110 hover:shadow-lg active:scale-95 disabled:opacity-60 disabled:cursor-not-allowed outline-none focus-visible:ring-2 focus-visible:ring-focus focus-visible:ring-offset-2"
            >
              {submitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Adding…
                </>
              ) : (
                "Add Item"
              )}
            </button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
}

export default AddScheduleItemForm;
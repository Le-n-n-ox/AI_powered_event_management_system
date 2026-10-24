import { useCallback, useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Plus,
  Trash2,
  Clock,
  MapPin,
  User,
  CalendarClock,
  Info,
  TriangleAlert,
} from "lucide-react";
import { supabase } from "../lib/supabase";
import AddScheduleItemForm from "../components/ui/AddScheduleItemForm";
import BackButton from "../components/layout/BackButton";
import AppShell from "../components/layout/AppShell";
import { eventNav } from "../components/layout/navItems";
import { isWithinWindow } from "../utils/scheduleWindow";
import type { Event, ScheduleItem } from "../types/event";

const CHIP = "text-xs font-semibold px-2.5 py-1 rounded-full";
const FMT: Intl.DateTimeFormatOptions = { dateStyle: "medium", timeStyle: "short" };

const ADD_BTN =
  "flex items-center gap-2 px-4 py-2 text-sm font-semibold text-text-on-dark bg-linear-to-r from-brand to-tag-violet rounded-lg shadow-md shadow-shadow-brand/30 transition-all duration-200 hover:brightness-110 hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0 active:scale-95 shrink-0 outline-none focus-visible:ring-2 focus-visible:ring-focus focus-visible:ring-offset-2";

export default function ManageSchedule() {
  const { id } = useParams<{ id: string }>();
  const [event, setEvent] = useState<Event | null>(null);
  const [items, setItems] = useState<ScheduleItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);

  const fetchData = useCallback(async () => {
    if (!id) return;

    const { data: eventData } = await supabase
      .from("events")
      .select("*")
      .eq("id", id)
      .single();
    if (eventData) setEvent(eventData);

    const { data: itemData } = await supabase
      .from("schedule_items")
      .select("*")
      .eq("event_id", id)
      .order("start_time", { ascending: true });

    if (itemData) setItems(itemData);
    setLoading(false);
  }, [id]);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      // Yield first so the effect never sets state synchronously.
      await Promise.resolve();
      if (cancelled) return;
      setLoading(true);
      await fetchData();
    }

    void load();

    return () => {
      cancelled = true;
    };
  }, [fetchData]);

  async function handleDelete(itemId: string) {
    if (!confirm("Delete this schedule item?")) return;
    const deletedItem = items.find((item) => item.id === itemId);

    const { error } = await supabase
      .from("schedule_items")
      .delete()
      .eq("id", itemId);

    if (!error) {
      setItems(items.filter((item) => item.id !== itemId));

      if (deletedItem && event) {
        const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:3000";
        fetch(`${apiUrl}/api/broadcast-update`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            eventId: event.id,
            eventName: event.name,
            updateType: "schedule cancellation",
            changeDetails: `The session "${deletedItem.title}" has been removed from the schedule.`,
          }),
        }).catch((err) => console.error("Schedule broadcast failed:", err));
      }
    }
  }

  if (loading)
    return (
      <div className="min-h-screen bg-background">
        <div
          role="status"
          aria-busy="true"
          className="max-w-4xl mx-auto px-4 sm:px-6 pt-24 pb-12"
        >
          <span className="sr-only">Loading schedule…</span>
          <div className="skeleton h-4 w-28 mb-5" />
          <div className="skeleton h-9 w-64 mb-6" />
          <div className="flex flex-col gap-3">
            {[0, 1, 2].map((i) => (
              <div key={i} className="skeleton h-20 w-full" />
            ))}
          </div>
        </div>
      </div>
    );
  if (!event)
    return (
      <div className="min-h-screen bg-background pt-32 text-center text-danger">
        Event not found.
      </div>
    );

  const outsideCount = items.filter(
    (i) => !isWithinWindow(i.start_time, i.end_time, event.start_date, event.end_date),
  ).length;

  return (
    <AppShell
      title="Schedule"
      subtitle={event.name}
      nav={eventNav(id ?? "")}
      activeKey="schedule"
      actions={
        <>
          <BackButton fallbackTo="/dashboard" label="Back" />
          <span
            className={`${CHIP} inline-flex items-center gap-1 bg-brand-soft text-brand-strong border border-brand-border`}
          >
            <CalendarClock className="w-3 h-3" />
            {items.length} session{items.length !== 1 ? "s" : ""}
          </span>
          <button onClick={() => setShowForm(true)} className={ADD_BTN}>
            <Plus className="w-4 h-4" />
            Add Item
          </button>
        </>
      }
    >
      {/* Event window: the only times sessions are allowed in */}
      <div className="flex items-start gap-2.5 mb-4 p-3.5 rounded-xl border border-info-border bg-info-bg text-info text-sm">
        <Info className="w-4 h-4 mt-0.5 shrink-0" />
        <span>
          Sessions must fall between{" "}
          <strong>{new Date(event.start_date).toLocaleString([], FMT)}</strong>{" "}
          and <strong>{new Date(event.end_date).toLocaleString([], FMT)}</strong>.
        </span>
      </div>

      {outsideCount > 0 && (
        <div
          role="alert"
          className="flex items-start gap-2.5 mb-4 p-3.5 rounded-xl border border-warning-border bg-warning-bg text-warning text-sm"
        >
          <TriangleAlert className="w-4 h-4 mt-0.5 shrink-0" />
          <span>
            {outsideCount} session{outsideCount !== 1 ? "s are" : " is"} outside
            the event hours. Delete and re-add{" "}
            {outsideCount !== 1 ? "them" : "it"} with valid times.
          </span>
        </div>
      )}

      {items.length === 0 ? (
        <div className="text-center p-10 bg-surface rounded-xl border border-dashed border-brand-border shadow-md shadow-shadow-soft">
          <div className="inline-flex p-3.5 rounded-xl bg-linear-to-br from-brand to-tag-teal text-text-on-dark mb-3 shadow-lg shadow-shadow-brand/40">
            <CalendarClock className="w-6 h-6" />
          </div>
          <p className="font-medium text-text">No schedule items yet</p>
          <p className="text-sm text-text-soft mt-1">
            Add sessions so attendees know what's happening and when.
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {items.map((item) => {
            const outside = !isWithinWindow(
              item.start_time,
              item.end_time,
              event.start_date,
              event.end_date,
            );
            return (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-40px" }}
                transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
                className={`bg-surface rounded-xl border border-border border-l-4 shadow-md shadow-shadow-soft p-4 flex items-start justify-between gap-3 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg ${
                  outside
                    ? "border-l-warning"
                    : "border-l-brand hover:border-l-tag-violet"
                }`}
              >
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="font-heading font-semibold text-text">
                      {item.title}
                    </h3>
                    {outside && (
                      <span
                        className={`${CHIP} bg-warning-bg text-warning border border-warning-border`}
                      >
                        Outside event hours
                      </span>
                    )}
                  </div>
                  <div className="flex flex-wrap gap-x-4 gap-y-1 mt-2 text-sm text-text-muted">
                    <span className="flex items-center gap-1.5">
                      <Clock className="w-4 h-4 text-tag-sky" />
                      {new Date(item.start_time).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}{" "}
                      –{" "}
                      {new Date(item.end_time).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                    {item.location && (
                      <span className="flex items-center gap-1.5">
                        <MapPin className="w-4 h-4 text-tag-teal" />
                        {item.location}
                      </span>
                    )}
                    {item.speaker && (
                      <span className="flex items-center gap-1.5">
                        <User className="w-4 h-4 text-tag-violet" />
                        {item.speaker}
                      </span>
                    )}
                  </div>
                </div>
                <button
                  onClick={() => handleDelete(item.id)}
                  className="p-2 rounded-lg text-text-soft transition-all duration-200 hover:text-danger hover:bg-danger-bg hover:scale-110 active:scale-95 shrink-0 outline-none focus-visible:ring-2 focus-visible:ring-focus"
                  aria-label={`Delete ${item.title}`}
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </motion.div>
            );
          })}
        </div>
      )}

      {showForm && (
        <AddScheduleItemForm
          eventId={event.id}
          eventStart={event.start_date}
          eventEnd={event.end_date}
          onItemAdded={fetchData}
          onClose={() => setShowForm(false)}
        />
      )}
    </AppShell>
  );
}

import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Plus, Trash2, Clock, MapPin, User } from "lucide-react";
import { supabase } from "../lib/supabase";
import AddScheduleItemForm from "../components/ui/AddScheduleItemForm";
import type { Event, ScheduleItem } from "../types/event";

export default function ManageSchedule() {
  const { id } = useParams<{ id: string }>();
  const [event, setEvent] = useState<Event | null>(null);
  const [items, setItems] = useState<ScheduleItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);

  async function fetchData() {
    if (!id) return;
    setLoading(true);

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
  }

  useEffect(() => {
    fetchData();
  }, [id]);

  async function handleDelete(itemId: string) {
    if (!confirm("Delete this schedule item?")) return;
    const { error } = await supabase
      .from("schedule_items")
      .delete()
      .eq("id", itemId);
    if (!error) setItems(items.filter((i) => i.id !== itemId));
  }

  if (loading)
    return (
      <div className="p-10 text-center text-[var(--color-text-muted)]">
        Loading schedule…
      </div>
    );
  if (!event)
    return (
      <div className="p-10 text-center text-[var(--color-danger)]">
        Event not found.
      </div>
    );

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-heading text-2xl font-bold text-[var(--color-text)]">
            Schedule: {event.name}
          </h1>
          <p className="text-sm text-[var(--color-text-muted)]">
            {items.length} session{items.length !== 1 ? "s" : ""}
          </p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-[var(--color-text-on-dark)] bg-[var(--color-brand)] rounded-lg hover:bg-[var(--color-brand-hover)]"
        >
          <Plus className="w-4 h-4" />
          Add Item
        </button>
      </div>

      {items.length === 0 ? (
        <div className="text-center p-10 bg-[var(--color-surface)] rounded-lg border border-[var(--color-border)] text-[var(--color-text-muted)]">
          No schedule items yet. Add one to get started.
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {items.map((item) => (
            <div
              key={item.id}
              className="bg-[var(--color-surface)] rounded-xl border border-[var(--color-border)] p-4 flex items-start justify-between"
            >
              <div>
                <h3 className="font-heading font-semibold text-[var(--color-text)]">
                  {item.title}
                </h3>
                <div className="flex flex-wrap gap-4 mt-2 text-sm text-[var(--color-text-muted)]">
                  <span className="flex items-center gap-1">
                    <Clock className="w-4 h-4" />
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
                    <span className="flex items-center gap-1">
                      <MapPin className="w-4 h-4" />
                      {item.location}
                    </span>
                  )}
                  {item.speaker && (
                    <span className="flex items-center gap-1">
                      <User className="w-4 h-4" />
                      {item.speaker}
                    </span>
                  )}
                </div>
              </div>
              <button
                onClick={() => handleDelete(item.id)}
                className="text-[var(--color-text-soft)] hover:text-[var(--color-danger)] transition-colors"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      )}

      {showForm && (
        <AddScheduleItemForm
          eventId={event.id}
          onItemAdded={fetchData}
          onClose={() => setShowForm(false)}
        />
      )}
    </div>
  );
}

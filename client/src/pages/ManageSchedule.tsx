import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Plus, Trash2, Clock, MapPin, User, CalendarClock } from "lucide-react";
import { supabase } from "../lib/supabase";
import AddScheduleItemForm from "../components/ui/AddScheduleItemForm";
import type { Event, ScheduleItem } from "../types/event";

const CHIP = "text-xs font-medium px-2.5 py-1 rounded-full";

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
      <div className="min-h-screen bg-background pt-32 text-center text-text-soft">
        Loading schedule…
      </div>
    );
  if (!event)
    return (
      <div className="min-h-screen bg-background pt-32 text-center text-danger">
        Event not found.
      </div>
    );

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 pt-24 pb-12">
        <div className="flex items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="font-heading text-2xl sm:text-3xl font-bold text-text tracking-tight mb-2">
              Schedule
              <span className="block sm:inline sm:ml-2 text-text-soft font-medium text-lg sm:text-2xl">
                {event.name}
              </span>
            </h1>
            <span className={`${CHIP} inline-flex items-center gap-1 bg-brand-soft text-brand-strong`}>
              <CalendarClock className="w-3 h-3" />
              {items.length} session{items.length !== 1 ? "s" : ""}
            </span>
          </div>
          <button
            onClick={() => setShowForm(true)}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-text-on-dark bg-brand rounded-lg hover:bg-brand-hover transition-colors shrink-0"
          >
            <Plus className="w-4 h-4" />
            Add Item
          </button>
        </div>

        {items.length === 0 ? (
          <div className="text-center p-10 bg-surface rounded-xl border border-border shadow-sm">
            <div className="inline-flex p-3 rounded-lg bg-brand-soft text-brand mb-3">
              <CalendarClock className="w-6 h-6" />
            </div>
            <p className="font-medium text-text">No schedule items yet</p>
            <p className="text-sm text-text-soft mt-1">
              Add sessions so attendees know what's happening and when.
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {items.map((item) => (
              <div
                key={item.id}
                className="bg-surface rounded-xl border border-border shadow-sm p-4 flex items-start justify-between hover:shadow-md transition-shadow"
              >
                <div>
                  <h3 className="font-heading font-semibold text-text">
                    {item.title}
                  </h3>
                  <div className="flex flex-wrap gap-x-4 gap-y-1 mt-2 text-sm text-text-muted">
                    <span className="flex items-center gap-1.5">
                      <Clock className="w-4 h-4 text-text-soft" />
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
                        <MapPin className="w-4 h-4 text-text-soft" />
                        {item.location}
                      </span>
                    )}
                    {item.speaker && (
                      <span className="flex items-center gap-1.5">
                        <User className="w-4 h-4 text-text-soft" />
                        {item.speaker}
                      </span>
                    )}
                  </div>
                </div>
                <button
                  onClick={() => handleDelete(item.id)}
                  className="text-text-soft hover:text-danger transition-colors shrink-0"
                  aria-label={`Delete ${item.title}`}
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
    </div>
  );
}
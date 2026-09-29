import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Plus, Trash2, MapPin } from "lucide-react";
import { supabase } from "../lib/supabase";
import AddVenueLocationForm from "../components/ui/AddVenueLocationForm";
import type { Event, VenueLocation } from "../types/event";

const CHIP = "text-xs font-medium px-2.5 py-1 rounded-full";

export default function ManageVenueLocations() {
  const { id } = useParams<{ id: string }>();
  const [event, setEvent] = useState<Event | null>(null);
  const [locations, setLocations] = useState<VenueLocation[]>([]);
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

    const { data: locationData } = await supabase
      .from("venue_locations")
      .select("*")
      .eq("event_id", id)
      .order("created_at", { ascending: true });

    if (locationData) setLocations(locationData);
    setLoading(false);
  }

  useEffect(() => {
    fetchData();
  }, [id]);

  async function handleDelete(locationId: string) {
    if (!confirm("Delete this location?")) return;
    const { error } = await supabase
      .from("venue_locations")
      .delete()
      .eq("id", locationId);
    if (!error) setLocations(locations.filter((l) => l.id !== locationId));
  }

  if (loading)
    return (
      <div className="min-h-screen bg-background pt-32 text-center text-text-soft">
        Loading locations…
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
              Venue Locations
              <span className="block sm:inline sm:ml-2 text-text-soft font-medium text-lg sm:text-2xl">
                {event.name}
              </span>
            </h1>
            <span className={`${CHIP} inline-flex items-center gap-1 bg-brand-soft text-brand-strong`}>
              <MapPin className="w-3 h-3" />
              {locations.length} location{locations.length !== 1 ? "s" : ""} — used by the AI assistant
            </span>
          </div>
          <button
            onClick={() => setShowForm(true)}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-text-on-dark bg-brand rounded-lg hover:bg-brand-hover transition-colors shrink-0"
          >
            <Plus className="w-4 h-4" />
            Add Location
          </button>
        </div>

        {locations.length === 0 ? (
          <div className="text-center p-10 bg-surface rounded-xl border border-border shadow-sm">
            <div className="inline-flex p-3 rounded-lg bg-brand-soft text-brand mb-3">
              <MapPin className="w-6 h-6" />
            </div>
            <p className="font-medium text-text">No locations yet</p>
            <p className="text-sm text-text-soft mt-1">
              Add washrooms, halls, registration desks, and other landmarks.
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {locations.map((loc) => (
              <div
                key={loc.id}
                className="bg-surface rounded-xl border border-border shadow-sm p-4 flex items-start justify-between hover:shadow-md transition-shadow"
              >
                <div className="flex items-start gap-3">
                  <MapPin className="w-5 h-5 text-brand mt-0.5 shrink-0" />
                  <div>
                    <h3 className="font-heading font-semibold text-text">
                      {loc.label}
                    </h3>
                    {loc.description && (
                      <p className="text-sm text-text-muted mt-1">
                        {loc.description}
                      </p>
                    )}
                  </div>
                </div>
                <button
                  onClick={() => handleDelete(loc.id)}
                  className="text-text-soft hover:text-danger transition-colors shrink-0"
                  aria-label={`Delete ${loc.label}`}
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        )}

        {showForm && (
          <AddVenueLocationForm
            eventId={event.id}
            onLocationAdded={fetchData}
            onClose={() => setShowForm(false)}
          />
        )}
      </div>
    </div>
  );
}
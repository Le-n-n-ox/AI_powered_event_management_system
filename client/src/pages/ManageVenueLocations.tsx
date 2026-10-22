import { useCallback, useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { motion } from "framer-motion";
import { Plus, Trash2, MapPin } from "lucide-react";
import { supabase } from "../lib/supabase";
import AddVenueLocationForm from "../components/ui/AddVenueLocationForm";
import BackButton from "../components/layout/BackButton";
import AppShell from "../components/layout/AppShell";
import { eventNav } from "../components/layout/navItems";
import type { Event, VenueLocation } from "../types/event";

const CHIP = "text-xs font-medium px-2.5 py-1 rounded-full";

const ADD_BTN =
  "flex items-center gap-2 px-4 py-2 text-sm font-semibold text-text-on-dark bg-linear-to-r from-brand to-tag-violet rounded-lg shadow-md shadow-shadow-brand/30 transition-all duration-200 hover:brightness-110 hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0 active:scale-95 shrink-0 outline-none focus-visible:ring-2 focus-visible:ring-focus focus-visible:ring-offset-2";

export default function ManageVenueLocations() {
  const { id } = useParams<{ id: string }>();
  const [event, setEvent] = useState<Event | null>(null);
  const [locations, setLocations] = useState<VenueLocation[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);

  const fetchData = useCallback(async () => {
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
  }, [id]);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      // Yield first so the effect never sets state synchronously.
      await Promise.resolve();
      if (cancelled) return;
      await fetchData();
    }

    void load();

    return () => {
      cancelled = true;
    };
  }, [fetchData]);

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
    <AppShell
      title="Venue locations"
      subtitle={event.name}
      nav={eventNav(id ?? "")}
      activeKey="locations"
      actions={
        <>
          <BackButton fallbackTo="/dashboard" label="Back" />
          <span
            className={`${CHIP} inline-flex items-center gap-1 bg-brand-soft text-brand-strong border border-brand-border`}
          >
            <MapPin className="w-3 h-3" />
            {locations.length} location{locations.length !== 1 ? "s" : ""}
          </span>
          <button onClick={() => setShowForm(true)} className={ADD_BTN}>
            <Plus className="w-4 h-4" />
            Add Location
          </button>
        </>
      }
    >
      <p className="text-sm text-text-soft mb-5">
        Landmarks the AI assistant can point attendees to — washrooms, halls,
        registration desks and more.
      </p>

      {locations.length === 0 ? (
        <div className="text-center p-10 bg-surface rounded-xl border border-dashed border-brand-border shadow-md shadow-shadow-soft">
          <div className="inline-flex p-3.5 rounded-xl bg-linear-to-br from-brand to-tag-teal text-text-on-dark mb-3 shadow-lg shadow-shadow-brand/40">
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
            <motion.div
              key={loc.id}
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-40px" }}
              transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
              className="bg-surface rounded-xl border border-border shadow-md shadow-shadow-soft p-4 flex items-start justify-between gap-3 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg hover:border-brand-border"
            >
              <div className="flex items-start gap-3 min-w-0">
                <MapPin className="w-5 h-5 text-tag-teal mt-0.5 shrink-0" />
                <div className="min-w-0">
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
                className="p-2 rounded-lg text-text-soft transition-all duration-200 hover:text-danger hover:bg-danger-bg hover:scale-110 active:scale-95 shrink-0 outline-none focus-visible:ring-2 focus-visible:ring-focus"
                aria-label={`Delete ${loc.label}`}
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </motion.div>
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
    </AppShell>
  );
}

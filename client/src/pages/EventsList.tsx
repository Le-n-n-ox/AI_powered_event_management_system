import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  CalendarDays,
  MapPin,
  TriangleAlert,
  ArrowRight,
} from "lucide-react";
import { supabase } from "../lib/supabase";
import type { Event } from "../types/event";

interface StatusStyle {
  badge: string;
  bar: string;
}

const STATUS_STYLES: { [key: string]: StatusStyle } = {
  upcoming: {
    badge: "bg-info-bg text-info border-info-border",
    bar: "bg-linear-to-r from-info to-brand",
  },
  ongoing: {
    badge: "bg-success-bg text-success border-success-border",
    bar: "bg-linear-to-r from-success to-tag-teal",
  },
  cancelled: {
    badge: "bg-danger-bg text-danger border-danger-border",
    bar: "bg-linear-to-r from-danger to-tag-pink",
  },
  completed: {
    badge: "bg-surface-strong text-text-muted border-border",
    bar: "bg-border-strong",
  },
};

const FOCUS =
  "outline-none focus-visible:ring-2 focus-visible:ring-focus focus-visible:ring-offset-2";

function isPast(event: Event) {
  return new Date(event.end_date) < new Date();
}

function EventTile({ event, past }: { event: Event; past: boolean }) {
  const cancelled = event.status === "cancelled";
  const style =
    past && !cancelled
      ? STATUS_STYLES.completed
      : STATUS_STYLES[event.status] ?? STATUS_STYLES.completed;
  const label = past && !cancelled ? "past" : event.status;

  return (
    <div
      className={`group relative bg-surface rounded-xl shadow-md shadow-shadow-soft border border-border overflow-hidden flex flex-col transition-all duration-300 hover:shadow-xl hover:shadow-shadow-brand/40 hover:border-brand-border hover:-translate-y-1.5 active:translate-y-0 active:scale-[0.99] ${
        past ? "opacity-80 hover:opacity-100" : ""
      }`}
    >
      <div className={`absolute top-0 left-0 w-full h-2 ${style.bar}`} />

      <div className="p-6 pt-8 grow">
        <div className="flex justify-between items-start gap-2 mb-4">
          <h3 className="font-heading text-xl font-bold text-text line-clamp-2">
            {event.name}
          </h3>
          <span
            className={`shrink-0 text-xs px-2.5 py-1 rounded-full border capitalize font-semibold ${style.badge}`}
          >
            {label}
          </span>
        </div>

        <div className="flex flex-col gap-2 mb-4 text-sm text-text-muted">
          <div className="flex items-center gap-2">
            <CalendarDays className="w-4 h-4 text-tag-violet shrink-0" />
            {new Date(event.start_date).toLocaleDateString()}
          </div>
          {event.venue_name && (
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-tag-teal shrink-0" />
              <span className="truncate">{event.venue_name}</span>
            </div>
          )}
        </div>

        <p className="text-text-soft text-sm line-clamp-3">
          {event.description}
        </p>
      </div>

      <div className="p-4 bg-surface-alt/60 border-t border-border mt-auto">
        <Link
          to={`/events/${event.id}`}
          className={`flex items-center justify-center gap-2 w-full bg-linear-to-r from-brand to-panel-organizer text-text-on-dark py-2 rounded-lg font-medium shadow-md shadow-shadow-brand/30 transition-all duration-200 hover:brightness-110 hover:shadow-lg hover:shadow-shadow-brand/50 active:scale-95 ${FOCUS}`}
        >
          View Details
          <ArrowRight className="w-4 h-4 transition-transform duration-200 group-hover:translate-x-1" />
        </Link>
      </div>
    </div>
  );
}

function Section({
  title,
  events,
  past,
}: {
  title: string;
  events: Event[];
  past: boolean;
}) {
  return (
    <section className="mb-12">
      <h2 className="font-heading text-xl font-semibold text-text mb-5 flex items-center gap-3">
        <span
          className={`w-2.5 h-2.5 rounded-full ${
            past ? "bg-border-strong" : "bg-linear-to-br from-brand to-tag-teal"
          }`}
        />
        {title}
        <span
          className={`inline-flex items-center justify-center min-w-6 h-6 px-2 rounded-full text-xs font-semibold ${
            past
              ? "bg-surface-strong text-text-soft"
              : "bg-brand-soft text-brand-strong"
          }`}
        >
          {events.length}
        </span>
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {events.map((event) => (
          <EventTile key={event.id} event={event} past={past} />
        ))}
      </div>
    </section>
  );
}

function LoadingSkeleton() {
  return (
    <div className="min-h-screen bg-background">
      <div
        role="status"
        aria-busy="true"
        className="max-w-6xl mx-auto px-4 sm:px-6 md:px-10 pt-24 pb-12"
      >
        <span className="sr-only">Loading events...</span>
        <div className="skeleton h-9 w-40 mb-3" />
        <div className="skeleton h-4 w-64 mb-10" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className="bg-surface border border-border rounded-xl p-6 shadow-md shadow-shadow-soft"
            >
              <div className="skeleton h-6 w-3/4 mb-5" />
              <div className="skeleton h-4 w-1/2 mb-2" />
              <div className="skeleton h-4 w-2/5 mb-5" />
              <div className="skeleton h-4 w-full mb-2" />
              <div className="skeleton h-4 w-5/6 mb-6" />
              <div className="skeleton h-10 w-full" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function EventsList() {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchEvents() {
      try {
        const { data, error: supabaseError } = await supabase
          .from("events")
          .select("*")
          .order("start_date", { ascending: true });

        if (supabaseError) throw supabaseError;
        setEvents(data || []);
      } catch (err) {
        console.error("Error fetching events:", err);
        setError(
          err instanceof Error ? err.message : "Failed to load events.",
        );
      } finally {
        setLoading(false);
      }
    }

    fetchEvents();
  }, []);

  const { upcoming, past } = useMemo(() => {
    const up: Event[] = [];
    const pa: Event[] = [];
    for (const e of events) {
      if (isPast(e)) pa.push(e);
      else up.push(e);
    }
    up.sort(
      (a, b) =>
        new Date(a.start_date).getTime() - new Date(b.start_date).getTime(),
    );
    pa.sort(
      (a, b) =>
        new Date(b.start_date).getTime() - new Date(a.start_date).getTime(),
    );
    return { upcoming: up, past: pa };
  }, [events]);

  if (loading) return <LoadingSkeleton />;

  if (error)
    return (
      <div className="min-h-screen bg-background pt-32 px-4">
        <div
          role="alert"
          className="max-w-md mx-auto flex items-start gap-3 p-4 rounded-lg border border-danger-border bg-danger-bg text-danger text-sm shadow-md shadow-shadow-soft"
        >
          <TriangleAlert className="w-4 h-4 mt-0.5 shrink-0" />
          <span>{error}</span>
        </div>
      </div>
    );

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 md:px-10 pt-24 pb-12">
        <div className="mb-10">
          <h1 className="font-heading text-4xl font-bold tracking-tight text-gradient">
            Events
          </h1>
          <p className="text-text-muted text-sm mt-2">
            Browse events and register in seconds.
          </p>
        </div>

        {events.length === 0 && (
          <div className="flex flex-col items-center text-center bg-surface border border-dashed border-brand-border rounded-xl p-12 shadow-md shadow-shadow-soft">
            <div className="p-3.5 rounded-xl bg-linear-to-br from-brand to-tag-teal text-text-on-dark mb-4 shadow-lg shadow-shadow-brand/40">
              <CalendarDays className="w-8 h-8" />
            </div>
            <h2 className="font-heading text-lg font-semibold text-text">
              No events found
            </h2>
            <p className="text-sm text-text-soft mt-1">
              Check back soon for new events.
            </p>
          </div>
        )}

        {upcoming.length > 0 && (
          <Section title="Upcoming" events={upcoming} past={false} />
        )}

        {events.length > 0 && upcoming.length === 0 && (
          <p className="mb-12 text-sm text-text-soft">
            No upcoming events right now.
          </p>
        )}

        {past.length > 0 && (
          <Section title="Past events" events={past} past={true} />
        )}
      </div>
    </div>
  );
}
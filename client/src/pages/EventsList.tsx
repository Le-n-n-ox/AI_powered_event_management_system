import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  CalendarDays,
  MapPin,
  TriangleAlert,
  ArrowRight,
  Banknote,
  Sparkles,
  Ticket,
  UsersRound,
} from "lucide-react";
import { supabase } from "../lib/supabase";
import { useAuth } from "../context/auth-context";
import PageHeader from "../components/layout/PageHeader";
import {
  categoriesOf,
  eventPeriod,
  locationsOf,
  RSVP_LABELS,
  RSVP_STYLES,
  rsvpState,
} from "../lib/events";
import type { Attendee, Event } from "../types/event";
import EventFilterBar from "../components/events/EventFilterBar";

interface StatusStyle {
  badge: string;
  bar: string;
  /** The soft wash behind the top of the card. */
  wash: string;
  /** The date tile's colours. */
  tile: string;
}

const STATUS_STYLES: { [key: string]: StatusStyle } = {
  upcoming: {
    badge: "bg-info-bg text-info border-info-border",
    bar: "bg-linear-to-r from-info via-tag-sky to-brand",
    wash: "from-info/25 via-tag-sky/10 to-transparent",
    tile: "bg-info-bg text-info border-info-border",
  },
  ongoing: {
    badge: "bg-success-bg text-success border-success-border",
    bar: "bg-linear-to-r from-success via-tag-teal to-brand",
    wash: "from-success/25 via-tag-teal/10 to-transparent",
    tile: "bg-success-bg text-success border-success-border",
  },
  cancelled: {
    badge: "bg-danger-bg text-danger border-danger-border",
    bar: "bg-linear-to-r from-danger via-tag-pink to-tag-violet",
    wash: "from-danger/25 via-tag-pink/10 to-transparent",
    tile: "bg-danger-bg text-danger border-danger-border",
  },
  completed: {
    badge: "bg-surface-strong text-text-muted border-border",
    bar: "bg-linear-to-r from-border-strong via-text-soft to-border-strong",
    wash: "from-border-strong/30 via-text-soft/10 to-transparent",
    tile: "bg-surface-strong text-text-muted border-border",
  },
};

const FOCUS =
  "outline-none focus-visible:ring-2 focus-visible:ring-focus focus-visible:ring-offset-2";

const MONTHS = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

function EventTile({
  event,
  past,
  registrationStatus,
}: {
  event: Event;
  past: boolean;
  registrationStatus?: Attendee["status"];
}) {
  const cancelled = event.status === "cancelled";
  const style =
    past && !cancelled
      ? STATUS_STYLES.completed
      : STATUS_STYLES[event.status] ?? STATUS_STYLES.completed;
  const label = past && !cancelled ? "past" : event.status;
  const rsvp = registrationStatus ? rsvpState(registrationStatus) : null;

  const start = new Date(event.start_date);
  const day = Number.isNaN(start.getTime()) ? "--" : start.getDate();
  const month = Number.isNaN(start.getTime())
    ? "---"
    : MONTHS[start.getMonth()];

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
      className={`group relative bg-surface rounded-2xl shadow-md shadow-shadow-soft border border-border overflow-hidden flex flex-col transition-all duration-300 hover:shadow-2xl hover:shadow-shadow-brand/30 hover:border-brand-border hover:-translate-y-2 active:translate-y-0 active:scale-[0.99] ${
        past ? "opacity-85 hover:opacity-100" : ""
      }`}
    >
      <div className={`absolute top-0 left-0 w-full h-1.5 ${style.bar}`} />

      {/* The coloured wash behind the top of the card */}
      <div
        className={`absolute inset-x-0 top-0 h-44 bg-linear-to-b ${style.wash} pointer-events-none`}
        aria-hidden
      />
      <div
        className="absolute -top-20 -right-12 w-52 h-52 rounded-full bg-brand/10 blur-3xl transition-all duration-500 group-hover:bg-brand/20 group-hover:scale-125 pointer-events-none"
        aria-hidden
      />

      <div className="p-6 pt-8 grow relative">
        <div className="flex items-start gap-3.5 mb-4">
          {/* The floating date tile */}
          <div
            className={`shrink-0 flex flex-col items-center justify-center w-14 h-16 rounded-2xl border shadow-md shadow-shadow-soft ${style.tile}`}
          >
            <span className="font-heading text-xl font-bold leading-none">
              {day}
            </span>
            <span className="text-[10px] font-bold uppercase tracking-widest mt-1 opacity-80">
              {month}
            </span>
          </div>

          <div className="flex-1 min-w-0">
            <h3 className="font-heading text-xl font-bold text-text line-clamp-2 min-h-14">
              {event.name}
            </h3>

            <div className="flex flex-wrap items-center gap-1.5 mt-2">
              <span
                className={`shrink-0 text-xs px-2.5 py-1 rounded-full border capitalize font-semibold ${style.badge}`}
              >
                {label}
              </span>
              {rsvp && (
                <span
                  className={`shrink-0 text-xs px-2.5 py-1 rounded-full border font-semibold ${RSVP_STYLES[rsvp]}`}
                >
                  {RSVP_LABELS[rsvp]}
                </span>
              )}
              {event.category && (
                <span className="inline-flex items-center gap-1 text-xs font-medium text-tag-violet bg-tag-violet-bg border border-tag-violet/20 rounded-full px-2.5 py-0.5">
                  <Sparkles className="w-3 h-3" />
                  {event.category}
                </span>
              )}
              {event.is_paid ? (
                <span className="inline-flex items-center gap-1 text-xs font-medium text-success bg-success-bg border border-success-border rounded-full px-2.5 py-0.5">
                  <Banknote className="w-3 h-3" />
                  KES {Number(event.ticket_price || 0).toLocaleString("en-KE")}
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 text-xs font-medium text-tag-teal bg-tag-teal-bg border border-tag-teal/30 rounded-full px-2.5 py-0.5">
                  <Ticket className="w-3 h-3" />
                  Free
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-2 mb-4 text-sm text-text-muted">
          <div className="flex items-center gap-2">
            <CalendarDays className="w-4 h-4 text-tag-violet shrink-0" />
            {Number.isNaN(start.getTime())
              ? "Date to be announced"
              : start.toLocaleDateString(undefined, {
                  weekday: "short",
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                })}
          </div>
          {event.venue_name && (
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-tag-teal shrink-0" />
              <span className="truncate">{event.venue_name}</span>
            </div>
          )}
          {event.capacity ? (
            <div className="flex items-center gap-2">
              <UsersRound className="w-4 h-4 text-tag-sky shrink-0" />
              <span>{event.capacity} spots</span>
            </div>
          ) : null}
        </div>

        {/* Exactly three lines of room, so the clamp never shows a sliver of
            a fourth line and every card in a row lines up. */}
        <p className="text-text-soft text-sm line-clamp-3 h-15">
          {event.description}
        </p>
      </div>

      <div className="p-4 bg-surface-alt/60 border-t border-border mt-auto relative">
        <Link
          to={`/events/${event.id}`}
          className={`flex items-center justify-center gap-2 w-full bg-linear-to-r from-brand via-brand to-panel-organizer bg-[length:200%_100%] bg-[position:0%_0%] text-text-on-dark py-2.5 rounded-lg font-medium shadow-md shadow-shadow-brand/30 transition-all duration-300 hover:bg-[position:100%_0%] hover:shadow-lg hover:shadow-shadow-brand/50 active:scale-95 ${FOCUS}`}
        >
          View Details
          <ArrowRight className="w-4 h-4 transition-transform duration-200 group-hover:translate-x-1" />
        </Link>
      </div>
    </motion.div>
  );
}

function Section({
  title,
  events,
  past,
  registrations,
}: {
  title: string;
  events: Event[];
  past: boolean;
  registrations: Map<string, Attendee["status"]>;
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
          <EventTile
            key={event.id}
            event={event}
            past={past}
            registrationStatus={registrations.get(event.id)}
          />
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
  const { user } = useAuth();
  const userId = user?.id ?? null;
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [categoriesAvailable, setCategoriesAvailable] = useState(false);
  const [registrations, setRegistrations] = useState<
    Map<string, Attendee["status"]>
  >(new Map());

  const [search, setSearch] = useState("");
  const [location, setLocation] = useState("all");
  const [category, setCategory] = useState("all");
  const [time, setTime] = useState("all");

  useEffect(() => {
    async function fetchEvents() {
      try {
        const { data, error: supabaseError } = await supabase
          .from("events")
          .select("*")
          .order("start_date", { ascending: true });

        if (supabaseError) throw supabaseError;

        const rows = (data ?? []) as Event[];
        setEvents(rows);
        setCategoriesAvailable(rows.length ? "category" in rows[0] : true);
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

  // The attendee's own registrations, so each card can say whether they are
  // going, pending, waitlisted or cancelled.
  useEffect(() => {
    let cancelled = false;

    async function loadRegistrations() {
      // Yield first so the effect never sets state synchronously.
      await Promise.resolve();
      if (cancelled) return;

      if (!userId) {
        setRegistrations(new Map());
        return;
      }

      const { data } = await supabase
        .from("attendees")
        .select("event_id, status")
        .eq("user_id", userId);

      if (cancelled) return;

      const map = new Map<string, Attendee["status"]>();
      for (const row of (data ?? []) as {
        event_id: string;
        status: Attendee["status"];
      }[]) {
        map.set(row.event_id, row.status);
      }
      setRegistrations(map);
    }

    void loadRegistrations();

    return () => {
      cancelled = true;
    };
  }, [userId]);

  const locations = useMemo(() => locationsOf(events), [events]);
  const categories = useMemo(() => categoriesOf(events), [events]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();

    return events.filter((event) => {
      if (location !== "all" && event.venue_name !== location) return false;
      if (category !== "all" && event.category !== category) return false;

      if (time !== "all") {
        const period = eventPeriod(event);
        if (time === "past" && period !== "past") return false;
        if (time === "upcoming" && period !== "upcoming") return false;
        if (time === "ongoing" && period !== "ongoing") return false;
      }

      if (!q) return true;

      return (
        event.name.toLowerCase().includes(q) ||
        (event.description || "").toLowerCase().includes(q) ||
        (event.venue_name || "").toLowerCase().includes(q) ||
        (event.category || "").toLowerCase().includes(q)
      );
    });
  }, [events, search, location, category, time]);

  const { upcoming, past } = useMemo(() => {
    const up: Event[] = [];
    const pa: Event[] = [];
    for (const e of filtered) {
      if (eventPeriod(e) === "past") pa.push(e);
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
  }, [filtered]);

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
        <PageHeader
          eyebrow="Discover"
          icon={CalendarDays}
          title={<span className="text-gradient">Events</span>}
          subtitle="Browse events and register in seconds."
        />

        {events.length > 0 && (
          <div className="mb-8">
            <EventFilterBar
              search={search}
              onSearchChange={setSearch}
              locations={locations}
              location={location}
              onLocationChange={setLocation}
              categories={categories}
              category={category}
              onCategoryChange={setCategory}
              categoriesAvailable={categoriesAvailable}
              showTime
              time={time}
              onTimeChange={setTime}
              onClear={() => {
                setSearch("");
                setLocation("all");
                setCategory("all");
                setTime("all");
              }}
            />
          </div>
        )}

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

        {events.length > 0 && filtered.length === 0 && (
          <div className="text-center bg-surface border border-dashed border-border-strong rounded-xl p-12">
            <h2 className="font-heading text-lg font-semibold text-text">
              No events match those filters
            </h2>
            <p className="text-sm text-text-soft mt-1">
              Try a different location, niche or time range.
            </p>
          </div>
        )}

        {upcoming.length > 0 && (
          <Section
            title="Upcoming"
            events={upcoming}
            past={false}
            registrations={registrations}
          />
        )}

        {events.length > 0 && upcoming.length === 0 && filtered.length > 0 && (
          <p className="mb-12 text-sm text-text-soft">
            No upcoming events right now.
          </p>
        )}

        {past.length > 0 && (
          <Section
            title="Past events"
            events={past}
            past={true}
            registrations={registrations}
          />
        )}
      </div>
    </div>
  );
}

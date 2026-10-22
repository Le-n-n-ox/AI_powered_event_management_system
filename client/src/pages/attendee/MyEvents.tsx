import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  CalendarDays,
  MapPin,
  Clock,
  Loader2,
  TriangleAlert,
  CheckCircle2,
  XCircle,
  Hourglass,
  ListPlus,
  Lock,
  X,
  Ticket,
} from "lucide-react";
import { useAuth } from "../../context/auth-context";
import { supabase } from "../../lib/supabase";
import { apiFetch } from "../../lib/api";
import TicketQR from "../../components/ui/TicketQR";
import EventFilterBar from "../../components/events/EventFilterBar";
import PageHeader from "../../components/layout/PageHeader";
import {
  categoriesOf,
  eventPeriod,
  locationsOf,
  RSVP_LABELS,
  RSVP_STYLES,
  rsvpState,
} from "../../lib/events";
import type { Attendee, Event, RsvpState } from "../../types/event";

type Registration = Attendee & { events: Event };

const STATUS_CONFIG: Record<
  Attendee["status"],
  { icon: typeof CheckCircle2; label: string; className: string }
> = {
  approved: {
    icon: CheckCircle2,
    label: "Approved",
    className: "bg-success-bg text-success border-success-border",
  },
  pending: {
    icon: Hourglass,
    label: "Pending approval",
    className: "bg-warning-bg text-warning border-warning-border",
  },
  waitlisted: {
    icon: ListPlus,
    label: "Waitlisted",
    className: "bg-info-bg text-info border-info-border",
  },
  rejected: {
    icon: XCircle,
    label: "Not approved",
    className: "bg-danger-bg text-danger border-danger-border",
  },
};

const TABS = [
  { key: "upcoming", label: "Upcoming" },
  { key: "past", label: "Past" },
  { key: "all", label: "All" },
] as const;

type Tab = (typeof TABS)[number]["key"];

const RSVP_FILTERS: { key: RsvpState | "all"; label: string }[] = [
  { key: "all", label: "Any status" },
  { key: "going", label: "Going" },
  { key: "pending", label: "Pending" },
  { key: "waitlisted", label: "Waitlisted" },
  { key: "cancelled", label: "Cancelled" },
];

/**
 * The ticket for a paid event.
 *
 * The QR is the proof of entry, so it only shows once the money has actually
 * landed. The backend is the one that knows — the row on the attendee may
 * still say "unpaid" if the payment callback was slow to arrive.
 */
function PaidTicket({ registration }: { registration: Registration }) {
  const event = registration.events;
  const [paid, setPaid] = useState(registration.payment_status === "paid");

  useEffect(() => {
    let cancelled = false;

    async function check() {
      try {
        const status = await apiFetch<{ paid: boolean }>(
          `/api/payments/attendee-status?attendeeId=${encodeURIComponent(
            registration.id,
          )}&phone=${encodeURIComponent(registration.phone_number)}`,
        );
        if (!cancelled) setPaid(status.paid);
      } catch {
        // If the check fails, trust what the attendee row already said.
      }
    }

    void check();

    return () => {
      cancelled = true;
    };
  }, [registration.id, registration.phone_number]);

  if (paid) {
    return (
      <TicketQR
        attendeeId={registration.id}
        eventId={event.id}
        eventName={event.name}
      />
    );
  }

  return (
    <div className="bg-surface border border-border rounded-xl shadow-lg p-6 text-center">
      <span className="inline-flex p-3 rounded-full bg-warning-bg text-warning mb-3">
        <Lock className="w-6 h-6" />
      </span>
      <h3 className="font-heading font-semibold text-text mb-1">
        Your ticket is waiting on payment
      </h3>
      <p className="text-sm text-text-soft">
        This is a paid event. Your QR ticket appears as soon as the M-Pesa
        payment goes through.
      </p>
      <Link
        to={`/events/${event.id}`}
        className="inline-flex items-center justify-center mt-4 h-10 px-4 rounded-lg btn-gradient font-semibold text-white"
      >
        Complete the payment
      </Link>
    </div>
  );
}

function TicketModal({
  registration,
  onClose,
}: {
  registration: Registration;
  onClose: () => void;
}) {
  const event = registration.events;
  const needsApproval = event.requires_approval && registration.status !== "approved";

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-overlay flex items-center justify-center p-4 z-50"
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, y: 10, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 10, scale: 0.98 }}
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-sm"
      >
        <button
          onClick={onClose}
          aria-label="Close"
          className="flex items-center gap-1 text-sm text-text-on-dark/90 hover:text-text-on-dark mb-3"
        >
          <X className="w-4 h-4" />
          Close
        </button>

        {needsApproval ? (
          <div
            className={`bg-surface border rounded-xl shadow-lg p-6 text-center ${
              STATUS_CONFIG[registration.status].className
            }`}
          >
            {(() => {
              const StatusIcon = STATUS_CONFIG[registration.status].icon;
              return <StatusIcon className="w-8 h-8 mx-auto mb-3" />;
            })()}
            <h3 className="font-heading font-semibold text-text mb-1">
              {STATUS_CONFIG[registration.status].label}
            </h3>
            <p className="text-sm text-text-soft">
              {registration.status === "pending"
                ? "Your ticket will appear here once the organizer approves your registration."
                : registration.status === "waitlisted"
                ? "You're on the waitlist. Your ticket will appear here if a spot opens up."
                : "This registration wasn't approved for this event."}
            </p>
          </div>
        ) : event.is_paid ? (
          <PaidTicket registration={registration} />
        ) : (
          <TicketQR
            attendeeId={registration.id}
            eventId={event.id}
            eventName={event.name}
          />
        )}
      </motion.div>
    </motion.div>
  );
}

export default function MyEvents() {
  const { user } = useAuth();
  const userId = user?.id ?? null;
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selected, setSelected] = useState<Registration | null>(null);

  const [tab, setTab] = useState<Tab>("upcoming");
  const [search, setSearch] = useState("");
  const [location, setLocation] = useState("all");
  const [category, setCategory] = useState("all");
  const [rsvpFilter, setRsvpFilter] = useState<RsvpState | "all">("all");

  useEffect(() => {
    if (!userId) return;

    supabase
      .from("attendees")
      .select("*, events(*)")
      .eq("user_id", userId)
      .order("registered_at", { ascending: false })
      .then(({ data, error: dbError }) => {
        if (dbError) {
          setError(dbError.message);
        } else {
          setRegistrations((data ?? []) as Registration[]);
        }
        setLoading(false);
      });
  }, [userId]);

  const events = useMemo(
    () =>
      registrations
        .map((reg) => reg.events)
        .filter((event): event is Event => Boolean(event)),
    [registrations],
  );

  const locations = useMemo(() => locationsOf(events), [events]);
  const categories = useMemo(() => categoriesOf(events), [events]);
  const categoriesAvailable = useMemo(
    () => events.length > 0 && "category" in events[0],
    [events],
  );

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();

    return registrations.filter((reg) => {
      const event = reg.events;
      if (!event) return false;

      const period = eventPeriod(event);
      if (tab === "upcoming" && period === "past") return false;
      if (tab === "past" && period !== "past") return false;

      if (location !== "all" && event.venue_name !== location) return false;
      if (category !== "all" && event.category !== category) return false;

      if (rsvpFilter !== "all" && rsvpState(reg.status) !== rsvpFilter) {
        return false;
      }

      if (!q) return true;

      return (
        event.name.toLowerCase().includes(q) ||
        (event.venue_name || "").toLowerCase().includes(q) ||
        (event.category || "").toLowerCase().includes(q) ||
        reg.full_name.toLowerCase().includes(q)
      );
    });
  }, [registrations, tab, search, location, category, rsvpFilter]);

  const counts = useMemo(() => {
    const past = registrations.filter(
      (reg) => reg.events && eventPeriod(reg.events) === "past",
    ).length;
    return { upcoming: registrations.length - past, past, all: registrations.length };
  }, [registrations]);

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 pt-24 pb-16">
        <PageHeader
          eyebrow="Your tickets"
          icon={Ticket}
          title="My Events"
          subtitle="Tap an event to view your ticket QR code."
        />

        {loading && (
          <div className="flex items-center gap-2 text-text-soft text-sm">
            <Loader2 className="w-4 h-4 animate-spin" />
            Loading…
          </div>
        )}

        {error && (
          <div
            role="alert"
            className="flex items-start gap-2 p-3 rounded-lg border border-danger-border bg-danger-bg text-danger text-sm"
          >
            <TriangleAlert className="w-4 h-4 mt-0.5 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {!loading && !error && registrations.length === 0 && (
          <div className="text-center p-10 bg-surface border border-border rounded-xl shadow-sm">
            <span className="inline-flex w-12 h-12 rounded-2xl bg-brand-soft text-brand-strong grid place-items-center mb-4">
              <CalendarDays className="w-6 h-6" />
            </span>
            <p className="font-medium text-text">No registrations yet</p>
            <p className="text-sm text-text-soft mt-1 mb-5">
              Browse events and register to see them here.
            </p>
            <Link
              to="/events"
              className="inline-block px-4 py-2 text-sm font-semibold text-text-on-dark bg-linear-to-r from-brand to-tag-violet rounded-lg shadow-md shadow-shadow-brand/30 hover:brightness-110 transition-all"
            >
              Browse events
            </Link>
          </div>
        )}

        {registrations.length > 0 && (
          <>
            {/* Upcoming / Past / All */}
            <div
              role="tablist"
              aria-label="Event timeframe"
              className="flex bg-surface rounded-lg p-1 shadow-sm border border-border mb-4"
            >
              {TABS.map((entry) => (
                <button
                  key={entry.key}
                  role="tab"
                  aria-selected={tab === entry.key}
                  onClick={() => setTab(entry.key)}
                  className={`flex-1 px-4 py-2 text-sm font-medium rounded-md transition-colors outline-none focus-visible:ring-2 focus-visible:ring-focus ${
                    tab === entry.key
                      ? "bg-brand text-text-on-dark shadow-sm"
                      : "text-text-soft hover:text-text hover:bg-surface-muted"
                  }`}
                >
                  {entry.label}
                  <span className="ml-1.5 text-xs opacity-80">
                    {counts[entry.key]}
                  </span>
                </button>
              ))}
            </div>

            <div className="mb-4">
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
                searchPlaceholder="Search my events"
                onClear={() => {
                  setSearch("");
                  setLocation("all");
                  setCategory("all");
                  setRsvpFilter("all");
                }}
              >
                <div className="flex flex-wrap gap-1.5">
                  {RSVP_FILTERS.map((filter) => (
                    <button
                      key={filter.key}
                      type="button"
                      onClick={() => setRsvpFilter(filter.key)}
                      aria-pressed={rsvpFilter === filter.key}
                      className={`text-xs font-medium px-3 py-1.5 rounded-full border transition-colors ${
                        rsvpFilter === filter.key
                          ? "bg-brand text-text-on-dark border-brand"
                          : "bg-surface text-text-muted border-border hover:border-border-strong"
                      }`}
                    >
                      {filter.label}
                    </button>
                  ))}
                </div>
              </EventFilterBar>
            </div>

            {filtered.length === 0 && (
              <p className="text-sm text-text-soft text-center py-10 bg-surface-muted border border-border rounded-xl">
                No events match those filters.
              </p>
            )}

            <div className="flex flex-col gap-3">
              {filtered.map((reg) => {
                const status = STATUS_CONFIG[reg.status] ?? STATUS_CONFIG.pending;
                const StatusIcon = status.icon;
                const event = reg.events;
                if (!event) return null;

                const rsvp = rsvpState(reg.status);
                const period = eventPeriod(event);

                return (
                  <motion.button
                    key={reg.id}
                    type="button"
                    initial={{ opacity: 0, y: 12 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-30px" }}
                    transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
                    onClick={() => setSelected(reg)}
                    className="w-full text-left bg-surface border border-border rounded-xl shadow-sm p-4 hover:shadow-md hover:border-border-strong hover:-translate-y-0.5 transition-all"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <h3 className="font-heading font-semibold text-text truncate">
                          {event.name}
                        </h3>
                        <div className="flex flex-wrap gap-x-4 gap-y-1 mt-2 text-sm text-text-muted">
                          <span className="flex items-center gap-1.5">
                            <CalendarDays className="w-3.5 h-3.5 text-text-soft" />
                            {new Date(event.start_date).toLocaleDateString()}
                          </span>
                          {event.venue_name && (
                            <span className="flex items-center gap-1.5">
                              <MapPin className="w-3.5 h-3.5 text-text-soft" />
                              {event.venue_name}
                            </span>
                          )}
                          {event.category && (
                            <span className="flex items-center gap-1.5 text-tag-violet">
                              <Ticket className="w-3.5 h-3.5" />
                              {event.category}
                            </span>
                          )}
                          <span className="flex items-center gap-1.5">
                            <Clock className="w-3.5 h-3.5 text-text-soft" />
                            Registered{" "}
                            {new Date(reg.registered_at).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                      <div className="flex flex-col items-end gap-1.5 shrink-0">
                        <span
                          className={`shrink-0 inline-flex items-center gap-1 text-xs font-medium px-2.5 py-1 rounded-full border ${status.className}`}
                        >
                          <StatusIcon className="w-3.5 h-3.5" />
                          {status.label}
                        </span>
                        <span
                          className={`shrink-0 text-xs font-semibold px-2.5 py-1 rounded-full border ${RSVP_STYLES[rsvp]}`}
                        >
                          {RSVP_LABELS[rsvp]}
                        </span>
                        {period === "past" && (
                          <span className="text-[11px] font-medium text-text-soft">
                            Attended
                          </span>
                        )}
                      </div>
                    </div>
                  </motion.button>
                );
              })}
            </div>
          </>
        )}
      </div>

      <AnimatePresence>
        {selected && (
          <TicketModal registration={selected} onClose={() => setSelected(null)} />
        )}
      </AnimatePresence>
    </div>
  );
}

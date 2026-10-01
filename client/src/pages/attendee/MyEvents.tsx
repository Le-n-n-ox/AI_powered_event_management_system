import { useEffect, useState } from "react";
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
  X,
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { supabase } from "../../lib/supabase";
import TicketQR from "../../components/ui/TicketQR";
import type { Attendee, Event } from "../../types/event";

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
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selected, setSelected] = useState<Registration | null>(null);

  useEffect(() => {
    if (!user) return;

    supabase
      .from("attendees")
      .select("*, events(*)")
      .eq("user_id", user.id)
      .order("registered_at", { ascending: false })
      .then(({ data, error: dbError }) => {
        if (dbError) {
          setError(dbError.message);
        } else {
          setRegistrations((data ?? []) as Registration[]);
        }
        setLoading(false);
      });
  }, [user?.id]);

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 pt-24 pb-16">
        <h1 className="font-heading text-2xl sm:text-3xl font-bold text-text tracking-tight mb-1">
          My Events
        </h1>
        <p className="text-text-soft text-sm mb-6">
          Tap an event to view your ticket QR code.
        </p>

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
          <div className="text-center p-10 bg-surface-muted border border-border rounded-xl">
            <CalendarDays className="w-10 h-10 mx-auto mb-3 text-text-soft" />
            <p className="font-medium text-text">No registrations yet</p>
            <p className="text-sm text-text-soft mt-1 mb-4">
              Browse events and register to see them here.
            </p>
            <Link
              to="/events"
              className="inline-block px-4 py-2 text-sm font-medium text-text-on-dark bg-brand rounded-lg hover:bg-brand-hover transition-colors"
            >
              Browse events
            </Link>
          </div>
        )}

        <div className="flex flex-col gap-3">
          {registrations.map((reg) => {
            const status = STATUS_CONFIG[reg.status] ?? STATUS_CONFIG.pending;
            const StatusIcon = status.icon;
            const event = reg.events;
            if (!event) return null;

            return (
              <button
                key={reg.id}
                type="button"
                onClick={() => setSelected(reg)}
                className="w-full text-left bg-surface-muted border border-border rounded-xl shadow-sm p-4 hover:shadow-md hover:border-border-strong transition-all"
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
                      <span className="flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 text-text-soft" />
                        Registered {new Date(reg.registered_at).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                  <span
                    className={`shrink-0 inline-flex items-center gap-1 text-xs font-medium px-2.5 py-1 rounded-full border ${status.className}`}
                  >
                    <StatusIcon className="w-3.5 h-3.5" />
                    {status.label}
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      <AnimatePresence>
        {selected && (
          <TicketModal registration={selected} onClose={() => setSelected(null)} />
        )}
      </AnimatePresence>
    </div>
  );
}
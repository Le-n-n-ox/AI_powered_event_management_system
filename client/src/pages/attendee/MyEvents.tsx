import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
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
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { supabase } from "../../lib/supabase";
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

export default function MyEvents() {
  const { user } = useAuth();
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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
          Events you've registered for, and their approval status.
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
              <Link
                key={reg.id}
                to={`/events/${event.id}`}
                className="bg-surface-muted border border-border rounded-xl shadow-sm p-4 hover:shadow-md hover:border-border-strong transition-all"
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
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
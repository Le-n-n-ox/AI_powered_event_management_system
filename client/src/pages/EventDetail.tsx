// client/src/pages/EventDetail.tsx
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import {
  MapPin,
  CalendarDays,
  Clock,
  CircleCheck,
  Ban,
  CalendarX,
  ExternalLink,
} from "lucide-react";
import { supabase } from "../lib/supabase";
import RegistrationForm from "../components/ui/RegistrationForm";
import BackButton from "../components/layout/BackButton";
import type { Event } from "../types/event";

interface ScheduleItem {
  id: string;
  title: string;
  start_time: string;
  location?: string;
  speaker?: string;
  venue_map_url?: string;
}

const PILL = "text-xs font-semibold px-2.5 py-1 rounded-full border";
const FOCUS =
  "outline-none focus-visible:ring-2 focus-visible:ring-focus focus-visible:ring-offset-2 rounded";
const MAP_LINK = `inline-flex items-center gap-1 text-sm text-brand-strong hover:text-tag-violet font-semibold mt-1 transition-colors ${FOCUS}`;

export default function EventDetail() {
  const { id } = useParams<{ id: string }>();
  const [event, setEvent] = useState<Event | null>(null);
  const [attendeeCount, setAttendeeCount] = useState(0);
  const [scheduleItems, setScheduleItems] = useState<ScheduleItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [isRegistered, setIsRegistered] = useState(false);

  useEffect(() => {
    async function fetchEvent() {
      if (!id) return;

      const { data: eventData, error: eventError } = await supabase
        .from("events")
        .select("*")
        .eq("id", id)
        .single();

      if (eventError) {
        console.error("Error fetching event:", eventError);
      } else {
        setEvent(eventData);
      }

      const { data: count } = await supabase.rpc("attendee_count", { eid: id });
      setAttendeeCount(count ?? 0);

      const { data: scheduleData, error: scheduleError } = await supabase
        .from("schedule_items")
        .select("*")
        .eq("event_id", id)
        .order("start_time", { ascending: true });

      if (scheduleError) {
        console.error("Error fetching schedule:", scheduleError);
      } else if (scheduleData) {
        setScheduleItems(scheduleData);
      }

      setLoading(false);
    }

    fetchEvent();
  }, [id]);

  if (loading)
    return (
      <div className="min-h-screen bg-background">
        <div
          role="status"
          aria-busy="true"
          className="max-w-5xl mx-auto px-4 sm:px-6 md:px-10 pt-24 pb-12 grid md:grid-cols-2 gap-8 md:gap-12"
        >
          <span className="sr-only">Loading event details...</span>
          <div>
            <div className="skeleton h-4 w-28 mb-5" />
            <div className="skeleton h-10 w-3/4 mb-5" />
            <div className="skeleton h-56 w-full mb-4" />
            <div className="skeleton h-4 w-full mb-2" />
            <div className="skeleton h-4 w-5/6" />
          </div>
          <div className="skeleton h-80 w-full" />
        </div>
      </div>
    );

  if (!event)
    return (
      <div className="min-h-screen bg-background pt-32 text-center text-text-soft">
        Event not found.
      </div>
    );

  const isPast = new Date(event.end_date) < new Date();
  const spotsLeft = event.capacity ? event.capacity - attendeeCount : null;
  const isFull = spotsLeft !== null && spotsLeft <= 0;
  const mapUrl = event.venue_map_url ? String(event.venue_map_url) : null;
  const mapQuery = event.venue_address || event.venue_name;

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 md:px-10 pt-24 pb-12 grid md:grid-cols-2 gap-8 md:gap-12">
        {/* Left: Event Info */}
        <div>
          <BackButton
            fallbackTo="/events"
            label="Back to events"
            className="mb-4"
          />
          <h1 className="font-heading text-3xl sm:text-4xl font-bold text-text tracking-tight mb-4">
            {event.name}
          </h1>

          <div className="relative overflow-hidden bg-surface p-4 pt-5 rounded-xl mb-4 border border-border shadow-md shadow-shadow-soft">
            <div className="absolute top-0 left-0 w-full h-1.5 bg-linear-to-r from-brand via-tag-violet to-tag-teal" />
            <div className="flex items-start gap-2">
              <MapPin className="w-4 h-4 mt-0.5 text-tag-teal shrink-0" />
              <div>
                <p className="font-medium text-text">{event.venue_name}</p>
                <p className="text-sm text-text-soft">{event.venue_address}</p>
                {mapUrl && (
                  <a
                    href={mapUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={MAP_LINK}
                  >
                    View on Google Maps
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                )}
              </div>
            </div>

            {mapQuery && (
              <div className="mt-3 rounded-lg overflow-hidden border border-border">
                <iframe
                  title="Event location map"
                  width="100%"
                  height="220"
                  style={{ border: 0 }}
                  loading="lazy"
                  src={`https://www.google.com/maps?q=${encodeURIComponent(
                    mapQuery,
                  )}&output=embed`}
                />
              </div>
            )}

            <hr className="my-3 border-border" />
            <div className="flex items-center gap-2 font-medium text-text">
              <CalendarDays className="w-4 h-4 text-tag-violet shrink-0" />
              {new Date(event.start_date).toLocaleString()}
            </div>
          </div>

          <div className="flex flex-wrap gap-2 mb-6">
            {isPast ? (
              <span
                className={`${PILL} bg-surface-strong text-text-soft border-border`}
              >
                Ended
              </span>
            ) : (
              event.capacity != null && (
                <span
                  className={`${PILL} ${
                    isFull
                      ? "bg-danger-bg text-danger border-danger-border"
                      : "bg-info-bg text-info border-info-border"
                  }`}
                >
                  {isFull ? "Fully Booked" : `${spotsLeft} spots left`}
                </span>
              )
            )}
            {event.requires_approval && (
              <span
                className={`${PILL} bg-warning-bg text-warning border-warning-border`}
              >
                Approval Required
              </span>
            )}
            {event.is_paid ? (
              <span
                className={`${PILL} bg-success-bg text-success border-success-border`}
              >
                KES {event.ticket_price}
              </span>
            ) : (
              <span
                className={`${PILL} bg-tag-teal-bg text-tag-teal border-tag-teal/30`}
              >
                Free
              </span>
            )}
          </div>

          <p className="text-text-muted leading-relaxed whitespace-pre-wrap">
            {event.description}
          </p>

          {/* Schedule Section */}
          {scheduleItems.length > 0 && (
            <div className="mt-8">
              <h2 className="font-heading text-lg font-bold text-text mb-3 flex items-center gap-2.5">
                <span className="w-2.5 h-2.5 rounded-full bg-linear-to-br from-brand to-tag-teal" />
                Schedule
              </h2>
              <div className="flex flex-col gap-2">
                {scheduleItems.map((item) => (
                  <div
                    key={item.id}
                    className="border border-border border-l-4 border-l-brand rounded-lg p-3 bg-surface shadow-sm shadow-shadow-soft transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md hover:border-brand-border hover:border-l-tag-violet"
                  >
                    <p className="font-medium text-text text-sm">
                      {item.title}
                    </p>
                    <p className="flex items-center gap-1.5 text-xs text-text-soft mt-1">
                      <Clock className="w-3.5 h-3.5 shrink-0 text-tag-sky" />
                      <span>
                        {new Date(item.start_time).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                        {item.location && ` · ${item.location}`}
                        {item.speaker && ` · ${item.speaker}`}
                      </span>
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right: Registration */}
        <div className="md:sticky md:top-24 md:self-start">
          {isRegistered ? (
            <div
              role="status"
              className="bg-success-bg border border-success-border text-success p-8 rounded-xl text-center shadow-md shadow-shadow-soft"
            >
              <CircleCheck className="w-10 h-10 mx-auto mb-3" />
              <h3 className="font-heading text-2xl font-bold mb-2">
                {event.requires_approval
                  ? "Request submitted"
                  : "You're on the list!"}
              </h3>
              <p className="text-sm">
                {event.requires_approval
                  ? "The organizer will review your registration. You'll be notified once approved."
                  : "You can now interact with our AI Assistant via SMS using the phone number you provided."}
              </p>
            </div>
          ) : isPast ? (
            <div
              role="status"
              className="bg-surface-muted border border-border-strong text-text-muted p-8 rounded-xl text-center shadow-md shadow-shadow-soft"
            >
              <CalendarX className="w-10 h-10 mx-auto mb-3 text-text-soft" />
              <h3 className="font-heading text-xl font-bold text-text mb-2">
                This event has ended
              </h3>
              <p className="text-sm">
                Registration is closed because this event has already taken
                place.
              </p>
            </div>
          ) : isFull ? (
            <div
              role="status"
              className="bg-danger-bg border border-danger-border text-danger p-8 rounded-xl text-center shadow-md shadow-shadow-soft"
            >
              <Ban className="w-10 h-10 mx-auto mb-3" />
              <h3 className="font-heading text-xl font-bold mb-2">
                Event Full
              </h3>
              <p className="text-sm">
                This event has reached its capacity. Registration is closed.
              </p>
            </div>
          ) : (
            <RegistrationForm
              eventId={event.id}
              onSuccess={() => setIsRegistered(true)}
            />
          )}
        </div>
      </div>
    </div>
  );
}
// client/src/pages/EventDetail.tsx
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { motion } from "framer-motion";
import {
  MapPin,
  CalendarDays,
  Clock,
  Ban,
  CalendarX,
  ExternalLink,
  Sparkles,
  Lock,
} from "lucide-react";
import { supabase } from "../lib/supabase";
import { apiFetch, ApiError } from "../lib/api";
import RegistrationForm from "../components/ui/RegistrationForm";
import PaymentPrompt from "../components/ui/PaymentPrompt";
import TicketQR from "../components/ui/TicketQR";
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

interface Registration {
  id: string;
  phone: string;
  /** The event this registration belongs to — the page is reused between events. */
  eventId: string;
}

/** What the backend knows about an attendee's payment. */
interface AttendeePayment {
  paid: boolean;
  paymentStatus: string;
  amount: number | null;
  currency: string;
  paybill: string | null;
  receiptNumber: string | null;
  paidAt: string | null;
  transactionStatus: string | null;
  transactionId: string | null;
  paymentToken: string | null;
}

const PILL = "text-xs font-semibold px-2.5 py-1 rounded-full border";
const FOCUS =
  "outline-none focus-visible:ring-2 focus-visible:ring-focus focus-visible:ring-offset-2 rounded";
const MAP_LINK = `inline-flex items-center gap-1 text-sm text-brand-strong hover:text-tag-violet font-semibold mt-1 transition-colors ${FOCUS}`;

/**
 * The registration is kept per event, so a refresh does not lose the ticket.
 */
const REGISTRATION_KEY = "eventos:registration";

function readRegistration(eventId: string | undefined): Registration | null {
  if (!eventId) return null;

  try {
    const raw = localStorage.getItem(`${REGISTRATION_KEY}:${eventId}`);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (parsed?.id && parsed?.phone && parsed?.eventId === eventId) {
      return parsed as Registration;
    }
  } catch {
    // A corrupt entry is not worth crashing the page over.
  }

  return null;
}

function writeRegistration(
  eventId: string | undefined,
  value: Registration | null,
) {
  if (!eventId) return;

  try {
    const key = `${REGISTRATION_KEY}:${eventId}`;
    if (value) localStorage.setItem(key, JSON.stringify(value));
    else localStorage.removeItem(key);
  } catch {
    // Private browsing can refuse writes — the page still works without it.
  }
}

export default function EventDetail() {
  const { id } = useParams<{ id: string }>();
  const [event, setEvent] = useState<Event | null>(null);
  const [attendeeCount, setAttendeeCount] = useState(0);
  const [scheduleItems, setScheduleItems] = useState<ScheduleItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [registration, setRegistration] = useState<Registration | null>(null);
  const [paymentComplete, setPaymentComplete] = useState(false);
  const [pendingPayment, setPendingPayment] = useState<{
    transactionId: string;
    paymentToken: string;
  } | null>(null);

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

  // Restore the registration for this event, and drop everything belonging to
  // the previous one — the page is reused when moving between events. The
  // update is deferred a frame so it does not cascade a render out of the
  // effect.
  useEffect(() => {
    const frame = requestAnimationFrame(() => {
      setPaymentComplete(false);
      setPendingPayment(null);
      setRegistration(readRegistration(id));
    });

    return () => cancelAnimationFrame(frame);
  }, [id]);

  // Ask the backend where this attendee's payment stands. This is what
  // unlocks the ticket after a refresh, and it also picks a payment that is
  // still in flight back up.
  useEffect(() => {
    if (!registration) return;
    // A registration from another event must never unlock this one's ticket.
    if (registration.eventId !== id) return;

    const { id: attendeeId, phone } = registration;
    let cancelled = false;

    async function checkPayment() {
      try {
        const status = await apiFetch<AttendeePayment>(
          `/api/payments/attendee-status?attendeeId=${encodeURIComponent(
            attendeeId,
          )}&phone=${encodeURIComponent(phone)}`,
        );

        if (cancelled) return;

        if (status.paid) {
          setPaymentComplete(true);
          setPendingPayment(null);
          return;
        }

        // Only a payment still in flight is worth resuming — a failed one
        // should let the attendee start again.
        if (
          status.transactionStatus === "pending" &&
          status.transactionId &&
          status.paymentToken
        ) {
          setPendingPayment({
            transactionId: status.transactionId,
            paymentToken: status.paymentToken,
          });
        }
      } catch (err) {
        if (cancelled) return;

        // The server does not know this registration, so it is stale.
        if (err instanceof ApiError && err.status === 404) {
          writeRegistration(id, null);
          setRegistration(null);
        }
      }
    }

    void checkPayment();

    return () => {
      cancelled = true;
    };
  }, [registration, id]);

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
  // A free event is unlocked by registering; a paid one only by paying.
  const ticketUnlocked = !event.is_paid || paymentComplete;
  const mapUrl = event.venue_map_url ? String(event.venue_map_url) : null;
  const mapQuery = event.venue_address || event.venue_name;

  return (
    <div className="min-h-screen bg-background">
      {/* Hero band */}
      <div className="relative overflow-hidden border-b border-border bg-surface/40">
        <div className="absolute inset-0 bg-grid grid-fade opacity-60" aria-hidden />
        <div
          className="absolute -top-24 left-1/4 w-72 h-72 rounded-full bg-brand/20 blur-3xl"
          aria-hidden
        />
        <div
          className="absolute -top-16 right-1/4 w-64 h-64 rounded-full bg-tag-violet/15 blur-3xl"
          aria-hidden
        />

        <div className="relative max-w-5xl mx-auto px-4 sm:px-6 md:px-10 pt-10 pb-10">
          <BackButton
            fallbackTo="/events"
            label="Back to events"
            className="mb-5"
          />

          <motion.div
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
          >
            {event.category && (
              <span className="inline-flex items-center gap-1 text-xs font-semibold uppercase tracking-widest text-brand-strong bg-brand-soft border border-brand-border rounded-full px-3 py-1 mb-4">
                <Sparkles className="w-3.5 h-3.5" />
                {event.category}
              </span>
            )}

            <h1 className="font-heading text-3xl sm:text-5xl font-bold text-text tracking-tight mb-4 max-w-3xl">
              {event.name}
            </h1>

            <div className="flex flex-wrap gap-2">
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
              <span
                className={`${PILL} bg-surface-strong text-text-muted border-border`}
              >
                {attendeeCount} going
              </span>
            </div>
          </motion.div>

          <motion.div
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1], delay: 0.1 }}
            style={{ originX: 0 }}
            className="h-1 w-28 mt-6 rounded-full bg-linear-to-r from-brand via-tag-violet to-tag-teal"
          />
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 md:px-10 py-10 grid md:grid-cols-2 gap-8 md:gap-12">
        {/* Left: Event Info */}
        <div>
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1], delay: 0.1 }}
            className="relative overflow-hidden bg-surface p-4 pt-5 rounded-xl mb-5 border border-border shadow-md shadow-shadow-soft"
          >
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
          </motion.div>

          <motion.p
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1], delay: 0.18 }}
            className="text-text-muted leading-relaxed whitespace-pre-wrap"
          >
            {event.description}
          </motion.p>

          {/* Schedule Section */}
          {scheduleItems.length > 0 && (
            <div className="mt-8">
              <h2 className="font-heading text-lg font-bold text-text mb-3 flex items-center gap-2.5">
                <span className="w-2.5 h-2.5 rounded-full bg-linear-to-br from-brand to-tag-teal" />
                Schedule
              </h2>
              <div className="flex flex-col gap-2">
                {scheduleItems.map((item, index) => (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, x: -12 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true, margin: "-40px" }}
                    transition={{
                      duration: 0.35,
                      ease: [0.22, 1, 0.36, 1],
                      delay: index * 0.05,
                    }}
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
                  </motion.div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right: Registration */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1], delay: 0.12 }}
          className="md:sticky md:top-24 md:self-start"
        >
          {registration ? (
            <div className="flex flex-col gap-4">
              {event.is_paid && !paymentComplete && (
                <PaymentPrompt
                  attendeeId={registration.id}
                  phone={registration.phone}
                  amount={Number(event.ticket_price || 0)}
                  paybill={event.mpesa_accno}
                  resume={pendingPayment}
                  onPaid={() => {
                    setPaymentComplete(true);
                    setPendingPayment(null);
                  }}
                />
              )}

              {/* The ticket is the proof of entry, so it only appears once
                  the money has actually landed. */}
              {ticketUnlocked ? (
                <TicketQR
                  attendeeId={registration.id}
                  eventId={event.id}
                  eventName={event.name}
                />
              ) : (
                <div className="rounded-2xl border border-dashed border-border-strong bg-surface-muted/60 p-8 text-center">
                  <span className="inline-flex p-3 rounded-full bg-surface-strong text-text-soft mb-3">
                    <Lock className="w-6 h-6" />
                  </span>
                  <h3 className="font-heading text-lg font-bold text-text mb-1.5">
                    Your ticket is locked
                  </h3>
                  <p className="text-sm text-text-soft max-w-xs mx-auto">
                    Complete the M-Pesa payment and your QR ticket will appear
                    here straight away.
                  </p>
                </div>
              )}
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
              event={event}
              onSuccess={(attendeeId, phone) => {
                const saved = { id: attendeeId, phone, eventId: event.id };
                writeRegistration(event.id, saved);
                setRegistration(saved);
              }}
            />
          )}
        </motion.div>
      </div>
    </div>
  );
}
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import {
  Briefcase,
  Utensils,
  Check,
  Loader2,
  TriangleAlert,
  Users,
  Phone,
  Mail,
} from "lucide-react";
import { supabase } from "../lib/supabase";
import type { Attendee, Event } from "../types/event";
import BackButton from "../components/layout/BackButton";

type AttendeeStatus = Attendee["status"];
type PaymentStatus = Attendee["payment_status"];

interface StyleMap {
  [key: string]: string;
}

const STATUS_STYLES: StyleMap = {
  approved: "bg-success-bg text-success border-success-border",
  pending: "bg-warning-bg text-warning border-warning-border",
  waitlisted: "bg-info-bg text-info border-info-border",
  rejected: "bg-danger-bg text-danger border-danger-border",
};

const PAYMENT_STYLES: StyleMap = {
  paid: "bg-success-bg text-success border-success-border",
  refunded: "bg-info-bg text-info border-info-border",
  unpaid: "bg-surface-muted text-text-muted border-border",
};

const CHIP = "text-xs font-medium px-2.5 py-1 rounded-full";
const SELECT =
  "h-9 border rounded-lg px-2 text-base sm:text-sm font-medium cursor-pointer transition-colors focus:outline-none focus:ring-2 focus:ring-focus-soft disabled:opacity-60 disabled:cursor-not-allowed";
const TH = "px-4 py-3 font-semibold";
const FOCUS =
  "outline-none focus-visible:ring-2 focus-visible:ring-focus focus-visible:ring-offset-2";

export default function ManageAttendees() {
  const { id } = useParams<{ id: string }>();
  const [event, setEvent] = useState<Event | null>(null);
  const [attendees, setAttendees] = useState<Attendee[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pendingId, setPendingId] = useState<string | null>(null);

  useEffect(() => {
    async function fetchData() {
      if (!id) return;

      const { data: eventData } = await supabase
        .from("events")
        .select("*")
        .eq("id", id)
        .single();

      if (eventData) setEvent(eventData);

      const { data: attendeeData } = await supabase
        .from("attendees")
        .select("*")
        .eq("event_id", id)
        .order("registered_at", { ascending: true });

      if (attendeeData) setAttendees(attendeeData);

      setLoading(false);
    }

    fetchData();
  }, [id]);

  async function updateAttendee(
    attendeeId: string,
    patch: { status?: AttendeeStatus; payment_status?: PaymentStatus },
  ) {
    const previous = attendees.find((a) => a.id === attendeeId);
    if (!previous) return;

    setPendingId(attendeeId);
    setError(null);
    setAttendees((prev) =>
      prev.map((a) => (a.id === attendeeId ? { ...a, ...patch } : a)),
    );

    const { error: updateError } = await supabase
      .from("attendees")
      .update(patch)
      .eq("id", attendeeId);

    if (updateError) {
      console.error("Failed to update attendee:", updateError);
      setAttendees((prev) =>
        prev.map((a) => (a.id === attendeeId ? previous : a)),
      );
      setError("Couldn't save that change. Please try again.");
    }
    setPendingId(null);
  }

  if (loading)
    return (
      <div className="min-h-screen bg-background pt-32 flex justify-center text-text-soft">
        <div className="flex items-center gap-2">
          <Loader2 className="w-4 h-4 animate-spin" />
          Loading attendees...
        </div>
      </div>
    );

  if (!event)
    return (
      <div className="min-h-screen bg-background pt-32 px-4">
        <div
          role="alert"
          className="max-w-md mx-auto flex items-start gap-3 p-4 rounded-lg border border-danger-border bg-danger-bg text-danger text-sm"
        >
          <TriangleAlert className="w-4 h-4 mt-0.5 shrink-0" />
          <span>Event not found.</span>
        </div>
      </div>
    );

  const colCount = event.is_paid ? 6 : 5;

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 pt-24 pb-12">
        <div className="mb-6">
          <BackButton
            fallbackTo="/dashboard"
            label="Back to dashboard"
            className="mb-4"
          />
          <h1 className="font-heading text-2xl sm:text-3xl font-bold text-text tracking-tight mb-3">
            Manage attendees
            <span className="block sm:inline sm:ml-2 text-text-soft font-medium text-lg sm:text-2xl">
              {event.name}
            </span>
          </h1>
          <div className="flex flex-wrap gap-2">
            <span className={`${CHIP} bg-surface-strong text-text-muted`}>
              Capacity: {event.capacity || "Unlimited"}
            </span>
            <span
              className={`${CHIP} inline-flex items-center gap-1 bg-brand-soft text-brand-strong`}
            >
              <Users className="w-3 h-3" />
              {attendees.length} registered
            </span>
            {event.requires_approval && (
              <span className={`${CHIP} bg-warning-bg text-warning`}>
                Approval required
              </span>
            )}
            {event.is_paid && (
              <span className={`${CHIP} bg-success-bg text-success`}>
                KES {event.ticket_price}
              </span>
            )}
          </div>
        </div>

        {error && (
          <div
            role="alert"
            className="mb-4 flex items-start gap-2 p-3 rounded-lg border border-danger-border bg-danger-bg text-danger text-sm"
          >
            <TriangleAlert className="w-4 h-4 mt-0.5 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <div className="bg-surface rounded-xl shadow-sm border border-border overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[40rem] text-left text-sm">
              <thead className="bg-surface-muted border-b border-border text-text-soft uppercase text-xs tracking-wide">
                <tr>
                  <th scope="col" className={TH}>
                    Attendee
                  </th>
                  <th scope="col" className={TH}>
                    Contact
                  </th>
                  <th scope="col" className={`${TH} hidden md:table-cell`}>
                    Registered
                  </th>
                  <th scope="col" className={TH}>
                    Status
                  </th>
                  {event.is_paid && (
                    <th scope="col" className={TH}>
                      Payment
                    </th>
                  )}
                  <th scope="col" className={`${TH} text-right`}>
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {attendees.map((attendee) => {
                  const busy = pendingId === attendee.id;
                  const approved = attendee.status === "approved";
                  return (
                    <tr
                      key={attendee.id}
                      className="hover:bg-surface-muted transition-colors align-top"
                    >
                      <td className="px-4 py-3">
                        <p className="font-medium text-text">
                          {attendee.full_name}
                        </p>
                        {(attendee.organization || attendee.job_title) && (
                          <p className="flex items-center gap-1 text-xs text-text-soft mt-0.5">
                            <Briefcase className="w-3 h-3 shrink-0" />
                            {[attendee.job_title, attendee.organization]
                              .filter(Boolean)
                              .join(" · ")}
                          </p>
                        )}
                        {attendee.dietary_notes && (
                          <p className="flex items-start gap-1 text-xs text-warning mt-0.5">
                            <Utensils className="w-3 h-3 mt-0.5 shrink-0" />
                            {attendee.dietary_notes}
                          </p>
                        )}
                      </td>
                      <td className="px-4 py-3 text-text-muted">
                        <p className="flex items-center gap-1.5">
                          <Phone className="w-3 h-3 text-text-soft shrink-0" />
                          {attendee.phone_number}
                        </p>
                        {attendee.email && (
                          <p className="flex items-center gap-1.5 text-xs text-text-soft mt-0.5">
                            <Mail className="w-3 h-3 shrink-0" />
                            {attendee.email}
                          </p>
                        )}
                      </td>
                      <td className="px-4 py-3 text-text-muted whitespace-nowrap hidden md:table-cell">
                        {new Date(attendee.registered_at).toLocaleDateString()}
                      </td>
                      <td className="px-4 py-3">
                        <select
                          aria-label={`Status for ${attendee.full_name}`}
                          value={attendee.status}
                          disabled={busy}
                          onChange={(e) =>
                            updateAttendee(attendee.id, {
                              status: e.target.value as AttendeeStatus,
                            })
                          }
                          className={`${SELECT} ${STATUS_STYLES[attendee.status] ?? STATUS_STYLES.pending}`}
                        >
                          <option value="pending">Pending</option>
                          <option value="approved">Approved</option>
                          <option value="waitlisted">Waitlisted</option>
                          <option value="rejected">Rejected</option>
                        </select>
                      </td>
                      {event.is_paid && (
                        <td className="px-4 py-3">
                          <select
                            aria-label={`Payment for ${attendee.full_name}`}
                            value={attendee.payment_status}
                            disabled={busy}
                            onChange={(e) =>
                              updateAttendee(attendee.id, {
                                payment_status: e.target.value as PaymentStatus,
                              })
                            }
                            className={`${SELECT} ${PAYMENT_STYLES[attendee.payment_status] ?? PAYMENT_STYLES.unpaid}`}
                          >
                            <option value="unpaid">Unpaid</option>
                            <option value="paid">Paid</option>
                            <option value="refunded">Refunded</option>
                          </select>
                        </td>
                      )}
                      <td className="px-4 py-3 text-right">
                        <button
                          type="button"
                          onClick={() =>
                            updateAttendee(attendee.id, { status: "approved" })
                          }
                          disabled={approved || busy}
                          className={`inline-flex items-center justify-center gap-1 h-9 px-3 rounded-lg text-sm font-medium text-brand bg-brand-soft hover:bg-surface-alt disabled:opacity-40 disabled:cursor-not-allowed transition-colors ${FOCUS}`}
                        >
                          {busy ? (
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          ) : (
                            <Check className="w-3.5 h-3.5" />
                          )}
                          {approved ? "Approved" : "Approve"}
                        </button>
                      </td>
                    </tr>
                  );
                })}
                {attendees.length === 0 && (
                  <tr>
                    <td colSpan={colCount} className="px-6 py-12 text-center">
                      <div className="flex flex-col items-center text-text-soft">
                        <div className="p-3 rounded-lg bg-brand-soft text-brand mb-3">
                          <Users className="w-6 h-6" />
                        </div>
                        <p className="font-medium text-text">
                          No attendees yet
                        </p>
                        <p className="text-sm mt-1">
                          Share the registration link to start collecting
                          sign-ups.
                        </p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

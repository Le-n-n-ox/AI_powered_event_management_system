import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Briefcase, Utensils, Check } from "lucide-react";
import { supabase } from "../lib/supabase";
import type { Attendee, Event } from "../types/event";

export default function ManageAttendees() {
  const { id } = useParams<{ id: string }>();
  const [event, setEvent] = useState<Event | null>(null);
  const [attendees, setAttendees] = useState<Attendee[]>([]);
  const [loading, setLoading] = useState(true);

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

  const updateAttendeeStatus = async (
    attendeeId: string,
    newStatus: string,
  ) => {
    setAttendees(
      attendees.map((a) =>
        a.id === attendeeId ? { ...a, status: newStatus as any } : a,
      ),
    );

    const { error } = await supabase
      .from("attendees")
      .update({ status: newStatus })
      .eq("id", attendeeId);

    if (error) {
      console.error("Failed to update status:", error);
    }
  };

  const updatePaymentStatus = async (attendeeId: string, newStatus: string) => {
    setAttendees(
      attendees.map((a) =>
        a.id === attendeeId ? { ...a, payment_status: newStatus as any } : a,
      ),
    );

    await supabase
      .from("attendees")
      .update({ payment_status: newStatus })
      .eq("id", attendeeId);
  };

  if (loading)
    return (
      <div className="p-10 text-center text-[var(--color-text-muted)]">
        Loading attendees...
      </div>
    );
  if (!event)
    return (
      <div className="p-10 text-center text-[var(--color-danger)]">
        Event not found.
      </div>
    );

  const statusStyles: Record<string, string> = {
    approved:
      "bg-[var(--color-success-bg)] text-[var(--color-success)] border-[var(--color-success-border)]",
    pending:
      "bg-[var(--color-warning-bg)] text-[var(--color-warning)] border-[var(--color-warning-border)]",
    waitlisted:
      "bg-[var(--color-info-bg)] text-[var(--color-info)] border-[var(--color-info-border)]",
    rejected:
      "bg-[var(--color-danger-bg)] text-[var(--color-danger)] border-[var(--color-danger-border)]",
  };

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="mb-6">
        <h1 className="font-heading text-2xl font-bold text-[var(--color-text)] mb-2">
          Manage Attendees: {event.name}
        </h1>
        <div className="flex flex-wrap gap-2">
          <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-[var(--color-surface-muted)] text-[var(--color-text-muted)]">
            Capacity: {event.capacity || "Unlimited"}
          </span>
          <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-[var(--color-surface-muted)] text-[var(--color-text-muted)]">
            {attendees.length} registered
          </span>
          {event.requires_approval && (
            <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-[var(--color-warning-bg)] text-[var(--color-warning)]">
              Approval Required
            </span>
          )}
          {event.is_paid && (
            <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-[var(--color-success-bg)] text-[var(--color-success)]">
              KES {event.ticket_price}
            </span>
          )}
        </div>
      </div>

      <div className="bg-[var(--color-surface)] rounded-xl shadow-sm border border-[var(--color-border)] overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="bg-[var(--color-surface-muted)] border-b border-[var(--color-border)]">
            <tr>
              <th className="p-4 font-semibold text-[var(--color-text-muted)]">
                Attendee
              </th>
              <th className="p-4 font-semibold text-[var(--color-text-muted)]">
                Contact
              </th>
              <th className="p-4 font-semibold text-[var(--color-text-muted)]">
                Registered
              </th>
              <th className="p-4 font-semibold text-[var(--color-text-muted)]">
                Status
              </th>
              {event.is_paid && (
                <th className="p-4 font-semibold text-[var(--color-text-muted)]">
                  Payment
                </th>
              )}
              <th className="p-4 font-semibold text-[var(--color-text-muted)] text-right">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--color-border)]">
            {attendees.map((attendee) => (
              <tr
                key={attendee.id}
                className="hover:bg-[var(--color-surface-muted)] transition-colors"
              >
                <td className="p-4">
                  <p className="font-medium text-[var(--color-text)]">
                    {attendee.full_name}
                  </p>
                  {(attendee.organization || attendee.job_title) && (
                    <p className="flex items-center gap-1 text-xs text-[var(--color-text-soft)] mt-0.5">
                      <Briefcase className="w-3 h-3" />
                      {[attendee.job_title, attendee.organization]
                        .filter(Boolean)
                        .join(" · ")}
                    </p>
                  )}
                  {attendee.dietary_notes && (
                    <p className="flex items-center gap-1 text-xs text-[var(--color-warning)] mt-0.5">
                      <Utensils className="w-3 h-3" />
                      {attendee.dietary_notes}
                    </p>
                  )}
                </td>
                <td className="p-4 text-[var(--color-text-muted)]">
                  {attendee.phone_number}
                  <br />
                  <span className="text-xs text-[var(--color-text-soft)]">
                    {attendee.email}
                  </span>
                </td>
                <td className="p-4 text-[var(--color-text-muted)]">
                  {new Date(attendee.registered_at).toLocaleDateString()}
                </td>
                <td className="p-4">
                  <select
                    value={attendee.status}
                    onChange={(e) =>
                      updateAttendeeStatus(attendee.id, e.target.value)
                    }
                    className={`border rounded-lg px-2 py-1.5 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[var(--color-focus)] ${statusStyles[attendee.status]}`}
                  >
                    <option value="pending">Pending</option>
                    <option value="approved">Approved</option>
                    <option value="waitlisted">Waitlisted</option>
                    <option value="rejected">Rejected</option>
                  </select>
                </td>
                {event.is_paid && (
                  <td className="p-4">
                    <select
                      value={attendee.payment_status}
                      onChange={(e) =>
                        updatePaymentStatus(attendee.id, e.target.value)
                      }
                      className={`border rounded-lg px-2 py-1.5 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[var(--color-focus)] ${
                        attendee.payment_status === "paid"
                          ? "bg-[var(--color-success-bg)] text-[var(--color-success)] border-[var(--color-success-border)]"
                          : "bg-[var(--color-surface-muted)] text-[var(--color-text-muted)] border-[var(--color-border)]"
                      }`}
                    >
                      <option value="unpaid">Unpaid</option>
                      <option value="paid">Paid</option>
                      <option value="refunded">Refunded</option>
                    </select>
                  </td>
                )}
                <td className="p-4 text-right">
                  <button
                    onClick={() =>
                      updateAttendeeStatus(attendee.id, "approved")
                    }
                    disabled={attendee.status === "approved"}
                    className="inline-flex items-center gap-1 text-[var(--color-brand)] hover:text-[var(--color-brand-hover)] font-medium disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    <Check className="w-3.5 h-3.5" />
                    Approve
                  </button>
                </td>
              </tr>
            ))}
            {attendees.length === 0 && (
              <tr>
                <td
                  colSpan={6}
                  className="p-10 text-center text-[var(--color-text-muted)]"
                >
                  No attendees registered yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

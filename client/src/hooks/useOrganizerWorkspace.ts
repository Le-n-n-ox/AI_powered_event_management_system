import { useCallback, useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import { useAuth } from "../context/auth-context";
import { fetchEvents } from "../lib/events";
import type {
  Attendee,
  Event,
  PaymentMethod,
  TransactionStatus,
} from "../types/event";

/**
 * One row in the payment ledger, whether it came from the `transactions`
 * table or was derived from attendee payment statuses.
 */
export interface LedgerEntry {
  id: string;
  event_id: string;
  attendee_id: string | null;
  attendee_name: string;
  amount: number;
  currency: string;
  status: TransactionStatus;
  method: PaymentMethod;
  phone_number: string | null;
  payer_name: string | null;
  receipt_number: string | null;
  provider_reference: string | null;
  paid_at: string | null;
  created_at: string;
  /** True when the row was derived from attendees rather than a real payment. */
  derived: boolean;
}

export type LedgerSource = "ledger" | "attendees";

/**
 * Attendees record payment as "unpaid" | "paid" | "refunded"; the ledger
 * speaks "pending" | "paid" | "failed" | "refunded" | "cancelled".
 */
function toLedgerStatus(
  paymentStatus: Attendee["payment_status"] | string | null,
): TransactionStatus {
  switch (paymentStatus) {
    case "paid":
      return "paid";
    case "refunded":
      return "refunded";
    case "failed":
      return "failed";
    default:
      return "pending";
  }
}

function isMissingTableError(error: { code?: string; message?: string }) {
  if (!error) return false;
  if (error.code === "42P01" || error.code === "PGRST205") return true;
  return /relation .* does not exist|table .* does not exist/i.test(
    error.message || "",
  );
}

/**
 * Loads everything the organizer workspace needs: their events, the attendees
 * on those events, and the payment ledger.
 *
 * The ledger degrades gracefully — before migration 002 lands there is no
 * `transactions` table, so payments are derived from each attendee's
 * `payment_status` and the event's ticket price instead.
 */
export function useOrganizerWorkspace() {
  const auth = useAuth();
  const isAdmin = auth.isAdmin;
  const userId = auth.user?.id ?? null;

  const [events, setEvents] = useState<Event[]>([]);
  const [attendees, setAttendees] = useState<Attendee[]>([]);
  const [entries, setEntries] = useState<LedgerEntry[]>([]);
  const [ledgerSource, setLedgerSource] = useState<LedgerSource>("attendees");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!userId) {
      setEvents([]);
      setAttendees([]);
      setEntries([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Admins see the whole platform; organizers see their own events.
      const { events: loadedEvents } = await fetchEvents(
        isAdmin ? {} : { organizerId: userId },
      );
      setEvents(loadedEvents);

      const eventIds = loadedEvents.map((event) => event.id);

      if (eventIds.length === 0) {
        setAttendees([]);
        setEntries([]);
        setLoading(false);
        return;
      }

      const { data: attendeeRows, error: attendeeError } = await supabase
        .from("attendees")
        .select("*")
        .in("event_id", eventIds);

      if (attendeeError) throw attendeeError;

      const attendeeList = (attendeeRows ?? []) as Attendee[];
      setAttendees(attendeeList);

      const eventById = new Map(
        loadedEvents.map((e) => [e.id, e] as const),
      );

      // Prefer the real ledger; fall back to attendee payment statuses.
      const { data: transactionRows, error: transactionError } = await supabase
        .from("transactions")
        .select("*")
        .in("event_id", eventIds)
        .order("created_at", { ascending: false });

      if (!transactionError && transactionRows) {
        const nameById = new Map(
          attendeeList.map((a) => [a.id, a.full_name] as const),
        );
        setLedgerSource("ledger");
        setEntries(
          (transactionRows as LedgerEntry[]).map((row) => ({
            ...row,
            amount: Number(row.amount),
            attendee_name:
              (row.attendee_id && nameById.get(row.attendee_id)) ||
              row.payer_name ||
              "Unknown attendee",
            phone_number: row.phone_number ?? null,
            payer_name: row.payer_name ?? null,
            currency: row.currency || "KES",
            method: row.method || "mpesa",
            provider_reference: row.provider_reference ?? null,
            receipt_number: row.receipt_number ?? null,
            paid_at: row.paid_at ?? null,
            created_at: row.created_at,
            derived: false,
            attendee_id: row.attendee_id ?? null,
            event_id: row.event_id,
          })),
        );
      } else if (transactionError && !isMissingTableError(transactionError)) {
        // A real failure (not just a missing table) is worth surfacing.
        throw transactionError;
      } else {
        setLedgerSource("attendees");
        setEntries(
          attendeeList
            .filter((attendee) => {
              const event = eventById.get(attendee.event_id);
              return event?.is_paid;
            })
            .map((attendee) => {
              const event = eventById.get(attendee.event_id);
              return {
                id: `attendee-${attendee.id}`,
                event_id: attendee.event_id,
                attendee_id: attendee.id,
                attendee_name: attendee.full_name,
                amount: Number(event?.ticket_price ?? 0),
                currency: "KES",
                // An attendee's payment status uses "unpaid"; the ledger uses
                // "pending" for the same thing.
                status: toLedgerStatus(attendee.payment_status),
                method: "mpesa" as PaymentMethod,
                phone_number: attendee.phone_number,
                payer_name: null,
                receipt_number: null,
                provider_reference: null,
                paid_at:
                  attendee.payment_status === "paid"
                    ? attendee.registered_at
                    : null,
                created_at: attendee.registered_at,
                derived: true,
              };
            }),
        );
      }

      setLoading(false);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Could not load your events.",
      );
      setLoading(false);
    }
  }, [userId, isAdmin]);

  useEffect(() => {
    let cancelled = false;

    async function initialLoad() {
      // Yield first: the effect itself must not set state synchronously.
      await Promise.resolve();
      if (cancelled) return;
      await load();
    }

    void initialLoad();

    return () => {
      cancelled = true;
    };
  }, [load]);

  return {
    events,
    attendees,
    entries,
    ledgerSource,
    loading,
    error,
    refresh: load,
  };
}

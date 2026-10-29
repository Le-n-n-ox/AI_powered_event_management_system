import { supabase } from "./supabase";
import type { Attendee, Event, RsvpState } from "../types/event";

/**
 * Niches an event can be filed under. Stored as free text in the database,
 * so organizers can type their own — this list is what the form offers and
 * what the filter bar suggests.
 */
export const EVENT_CATEGORIES = [
  "Technology",
  "Business & Startups",
  "Health & Wellness",
  "Arts & Culture",
  "Sports & Fitness",
  "Education",
  "Finance & Investing",
  "Networking",
  "Music",
  "Food & Drink",
  "Community & Charity",
  "Career & Jobs",
  "Other",
] as const;

/** Where an event sits relative to now. */
export type EventPeriod = "upcoming" | "ongoing" | "past" | "cancelled";

export function eventPeriod(event: Event): EventPeriod {
  if (event.status === "cancelled") return "cancelled";

  const now = Date.now();
  const start = new Date(event.start_date).getTime();
  const end = new Date(event.end_date).getTime();

  if (now < start) return "upcoming";
  if (now <= end) return "ongoing";
  return "past";
}

export function isPastEvent(event: Event): boolean {
  return eventPeriod(event) === "past";
}

/**
 * True when the database is missing the `category` column (migration 001
 * has not been applied yet). Callers fall back to a plain `select *`.
 */
export function isMissingColumnError(error: { code?: string; message?: string }) {
  if (!error) return false;
  if (error.code === "42703" || error.code === "PGRST204") return true;
  return /column .* does not exist|could not find column/i.test(
    error.message || "",
  );
}

/**
 * The name of the column a "missing column" error is complaining about.
 *
 * Postgres says `column "x" of relation "events" does not exist`; PostgREST
 * says `column events.x does not exist`. Returns null for any other error.
 */
export function missingColumnName(error: {
  code?: string;
  message?: string;
}): string | null {
  if (!isMissingColumnError(error)) return null;

  const message = error.message || "";

  const quoted = message.match(/column "([^"]+)" of relation/i);
  if (quoted) return quoted[1];

  const dotted = message.match(/column\s+[\w.]+\.([\w]+)\s+does not exist/i);
  if (dotted) return dotted[1];

  return null;
}

/**
 * Reads events, including the `category` column when the database has it.
 *
 * `select *` returns whatever columns the table actually has, so the niche
 * rides along for free once migration 001 lands. `categoriesAvailable` tells
 * the UI whether to offer the niche filter at all.
 */
export async function fetchEvents(
  options: { organizerId?: string } = {},
): Promise<{ events: Event[]; categoriesAvailable: boolean }> {
  let query = supabase.from("events").select("*");
  if (options.organizerId) {
    query = query.eq("organizer_id", options.organizerId);
  }

  const { data, error } = await query.order("start_date", { ascending: true });

  if (error) throw error;

  const rows = (data ?? []) as Event[];
  return {
    events: rows,
    categoriesAvailable: rows.length ? "category" in rows[0] : true,
  };
}

/** Reads every event on the platform, including the niche when available. */
export async function fetchAllEvents(): Promise<{
  events: Event[];
  categoriesAvailable: boolean;
}> {
  return fetchEvents();
}

/** Maps an attendee's registration status onto what the card should say. */
export function rsvpState(status: Attendee["status"]): RsvpState {
  switch (status) {
    case "approved":
      return "going";
    case "pending":
      return "pending";
    case "waitlisted":
      return "waitlisted";
    case "rejected":
    default:
      return "cancelled";
  }
}

export const RSVP_LABELS: Record<RsvpState, string> = {
  going: "Going",
  pending: "Pending",
  waitlisted: "Waitlisted",
  cancelled: "Cancelled",
};

export const RSVP_STYLES: Record<RsvpState, string> = {
  going: "bg-success-bg text-success border-success-border",
  pending: "bg-warning-bg text-warning border-warning-border",
  waitlisted: "bg-info-bg text-info border-info-border",
  cancelled: "bg-danger-bg text-danger border-danger-border",
};

/** Distinct locations across a set of events, for the location filter. */
export function locationsOf(events: Event[]): string[] {
  const seen = new Map<string, string>();

  for (const event of events) {
    const name = event.venue_name?.trim();
    if (name && !seen.has(name.toLowerCase())) {
      seen.set(name.toLowerCase(), name);
    }
  }

  return [...seen.values()].sort((a, b) => a.localeCompare(b));
}

/** Distinct niches across a set of events, for the niche filter. */
export function categoriesOf(events: Event[]): string[] {
  const seen = new Map<string, string>();

  for (const event of events) {
    const name = event.category?.trim();
    if (name && !seen.has(name.toLowerCase())) {
      seen.set(name.toLowerCase(), name);
    }
  }

  return [...seen.values()].sort((a, b) => a.localeCompare(b));
}

/** Formats a Kenyan-shilling amount. */
export function formatMoney(amount: number, currency = "KES") {
  return `${currency} ${amount.toLocaleString("en-KE", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  })}`;
}

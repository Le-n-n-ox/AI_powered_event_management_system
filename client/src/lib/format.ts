/**
 * Every date, time and money string in the app goes through here.
 *
 * The backend pins `en-KE` and `Africa/Nairobi` (see server/index.js EVENT_TZ).
 * The browser's own locale and timezone are whatever the visitor happens to
 * have, so without this module a Nairobi event renders as "4/12/2026, 2:30 AM"
 * for a visitor in Los Angeles and as "12/04/2026" for one in London. Same
 * event, two different days. We pin both.
 */

export const LOCALE = "en-KE";
export const TIME_ZONE = "Africa/Nairobi";
export const CURRENCY = "KES";

function toDate(value: string | Date | null | undefined): Date | null {
  if (!value) return null;
  const date = value instanceof Date ? value : new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

/** "Sat, 12 Apr 2026" */
export function formatDate(value: string | Date | null | undefined): string {
  const date = toDate(value);
  if (!date) return "—";
  return new Intl.DateTimeFormat(LOCALE, {
    weekday: "short",
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: TIME_ZONE,
  }).format(date);
}

/** "12 Apr" — or "12 Apr 2026" when the year differs from now. */
export function formatDateShort(value: string | Date | null | undefined): string {
  const date = toDate(value);
  if (!date) return "—";
  const now = new Date();
  const sameYear = new Intl.DateTimeFormat("en", {
    year: "numeric",
    timeZone: TIME_ZONE,
  }).format(date) === new Intl.DateTimeFormat("en", {
    year: "numeric",
    timeZone: TIME_ZONE,
  }).format(now);
  return new Intl.DateTimeFormat(LOCALE, {
    day: "numeric",
    month: "short",
    ...(sameYear ? {} : { year: "numeric" }),
    timeZone: TIME_ZONE,
  }).format(date);
}

/** "09:30" */
export function formatTime(value: string | Date | null | undefined): string {
  const date = toDate(value);
  if (!date) return "—";
  return new Intl.DateTimeFormat(LOCALE, {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
    timeZone: TIME_ZONE,
  }).format(date);
}

/** "Sat, 12 Apr 2026 · 09:30" */
export function formatDateTime(value: string | Date | null | undefined): string {
  const date = toDate(value);
  if (!date) return "—";
  return `${formatDate(date)} · ${formatTime(date)}`;
}

/** "09:30 – 11:00". Falls back to a single time when the end is missing. */
export function formatTimeRange(
  start: string | Date | null | undefined,
  end?: string | Date | null,
): string {
  const from = formatTime(start);
  const to = end ? formatTime(end) : null;
  return to && to !== "—" ? `${from} – ${to}` : from;
}

/** "KES 1,500" */
export function formatMoney(amount: number | string | null | undefined): string {
  const value = typeof amount === "string" ? Number(amount) : amount;
  if (value === null || value === undefined || Number.isNaN(value)) return "—";
  return new Intl.NumberFormat(LOCALE, {
    style: "currency",
    currency: CURRENCY,
    maximumFractionDigits: value % 1 === 0 ? 0 : 2,
  }).format(value);
}

/** "1,248" */
export function formatNumber(value: number | null | undefined): string {
  if (value === null || value === undefined || Number.isNaN(value)) return "—";
  return new Intl.NumberFormat(LOCALE).format(value);
}

/** Whole days between today (Nairobi) and the target date. */
export function daysUntil(value: string | Date | null | undefined): number | null {
  const date = toDate(value);
  if (!date) return null;
  const target = startOfDayNairobi(date);
  const today = startOfDayNairobi(new Date());
  return Math.round((target.getTime() - today.getTime()) / 86_400_000);
}

function startOfDayNairobi(date: Date): Date {
  // en-KE with a numeric dateStyle gives us the Nairobi calendar day, which we
  // then anchor to UTC midnight so day arithmetic never drifts by a timezone.
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: TIME_ZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(date);
  return new Date(`${parts}T00:00:00Z`);
}

/**
 * "Today", "Tomorrow", "Sat 12 Apr" — a human day label for agenda headings.
 */
export function formatDayLabel(value: string | Date | null | undefined): string {
  const days = daysUntil(value);
  if (days === null) return "—";
  if (days === 0) return "Today";
  if (days === 1) return "Tomorrow";
  if (days === -1) return "Yesterday";
  return formatDateShort(value);
}

/**
 * A short, human countdown: "in 3 days", "in 4 hrs", "in 20 min", "Live now",
 * "Ended". Used on cards so people can scan urgency at a glance.
 */
export function formatCountdown(value: string | Date | null | undefined): string {
  const date = toDate(value);
  if (!date) return "—";

  const diffMs = date.getTime() - Date.now();
  if (diffMs <= 0) return "Started";

  const minutes = Math.floor(diffMs / 60_000);
  if (minutes < 60) return `in ${minutes} min${minutes === 1 ? "" : "s"}`;

  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `in ${hours} hr${hours === 1 ? "" : "s"}`;

  const days = Math.floor(hours / 24);
  if (days < 7) return `in ${days} day${days === 1 ? "" : "s"}`;

  return formatDateShort(date);
}

/** "2 hours ago", "just now" — for registration and activity timestamps. */
export function formatRelativeTime(value: string | Date | null | undefined): string {
  const date = toDate(value);
  if (!date) return "—";

  const diffMs = Date.now() - date.getTime();
  const abs = Math.abs(diffMs);
  const formatter = new Intl.RelativeTimeFormat(LOCALE, { numeric: "auto" });

  if (abs < 60_000) return "just now";
  if (abs < 3_600_000) return formatter.format(-Math.round(diffMs / 60_000), "minute");
  if (abs < 86_400_000) return formatter.format(-Math.round(diffMs / 3_600_000), "hour");
  if (abs < 2_592_000_000) return formatter.format(-Math.round(diffMs / 86_400_000), "day");
  return formatDate(date);
}

/** "9:30 AM" for a duration-style label that a human reads quickly. */
export function formatTime12Hour(value: string | Date | null | undefined): string {
  const date = toDate(value);
  if (!date) return "—";
  return new Intl.DateTimeFormat(LOCALE, {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
    timeZone: TIME_ZONE,
  }).format(date);
}

/** Human pluralisation: pluralise(1, "session") -> "1 session". */
export function pluralise(count: number, singular: string, plural?: string): string {
  const word = count === 1 ? singular : (plural ?? `${singular}s`);
  return `${formatNumber(count)} ${word}`;
}

/** Initials for an avatar: "Jane Doe" -> "JD", "Cher" -> "CH". */
export function initials(name: string | null | undefined): string {
  const source = (name ?? "").trim();
  if (!source) return "?";
  const parts = source.split(/\s+/);
  if (parts.length > 1) {
    return (parts[0][0] + parts[1][0]).toUpperCase();
  }
  return source.slice(0, 2).toUpperCase();
}

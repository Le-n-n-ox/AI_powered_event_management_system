const pad = (n: number) => String(n).padStart(2, "0");

/** ISO string -> value for <input type="datetime-local"> (local time) */
export function toDatetimeLocal(iso: string): string {
  const d = new Date(iso);
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(
    d.getHours(),
  )}:${pad(d.getMinutes())}`;
}

/** True when a session sits fully inside the event's start/end. */
export function isWithinWindow(
  start: string,
  end: string,
  eventStart: string,
  eventEnd: string,
): boolean {
  const s = new Date(start).getTime();
  const e = new Date(end).getTime();
  return (
    s >= new Date(eventStart).getTime() && e <= new Date(eventEnd).getTime()
  );
}

/** Returns an error message, or null if the times are valid. */
export function validateSessionTimes(
  start: string,
  end: string,
  eventStart: string,
  eventEnd: string,
): string | null {
  const s = new Date(start).getTime();
  const e = new Date(end).getTime();
  if (Number.isNaN(s) || Number.isNaN(e)) return "Enter a valid start and end time.";
  if (e <= s) return "End time must be after the start time.";

  const fmt: Intl.DateTimeFormatOptions = { dateStyle: "medium", timeStyle: "short" };
  const from = new Date(eventStart).toLocaleString([], fmt);
  const to = new Date(eventEnd).toLocaleString([], fmt);
  if (s < new Date(eventStart).getTime() || e > new Date(eventEnd).getTime())
    return `Sessions must fall within the event: ${from} – ${to}.`;
  return null;
}
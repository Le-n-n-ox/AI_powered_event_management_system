import { useCallback, useEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import { Html5Qrcode } from "html5-qrcode";
import {
  CheckCircle2,
  XCircle,
  ScanLine,
  Search,
  Loader2,
  Undo2,
  UsersRound,
  Hourglass,
  ListPlus,
} from "lucide-react";
import { supabase } from "../lib/supabase";
import type { Attendee, Event } from "../types/event";
import BackButton from "../components/layout/BackButton";
import AppShell from "../components/layout/AppShell";
import { eventNav } from "../components/layout/navItems";

const SCANNER_ID = "qr-reader";

type ScanResult = { kind: "success" | "error"; message: string } | null;

const STATUS_STYLES: Record<Attendee["status"], string> = {
  approved: "bg-success-bg text-success border-success-border",
  pending: "bg-warning-bg text-warning border-warning-border",
  waitlisted: "bg-info-bg text-info border-info-border",
  rejected: "bg-danger-bg text-danger border-danger-border",
};

const STATUS_ICONS = {
  approved: CheckCircle2,
  pending: Hourglass,
  waitlisted: ListPlus,
  rejected: XCircle,
};

export default function CheckIn() {
  const { id } = useParams<{ id: string }>();
  const [event, setEvent] = useState<Event | null>(null);
  const [attendees, setAttendees] = useState<Attendee[]>([]);
  const [scanning, setScanning] = useState(false);
  const [result, setResult] = useState<ScanResult>(null);
  const [manualQuery, setManualQuery] = useState("");
  const [manualResults, setManualResults] = useState<Attendee[]>([]);
  const [searching, setSearching] = useState(false);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [recent, setRecent] = useState<{ name: string; at: string }[]>([]);
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const processingRef = useRef(false);

  const loadAttendees = useCallback(async () => {
    if (!id) return;
    const { data } = await supabase
      .from("attendees")
      .select("*")
      .eq("event_id", id)
      .order("registered_at", { ascending: true });
    setAttendees((data ?? []) as Attendee[]);
  }, [id]);

  useEffect(() => {
    if (!id) return;

    let cancelled = false;

    async function load() {
      // Yield first so the effect never sets state synchronously.
      await Promise.resolve();
      if (cancelled) return;

      const { data } = await supabase
        .from("events")
        .select("*")
        .eq("id", id)
        .single();

      if (cancelled) return;
      if (data) setEvent(data);

      await loadAttendees();
    }

    void load();

    return () => {
      cancelled = true;
    };
  }, [id, loadAttendees]);

  useEffect(() => {
    return () => {
      scannerRef.current?.stop().catch(() => {});
    };
  }, []);

  const expected = attendees.filter((a) => a.status === "approved").length;
  const checkedIn = attendees.filter((a) => a.checked_in).length;

  async function startScanning() {
    setResult(null);
    setScanning(true);

    const scanner = new Html5Qrcode(SCANNER_ID);
    scannerRef.current = scanner;

    try {
      await scanner.start(
        { facingMode: "environment" },
        { fps: 10, qrbox: { width: 250, height: 250 } },
        (decodedText) => handleDecoded(decodedText),
        () => {}
      );
    } catch {
      setResult({ kind: "error", message: "Couldn't access the camera." });
      setScanning(false);
    }
  }

  async function stopScanning() {
    if (scannerRef.current) {
      await scannerRef.current.stop().catch(() => {});
      scannerRef.current.clear();
    }
    setScanning(false);
  }

  async function handleDecoded(decodedText: string) {
    if (processingRef.current) return;
    processingRef.current = true;

    try {
      const payload = JSON.parse(decodedText) as { a?: string; e?: string };
      await checkInAttendee(payload.a, payload.e);
    } catch {
      setResult({ kind: "error", message: "That QR code isn't a valid ticket." });
    }

    setTimeout(() => {
      processingRef.current = false;
    }, 1500);
  }

  async function checkInAttendee(attendeeId?: string, eventIdOnCode?: string) {
    if (!attendeeId || !id) {
      setResult({ kind: "error", message: "Invalid ticket code." });
      return;
    }
    if (eventIdOnCode && eventIdOnCode !== id) {
      setResult({ kind: "error", message: "This ticket is for a different event." });
      return;
    }

    const { data: attendee, error: fetchError } = await supabase
      .from("attendees")
      .select("*")
      .eq("id", attendeeId)
      .eq("event_id", id)
      .maybeSingle();

    if (fetchError || !attendee) {
      setResult({ kind: "error", message: "Ticket not found for this event." });
      return;
    }
    if (attendee.status === "rejected") {
      setResult({
        kind: "error",
        message: `${attendee.full_name}'s registration was rejected.`,
      });
      return;
    }
    if (attendee.status === "waitlisted") {
      setResult({
        kind: "error",
        message: `${attendee.full_name} is on the waitlist — no seat yet.`,
      });
      return;
    }
    if (attendee.status === "pending" && event?.requires_approval) {
      setResult({
        kind: "error",
        message: `${attendee.full_name} is still pending approval.`,
      });
      return;
    }
    if (attendee.checked_in) {
      setResult({ kind: "error", message: `${attendee.full_name} is already checked in.` });
      return;
    }

    const { error: updateError } = await supabase
      .from("attendees")
      .update({ checked_in: true })
      .eq("id", attendeeId);

    if (updateError) {
      setResult({ kind: "error", message: "Couldn't check them in. Try again." });
      return;
    }

    setAttendees((prev) =>
      prev.map((a) => (a.id === attendeeId ? { ...a, checked_in: true } : a)),
    );
    setRecent((prev) =>
      [{ name: attendee.full_name, at: new Date().toLocaleTimeString() }, ...prev].slice(0, 8),
    );
    setResult({ kind: "success", message: `${attendee.full_name} checked in ✓` });
  }

  async function undoCheckIn(attendee: Attendee) {
    setBusyId(attendee.id);
    const { error: updateError } = await supabase
      .from("attendees")
      .update({ checked_in: false })
      .eq("id", attendee.id);

    if (!updateError) {
      setAttendees((prev) =>
        prev.map((a) => (a.id === attendee.id ? { ...a, checked_in: false } : a)),
      );
      setResult({
        kind: "success",
        message: `${attendee.full_name} was moved back to not checked in.`,
      });
    }
    setBusyId(null);
  }

  async function handleManualSearch(e: React.FormEvent) {
    e.preventDefault();
    if (!id || !manualQuery.trim()) return;
    setSearching(true);
    const q = manualQuery.trim();
    const { data } = await supabase
      .from("attendees")
      .select("*")
      .eq("event_id", id)
      .or(`full_name.ilike.%${q}%,phone_number.ilike.%${q}%`)
      .limit(5);
    setManualResults(data ?? []);
    setSearching(false);
  }

  async function manualCheckIn(attendee: Attendee) {
    await checkInAttendee(attendee.id, id);
    setManualResults((prev) => prev.filter((a) => a.id !== attendee.id));
  }

  if (!event) {
    return (
      <div className="min-h-screen bg-background pt-32 text-center text-text-soft">
        Loading…
      </div>
    );
  }

  return (
    <AppShell
      title="Check-in"
      subtitle={event.name}
      nav={eventNav(id ?? "")}
      activeKey="checkin"
      actions={<BackButton fallbackTo="/dashboard" label="Back" />}
    >
      <div className="max-w-lg">

        {/* Live counters */}
        <div className="grid grid-cols-3 gap-3 mb-6">
          <div className="bg-surface-muted border border-border rounded-xl p-4 text-center">
            <p className="text-xs font-medium text-text-soft">Checked in</p>
            <p className="text-2xl font-bold text-success mt-1 tabular-nums">
              {checkedIn}
            </p>
          </div>
          <div className="bg-surface-muted border border-border rounded-xl p-4 text-center">
            <p className="text-xs font-medium text-text-soft">Expected</p>
            <p className="text-2xl font-bold text-text mt-1 tabular-nums">
              {expected}
            </p>
          </div>
          <div className="bg-surface-muted border border-border rounded-xl p-4 text-center">
            <p className="text-xs font-medium text-text-soft">Registered</p>
            <p className="text-2xl font-bold text-text mt-1 tabular-nums">
              {attendees.length}
            </p>
          </div>
        </div>

        {expected > 0 && (
          <div className="mb-6">
            <div className="flex items-center justify-between text-xs text-text-soft mb-1.5">
              <span className="inline-flex items-center gap-1.5">
                <UsersRound className="w-3.5 h-3.5" />
                {Math.round((checkedIn / expected) * 100)}% arrived
              </span>
              <span>
                {expected - checkedIn} still to come
              </span>
            </div>
            <div className="h-2 rounded-full bg-surface-strong overflow-hidden">
              <div
                className="h-full rounded-full bg-linear-to-r from-success to-tag-teal transition-all duration-500"
                style={{
                  width: `${Math.min(100, (checkedIn / expected) * 100)}%`,
                }}
              />
            </div>
          </div>
        )}

        <div className="bg-surface-muted border border-border rounded-xl shadow-sm p-6 mb-6">
          <div
            id={SCANNER_ID}
            className={`rounded-lg overflow-hidden bg-surface-strong ${scanning ? "block" : "hidden"}`}
          />

          {!scanning && (
            <button
              onClick={startScanning}
              className="w-full flex items-center justify-center gap-2 h-12 rounded-xl text-sm font-semibold text-text-on-dark bg-linear-to-r from-brand to-tag-violet shadow-lg shadow-shadow-brand/30 hover:brightness-110 transition-all"
            >
              <ScanLine className="w-4 h-4" />
              Start scanning
            </button>
          )}
          {scanning && (
            <button
              onClick={stopScanning}
              className="w-full mt-3 h-11 rounded-lg text-sm font-medium text-text-soft border border-border hover:bg-surface-strong transition-colors"
            >
              Stop scanning
            </button>
          )}

          {result && (
            <div
              className={`mt-4 flex items-start gap-2 p-3 rounded-lg border text-sm ${
                result.kind === "success"
                  ? "bg-success-bg border-success-border text-success"
                  : "bg-danger-bg border-danger-border text-danger"
              }`}
            >
              {result.kind === "success" ? (
                <CheckCircle2 className="w-4 h-4 mt-0.5 shrink-0" />
              ) : (
                <XCircle className="w-4 h-4 mt-0.5 shrink-0" />
              )}
              <span>{result.message}</span>
            </div>
          )}

          {recent.length > 0 && (
            <div className="mt-5">
              <h3 className="text-xs font-semibold text-text-soft uppercase tracking-wide mb-2">
                Recent check-ins
              </h3>
              <ul className="space-y-1.5">
                {recent.map((entry, index) => (
                  <li
                    key={`${entry.name}-${index}`}
                    className="flex items-center justify-between gap-2 text-sm text-text-muted"
                  >
                    <span className="inline-flex items-center gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-success" />
                      {entry.name}
                    </span>
                    <span className="text-xs text-text-soft">{entry.at}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        <div className="bg-surface-muted border border-border rounded-xl shadow-sm p-6">
          <h2 className="font-heading text-lg font-semibold text-text mb-3">
            Manual check-in
          </h2>
          <form onSubmit={handleManualSearch} className="flex gap-2 mb-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-soft" />
              <input
                type="text"
                placeholder="Search name or phone"
                value={manualQuery}
                onChange={(e) => setManualQuery(e.target.value)}
                className="w-full h-10 pl-9 pr-3 border border-border rounded-lg bg-surface text-sm text-text focus:outline-none focus:ring-2 focus:ring-focus-soft"
              />
            </div>
            <button
              type="submit"
              disabled={searching}
              className="h-10 px-4 rounded-lg text-sm font-medium text-text-on-dark bg-brand hover:bg-brand-hover disabled:opacity-60"
            >
              {searching ? <Loader2 className="w-4 h-4 animate-spin" /> : "Search"}
            </button>
          </form>

          {manualResults.length > 0 && (
            <ul className="flex flex-col gap-2">
              {manualResults.map((a) => {
                const StatusIcon = STATUS_ICONS[a.status];
                const blocked =
                  a.status === "rejected" ||
                  a.status === "waitlisted" ||
                  (a.status === "pending" && event.requires_approval);

                return (
                  <li
                    key={a.id}
                    className="flex items-center justify-between gap-2 p-2.5 rounded-lg bg-surface border border-border text-sm"
                  >
                    <div className="min-w-0">
                      <p className="font-medium text-text truncate">{a.full_name}</p>
                      <p className="text-text-soft text-xs">{a.phone_number}</p>
                      <span
                        className={`inline-flex items-center gap-1 mt-1 text-[11px] font-medium px-1.5 py-0.5 rounded-full border ${STATUS_STYLES[a.status]}`}
                      >
                        <StatusIcon className="w-3 h-3" />
                        {a.status}
                      </span>
                    </div>
                    {a.checked_in ? (
                      <button
                        type="button"
                        onClick={() => undoCheckIn(a)}
                        disabled={busyId === a.id}
                        className="inline-flex items-center gap-1 text-xs font-medium text-text-soft hover:text-danger disabled:opacity-50"
                      >
                        {busyId === a.id ? (
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        ) : (
                          <Undo2 className="w-3.5 h-3.5" />
                        )}
                        Undo
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={() => manualCheckIn(a)}
                        disabled={blocked}
                        className="text-xs font-medium text-brand hover:text-brand-hover disabled:text-text-soft disabled:cursor-not-allowed"
                      >
                        Check in
                      </button>
                    )}
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </div>
    </AppShell>
  );
}

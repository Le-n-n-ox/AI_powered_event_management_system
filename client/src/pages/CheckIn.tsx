import { useEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import { Html5Qrcode } from "html5-qrcode";
import { CheckCircle2, XCircle, ScanLine, Search, Loader2 } from "lucide-react";
import { supabase } from "../lib/supabase";
import type { Attendee, Event } from "../types/event";

const SCANNER_ID = "qr-reader";

type ScanResult = { kind: "success" | "error"; message: string } | null;

export default function CheckIn() {
  const { id } = useParams<{ id: string }>();
  const [event, setEvent] = useState<Event | null>(null);
  const [scanning, setScanning] = useState(false);
  const [result, setResult] = useState<ScanResult>(null);
  const [manualQuery, setManualQuery] = useState("");
  const [manualResults, setManualResults] = useState<Attendee[]>([]);
  const [searching, setSearching] = useState(false);
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const processingRef = useRef(false);

  useEffect(() => {
    if (!id) return;
    supabase.from("events").select("*").eq("id", id).single().then(({ data }) => {
      if (data) setEvent(data);
    });
  }, [id]);

  useEffect(() => {
    return () => {
      scannerRef.current?.stop().catch(() => {});
    };
  }, []);

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
    } catch (err) {
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
      setResult({ kind: "error", message: `${attendee.full_name}'s registration was rejected.` });
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

    setResult({ kind: "success", message: `${attendee.full_name} checked in ✓` });
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
    <div className="min-h-screen bg-background">
      <div className="max-w-lg mx-auto px-4 sm:px-6 pt-24 pb-16">
        <h1 className="font-heading text-2xl sm:text-3xl font-bold text-text tracking-tight mb-1">
          Check-in
        </h1>
        <p className="text-text-soft text-sm mb-6">{event.name}</p>

        <div className="bg-surface-muted border border-border rounded-xl shadow-sm p-6 mb-6">
          <div
            id={SCANNER_ID}
            className={`rounded-lg overflow-hidden bg-surface-strong ${scanning ? "block" : "hidden"}`}
          />

          {!scanning && (
            <button
              onClick={startScanning}
              className="w-full flex items-center justify-center gap-2 h-12 rounded-lg text-sm font-semibold text-text-on-dark bg-brand hover:bg-brand-hover transition-colors"
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
              {manualResults.map((a) => (
                <li
                  key={a.id}
                  className="flex items-center justify-between gap-2 p-2.5 rounded-lg bg-surface border border-border text-sm"
                >
                  <div>
                    <p className="font-medium text-text">{a.full_name}</p>
                    <p className="text-text-soft text-xs">{a.phone_number}</p>
                  </div>
                  {a.checked_in ? (
                    <span className="text-xs text-success font-medium">Checked in</span>
                  ) : (
                    <button
                      onClick={() => manualCheckIn(a)}
                      className="text-xs font-medium text-brand hover:text-brand-hover"
                    >
                      Check in
                    </button>
                  )}
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
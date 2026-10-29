import { useMemo, useState } from "react";
import {
  Wallet,
  Download,
  Loader2,
  TriangleAlert,
  Search,
  RotateCcw,
  Smartphone,
  Receipt,
  Info,
} from "lucide-react";
import { useOrganizerWorkspace } from "../../hooks/useOrganizerWorkspace";
import { formatMoney } from "../../lib/events";
import { supabase } from "../../lib/supabase";
import StatTile from "../../components/charts/StatTile";
import { Button } from "@/components/ui/button";
import AppShell from "../../components/layout/AppShell";
import { ORGANIZER_NAV } from "../../components/layout/navItems";
import type { TransactionStatus } from "../../types/event";

const CARD = "bg-surface rounded-xl border border-border shadow-sm";

const FIELD =
  "border border-border rounded-lg bg-surface text-sm text-text h-10 transition-colors hover:border-border-strong focus:outline-none focus:ring-2 focus:ring-focus-soft";

const STATUS_STYLES: Record<TransactionStatus, string> = {
  paid: "bg-success-bg text-success border-success-border",
  pending: "bg-warning-bg text-warning border-warning-border",
  failed: "bg-danger-bg text-danger border-danger-border",
  refunded: "bg-info-bg text-info border-info-border",
  cancelled: "bg-surface-strong text-text-muted border-border",
};

const STATUS_LABELS: Record<TransactionStatus, string> = {
  paid: "Paid",
  pending: "Pending",
  failed: "Failed",
  refunded: "Refunded",
  cancelled: "Cancelled",
};

type StatusFilter = "all" | TransactionStatus;

export default function Transactions() {
  const { events, entries, ledgerSource, loading, error, refresh } =
    useOrganizerWorkspace();

  const [eventId, setEventId] = useState("all");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [query, setQuery] = useState("");
  const [busyId, setBusyId] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  const paidEvents = useMemo(() => events.filter((e) => e.is_paid), [events]);

  const eventNameById = useMemo(
    () => new Map(events.map((e) => [e.id, e.name] as const)),
    [events],
  );

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();

    return entries.filter((entry) => {
      if (eventId !== "all" && entry.event_id !== eventId) return false;
      if (statusFilter !== "all" && entry.status !== statusFilter) return false;
      if (!q) return true;

      return (
        entry.attendee_name.toLowerCase().includes(q) ||
        (entry.phone_number || "").toLowerCase().includes(q) ||
        (entry.receipt_number || "").toLowerCase().includes(q) ||
        (eventNameById.get(entry.event_id) || "").toLowerCase().includes(q)
      );
    });
  }, [entries, eventId, statusFilter, query, eventNameById]);

  const totals = useMemo(() => {
    const sum = (status: TransactionStatus[]) =>
      filtered
        .filter((e) => status.includes(e.status))
        .reduce((sum, e) => sum + Number(e.amount), 0);

    return {
      collected: sum(["paid"]),
      outstanding: sum(["pending", "failed"]),
      refunded: sum(["refunded"]),
      count: filtered.length,
    };
  }, [filtered]);

  async function markStatus(
    entryId: string,
    attendeeId: string | null,
    status: TransactionStatus,
  ) {
    setBusyId(entryId);
    setActionError(null);

    try {
      if (!entryId.startsWith("attendee-") && attendeeId) {
        const { error: updateError } = await supabase
          .from("transactions")
          .update({
            status,
            paid_at: status === "paid" ? new Date().toISOString() : undefined,
          })
          .eq("id", entryId);

        if (updateError) throw updateError;
      }

      if (attendeeId) {
        const attendeeStatus =
          status === "paid" ? "paid" : status === "refunded" ? "refunded" : "unpaid";

        const { error: attendeeError } = await supabase
          .from("attendees")
          .update({ payment_status: attendeeStatus })
          .eq("id", attendeeId);

        if (attendeeError) throw attendeeError;
      }

      await refresh();
    } catch (err) {
      setActionError(
        err instanceof Error ? err.message : "Could not update that payment.",
      );
    } finally {
      setBusyId(null);
    }
  }

  function exportCsv() {
    const header = [
      "Attendee",
      "Phone",
      "Event",
      "Amount",
      "Currency",
      "Status",
      "Method",
      "Receipt",
      "Paid at",
    ];

    const rows = filtered.map((entry) => [
      entry.attendee_name,
      entry.phone_number ?? "",
      eventNameById.get(entry.event_id) ?? "",
      String(entry.amount),
      entry.currency,
      STATUS_LABELS[entry.status],
      entry.method,
      entry.receipt_number ?? "",
      entry.paid_at ?? "",
    ]);

    const csv = [header, ...rows]
      .map((row) =>
        row
          .map((cell) => `"${String(cell).replace(/"/g, '""')}"`)
          .join(","),
      )
      .join("\n");

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `transactions-${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background pt-32 flex justify-center text-text-soft">
        <div className="flex items-center gap-2">
          <Loader2 className="w-4 h-4 animate-spin" />
          Loading transactions…
        </div>
      </div>
    );
  }

  return (
    <AppShell
      title="Transactions"
      subtitle="Track every ticket payment for your paid events."
      nav={ORGANIZER_NAV}
      activeKey="transactions"
      actions={
        <Button onClick={exportCsv} disabled={filtered.length === 0}>
          <Download className="w-4 h-4" />
          Export CSV
        </Button>
      }
    >
      {error && (
        <div
          role="alert"
          className="mb-4 flex items-start gap-2 p-3 rounded-lg border border-danger-border bg-danger-bg text-danger text-sm"
        >
          <TriangleAlert className="w-4 h-4 mt-0.5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {ledgerSource === "attendees" && paidEvents.length > 0 && (
        <div className="mb-4 flex items-start gap-2 p-3 rounded-lg border border-info-border bg-info-bg text-info text-sm">
          <Info className="w-4 h-4 mt-0.5 shrink-0" />
          <span>
            Showing payments derived from attendee records. Run the database
            migrations in{" "}
            <code className="font-mono text-xs">server/db/migrations</code> to
            turn on the full payment ledger.
          </span>
        </div>
      )}

      {actionError && (
        <div
          role="alert"
          className="mb-4 flex items-start gap-2 p-3 rounded-lg border border-danger-border bg-danger-bg text-danger text-sm"
        >
          <TriangleAlert className="w-4 h-4 mt-0.5 shrink-0" />
          <span>{actionError}</span>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <StatTile
          label="Collected"
          value={formatMoney(totals.collected)}
          icon={<Wallet className="w-5 h-5" />}
          tone="success"
        />
        <StatTile
          label="Outstanding"
          value={formatMoney(totals.outstanding)}
          icon={<Receipt className="w-5 h-5" />}
          tone="warning"
        />
        <StatTile
          label="Refunded"
          value={formatMoney(totals.refunded)}
          icon={<RotateCcw className="w-5 h-5" />}
          tone="info"
        />
      </div>

      {/* Filters */}
      <div className={`${CARD} p-4 sm:p-5 border-b border-border flex flex-col sm:flex-row gap-3 sm:items-center`}>
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-soft" />
          <input
            type="search"
            aria-label="Search transactions"
            placeholder="Search name, phone, receipt or event"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className={`${FIELD} w-full pl-9 pr-3 placeholder:text-text-soft`}
          />
        </div>

        <select
          aria-label="Filter by event"
          value={eventId}
          onChange={(e) => setEventId(e.target.value)}
          className={`${FIELD} px-3 cursor-pointer`}
        >
          <option value="all">All paid events</option>
          {paidEvents.map((event) => (
            <option key={event.id} value={event.id}>
              {event.name}
            </option>
          ))}
        </select>

        <select
          aria-label="Filter by status"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as StatusFilter)}
          className={`${FIELD} px-3 cursor-pointer`}
        >
          <option value="all">All statuses</option>
          <option value="paid">Paid</option>
          <option value="pending">Pending</option>
          <option value="failed">Failed</option>
          <option value="refunded">Refunded</option>
          <option value="cancelled">Cancelled</option>
        </select>
      </div>

      <div className={`${CARD} overflow-hidden mt-4`}>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[46rem] text-left text-sm">
            <thead className="bg-surface-muted border-b border-border text-text-soft uppercase text-xs tracking-wide">
              <tr>
                <th scope="col" className="px-4 py-3 font-semibold">
                  Attendee
                </th>
                <th scope="col" className="px-4 py-3 font-semibold">
                  Event
                </th>
                <th scope="col" className="px-4 py-3 font-semibold">
                  Amount
                </th>
                <th scope="col" className="px-4 py-3 font-semibold">
                  Method
                </th>
                <th scope="col" className="px-4 py-3 font-semibold">
                  Status
                </th>
                <th scope="col" className="px-4 py-3 text-right font-semibold">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-text-muted">
                    <Wallet className="w-8 h-8 mx-auto mb-3 text-border-strong" />
                    <p className="font-medium text-text">
                      No transactions to show
                    </p>
                    <p className="text-sm mt-1">
                      {entries.length === 0
                        ? "Payments will appear here once your attendees start paying."
                        : "No transactions match your filters."}
                    </p>
                  </td>
                </tr>
              ) : (
                filtered.map((entry) => {
                  const busy = busyId === entry.id;

                  return (
                    <tr
                      key={entry.id}
                      className="hover:bg-surface-muted transition-colors"
                    >
                      <td className="px-4 py-3">
                        <p className="font-medium text-text">
                          {entry.attendee_name}
                        </p>
                        {entry.phone_number && (
                          <p className="text-xs text-text-soft">
                            {entry.phone_number}
                          </p>
                        )}
                        {entry.receipt_number && (
                          <p className="text-xs text-text-soft">
                            Receipt {entry.receipt_number}
                          </p>
                        )}
                      </td>
                      <td className="px-4 py-3 text-text-muted">
                        {eventNameById.get(entry.event_id) ?? "—"}
                      </td>
                      <td className="px-4 py-3 font-medium text-text tabular-nums">
                        {formatMoney(entry.amount, entry.currency)}
                      </td>
                      <td className="px-4 py-3 text-text-muted capitalize">
                        <span className="inline-flex items-center gap-1.5">
                          <Smartphone className="w-3.5 h-3.5 text-text-soft" />
                          {entry.method}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`text-xs font-medium px-2.5 py-1 rounded-full border ${STATUS_STYLES[entry.status]}`}
                        >
                          {STATUS_LABELS[entry.status]}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-end gap-2">
                          {entry.status !== "paid" && (
                            <button
                              type="button"
                              onClick={() =>
                                markStatus(
                                  entry.id,
                                  entry.attendee_id,
                                  "paid",
                                )
                              }
                              disabled={busy}
                              className="text-xs font-medium text-success hover:text-success/80 disabled:opacity-50"
                            >
                              Mark paid
                            </button>
                          )}

                          {entry.status === "paid" && (
                            <button
                              type="button"
                              onClick={() =>
                                markStatus(
                                  entry.id,
                                  entry.attendee_id,
                                  "refunded",
                                )
                              }
                              disabled={busy}
                              className="text-xs font-medium text-info hover:text-info/80 disabled:opacity-50"
                            >
                              Refund
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        <div className="px-4 sm:px-6 py-3 border-t border-border bg-surface-muted text-xs text-text-soft">
          Showing {filtered.length} of {entries.length} transactions
          {totals.count > 0 && ` · ${formatMoney(totals.collected)} collected`}
        </div>
      </div>
    </AppShell>
  );
}
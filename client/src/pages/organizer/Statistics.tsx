import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  UsersRound,
  CircleCheckBig,
  Hourglass,
  ScanLine,
  Wallet,
  Gauge,
  CalendarDays,
  Loader2,
  TriangleAlert,
  Ticket,
} from "lucide-react";
import { motion } from "framer-motion";
import { useOrganizerWorkspace } from "../../hooks/useOrganizerWorkspace";
import { formatMoney } from "../../lib/events";
import type { Attendee, Event } from "../../types/event";
import StatTile from "../../components/charts/StatTile";
import LineChart from "../../components/charts/LineChart";
import BarChart from "../../components/charts/BarChart";
import StatusBar from "../../components/charts/StatusBar";
import StackedBarChart from "../../components/charts/StackedBarChart";
import ChartCard from "../../components/charts/ChartCard";
import {
  useChartPalette,
  useStatusColors,
} from "../../components/charts/chart-utils";
import AppShell from "../../components/layout/AppShell";
import { ORGANIZER_NAV } from "../../components/layout/navItems";

const CARD = "bg-surface rounded-xl border border-border shadow-sm";

const SELECT =
  "h-10 border border-border rounded-lg px-3 text-sm text-text bg-surface focus:outline-none focus:ring-2 focus:ring-focus-soft cursor-pointer";

interface EventRow {
  event: Event;
  registered: number;
  approved: number;
  pending: number;
  waitlisted: number;
  rejected: number;
  checkedIn: number;
  revenue: number;
}

export default function Statistics() {
  const { events, attendees, entries, loading, error } = useOrganizerWorkspace();
  const [selectedEventId, setSelectedEventId] = useState<string>("all");
  const palette = useChartPalette();
  const statusColors = useStatusColors();

  const scopedAttendees = useMemo(
    () =>
      selectedEventId === "all"
        ? attendees
        : attendees.filter((a) => a.event_id === selectedEventId),
    [attendees, selectedEventId],
  );

  const scopedEntries = useMemo(
    () =>
      selectedEventId === "all"
        ? entries
        : entries.filter((e) => e.event_id === selectedEventId),
    [entries, selectedEventId],
  );

  const totals = useMemo(() => {
    const count = (status: Attendee["status"]) =>
      scopedAttendees.filter((a) => a.status === status).length;

    return {
      registered: scopedAttendees.length,
      approved: count("approved"),
      pending: count("pending"),
      waitlisted: count("waitlisted"),
      rejected: count("rejected"),
      checkedIn: scopedAttendees.filter((a) => a.checked_in).length,
      revenue: scopedEntries
        .filter((e) => e.status === "paid")
        .reduce((sum, e) => sum + Number(e.amount), 0),
      outstanding: scopedEntries
        .filter((e) => e.status === "pending" || e.status === "failed")
        .reduce((sum, e) => sum + Number(e.amount), 0),
    };
  }, [scopedAttendees, scopedEntries]);

  /** Per-event roll-up. */
  const rows = useMemo<EventRow[]>(() => {
    return events
      .filter(
        (event) => selectedEventId === "all" || event.id === selectedEventId,
      )
      .map((event) => {
        const forEvent = attendees.filter((a) => a.event_id === event.id);
        return {
          event,
          registered: forEvent.length,
          approved: forEvent.filter((a) => a.status === "approved").length,
          pending: forEvent.filter((a) => a.status === "pending").length,
          waitlisted: forEvent.filter((a) => a.status === "waitlisted").length,
          rejected: forEvent.filter((a) => a.status === "rejected").length,
          checkedIn: forEvent.filter((a) => a.checked_in).length,
          revenue: entries
            .filter((e) => e.event_id === event.id && e.status === "paid")
            .reduce((sum, e) => sum + Number(e.amount), 0),
        };
      });
  }, [events, attendees, entries, selectedEventId]);

  /** Registrations per day, oldest first. */
  const trend = useMemo(() => {
    // Key by calendar day so the axis is in date order, not sign-up order.
    const byDay = new Map<string, number>();

    for (const attendee of scopedAttendees) {
      const date = new Date(attendee.registered_at);
      if (Number.isNaN(date.getTime())) continue;

      const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
      byDay.set(key, (byDay.get(key) ?? 0) + 1);
    }

    const keys = [...byDay.keys()].sort();
    const spansYears = new Set(keys.map((key) => key.slice(0, 4))).size > 1;

    return keys.map((key) => {
      const [year, month, day] = key.split("-").map(Number);
      const date = new Date(year, month - 1, day);

      return {
        label: date.toLocaleDateString("en-KE", {
          day: "2-digit",
          month: "short",
          ...(spansYears ? { year: "2-digit" as const } : {}),
        }),
        value: byDay.get(key) ?? 0,
      };
    });
  }, [scopedAttendees]);

  const revenueBars = useMemo(
    () =>
      rows
        .filter((row) => row.revenue > 0)
        .map((row) => ({
          label: row.event.name,
          value: row.revenue,
          hint: `${row.approved} approved`,
        })),
    [rows],
  );

  const capacityTotal = useMemo(
    () =>
      rows.reduce((sum, row) => sum + (row.event.capacity ?? 0), 0),
    [rows],
  );

  const capacityUsed = rows.reduce((sum, row) => sum + row.registered, 0);
  const fillRate =
    capacityTotal > 0 ? Math.round((capacityUsed / capacityTotal) * 100) : null;

  /** The status breakdown for each event, as a part-to-whole bar. */
  const statusByEvent = useMemo(
    () =>
      rows
        .filter((row) => row.registered > 0)
        .map((row) => ({
          label: row.event.name,
          segments: [
            {
              label: "Approved",
              value: row.approved,
              color: statusColors.approved,
            },
            {
              label: "Pending",
              value: row.pending,
              color: statusColors.pending,
            },
            {
              label: "Waitlisted",
              value: row.waitlisted,
              color: statusColors.waitlisted,
            },
            {
              label: "Rejected",
              value: row.rejected,
              color: statusColors.rejected,
            },
          ],
        })),
    [rows, statusColors],
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-background pt-32 flex justify-center text-text-soft">
        <div className="flex items-center gap-2">
          <Loader2 className="w-4 h-4 animate-spin" />
          Loading statistics…
        </div>
      </div>
    );
  }

  return (
    <AppShell
      title="Statistics"
      subtitle="Registrations, approvals, attendance and revenue across your events."
      nav={ORGANIZER_NAV}
      activeKey="statistics"
      actions={
        events.length > 0 ? (
          <div>
            <label
              htmlFor="stats-event"
              className="block text-xs font-medium text-text-soft mb-1"
            >
              Event
            </label>
            <select
              id="stats-event"
              value={selectedEventId}
              onChange={(e) => setSelectedEventId(e.target.value)}
              className={SELECT}
            >
              <option value="all">All events</option>
              {events.map((event) => (
                <option key={event.id} value={event.id}>
                  {event.name}
                </option>
              ))}
            </select>
          </div>
        ) : undefined
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

      {events.length === 0 ? (
          <div className={`${CARD} p-12 text-center`}>
            <CalendarDays className="w-10 h-10 mx-auto mb-3 text-text-soft" />
            <p className="font-medium text-text">No events yet</p>
            <p className="text-sm text-text-soft mt-1">
              Create an event and its statistics will show up here.
            </p>
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            {/* Headline numbers */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
              <StatTile
                label="Registrations"
                value={totals.registered}
                icon={<UsersRound className="w-5 h-5" />}
                tone="brand"
                hint={
                  totals.pending > 0
                    ? `${totals.pending} awaiting your approval`
                    : undefined
                }
              />
              <StatTile
                label="Approved"
                value={totals.approved}
                icon={<CircleCheckBig className="w-5 h-5" />}
                tone="success"
                hint={
                  totals.registered > 0
                    ? `${Math.round((totals.approved / totals.registered) * 100)}% of registrations`
                    : undefined
                }
              />
              <StatTile
                label="Checked in"
                value={totals.checkedIn}
                icon={<ScanLine className="w-5 h-5" />}
                tone="info"
                hint={
                  totals.approved > 0
                    ? `${Math.round((totals.checkedIn / totals.approved) * 100)}% of approved attendees`
                    : undefined
                }
              />
              <StatTile
                label="Revenue"
                value={formatMoney(totals.revenue)}
                icon={<Wallet className="w-5 h-5" />}
                tone="success"
                hint={
                  totals.outstanding > 0
                    ? `${formatMoney(totals.outstanding)} still outstanding`
                    : "All payments settled"
                }
              />
              <StatTile
                label="Capacity used"
                value={fillRate === null ? "Unlimited" : `${fillRate}%`}
                icon={<Gauge className="w-5 h-5" />}
                tone={fillRate !== null && fillRate >= 90 ? "warning" : "neutral"}
                hint={
                  fillRate === null
                    ? `${capacityUsed} registered`
                    : `${capacityUsed} of ${capacityTotal} seats`
                }
              />
            </div>

            {/* Trend + status breakdown */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <ChartCard
                className="lg:col-span-2"
                title="Registrations over time"
                subtitle="New sign-ups per day"
                table={{
                  columns: ["Day", "Sign-ups"],
                  rows: trend.map((point) => [point.label, point.value]),
                }}
              >
                <LineChart
                  data={trend}
                  color={palette.series.brand}
                  emptyMessage="No registrations yet."
                />
              </ChartCard>

              <ChartCard
                title="Registration status"
                subtitle="Where every registration stands"
                table={{
                  columns: ["Status", "Registrations"],
                  rows: [
                    ["Approved", totals.approved],
                    ["Pending", totals.pending],
                    ["Waitlisted", totals.waitlisted],
                    ["Rejected", totals.rejected],
                  ],
                }}
              >
                <StatusBar
                  segments={[
                    { label: "Approved", value: totals.approved, color: statusColors.approved },
                    { label: "Pending", value: totals.pending, color: statusColors.pending },
                    { label: "Waitlisted", value: totals.waitlisted, color: statusColors.waitlisted },
                    { label: "Rejected", value: totals.rejected, color: statusColors.rejected },
                  ]}
                  emptyMessage="No registrations yet."
                />
              </ChartCard>
            </div>

            {/* Status by event + revenue */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <ChartCard
                title="Registration status by event"
                subtitle="Where each event's sign-ups stand"
                table={{
                  columns: [
                    "Event",
                    "Approved",
                    "Pending",
                    "Waitlisted",
                    "Rejected",
                    "Total",
                  ],
                  rows: statusByEvent.map((row) => [
                    row.label,
                    ...row.segments.map((segment) => segment.value),
                    row.segments.reduce((sum, segment) => sum + segment.value, 0),
                  ]),
                }}
              >
                <StackedBarChart
                  data={statusByEvent}
                  emptyMessage="No registrations yet."
                />
              </ChartCard>

              <ChartCard
                title="Revenue by event"
                subtitle="Collected from paid tickets"
                table={{
                  columns: ["Event", "Revenue", "Approved"],
                  rows: revenueBars.map((bar) => [
                    bar.label,
                    formatMoney(bar.value),
                    bar.hint ?? "—",
                  ]),
                }}
              >
                <BarChart
                  data={revenueBars}
                  color={palette.series.teal}
                  formatValue={(v) => `${Math.round(v).toLocaleString()}`}
                  emptyMessage="No ticket revenue yet."
                />
              </ChartCard>
            </div>

            {/* Per-event table */}
            <div className={`${CARD} p-6`}>
              <h2 className="text-lg font-semibold text-text mb-1">
                Event breakdown
              </h2>
              <p className="text-sm text-text-soft mb-4">
                Per-event numbers at a glance
              </p>

              <div className="overflow-x-auto">
                <table className="w-full min-w-[36rem] text-left text-sm">
                  <thead className="border-b border-border text-text-soft uppercase text-xs tracking-wide">
                    <tr>
                      <th scope="col" className="py-2 pr-3 font-semibold">
                        Event
                      </th>
                      <th scope="col" className="py-2 px-2 font-semibold">
                        Reg.
                      </th>
                      <th scope="col" className="py-2 px-2 font-semibold">
                        Appr.
                      </th>
                      <th scope="col" className="py-2 px-2 font-semibold">
                        In
                      </th>
                      <th scope="col" className="py-2 px-2 font-semibold">
                        Revenue
                      </th>
                      <th scope="col" className="py-2 pl-2 text-right font-semibold">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {rows.map((row) => (
                      <tr key={row.event.id} className="hover:bg-surface-muted">
                        <td className="py-2.5 pr-3">
                          <p className="font-medium text-text truncate max-w-[14rem]">
                            {row.event.name}
                          </p>
                          {row.event.is_paid && (
                            <span className="inline-flex items-center gap-1 text-xs text-text-soft mt-0.5">
                              <Ticket className="w-3 h-3" />
                              {formatMoney(row.event.ticket_price ?? 0)} each
                            </span>
                          )}
                        </td>
                        <td className="py-2.5 px-2 tabular-nums text-text-muted">
                          {row.registered}
                        </td>
                        <td className="py-2.5 px-2 tabular-nums text-text-muted">
                          {row.approved}
                        </td>
                        <td className="py-2.5 px-2 tabular-nums text-text-muted">
                          {row.checkedIn}
                        </td>
                        <td className="py-2.5 px-2 tabular-nums text-text">
                          {row.revenue > 0 ? formatMoney(row.revenue) : "—"}
                        </td>
                        <td className="py-2.5 pl-2">
                          <div className="flex items-center justify-end gap-1.5">
                            <Link
                              to={`/events/${row.event.id}/manage`}
                              className="text-xs font-medium text-brand hover:text-brand-hover"
                            >
                              Attendees
                            </Link>
                            <span className="text-border-strong">|</span>
                            <Link
                              to={`/events/${row.event.id}/checkin`}
                              className="text-xs font-medium text-brand hover:text-brand-hover"
                            >
                              Check-in
                            </Link>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {totals.pending > 0 && (
              <div className="flex items-center gap-2 text-sm text-warning bg-warning-bg border border-warning-border rounded-lg px-4 py-3">
                <Hourglass className="w-4 h-4 shrink-0" />
                <span>
                  {totals.pending} registration
                  {totals.pending === 1 ? "" : "s"} still need your approval.
                </span>
                <Link
                  to={
                    selectedEventId === "all"
                      ? "/dashboard"
                      : `/events/${selectedEventId}/manage`
                  }
                  className="ml-auto font-medium text-warning underline underline-offset-2 shrink-0"
                >
                  Review
                </Link>
              </div>
            )}
          </motion.div>
        )}
    </AppShell>
  );
}
